package analytics

import (
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

// Климатические данные по СП 131.13330.2025 для ТТР и влагонакопления.
// Сейчас — демо-набор (извлечён из СП 131, табл. 5.1 / 7.1 / 11.1). Полная
// выгрузка по всем городам заменит набор без изменения логики.
// TODO(СП 131): полный справочник городов из выгрузки.

type cityClimate struct {
	city         string
	tht          float64     // расчётная зимняя t (пятидневка 0,92), °C — табл. 5.1
	tot          float64     // средняя t отопительного периода (≤8 °C), °C — табл. 5.1
	zot          int         // продолжительность отопительного периода, сут — табл. 5.1
	humidityZone string      // зона влажности
	monthlyTemp  [12]float64 // средние месячные t, °C — табл. 7.1
	monthlyVapor [12]float64 // среднее месячное парц. давление пара, гПа — табл. 11.1
}

var thermalClimates = map[string]cityClimate{
	"москва": {
		city: "Москва", tht: -26, tot: -1.7, zot: 202, humidityZone: "нормальная",
		monthlyTemp:  [12]float64{-7.0, -6.4, -1.0, 6.5, 13.3, 17.2, 19.2, 17.2, 11.4, 5.4, -0.7, -4.8},
		monthlyVapor: [12]float64{3.5, 3.4, 4.3, 6.5, 10.0, 13.5, 15.9, 14.7, 11.0, 7.7, 5.3, 4.0},
	},
	"екатеринбург": {
		city: "Екатеринбург", tht: -30, tot: -5.1, zot: 216, humidityZone: "нормальная",
		monthlyTemp:  [12]float64{-13.1, -11.2, -3.9, 4.5, 11.7, 16.8, 18.8, 16.1, 10.0, 2.9, -5.6, -10.6},
		monthlyVapor: [12]float64{2.1, 2.2, 3.2, 5.0, 7.4, 11.8, 14.2, 12.9, 9.1, 5.9, 3.5, 2.4},
	},
}

func lookupCity(city string) (cityClimate, bool) {
	c, ok := thermalClimates[strings.ToLower(strings.TrimSpace(city))]
	return c, ok
}

// ThermalClimateFor — климат для ТТР по городу (СП 131). Если города нет в наборе —
// дефолт (Москва); вызывающий код может пометить это как требующее уточнения.
func ThermalClimateFor(city string) model.ThermalClimate {
	c, ok := lookupCity(city)
	if !ok {
		c = thermalClimates["москва"]
	}
	mt := make([]float64, 12)
	copy(mt, c.monthlyTemp[:])
	return model.ThermalClimate{
		City:         c.city,
		Tht:          c.tht,
		Tot:          c.tot,
		Zot:          c.zot,
		HumidityZone: c.humidityZone,
		MonthlyTemp:  mt,
		Norm:         "СП 131.13330.2025",
	}
}

// VaporClimateFor — климат для влагонакопления: годовое eн, eн за период отрицательных
// месяцев, продолжительность периода и средняя t. Выводится из месячных данных СП 131
// (давление пара гПа → Па ×100).
func VaporClimateFor(city string) VaporClimate {
	c, ok := lookupCity(city)
	if !ok {
		c = thermalClimates["москва"]
	}
	var sumV float64
	for _, v := range c.monthlyVapor {
		sumV += v
	}
	vc := VaporClimate{En: round1(sumV / 12.0 * 100.0)}

	var negV, negT float64
	var negCount int
	for i, t := range c.monthlyTemp {
		if t < 0 {
			negCount++
			negV += c.monthlyVapor[i]
			negT += t
		}
	}
	if negCount > 0 {
		vc.HasNeg = true
		vc.EnNeg = round1(negV / float64(negCount) * 100.0)
		vc.TNegMean = round1(negT / float64(negCount))
		vc.Z0Days = negCount * 30 // приближённо мес.×30 сут. TODO(СП 131): точные сутки периода
	}
	return vc
}
