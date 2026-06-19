package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/google/uuid"
	"github.com/technonicol/snowbag/api/internal/analytics"
	"github.com/technonicol/snowbag/api/internal/config"
	"github.com/technonicol/snowbag/api/internal/export"
	"github.com/technonicol/snowbag/api/internal/model"
	"github.com/technonicol/snowbag/api/internal/storage"
	"github.com/technonicol/snowbag/api/internal/store"
)

type Handler struct {
	store *store.Store
	s3    *storage.S3
	cfg   config.Config
}

func New(s *store.Store, s3 *storage.S3, cfg config.Config) *Handler {
	return &Handler{store: s, s3: s3, cfg: cfg}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer, middleware.Timeout(120*time.Second))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   h.cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", h.health)
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/config", h.publicConfig)
		r.Get("/geocode", h.geocode)
		r.Get("/climate", h.lookupClimate)
		r.Get("/projects", h.listProjects)
		r.Post("/projects", h.createProject)
		r.Get("/projects/{id}", h.getProject)
		r.Patch("/projects/{id}", h.updateProject)
		r.Delete("/projects/{id}", h.deleteProject)
		r.Post("/projects/{id}/calculate", h.calculate)
		r.Get("/projects/{id}/calculations", h.listCalculations)
		r.Get("/projects/{id}/calculations/{runId}", h.getCalculationRun)
		r.Post("/projects/{id}/recalculate", h.recalculate)
		r.Post("/projects/{id}/thermal", h.thermal)
		r.Post("/projects/{id}/files", h.uploadFile)
		r.Post("/projects/{id}/recognize", h.recognize)
		r.Get("/projects/{id}/underlay", h.getUnderlay)
		r.Get("/projects/{id}/export", h.export)
	})
	return r
}

func (h *Handler) publicConfig(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"yandexMapsApiKey": h.cfg.YandexMapsAPIKey,
	})
}

func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	services := map[string]string{"api": "ok"}
	if err := h.store.Ping(r.Context()); err != nil {
		services["postgres"] = "error"
		writeJSON(w, http.StatusServiceUnavailable, model.HealthResponse{Status: "degraded", Services: services})
		return
	}
	services["postgres"] = "ok"
	if h.s3 != nil {
		if err := h.s3.Ping(r.Context()); err != nil {
			services["storage"] = "error"
		} else {
			services["storage"] = "ok"
		}
	}
	writeJSON(w, http.StatusOK, model.HealthResponse{Status: "ok", Services: services})
}

func (h *Handler) lookupClimate(w http.ResponseWriter, r *http.Request) {
	city := r.URL.Query().Get("city")
	snow := r.URL.Query().Get("snowRegion")
	wind := r.URL.Query().Get("windRegion")
	res := analytics.LookupClimateFromSNiP(city, snow, wind)

	latStr := r.URL.Query().Get("lat")
	lonStr := r.URL.Query().Get("lon")
	if latStr != "" && lonStr != "" && snow == "" && wind == "" {
		lat, latErr := strconv.ParseFloat(latStr, 64)
		lon, lonErr := strconv.ParseFloat(lonStr, 64)
		if latErr == nil && lonErr == nil {
			if analytics.ApplyGeoRegions(&res, city, lat, lon) {
				res.RegionSource = "geo"
			}
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"norm":           res.Norm,
		"month":          res.Month,
		"monthLabel":     res.MonthLabel,
		"matchedCity":    res.MatchedCity,
		"matchQuality":   res.MatchQuality,
		"regionSource":   res.RegionSource,
		"snowRegion":     res.SnowRegion,
		"windRegion":     res.WindRegion,
		"sg":             res.Sg,
		"w0":             res.W0,
		"windRose":       res.WindRose,
		"prevailingWind": res.Prevailing,
		"prevailingLabel": analytics.PrevailingWindLabel(res.WindRose),
	})
}

func (h *Handler) listProjects(w http.ResponseWriter, r *http.Request) {
	items, err := h.store.ListProjects(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if items == nil {
		items = []model.ProjectListItem{}
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) getProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	p, err := h.loadProjectWithUnderlay(r, id)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (h *Handler) loadProjectWithUnderlay(r *http.Request, id uuid.UUID) (*model.Project, error) {
	p, err := h.store.GetProject(r.Context(), id)
	if err != nil {
		return nil, err
	}
	if h.s3 != nil {
		key, _ := h.store.GetUnderlayKey(r.Context(), id)
		if key != "" {
			url, err := storage.PresignedGet(r.Context(), h.s3, h.cfg, key)
			if err == nil {
				p.UnderlayURL = url
			}
		}
	}
	if uf, err := h.store.GetUnderlayFile(r.Context(), id); err == nil && uf != nil {
		p.UnderlayName = uf.Name
		p.UnderlayMimeType = uf.MimeType
	}
	return p, nil
}

func (h *Handler) createProject(w http.ResponseWriter, r *http.Request) {
	var req model.CreateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if req.Name == "" {
		req.Name = "Новый объект"
	}
	p, err := h.store.CreateProject(r.Context(), req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	snow, wind := store.ClimateFromCity(req.City)
	pid := p.ID
	h.store.Audit(r.Context(), &pid, "project.create", map[string]string{"name": req.Name})
	_, _ = h.store.UpdateProject(r.Context(), p.ID, model.UpdateProjectRequest{
		SnowRegion: &snow,
		WindRegion: &wind,
	})
	p, _ = h.store.GetProject(r.Context(), p.ID)
	writeJSON(w, http.StatusCreated, p)
}

func (h *Handler) updateProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	var req model.UpdateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	p, err := h.store.UpdateProject(r.Context(), id, req)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	h.store.Audit(r.Context(), &id, "project.update", req)
	writeJSON(w, http.StatusOK, p)
}

func (h *Handler) deleteProject(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	if _, err := h.store.GetProject(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}

	keys, _ := h.store.ListProjectStorageKeys(r.Context(), id)
	if h.s3 != nil {
		for _, key := range keys {
			_ = h.s3.Delete(r.Context(), key)
		}
	}

	if err := h.store.DeleteProject(r.Context(), id); err != nil {
		if err.Error() == "project not found" {
			writeError(w, http.StatusNotFound, "project not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.store.Audit(r.Context(), &id, "project.delete", map[string]string{"id": id.String()})
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) calculate(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.store.GetProject(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	var req model.CalculateRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	geom := store.ParseGeometry(req.Geometry, project.Geometry, project.AreaM2)
	snowRegion := req.SnowRegion
	if snowRegion == "" {
		snowRegion = project.SnowRegion
	}
	windRegion := req.WindRegion
	if windRegion == "" {
		windRegion = project.WindRegion
	}
	northDeg := req.NorthDeg
	if northDeg == 0 && project.NorthDeg != 0 {
		northDeg = project.NorthDeg
	}
	parapetMm := req.ParapetMm
	if parapetMm <= 0 {
		parapetMm = analytics.ParseParapetMm(project.Parapet)
	}

	result := analytics.Calculate(model.CalculateInput{
		City:             project.City,
		SnowRegion:       snowRegion,
		WindRegion:       windRegion,
		NorthDeg:         northDeg,
		ParapetMm:        parapetMm,
		WindDirectionDeg: req.WindDirectionDeg,
		Ce:               req.Ce,
		Ct:               req.Ct,
		Geometry:         geom,
		Sensors:          req.Sensors,
	})

	geomJSON := store.GeometryJSON(geom)
	if geom.AreaM2 <= 0 {
		// derive from metrics
		var roofF float64
		_, _ = fmt.Sscanf(strings.ReplaceAll(result.Metrics.RoofArea, " ", ""), "%f", &roofF)
		if roofF > 0 {
			geom.AreaM2 = roofF
			geomJSON = store.GeometryJSON(geom)
		}
	}

	calcJSON := analytics.ToJSON(result)
	updated, err := h.store.SaveCalculation(r.Context(), id, req, geomJSON, geom.AreaM2, calcJSON)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.store.Audit(r.Context(), &id, "project.calculate", map[string]int{"sensors": result.Metrics.Sensors})
	writeJSON(w, http.StatusOK, map[string]any{
		"project":     updated,
		"calculation": result,
	})
}

func (h *Handler) listCalculations(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	history, err := h.store.ListCalculationHistory(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	writeJSON(w, http.StatusOK, history)
}

func (h *Handler) getCalculationRun(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	runID, err := uuid.Parse(chi.URLParam(r, "runId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid run id")
		return
	}
	run, err := h.store.GetCalculationRun(r.Context(), id, runID)
	if err != nil {
		if err.Error() == "calculation run not found" || err.Error() == "calculation not found" {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	writeJSON(w, http.StatusOK, run)
}

func (h *Handler) recalculate(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.store.GetProject(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	if len(project.Calculation) == 0 || string(project.Calculation) == "{}" {
		writeError(w, http.StatusBadRequest, "расчёт не выполнен")
		return
	}

	geom := store.ParseGeometry(project.Geometry, nil, project.AreaM2)
	result := analytics.Calculate(model.CalculateInput{
		City:       project.City,
		SnowRegion: project.SnowRegion,
		WindRegion: project.WindRegion,
		NorthDeg:   project.NorthDeg,
		ParapetMm:  analytics.ParseParapetMm(project.Parapet),
		Geometry:   geom,
	})

	geomJSON := store.GeometryJSON(geom)
	if geom.AreaM2 <= 0 {
		var roofF float64
		_, _ = fmt.Sscanf(strings.ReplaceAll(result.Metrics.RoofArea, " ", ""), "%f", &roofF)
		if roofF > 0 {
			geom.AreaM2 = roofF
			geomJSON = store.GeometryJSON(geom)
		}
	}

	calcJSON := analytics.ToJSON(result)
	updated, err := h.store.RecalculateProject(r.Context(), id, geomJSON, geom.AreaM2, calcJSON)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.store.Audit(r.Context(), &id, "project.recalculate", map[string]string{"calcNo": updated.CalcNo})
	history, _ := h.store.ListCalculationHistory(r.Context(), id)
	writeJSON(w, http.StatusOK, map[string]any{
		"project":     updated,
		"calculation": result,
		"history":     history,
	})
}

func (h *Handler) uploadFile(w http.ResponseWriter, r *http.Request) {
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
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "multipart required")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file required")
		return
	}
	defer file.Close()

	mime := header.Header.Get("Content-Type")
	mime = normalizeUploadMime(mime, header.Filename)
	key, err := h.s3.Upload(r.Context(), id, header.Filename, file, header.Size, mime)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	url, _ := storage.PresignedGet(r.Context(), h.s3, h.cfg, key)
	fid := uuid.New()
	pf, err := h.store.AddFile(r.Context(), model.ProjectFile{
		ID: fid, ProjectID: id, Name: header.Filename, MimeType: mime, Size: header.Size, URL: url,
	}, key)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if strings.HasPrefix(mime, "image/") || mime == "application/pdf" {
		_ = h.store.SetUnderlay(r.Context(), id, key)
	}

	h.store.Audit(r.Context(), &id, "file.upload", map[string]string{"name": header.Filename})
	writeJSON(w, http.StatusCreated, pf)
}

func (h *Handler) getUnderlay(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	if _, err := h.store.GetProject(r.Context(), id); err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	key, err := h.store.GetUnderlayKey(r.Context(), id)
	if err != nil || key == "" {
		writeError(w, http.StatusNotFound, "underlay not found")
		return
	}
	if h.s3 == nil {
		writeError(w, http.StatusServiceUnavailable, "storage not configured")
		return
	}
	obj, err := h.s3.Open(r.Context(), key)
	if err != nil {
		writeError(w, http.StatusNotFound, "underlay not found")
		return
	}
	defer obj.Close()

	info, err := obj.Stat()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if info.ContentType != "" {
		w.Header().Set("Content-Type", info.ContentType)
	} else {
		w.Header().Set("Content-Type", "application/octet-stream")
	}
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "private, max-age=3600")
	_, _ = io.Copy(w, obj)
}

func (h *Handler) export(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid project id")
		return
	}
	project, err := h.store.GetProject(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "json"
	}

	calc, err := export.ParseCalculation(project.Calculation)
	if err != nil && format != "json" {
		writeError(w, http.StatusBadRequest, "расчёт не выполнен")
		return
	}

	switch format {
	case "json":
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Content-Disposition", "attachment; filename=project-"+id.String()+".json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"project":     project,
			"calculation":   json.RawMessage(project.Calculation),
			"exportedAt":    time.Now().Format(time.RFC3339),
		})
	case "pdf":
		data, err := export.PDF(project, calc)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", "attachment; filename=project-"+id.String()+".pdf")
		_, _ = w.Write(data)
	case "excel":
		data, err := export.Excel(project, calc)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		w.Header().Set("Content-Disposition", "attachment; filename=project-"+id.String()+".xlsx")
		_, _ = w.Write(data)
	default:
		writeError(w, http.StatusBadRequest, "unsupported format")
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func normalizeUploadMime(mime, filename string) string {
	if mime != "" && mime != "application/octet-stream" {
		return mime
	}
	lower := strings.ToLower(filename)
	switch {
	case strings.HasSuffix(lower, ".pdf"):
		return "application/pdf"
	case strings.HasSuffix(lower, ".png"):
		return "image/png"
	case strings.HasSuffix(lower, ".jpg"), strings.HasSuffix(lower, ".jpeg"):
		return "image/jpeg"
	case strings.HasSuffix(lower, ".webp"):
		return "image/webp"
	default:
		if mime != "" {
			return mime
		}
		return "application/octet-stream"
	}
}
