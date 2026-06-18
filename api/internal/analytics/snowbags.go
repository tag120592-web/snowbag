package analytics

import (
	"fmt"
	"math"
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

func buildSnowbags(geom model.GeometryData, sg, northDeg, parapetMm, ce, ct float64, windRose []model.WindRose) []model.Snowbag {
	roof := geom.Roof
	if len(roof) < 3 {
		return nil
	}
	roof = ensureCCW(roof)
	if ce <= 0 {
		ce = defaultCe
	}
	if ct <= 0 {
		ct = defaultCt
	}
	if parapetMm <= 0 {
		parapetMm = 600
	}
	parapetM := parapetMm / 1000

	mpp := metersPerPixel(roof, geom.AreaM2)
	transfers := rankTransferDirections(windRose, northDeg)
	primary := primaryTransfer(windRose, northDeg)

	var raw []rawBag

	for _, idx := range concaveVertices(roof) {
		size := cornerZoneSizeM / mpp
		if poly := cornerZone(roof, idx, size); poly != nil {
			c := polygonCentroid(poly)
			if pointInPolygon([]float64{c.X, c.Y}, roof) {
				raw = append(raw, rawBag{
					name:    "Входящий угол",
					basis:   "Геометрия: вогнутый угол кровли (СП 20, п. 10.4)",
					scheme:  "10.4",
					poly:    poly,
					mu:      3.2,
					concave: true,
				})
			}
		}
	}

	for _, o := range geom.Obstacles {
		if skipObstacle(o) {
			continue
		}
		rect, ok := rectFromObstacle(o)
		if !ok {
			continue
		}
		hM := obstacleHeightM(o)
		td := bestTransferForObstacle(rect, transfers, primary, roof, o, mpp)
		depthPx := obstacleLeeDepthM(o) / mpp
		lee := leeRectPoly(rect, depthPx, td)
		poly := intersectPolyWithRoof(lee, roof)
		if len(poly) < 3 {
			continue
		}
		mu, scheme := obstacleMuAndScheme(o, hM)
		short := o.Short
		if short == "" {
			short = o.Type
		}
		raw = append(raw, rawBag{
			name:   "За " + short,
			basis:  fmt.Sprintf("Подветренная зона за препятствием %.1f м", hM),
			scheme: scheme,
			poly:   poly,
			mu:     mu,
		})
	}

	parapetDepthPx := parapetStripDepthM / mpp
	seenEdges := map[int]bool{}
	for _, td := range transfers {
		if td.Weight < 7 {
			continue
		}
		for _, eIdx := range leewardParapetEdges(roof, td) {
			if seenEdges[eIdx] {
				continue
			}
			seenEdges[eIdx] = true
			strip := parapetStripPoly(roof, eIdx, parapetDepthPx)
			poly := intersectPolyWithRoof(strip, roof)
			if len(poly) < 3 {
				continue
			}
			edgeLen := edgeLengthM(roof, eIdx, mpp)
			mu := parapetMu(parapetM, edgeLen)
			label := compassLabel(edgeAzimuth(roof, eIdx, northDeg))
			name := "Парапет (" + label + ")"
			basis := "Снос снега к парапету, μ по п. 10.4 СП 20"
			if td.Weight >= transfers[0].Weight*0.85 {
				name = "Подветренный парапет (" + label + ")"
			}
			raw = append(raw, rawBag{
				name:      name,
				basis:     basis,
				scheme:    "B.13",
				poly:      poly,
				mu:        mu,
				edgeLabel: label,
			})
		}
	}

	return finalizeBags(unionZones(raw), sg, ce, ct, mpp)
}

func skipObstacle(o model.Obstacle) bool {
	t := strings.ToLower(o.Type)
	return strings.Contains(t, "воронк") ||
		strings.Contains(t, "дорожк") ||
		strings.Contains(t, "щиток") ||
		strings.Contains(t, "корзин")
}

func bestTransferForObstacle(rect Rect, transfers []TransferDir, fallback TransferDir, roof [][]float64, o model.Obstacle, mpp float64) TransferDir {
	if len(transfers) == 0 {
		return fallback
	}
	best := transfers[0]
	bestArea := 0.0
	depthPx := obstacleLeeDepthM(o) / mpp
	for _, td := range transfers {
		if td.Weight < 7 {
			continue
		}
		lee := leeRectPoly(rect, depthPx, td)
		clipped := intersectPolyWithRoof(lee, roof)
		if len(clipped) < 3 {
			continue
		}
		a := polygonArea(clipped)
		if a > bestArea {
			bestArea = a
			best = td
		}
	}
	return best
}

func obstacleMuAndScheme(o model.Obstacle, hM float64) (mu float64, scheme string) {
	switch o.Type {
	case "Лестнично-лифтовая надстройка":
		return 2.6, "B.14"
	case "Вентиляционная установка":
		return 2.2, "B.14"
	case "Зенитный фонарь":
		return 1.6, "B.14"
	case "Технический блок (ИТП)":
		return 1.8, "B.12"
	default:
		mu = 1.4 + 0.35*math.Min(hM/3.6, 1.2)
		if mu >= 2.0 {
			return mu, "B.14"
		}
		return mu, "B.12"
	}
}

func parapetMu(parapetM, edgeLenM float64) float64 {
	mu := 1.4
	if parapetM >= 1.2 {
		mu = 1.6
	}
	if edgeLenM > 24 {
		mu += 0.2
	}
	if mu > 1.8 {
		return 1.8
	}
	return mu
}

func edgeAzimuth(roof [][]float64, edgeIdx int, northDeg float64) float64 {
	n := len(roof)
	a := roof[edgeIdx]
	b := roof[(edgeIdx+1)%n]
	mx := (a[0] + b[0]) / 2
	my := (a[1] + b[1]) / 2
	c := polygonCentroid(roof)
	dx := mx - c.X
	dy := my - c.Y
	deg := math.Mod(math.Atan2(dx, -dy)*180/math.Pi-northDeg, 360)
	if deg < 0 {
		deg += 360
	}
	return deg
}

func finalizeBags(raw []rawBag, sg, ce, ct, mpp float64) []model.Snowbag {
	var bags []model.Snowbag
	zoneID := 1
	for _, b := range raw {
		areaM2 := int(math.Round(pxToM2(polygonArea(b.poly), mpp)))
		if areaM2 < minBagAreaM2 {
			continue
		}
		riskClass, uiRisk := classifyRisk(b.mu, b.concave)
		if riskClass == "A" {
			continue
		}
		bags = append(bags, model.Snowbag{
			ID:        fmt.Sprintf("Z%d", zoneID),
			Name:      b.name,
			Basis:     b.basis,
			Scheme:    b.scheme,
			RiskClass: riskClass,
			Poly:      b.poly,
			Mu:        b.mu,
			Load:      snowLoadStr(ce, ct, b.mu, sg),
			Area:      areaM2,
			Risk:      uiRisk,
		})
		zoneID++
	}
	return bags
}
