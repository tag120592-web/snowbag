package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/technonicol/snowbag/api/internal/analytics"
	"github.com/technonicol/snowbag/api/internal/model"
)

// thermalRequest — тело запроса теплотехнического расчёта: вход + подтверждённые
// пользователем неоднородности (СП 230).
type thermalRequest struct {
	model.ThermalInput
	Heterogeneities []model.Heterogeneity `json:"heterogeneities,omitempty"`
}

// thermal выполняет теплотехнический расчёт и/или расчёт влагонакопления по объекту
// (POST /api/v1/projects/{id}/thermal) и сохраняет результат.
func (h *Handler) thermal(w http.ResponseWriter, r *http.Request) {
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

	var req thermalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if !req.Modules.Thermal && !req.Modules.Vapor {
		req.Modules.Thermal = true // по умолчанию хотя бы ТТР
	}
	if req.SystemEKN == "" {
		req.SystemEKN = "tn-standart"
	}

	sys, err := h.store.GetThermalSystem(r.Context(), req.SystemEKN)
	if err != nil {
		writeError(w, http.StatusBadRequest, "система не найдена: "+req.SystemEKN)
		return
	}

	// Температура помещения: авто по категории + ручная правка (если задана > 0).
	if req.TIn == 0 {
		req.TIn = analytics.DefaultIndoorTemp(req.CategoryID)
	}
	if req.HumidityPct == 0 {
		req.HumidityPct = 55
	}

	climate := analytics.ThermalClimateFor(project.City)

	var thermalRes *model.ThermalResult
	var vaporRes *model.VaporResult
	if req.Modules.Thermal {
		res := analytics.ComputeThermal(req.ThermalInput, sys, climate, req.Heterogeneities, project.AreaM2)
		thermalRes = &res
	}
	if req.Modules.Vapor {
		res := analytics.ComputeVapor(req.ThermalInput, sys, analytics.VaporClimateFor(project.City))
		vaporRes = &res
	}

	calc := model.ThermalCalculation{
		ID:        uuid.New(),
		ProjectID: id,
		Input:     req.ThermalInput,
		Thermal:   thermalRes,
		Vapor:     vaporRes,
		CreatedAt: time.Now(),
	}
	if err := h.store.SaveThermalCalculation(r.Context(), calc); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	h.store.Audit(r.Context(), &id, "project.thermal", map[string]string{"system": sys.Name})

	writeJSON(w, http.StatusOK, map[string]any{
		"thermal": thermalRes,
		"vapor":   vaporRes,
		"climate": climate,
		"system":  sys,
	})
}
