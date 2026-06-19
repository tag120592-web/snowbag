package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/technonicol/snowbag/api/internal/model"
	"github.com/technonicol/snowbag/api/internal/store"
)

// Холст редактора: viewBox 1000×680, масштаб PX_PER_M=6.6 (1 м = 6.6 px) — должен
// совпадать с web/src/composables/useRoofDrawing.ts. Геометрию и подложку кладём в
// ОДИН реальный масштаб, чтобы контур ложился на чертёж, а длины рёбер были верны.
const (
	canvasW    = 1000.0
	canvasH    = 680.0
	canvasPxPM = 6.6
)

// Контракт сервиса распознавания (recognizer/pipeline.py) — нужные поля.
type recogContract struct {
	Page struct {
		WidthPt  float64 `json:"width_pt"`
		HeightPt float64 `json:"height_pt"`
	} `json:"page"`
	Scale struct {
		MmPerPt float64 `json:"mm_per_pt"`
	} `json:"scale"`
	Roof *struct {
		VerticesPt [][]float64 `json:"vertices_pt"`
		AreaM2     float64     `json:"area_m2"`
	} `json:"roof"`
	Elements []struct {
		Class    string    `json:"class"`
		Text     string    `json:"text"`
		CenterPt []float64 `json:"center_pt"`
	} `json:"elements"`
}

type underlayBox struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	W float64 `json:"w"`
	H float64 `json:"h"`
}

// Ответ распознавания: геометрия (контур+элементы в координатах холста) + куда
// положить подложку, чтобы она совпала с геометрией в реальном масштабе.
type recognizeResponse struct {
	Geometry model.GeometryData `json:"geometry"`
	Underlay underlayBox        `json:"underlay"`
}

// recognize: берём загруженный PDF проекта из MinIO, шлём в recognizer на хосте,
// контракт → геометрия в координатах холста + трансформ подложки → сохраняем геометрию.
func (h *Handler) recognize(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	if _, err := h.store.GetProject(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	if h.s3 == nil {
		writeError(w, http.StatusServiceUnavailable, "storage not configured")
		return
	}
	// Источник — оригинальный векторный PDF проекта (подложка — растровый PNG-рендер).
	key, name, err := h.store.GetLatestPDFKey(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "не удалось найти PDF: "+err.Error())
		return
	}
	if key == "" {
		writeError(w, http.StatusBadRequest, "не найден векторный PDF — распознавание работает по PDF, не по картинке")
		return
	}
	if name == "" {
		name = "drawing.pdf"
	}

	obj, err := h.s3.Open(r.Context(), key)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "не удалось открыть чертёж: "+err.Error())
		return
	}
	defer obj.Close()

	contract, err := callRecognizer(r.Context(), h.cfg.RecognizerURL, name, obj)
	if err != nil {
		writeError(w, http.StatusBadGateway, "сервис распознавания недоступен/ошибка: "+err.Error())
		return
	}
	if contract.Roof == nil || len(contract.Roof.VerticesPt) < 3 || contract.Scale.MmPerPt <= 0 {
		writeError(w, http.StatusUnprocessableEntity, "контур кровли или масштаб не распознаны")
		return
	}

	geom, ul := contractToGeometry(contract)
	geomJSON := store.GeometryJSON(geom)
	area := geom.AreaM2
	if _, err := h.store.UpdateProject(r.Context(), id, model.UpdateProjectRequest{
		Geometry: geomJSON,
		AreaM2:   &area,
	}); err != nil {
		writeError(w, http.StatusInternalServerError, "не удалось сохранить геометрию: "+err.Error())
		return
	}
	h.store.Audit(r.Context(), &id, "drawing.recognize",
		map[string]any{"elements": len(geom.Obstacles), "areaM2": area})
	writeJSON(w, http.StatusOK, recognizeResponse{Geometry: geom, Underlay: ul})
}

// callRecognizer отправляет файл multipart-ом в recognizer и парсит контракт.
func callRecognizer(ctx context.Context, baseURL, filename string, file io.Reader) (recogContract, error) {
	var out recogContract
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	part, err := mw.CreateFormFile("file", filename)
	if err != nil {
		return out, err
	}
	if _, err := io.Copy(part, file); err != nil {
		return out, err
	}
	mw.Close()

	cctx, cancel := context.WithTimeout(ctx, 180*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(cctx, http.MethodPost, baseURL+"/recognize", &body)
	if err != nil {
		return out, err
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		msg, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
		return out, fmt.Errorf("recognizer %d: %s", resp.StatusCode, string(msg))
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return out, err
	}
	return out, nil
}

// contractToGeometry проецирует точки PDF (пункты, ось Y вверх) в координаты холста
// в РЕАЛЬНОМ масштабе (k = мм/pt × 6.6/1000 px/pt). Подложку (всю страницу) кладём тем
// же преобразованием — поэтому контур точно ложится на чертёж, а длины рёбер (px/6.6)
// дают реальные метры. Страницу центрируем в холсте.
func contractToGeometry(c recogContract) (model.GeometryData, underlayBox) {
	k := c.Scale.MmPerPt * canvasPxPM / 1000.0
	pageW, pageH := c.Page.WidthPt, c.Page.HeightPt
	uw, uh := pageW*k, pageH*k
	ux, uy := (canvasW-uw)/2, (canvasH-uh)/2

	tx := func(px, py float64) []float64 {
		return []float64{
			round1(ux + px*k),
			round1(uy + (pageH-py)*k), // ось Y PDF вверх → холст вниз
		}
	}

	roof := make([][]float64, 0, len(c.Roof.VerticesPt))
	for _, v := range c.Roof.VerticesPt {
		roof = append(roof, tx(v[0], v[1]))
	}

	obstacles := make([]model.Obstacle, 0, len(c.Elements))
	for i, e := range c.Elements {
		if len(e.CenterPt) < 2 {
			continue
		}
		p := tx(e.CenterPt[0], e.CenterPt[1])
		typ, short := classToType(e.Class)
		obstacles = append(obstacles, model.Obstacle{
			ID:    fmt.Sprintf("rec-%d", i+1),
			Type:  typ,
			Short: short,
			Shape: "circle",
			CX:    p[0],
			CY:    p[1],
			R:     9,
		})
	}

	geom := model.GeometryData{Roof: roof, Obstacles: obstacles, AreaM2: c.Roof.AreaM2}
	return geom, underlayBox{X: round1(ux), Y: round1(uy), W: round1(uw), H: round1(uh)}
}

func classToType(class string) (typ, short string) {
	switch class {
	case "воронка_водостока":
		return "воронка", "Ø"
	case "аэратор":
		return "аэратор", "аэр"
	case "вентшахта", "вентиляция":
		return "вентшахта", "ВШ"
	case "надстройка", "лестничная_клетка":
		return "надстройка", "надстр"
	case "проходка":
		return "проходка", "пр"
	default:
		return class, ""
	}
}

func round1(v float64) float64 {
	return float64(int(v*10+0.5)) / 10
}
