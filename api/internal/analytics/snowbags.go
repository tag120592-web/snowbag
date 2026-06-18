package analytics

import (
	"fmt"
	"math"
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

type edgeInfo struct {
	idx int
	len float64
}

func buildSnowbags(geom model.GeometryData, sg, northDeg float64, windRose []model.WindRose) []model.Snowbag {
	roof := geom.Roof
	if len(roof) < 3 {
		return nil
	}
	mpp := metersPerPixel(roof, geom.AreaM2)
	windFrom := prevailingWindDeg(windRose)
	dx, dy := windTravelVector(windFrom, northDeg)

	var bags []model.Snowbag
	zoneID := 1

	addBag := func(name, basis string, poly [][]float64, mu float64, risk string) {
		if len(poly) < 3 {
			return
		}
		areaM2 := int(math.Round(pxToM2(polygonArea(poly), mpp)))
		if areaM2 < 5 {
			return
		}
		load := strings.ReplaceAll(fmt.Sprintf("%.2f", mu*sg), ".", ",")
		bags = append(bags, model.Snowbag{
			ID:    fmt.Sprintf("Z%d", zoneID),
			Name:  name,
			Basis: basis,
			Poly:  poly,
			Mu:    mu,
			Load:  load,
			Area:  areaM2,
			Risk:  risk,
		})
		zoneID++
	}

	for _, idx := range concaveVertices(roof) {
		size := 70.0 / mpp
		if poly := cornerZone(roof, idx, size); poly != nil {
			addBag("Входящий угол", "Геометрия: вогнутый угол кровли (СП 20, п. 10.4)", poly, 3.2, "critical")
		}
	}

	for _, o := range geom.Obstacles {
		rect, ok := rectFromObstacle(o)
		if !ok {
			continue
		}
		hM := obstacleHeightM(o)
		lee := leeZone(rect, hM, mpp, dx, dy)
		poly := clipRectToRoof(lee, roof)
		mu := 1.4 + 0.35*math.Min(hM/3.6, 1.2)
		risk := "high"
		if mu >= 2.5 {
			risk = "critical"
		}
		short := o.Short
		if short == "" {
			short = o.Type
		}
		addBag("За "+short, fmt.Sprintf("Подветренная зона за препятствием %.1f м", hM), poly, mu, risk)
	}

	n := len(roof)
	var edges []edgeInfo
	for i := 0; i < n; i++ {
		a, b := roof[i], roof[(i+1)%n]
		edges = append(edges, edgeInfo{i, math.Hypot(b[0]-a[0], b[1]-a[1])})
	}
	thick := 42.0 / mpp
	for _, e := range topEdges(edges, 2) {
		poly := parapetStrip(roof, e.idx, thick, true)
		if poly == nil {
			continue
		}
		addBag("Парапет", "Снос снега к парапету, μ по п. 10.4 СП 20", poly, 1.6, "medium")
	}

	return bags
}

func topEdges(edges []edgeInfo, k int) []edgeInfo {
	if len(edges) <= k {
		return edges
	}
	out := make([]edgeInfo, len(edges))
	copy(out, edges)
	for i := 0; i < k; i++ {
		best := i
		for j := i + 1; j < len(out); j++ {
			if out[j].len > out[best].len {
				best = j
			}
		}
		out[i], out[best] = out[best], out[i]
	}
	return out[:k]
}
