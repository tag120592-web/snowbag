package analytics

import (
	"fmt"
	"math"

	"github.com/technonicol/snowbag/api/internal/model"
)

const sensorSpacingM = 18.0
const sensorRangeM = 12.0

func placeSensors(bags []model.Snowbag, roof [][]float64, areaM2 float64, overrides []model.Sensor) []model.Sensor {
	if len(overrides) > 0 {
		return overrides
	}
	if len(bags) == 0 {
		return fallbackSensors(roof)
	}
	mpp := metersPerPixel(roof, areaM2)
	spacingPx := sensorSpacingM / mpp

	var sensors []model.Sensor
	n := 1
	for _, bag := range bags {
		areaPx := polygonArea(bag.Poly)
		c := polygonCentroid(bag.Poly)
		zone := bag.ID
		z := zone
		count := 1
		if pxToM2(areaPx, mpp) > sensorSpacingM*sensorSpacingM*1.2 {
			count = int(math.Ceil(math.Sqrt(pxToM2(areaPx, mpp)) / sensorSpacingM))
			if count > 3 {
				count = 3
			}
		}
		for i := 0; i < count; i++ {
			x, y := c.X, c.Y
			if count > 1 {
				offset := spacingPx * 0.35 * float64(i-count/2)
				x += offset
			}
			sensors = append(sensors, model.Sensor{
				ID:   fmt.Sprintf("Д-%02d", n),
				X:    x,
				Y:    y,
				Zone: &z,
			})
			n++
		}
	}
	if len(sensors) < 2 && len(bags) > 0 {
		c := polygonCentroid(roof)
		sensors = append(sensors, model.Sensor{ID: fmt.Sprintf("Д-%02d", n), X: c.X, Y: c.Y, Zone: nil})
	}
	return sensors
}

func fallbackSensors(roof [][]float64) []model.Sensor {
	c := polygonCentroid(roof)
	return []model.Sensor{{ID: "Д-01", X: c.X, Y: c.Y, Zone: nil}}
}

func sensorMetrics(sensors []model.Sensor, bags []model.Snowbag, roof [][]float64, areaM2 float64) (coverage string, minDistM, avgDistM float64) {
	if len(sensors) == 0 {
		return "0", 0, 0
	}
	mpp := metersPerPixel(roof, areaM2)
	rangePx := sensorRangeM / mpp

	var bagAreaPx float64
	for _, b := range bags {
		bagAreaPx += polygonArea(b.Poly)
	}
	covered := 0.0
	step := 24.0
	minX, minY, maxX, maxY := roofBounds(roof)
	for x := minX; x <= maxX; x += step {
		for y := minY; y <= maxY; y += step {
			pt := []float64{x, y}
			if !pointInPolygon(pt, roof) {
				continue
			}
			inBag := false
			for _, b := range bags {
				if pointInPolygon(pt, b.Poly) {
					inBag = true
					break
				}
			}
			if !inBag {
				continue
			}
			for _, s := range sensors {
				if distPx(Point{s.X, s.Y}, Point{x, y}) <= rangePx {
					covered += step * step
					break
				}
			}
		}
	}
	if bagAreaPx > 0 {
		pct := covered / bagAreaPx * 100
		if pct > 99 {
			pct = 99
		}
		coverage = formatNum0(pct)
	} else {
		coverage = "—"
	}

	var dists []float64
	for i := 0; i < len(sensors); i++ {
		for j := i + 1; j < len(sensors); j++ {
			d := distPx(Point{sensors[i].X, sensors[i].Y}, Point{sensors[j].X, sensors[j].Y}) * mpp
			dists = append(dists, d)
		}
	}
	if len(dists) == 0 {
		return coverage, 0, 0
	}
	minD, sum := dists[0], 0.0
	for _, d := range dists {
		if d < minD {
			minD = d
		}
		sum += d
	}
	return coverage, minD, sum / float64(len(dists))
}

func buildSpec(sensorCount int, avgDistM float64) []model.SpecItem {
	cable := int(math.Max(80, float64(sensorCount)*22))
	note := "—"
	if avgDistM > 0 {
		note = fmt.Sprintf("ср. расстояние %.0f м", avgDistM)
	}
	return []model.SpecItem{
		{Pos: 1, Name: "Датчик снеговой нагрузки ТН-СНЕГ-200", Unit: "шт.", Qty: sensorCount, Note: "Тензометрический, IP67"},
		{Pos: 2, Name: "Базовая станция сбора данных ТН-ХАБ-С", Unit: "шт.", Qty: 1, Note: "LoRaWAN, 4G"},
		{Pos: 3, Name: "Щиток системы мониторинга ЩСМ-1", Unit: "шт.", Qty: 1, Note: "IP65, ввод 220 В"},
		{Pos: 4, Name: "Корзина системы мониторинга КСМ-1", Unit: "шт.", Qty: 1, Note: "Защита оборудования"},
		{Pos: 5, Name: "Кабель сигнальный, экранированный", Unit: "м", Qty: cable, Note: note},
	}
}
