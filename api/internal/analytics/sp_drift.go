package analytics

import (
	"math"

	"github.com/technonicol/snowbag/api/internal/model"
)

const sp20Reliability = 0.7

func sp20BaseLoad(sg, ce, ct, mu float64) float64 {
	if mu <= 0 {
		mu = 1
	}
	return sp20Reliability * ce * ct * mu * sg
}

func windFromVector(windDirectionDeg float64) (dx, dy float64) {
	rad := windDirectionDeg * math.Pi / 180
	return math.Sin(rad), -math.Cos(rad)
}

func driftParameters(parapetHeightM, baseLoadKpa float64) (muMax, zoneWidthM float64, ok bool) {
	if parapetHeightM <= 0 || baseLoadKpa <= 0 {
		return 0, 0, false
	}
	if parapetHeightM <= baseLoadKpa/2 {
		return 0, 0, false
	}
	muMax = math.Min(2*parapetHeightM/baseLoadKpa, 3)
	zoneWidthM = 2 * parapetHeightM
	if zoneWidthM <= 0 {
		return 0, 0, false
	}
	return muMax, zoneWidthM, true
}

func segmentInwardNormal(a, b []float64, poly [][]float64) (nx, ny float64) {
	ex, ey := b[0]-a[0], b[1]-a[1]
	l := math.Hypot(ex, ey)
	if l < 1e-9 {
		return 0, 0
	}
	nx, ny = -ey/l, ex/l
	mx := (a[0] + b[0]) / 2
	my := (a[1] + b[1]) / 2
	c := polygonCentroid(poly)
	vx, vy := c.X-mx, c.Y-my
	if nx*vx+ny*vy < 0 {
		nx, ny = -nx, -ny
	}
	return nx, ny
}

func isWindwardEdge(roof [][]float64, edgeIdx int, windFromX, windFromY float64) bool {
	nx, ny := edgeOutwardNormal(roof, edgeIdx)
	return nx*windFromX+ny*windFromY > 0
}

func perpDistanceInsideEdge(px, py float64, a, b []float64, inwardX, inwardY float64) float64 {
	ex, ey := b[0]-a[0], b[1]-a[1]
	el := math.Hypot(ex, ey)
	if el < 1e-9 {
		return 0
	}
	t := ((px-a[0])*ex + (py-a[1])*ey) / (el * el)
	if t < 0 {
		t = 0
	} else if t > 1 {
		t = 1
	}
	cx := a[0] + t*ex
	cy := a[1] + t*ey
	return (px-cx)*inwardX + (py-cy)*inwardY
}

func triangularMuAtEdge(distM, zoneWidthM, muMax float64) float64 {
	if distM <= 0 {
		return muMax
	}
	if distM >= zoneWidthM {
		return 1
	}
	ratio := distM / zoneWidthM
	mu := muMax - (muMax-1)*ratio
	if mu < 1 {
		return 1
	}
	if mu > muMax {
		return muMax
	}
	return mu
}

func edgeParapetHeightM(geom model.GeometryData, edgeIdx int, defaultParapetM float64) float64 {
	if len(geom.SideParapets) > edgeIdx && geom.SideParapets[edgeIdx] > 0 {
		return geom.SideParapets[edgeIdx]
	}
	return defaultParapetM
}

func resolveWindDirectionDeg(windDirectionDeg *float64, windRose []model.WindRose) float64 {
	if windDirectionDeg != nil {
		return *windDirectionDeg
	}
	prev := prevailingWind(windRose)
	if prev.Deg != 0 || prev.Dir != "" {
		return prev.Deg
	}
	return 270
}

func muAtPoint(
	px, py float64,
	roof [][]float64,
	geom model.GeometryData,
	parapetM, sBase, mpp float64,
	windFromX, windFromY float64,
) float64 {
	mu := 1.0
	n := len(roof)
	for i := 0; i < n; i++ {
		h := edgeParapetHeightM(geom, i, parapetM)
		muMax, zoneWidthM, ok := driftParameters(h, sBase)
		if !ok || !isWindwardEdge(roof, i, windFromX, windFromY) {
			continue
		}
		a := roof[i]
		b := roof[(i+1)%n]
		inX, inY := segmentInwardNormal(a, b, roof)
		distPx := perpDistanceInsideEdge(px, py, a, b, inX, inY)
		if distPx <= 0 {
			continue
		}
		distM := distPx * mpp
		zonePx := zoneWidthM / mpp
		if distPx > zonePx {
			continue
		}
		edgeMu := triangularMuAtEdge(distM, zoneWidthM, muMax)
		if edgeMu > mu {
			mu = edgeMu
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
		obsMu, _ := obstacleMuAndScheme(o, hM)
		_, zoneWidthM, ok := driftParameters(hM, sBase)
		if !ok {
			continue
		}
		segments := obstacleLeeSegments(rect, windFromX, windFromY)
		for _, seg := range segments {
			a, b := seg[0], seg[1]
			inX, inY := segmentInwardNormal(a, b, roof)
			distPx := perpDistanceInsideEdge(px, py, a, b, inX, inY)
			if distPx <= 0 {
				continue
			}
			distM := distPx * mpp
			zonePx := zoneWidthM / mpp
			if distPx > zonePx {
				continue
			}
			muMax := obsMu
			if sBase > 0 {
				muMax = math.Min(math.Min(2*hM/sBase, 3), obsMu)
			}
			if muMax < 1 {
				muMax = obsMu
			}
			edgeMu := triangularMuAtEdge(distM, zoneWidthM, muMax)
			if edgeMu > mu {
				mu = edgeMu
			}
		}
	}
	return mu
}

func obstacleLeeSegments(rect Rect, windFromX, windFromY float64) [][][]float64 {
	corners := [][]float64{
		{rect.X, rect.Y},
		{rect.X + rect.W, rect.Y},
		{rect.X + rect.W, rect.Y + rect.H},
		{rect.X, rect.Y + rect.H},
	}
	var segs [][][]float64
	for i := 0; i < 4; i++ {
		a := corners[i]
		b := corners[(i+1)%4]
		ex, ey := b[0]-a[0], b[1]-a[1]
		l := math.Hypot(ex, ey)
		if l < 1e-9 {
			continue
		}
		outX, outY := ey/l, -ex/l
		if outX*windFromX+outY*windFromY > 0 {
			segs = append(segs, [][]float64{a, b})
		}
	}
	return segs
}
