package analytics

import (
	"math"
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

// Расчёт влагонакопления (защита от переувлажнения) по разделу 8 СП 50.13330.2024.
// Одномерный расчёт по слоям; неоднородности не участвуют (п. 12 алгоритма).
//
// ВНИМАНИЕ: реализованы формулы 8.1–8.3 и определение плоскости максимального
// увлажнения. Климат (eн, eн,отр, z0, средние t) и точные μ/ρ/Δw материалов
// сейчас представительные — TODO(СП 131 / ПИМ). Полная формула 8.7 и сезонный
// E (8.4) упрощены — TODO(СП). Числа подлежат проверке инженером.

// VaporClimate — климатические данные для расчёта влаги (из СП 131).
type VaporClimate struct {
	En       float64 // среднее годовое парц. давление пара наружного воздуха eн, Па
	EnNeg    float64 // среднее парц. давление пара за период отриц. месяцев eн,отр, Па
	Z0Days   int     // продолжительность периода влагонакопления, сут
	TNegMean float64 // средняя t наружного воздуха периода влагонакопления, °C
	HasNeg   bool    // есть ли месяцы с отрицательными средними температурами
}

// saturationPressure — парциальное давление насыщенного водяного пара E(t), Па.
// Формула вида E = 1,84·10¹¹·exp(−5330/T), T = 273,15 + t (согласуется с константой
// 5330 в формуле 8.7 СП 50). TODO(СП): сверить с табличными значениями приложения.
func saturationPressure(t float64) float64 {
	return 1.84e11 * math.Exp(-5330.0/(273.15+t))
}

// vaporResistance — сопротивление паропроницанию слоя Rп = δ/μ, (м²·ч·Па)/мг.
// При μ ≤ 0 (металл, мембрана-барьер) слой считается практически паронепроницаемым.
func vaporResistance(l model.Layer) float64 {
	mu := materialMu(l)
	if mu <= 0 {
		return 1000 // практически паронепроницаемый слой
	}
	return (l.ThicknessMM / 1000.0) / mu
}

func totalVaporResistance(layers []model.Layer) float64 {
	var s float64
	for _, l := range layers {
		s += vaporResistance(l)
	}
	return s
}

// ComputeVapor выполняет расчёт влагонакопления (этапы 1–7 алгоритма влаги).
// Слои sys.Layers заданы снаружи → внутрь.
func ComputeVapor(in model.ThermalInput, sys model.ThermalSystem, clim VaporClimate) model.VaporResult {
	layers := withLayerResistances(sys.Layers)
	rTotal := Rsi + Rse + sumLayerR(layers)
	rpTotal := totalVaporResistance(layers)
	if rTotal <= 0 || rpTotal <= 0 {
		return model.VaporResult{Verdict: "Недостаточно данных", Pass: false}
	}

	tIn := in.TIn
	tOut := clim.TNegMean
	eIn := (in.HumidityPct / 100.0) * saturationPressure(tIn)

	// Профиль по границам слоёв изнутри наружу: температура, E и фактическое e.
	// Идём от внутренней поверхности (последний слой массива) к наружной (первый).
	rAcc := Rsi  // накопленное термическое сопротивление от внутр. воздуха
	rpAcc := 0.0 // накопленное сопротивление паропроницанию от внутр. поверхности
	planeIdx := -1
	planeRpInner := 0.0 // Rп от внутренней поверхности до плоскости
	minGap := math.MaxFloat64
	for k := len(layers) - 1; k >= 0; k-- {
		l := layers[k]
		rAcc += l.R
		rpAcc += vaporResistance(l)
		tBoundary := tIn - (tIn-tOut)*rAcc/rTotal
		eSat := saturationPressure(tBoundary)
		eActual := eIn - (eIn-clim.En)*rpAcc/rpTotal
		if gap := eSat - eActual; gap < minGap { // ближе всего к конденсации
			minGap = gap
			planeIdx = k
			planeRpInner = rpAcc
		}
	}
	if planeIdx < 0 {
		planeIdx = 0
		planeRpInner = rpTotal
	}

	// Плоскость максимального увлажнения и сопротивление наружной части Rп.н.
	rpOuter := rpTotal - planeRpInner
	planeLayer := layers[planeIdx]
	tPlane := tIn - (tIn-tOut)*resistInnerTo(layers, planeIdx, rTotal)/rTotal
	e0 := saturationPressure(tPlane)

	// Этап 5. Rптр1 — годовой период (формула 8.1): (eв − E)·Rп.н / (E − eн).
	var rTr1 float64
	if e0-clim.En > 0 {
		rTr1 = (eIn - e0) * rpOuter / (e0 - clim.En)
	}

	// Этап 6. Rптр2 — период влагонакопления (формула 8.2), если есть отриц. месяцы.
	var rTr2 float64
	if clim.HasNeg && clim.Z0Days > 0 {
		rhoW := materialDensity(planeLayer)
		deltaW := planeLayer.ThicknessMM / 1000.0 // δw, м
		dW := materialDeltaW(planeLayer)           // Δw, % по массе (табл. 11)
		eta := 0.0
		if rpOuter > 0 {
			eta = 0.0024 * float64(clim.Z0Days) * (e0 - clim.EnNeg) / rpOuter
		}
		denom := rhoW*deltaW*dW + eta
		if denom > 0 {
			rTr2 = 0.0024 * float64(clim.Z0Days) * (eIn - e0) / denom
		}
	}

	rReq := math.Max(rTr1, rTr2)
	pass := planeRpInner >= rReq

	verdict := "Соответствует"
	if !pass {
		verdict = "Не соответствует — нужна пароизоляция/корректировка"
	}

	return model.VaporResult{
		MaxMoisturePlane: planeDescription(planeLayer, planeIdx, len(layers)),
		Rvp:              round2(planeRpInner),
		RvpReq1:          round2(rTr1),
		RvpReq2:          round2(rTr2),
		RvpReqFinal:      round2(rReq),
		Pass:             pass,
		Verdict:          verdict,
	}
}

// resistInnerTo — термическое сопротивление от внутреннего воздуха до внешней
// границы слоя idx (включая Rsi и слои от внутреннего к idx).
func resistInnerTo(layers []model.Layer, idx int, _ float64) float64 {
	r := Rsi
	for k := len(layers) - 1; k >= idx; k-- {
		r += layers[k].R
	}
	return r
}

func planeDescription(l model.Layer, idx, n int) string {
	pos := "в слое «" + l.Material.Name + "»"
	if idx == 0 {
		pos = "на наружной границе утеплителя/конструкции"
	}
	return pos
}

// ---- Представительные свойства материалов для влаги (TODO: из ПИМ/СП) ----

func materialMu(l model.Layer) float64 {
	if l.Material.Mu != nil {
		return *l.Material.Mu
	}
	n := strings.ToLower(l.Material.Name + " " + l.Role)
	switch {
	case strings.Contains(n, "мембран"), strings.Contains(n, "гидро"), strings.Contains(n, "logicroof"):
		return 0.0023
	case strings.Contains(n, "пароизоляц"), strings.Contains(n, "парабарьер"):
		return 0 // паробарьер — практически непроницаем
	case strings.Contains(n, "xps"), strings.Contains(n, "carbon"), strings.Contains(n, "экструз"):
		return 0.005
	case strings.Contains(n, "минвата"), strings.Contains(n, "техноруф"), strings.Contains(n, "минерал"):
		return 0.3
	case strings.Contains(n, "профлист"), strings.Contains(n, "сталь"), strings.Contains(n, "метал"):
		return 0 // металл непроницаем
	case strings.Contains(n, "бетон"), strings.Contains(n, "стяжк"), strings.Contains(n, "цпс"):
		return 0.03
	default:
		return 0.1
	}
}

func materialDensity(l model.Layer) float64 {
	if l.Material.Density != nil {
		return *l.Material.Density
	}
	n := strings.ToLower(l.Material.Name)
	switch {
	case strings.Contains(n, "xps"), strings.Contains(n, "carbon"):
		return 35
	case strings.Contains(n, "минвата"), strings.Contains(n, "техноруф"):
		return 110
	case strings.Contains(n, "бетон"):
		return 1800
	default:
		return 100
	}
}

// materialDeltaW — Δw по таблице 11 СП 50 (предельно допустимое приращение влажности).
func materialDeltaW(l model.Layer) float64 {
	if l.Material.DeltaW != nil {
		return *l.Material.DeltaW
	}
	n := strings.ToLower(l.Material.Name)
	switch {
	case strings.Contains(n, "xps"), strings.Contains(n, "carbon"), strings.Contains(n, "экструз"):
		return 1.5
	case strings.Contains(n, "минвата"), strings.Contains(n, "техноруф"), strings.Contains(n, "минерал"):
		return 3
	case strings.Contains(n, "пенопол"), strings.Contains(n, "ппс"):
		return 25
	case strings.Contains(n, "бетон"), strings.Contains(n, "цпс"):
		return 2
	default:
		return 3
	}
}
