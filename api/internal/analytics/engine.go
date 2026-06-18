package analytics

import (
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

// snowLoad — нормативный вес снегового покрова Sg, кПа (СП 20.13330.2016, табл. 10.1).
func snowLoad(region string) float64 {
	switch region {
	case "I":
		return 0.5
	case "II":
		return 1.0
	case "III":
		return 1.5
	case "IV":
		return 2.0
	case "V":
		return 2.5
	case "VI":
		return 3.0
	case "VII":
		return 3.5
	case "VIII":
		return 4.0
	default:
		return 1.5
	}
}

func Calculate(input model.CalculateInput) model.CalculationResult {
	geom := input.Geometry
	if len(geom.Roof) < 3 {
		geom = defaultGeometry()
	}

	clim, windRose := LookupClimate(input.City, input.SnowRegion, input.WindRegion)
	if len(input.WindRose) > 0 {
		windRose = input.WindRose
	}
	sg := clim.Sg
	if input.SnowRegion != "" {
		sg = snowLoad(input.SnowRegion)
	}

	ce := input.Ce
	if ce <= 0 {
		ce = defaultCe
	}
	ct := input.Ct
	if ct <= 0 {
		ct = defaultCt
	}
	parapetMm := input.ParapetMm
	if parapetMm <= 0 {
		parapetMm = 600
	}

	northDeg := input.NorthDeg
	bags := buildSnowbags(geom, sg, northDeg, parapetMm, ce, ct, windRose)
	sensors := placeSensors(bags, geom.Roof, geom.AreaM2, input.Sensors)

	mpp := metersPerPixel(geom.Roof, geom.AreaM2)
	roofM2 := geom.AreaM2
	if roofM2 <= 0 {
		roofM2 = pxToM2(polygonArea(geom.Roof), mpp)
	}
	var bagsM2 float64
	risk := map[string]int{"critical": 0, "high": 0, "medium": 0}
	maxS := 0.0
	for _, b := range bags {
		bagsM2 += float64(b.Area)
		risk[b.Risk]++
		s := ce * ct * b.Mu * sg
		if s > maxS {
			maxS = s
		}
	}
	sd := 1.4 * maxS
	share := 0.0
	if roofM2 > 0 {
		share = bagsM2 / roofM2 * 100
	}

	coverage, minDist, avgDist := sensorMetrics(sensors, bags, geom.Roof, roofM2)

	return model.CalculationResult{
		Snowbags: bags,
		Sensors:  sensors,
		Metrics: model.Metrics{
			RoofArea:  formatNum0(roofM2),
			BagsArea:  formatNum0(bagsM2),
			BagsShare: strings.ReplaceAll(formatNum1(share), ".", ","),
			Sensors:   len(sensors),
			Coverage:  coverage,
			MaxLoad:   strings.ReplaceAll(formatNum1(sd), ".", ","),
			MinDistM:  formatNum1(minDist),
			AvgDistM:  formatNum1(avgDist),
			Risk:      risk,
		},
		Spec:     buildSpec(len(sensors), avgDist),
		WindRose: windRose,
	}
}

func defaultGeometry() model.GeometryData {
	return model.GeometryData{
		Roof: [][]float64{{90, 90}, {910, 90}, {910, 440}, {560, 440}, {560, 590}, {90, 590}},
		Obstacles: []model.Obstacle{
			{ID: "shaft-1", Type: "Лестнично-лифтовая надстройка", Short: "Надстройка", Shape: "rect", X: 690, Y: 150, W: 150, H: 110, HM: 3.6},
			{ID: "vent-1", Type: "Вентиляционная установка", Short: "Вентустановка", Shape: "rect", X: 360, Y: 150, W: 130, H: 74, HM: 2.4},
		},
		AreaM2: 8240,
	}
}
