package analytics

import (
	"math"
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

type rawBag struct {
	name      string
	basis     string
	scheme    string
	poly      [][]float64
	mu        float64
	concave   bool
	edgeLabel string
}

func intersectPolyWithRoof(zone, roof [][]float64) [][]float64 {
	return clipPolygonToRoof(zone, roof, false)
}

func clipPolygonToRoof(zone, roof [][]float64, allowSmallFallback bool) [][]float64 {
	if len(zone) < 3 || len(roof) < 3 {
		return nil
	}
	roof = ensureCCW(roof)
	out := zone
	for i := 0; i < len(roof); i++ {
		a := roof[i]
		b := roof[(i+1)%len(roof)]
		out = clipPolyHalfPlane(out, a, b, true)
		if len(out) < 3 {
			out = nil
			break
		}
	}
	if len(out) >= 3 {
		return out
	}
	if !allowSmallFallback {
		return nil
	}
	if polygonArea(zone) > polygonArea(roof)*0.08 {
		return nil
	}
	c := polygonCentroid(zone)
	if pointInPolygon([]float64{c.X, c.Y}, roof) {
		return zone
	}
	return nil
}

func clipPolyHalfPlane(poly [][]float64, edgeA, edgeB []float64, ccw bool) [][]float64 {
	if len(poly) == 0 {
		return nil
	}
	inside := func(p []float64) bool {
		v := leftOfEdge(p, edgeA, edgeB)
		if ccw {
			return v
		}
		return !v
	}
	var out [][]float64
	n := len(poly)
	for i := 0; i < n; i++ {
		cur := poly[i]
		prev := poly[(i+n-1)%n]
		curIn := inside(cur)
		prevIn := inside(prev)
		if curIn {
			if !prevIn {
				if ix := lineIntersect(prev, cur, edgeA, edgeB); ix != nil {
					out = append(out, ix)
				}
			}
			out = append(out, cur)
		} else if prevIn {
			if ix := lineIntersect(prev, cur, edgeA, edgeB); ix != nil {
				out = append(out, ix)
			}
		}
	}
	return out
}

func leftOfEdge(p, a, b []float64) bool {
	return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]) >= -1e-9
}

func lineIntersect(p1, p2, a, b []float64) []float64 {
	x1, y1 := p1[0], p1[1]
	x2, y2 := p2[0], p2[1]
	x3, y3 := a[0], a[1]
	x4, y4 := b[0], b[1]
	d := (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
	if math.Abs(d) < 1e-12 {
		return nil
	}
	t := ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / d
	return []float64{x1 + t*(x2-x1), y1 + t*(y2-y1)}
}

func edgeOutwardNormal(roof [][]float64, edgeIdx int) (nx, ny float64) {
	n := len(roof)
	a := roof[edgeIdx]
	b := roof[(edgeIdx+1)%n]
	ex, ey := b[0]-a[0], b[1]-a[1]
	l := math.Hypot(ex, ey)
	if l < 1e-9 {
		return 0, 0
	}
	// CCW polygon → outward is right-hand normal.
	nx, ny = ey/l, -ex/l
	return nx, ny
}

func edgeLengthM(roof [][]float64, edgeIdx int, mpp float64) float64 {
	n := len(roof)
	a := roof[edgeIdx]
	b := roof[(edgeIdx+1)%n]
	return math.Hypot(b[0]-a[0], b[1]-a[1]) * mpp
}

func leewardParapetEdges(roof [][]float64, td TransferDir) []int {
	var out []int
	n := len(roof)
	for i := 0; i < n; i++ {
		nx, ny := edgeOutwardNormal(roof, i)
		dot := nx*td.DX + ny*td.DY
		if dot < -0.25 {
			out = append(out, i)
		}
	}
	return out
}

func parapetStripPoly(roof [][]float64, edgeIdx int, depthPx float64) [][]float64 {
	return parapetStrip(roof, edgeIdx, depthPx, true)
}

func leeRectPoly(rect Rect, depthPx float64, td TransferDir) [][]float64 {
	if math.Abs(td.DX) >= math.Abs(td.DY) {
		if td.DX > 0 {
			return rectPoints(Rect{X: rect.X + rect.W, Y: rect.Y, W: depthPx, H: rect.H})
		}
		return rectPoints(Rect{X: rect.X - depthPx, Y: rect.Y, W: depthPx, H: rect.H})
	}
	if td.DY > 0 {
		return rectPoints(Rect{X: rect.X, Y: rect.Y + rect.H, W: rect.W, H: depthPx})
	}
	return rectPoints(Rect{X: rect.X, Y: rect.Y - depthPx, W: rect.W, H: depthPx})
}

func rectPoints(r Rect) [][]float64 {
	return [][]float64{
		{r.X, r.Y},
		{r.X + r.W, r.Y},
		{r.X + r.W, r.Y + r.H},
		{r.X, r.Y + r.H},
	}
}

func obstacleLeeDepthM(o model.Obstacle) float64 {
	hM := obstacleHeightM(o)
	switch o.Type {
	case "Зенитный фонарь":
		return 5.5
	case "Вентиляционная установка":
		return 8.5
	case "Лестнично-лифтовая надстройка":
		return 10.0
	case "Технический блок (ИТП)":
		return 9.0
	default:
		d := leeMinDepthM + leeDepthPerHeightM*math.Min(hM/3.6, 1.0)
		if d > leeMaxDepthM {
			return leeMaxDepthM
		}
		return d
	}
}

func classifyRisk(mu float64, concave bool) (riskClass, uiRisk string) {
	if concave || mu >= 2.5 {
		return "D", "critical"
	}
	if mu >= 1.8 {
		return "C", "high"
	}
	if mu >= 1.4 {
		return "B", "medium"
	}
	return "A", "medium"
}

func snowLoadStr(ce, ct, mu, sg float64) string {
	s := ce * ct * mu * sg
	return formatLoad(s)
}

func formatLoad(v float64) string {
	s := math.Round(v*100) / 100
	whole := int(s)
	frac := int(math.Round((s - float64(whole)) * 100))
	if frac == 100 {
		whole++
		frac = 0
	}
	if frac == 0 {
		return itoa(whole)
	}
	if frac < 10 {
		return itoa(whole) + ",0" + itoa(frac)
	}
	return itoa(whole) + "," + itoa(frac)
}

// edgeFacingDirection returns the outward azimuth of a roof edge (0=north/up, clockwise).
func edgeFacingDirection(roof [][]float64, edgeIdx int, northDeg float64) float64 {
	return edgeAzimuth(roof, edgeIdx, northDeg)
}

// windwardEdges returns parapet edge indices where snow accumulates for a transfer direction.
func windwardEdges(roof [][]float64, td TransferDir) []int {
	return leewardParapetEdges(roof, td)
}

func polyBounds(poly [][]float64) (minX, minY, maxX, maxY float64) {
	if len(poly) == 0 {
		return
	}
	minX, maxX = poly[0][0], poly[0][0]
	minY, maxY = poly[0][1], poly[0][1]
	for _, p := range poly[1:] {
		minX = math.Min(minX, p[0])
		maxX = math.Max(maxX, p[0])
		minY = math.Min(minY, p[1])
		maxY = math.Max(maxY, p[1])
	}
	return
}

func boundsOverlap(a, b [][]float64) bool {
	ax1, ay1, ax2, ay2 := polyBounds(a)
	bx1, by1, bx2, by2 := polyBounds(b)
	return ax1 <= bx2 && ax2 >= bx1 && ay1 <= by2 && ay2 >= by1
}

func zonesOverlap(a, b [][]float64) bool {
	if !boundsOverlap(a, b) {
		return false
	}
	overlap := pxToM2Overlap(a, b)
	minArea := math.Min(polygonArea(a), polygonArea(b))
	if minArea <= 0 {
		return false
	}
	return overlap/minArea > 0.45
}

func shouldUnion(a, b rawBag) bool {
	if a.scheme != b.scheme {
		return false
	}
	return zonesOverlap(a.poly, b.poly)
}

func pxToM2Overlap(a, b [][]float64) float64 {
	// Approximate overlap as intersection of bounding boxes (conservative merge trigger).
	ax1, ay1, ax2, ay2 := polyBounds(a)
	bx1, by1, bx2, by2 := polyBounds(b)
	x1 := math.Max(ax1, bx1)
	y1 := math.Max(ay1, by1)
	x2 := math.Min(ax2, bx2)
	y2 := math.Min(ay2, by2)
	if x2 <= x1 || y2 <= y1 {
		return 0
	}
	return (x2 - x1) * (y2 - y1)
}

func mergeRawBag(a, b rawBag) rawBag {
	out := a
	if b.mu > out.mu {
		out.mu = b.mu
	}
	out.concave = out.concave || b.concave
	if b.scheme == out.scheme || out.scheme == "" {
		out.scheme = b.scheme
	}
	ax1, ay1, ax2, ay2 := polyBounds(a.poly)
	bx1, by1, bx2, by2 := polyBounds(b.poly)
	out.poly = rectPoints(Rect{
		X: math.Min(ax1, bx1),
		Y: math.Min(ay1, by1),
		W: math.Max(ax2, bx2) - math.Min(ax1, bx1),
		H: math.Max(ay2, by2) - math.Min(ay1, by1),
	})
	if strings.Contains(out.name, "Парапет") && strings.Contains(b.name, "Парапет") {
		out.name = "Объединённая зона (" + out.edgeLabel + ")"
		out.basis = "Пересечение снеговых мешков, μ по максимальной нагрузке"
	}
	return out
}

// unionZones merges overlapping snowbag polygons (п. 12, 21 алгоритма).
func unionZones(bags []rawBag) []rawBag {
	if len(bags) < 2 {
		return bags
	}
	out := append([]rawBag(nil), bags...)
	merged := true
	for merged {
		merged = false
		for i := 0; i < len(out); i++ {
			for j := i + 1; j < len(out); j++ {
				if shouldUnion(out[i], out[j]) {
					out[i] = mergeRawBag(out[i], out[j])
					out = append(out[:j], out[j+1:]...)
					merged = true
					break
				}
			}
			if merged {
				break
			}
		}
	}
	return out
}
