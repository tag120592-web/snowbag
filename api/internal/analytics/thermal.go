package analytics

import (
	"math"

	"github.com/technonicol/snowbag/api/internal/model"
)

// Теплотехнический расчёт плоской кровли по СП 50.13330.2024 + СП 230.1325800.2015.
// Этапы 6–11 «Финального алгоритма ТТР».

// ComputeThermal выполняет ТТР: однородная часть, требуемое сопротивление,
// влияние неоднородностей (приведённое сопротивление), вердикт и подбор
// требуемой толщины утеплителя.
//
//   sys      — состав конструкции (из ПИМ; на демо — из таблиц thermal_*).
//   clim     — климат по объекту (СП 131).
//   hetero   — кандидаты/подтверждённые неоднородности (СП 230).
//   areaM2   — площадь кровли (для приведения неоднородностей к площади).
func ComputeThermal(in model.ThermalInput, sys model.ThermalSystem, clim model.ThermalClimate, hetero []model.Heterogeneity, areaM2 float64) model.ThermalResult {
	// Этап 6. Однородная часть конструкции: R = Rsi + Σ(δ/λ) + Rse.
	layers := withLayerResistances(sys.Layers)
	rCond := Rsi + Rse + sumLayerR(layers)

	// Этап 9. Требуемое сопротивление Rтр по ГСОП и категории (СП 50, табл. 3).
	gsop := GSOP(in.TIn, clim.Tot, clim.Zot)
	rReq := RequiredRoofResistance(in.CategoryID, gsop)

	// Этапы 7–8. Приведённое сопротивление через подтверждённые неоднородности (СП 230).
	included := confirmedHetero(hetero)
	rRed, r := reducedResistance(rCond, included, areaM2)

	// Этап 11. Подбор требуемой толщины утеплителя, если Rпр < Rтр.
	if rRed < rReq {
		layers, rCond, rRed, r = pickInsulation(layers, included, areaM2, rReq)
	}

	// Этап 9. Проверка соответствия.
	pass := rRed >= rReq
	verdict := "Не соответствует"
	if pass {
		verdict = "Соответствует"
	}
	reserve := 0.0
	if rReq > 0 {
		reserve = (rRed/rReq - 1) * 100
	}

	return model.ThermalResult{
		Rsi:                  round3(Rsi),
		Rse:                  round3(Rse),
		Rcond:                round2(rCond),
		R:                    round3(r),
		Rred:                 round2(rRed),
		Rreq:                 round2(rReq),
		RequiredInsulationMM: round1(totalInsulationMM(layers)),
		ReservePct:           round1(reserve),
		Verdict:              verdict,
		Layers:               layers,
		IncludedHetero:       included,
		ExcludedElements:     nil,
		SurfaceTemps:         surfaceTempChecks(in, clim, rRed),
	}
}

// withLayerResistances возвращает копию слоёв с заполненным R = (δ/1000)/λ.
func withLayerResistances(in []model.Layer) []model.Layer {
	out := make([]model.Layer, len(in))
	copy(out, in)
	for i := range out {
		out[i].R = layerR(out[i])
	}
	return out
}

func layerR(l model.Layer) float64 {
	if l.Material.Lambda <= 0 {
		return 0
	}
	return round3((l.ThicknessMM / 1000.0) / l.Material.Lambda)
}

func sumLayerR(layers []model.Layer) float64 {
	var s float64
	for _, l := range layers {
		s += l.R
	}
	return s
}

func totalInsulationMM(layers []model.Layer) float64 {
	var s float64
	for _, l := range layers {
		if l.IsInsulant {
			s += l.ThicknessMM
		}
	}
	return s
}

func confirmedHetero(h []model.Heterogeneity) []model.Heterogeneity {
	var out []model.Heterogeneity
	for _, x := range h {
		if x.Status == model.HeteroConfirmed {
			out = append(out, x)
		}
	}
	return out
}

// reducedResistance — приведённое сопротивление теплопередаче Rпр (СП 50, прил. Г / СП 230):
//
//	1/Rпр = 1/Rусл + (Σ ψ·L + Σ χ·n) / A,   r = Rпр / Rусл.
//
// ψ (линейные, Вт/(м·°C)) и χ (точечные, Вт/°C) берутся из полей неоднородности.
// TODO(СП 230): значения ψ/χ заполняются из таблиц СП 230 по типу узла.
func reducedResistance(rCond float64, hetero []model.Heterogeneity, areaM2 float64) (rRed, r float64) {
	if rCond <= 0 {
		return 0, 0
	}
	u := 1.0 / rCond
	if areaM2 > 0 {
		var extra float64
		for _, h := range hetero {
			switch h.Kind {
			case model.HeteroLinear:
				extra += h.Psi * h.LengthM
			case model.HeteroPoint:
				extra += h.Chi * float64(h.Count)
			}
		}
		u += extra / areaM2
	}
	rRed = 1.0 / u
	return rRed, rRed / rCond
}

// pickInsulation увеличивает толщину утеплителя шагами по 10 мм, пока Rпр < Rтр
// (этап 11 алгоритма). Возвращает обновлённые слои и пересчитанные сопротивления.
func pickInsulation(layers []model.Layer, hetero []model.Heterogeneity, areaM2, rReq float64) ([]model.Layer, float64, float64, float64) {
	idx := -1
	for i := range layers {
		if layers[i].IsInsulant {
			idx = i
			break
		}
	}
	rCond := Rsi + Rse + sumLayerR(layers)
	rRed, r := reducedResistance(rCond, hetero, areaM2)
	if idx == -1 {
		return layers, rCond, rRed, r
	}
	for step := 0; step < 200 && rRed < rReq; step++ {
		layers[idx].ThicknessMM += 10
		layers[idx].R = layerR(layers[idx])
		rCond = Rsi + Rse + sumLayerR(layers)
		rRed, r = reducedResistance(rCond, hetero, areaM2)
	}
	return layers, rCond, rRed, r
}

// surfaceTempChecks — проверка температуры внутренней поверхности (этап 10):
//
//	τв = tв − (tв − tн)·Rsi/Rпр,   должно быть ≥ tв − Δtн (и ≥ точки росы).
func surfaceTempChecks(in model.ThermalInput, clim model.ThermalClimate, rRed float64) []model.SurfaceTempCheck {
	if rRed <= 0 {
		return nil
	}
	tauMin := in.TIn - (in.TIn-clim.Tht)*Rsi/rRed
	tauReq := in.TIn - NormalizedTempDiff(in.CategoryID)
	return []model.SurfaceTempCheck{{
		Node:   "Гладь покрытия",
		TauMin: round1(tauMin),
		TauReq: round1(tauReq),
		Pass:   tauMin >= tauReq,
	}}
}

func round1(x float64) float64 { return math.Round(x*10) / 10 }
func round2(x float64) float64 { return math.Round(x*100) / 100 }
func round3(x float64) float64 { return math.Round(x*1000) / 1000 }
