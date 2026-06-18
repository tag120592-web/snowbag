package analytics

import (
	"math"

	"github.com/technonicol/snowbag/api/internal/model"
)

type Point struct {
	X, Y float64
}

type Rect struct {
	X, Y, W, H float64
}

func polygonArea(pts [][]float64) float64 {
	n := len(pts)
	if n < 3 {
		return 0
	}
	var a float64
	for i := 0; i < n; i++ {
		j := (i + 1) % n
		a += pts[i][0]*pts[j][1] - pts[j][0]*pts[i][1]
	}
	return math.Abs(a) / 2
}

func polygonCentroid(pts [][]float64) Point {
	n := len(pts)
	if n == 0 {
		return Point{}
	}
	var cx, cy float64
	for _, p := range pts {
		cx += p[0]
		cy += p[1]
	}
	return Point{X: cx / float64(n), Y: cy / float64(n)}
}

func metersPerPixel(roof [][]float64, areaM2 float64) float64 {
	pxArea := polygonArea(roof)
	if pxArea <= 0 {
		return 1
	}
	if areaM2 > 0 {
		return math.Sqrt(areaM2 / pxArea)
	}
	// ~8240 m² demo footprint when area unknown
	return math.Sqrt(8240 / pxArea)
}

func pxToM2(pxArea float64, mpp float64) float64 {
	return pxArea * mpp * mpp
}

// RoofAreaFromCanvasPolygon converts plan polygon area (SVG px) to m² using canvasPxPerM.
func RoofAreaFromCanvasPolygon(roof [][]float64) float64 {
	pxArea := polygonArea(roof)
	if pxArea <= 0 {
		return 0
	}
	mpp := 1 / canvasPxPerM
	return pxToM2(pxArea, mpp)
}

func rectFromObstacle(o model.Obstacle) (Rect, bool) {
	if o.Shape == "circle" && o.R > 0 {
		r := o.R
		return Rect{X: o.CX - r, Y: o.CY - r, W: 2 * r, H: 2 * r}, true
	}
	if o.W > 0 && o.H > 0 {
		return Rect{X: o.X, Y: o.Y, W: o.W, H: o.H}, true
	}
	return Rect{}, false
}

func obstacleHeightM(o model.Obstacle) float64 {
	if o.HM > 0 {
		return o.HM
	}
	switch o.Type {
	case "Лестнично-лифтовая надстройка":
		return 3.6
	case "Вентиляционная установка":
		return 2.4
	case "Зенитный фонарь":
		return 0.9
	case "Технический блок (ИТП)":
		return 1.8
	default:
		return 1.2
	}
}

func clipRectToRoof(rect Rect, roof [][]float64) [][]float64 {
	corners := [][]float64{
		{rect.X, rect.Y},
		{rect.X + rect.W, rect.Y},
		{rect.X + rect.W, rect.Y + rect.H},
		{rect.X, rect.Y + rect.H},
	}
	var inside [][]float64
	for _, c := range corners {
		if pointInPolygon(c, roof) {
			inside = append(inside, c)
		}
	}
	if len(inside) < 3 {
		// keep axis-aligned box clipped by intersection with roof bbox
		minX, minY, maxX, maxY := roofBounds(roof)
		x1 := math.Max(rect.X, minX)
		y1 := math.Max(rect.Y, minY)
		x2 := math.Min(rect.X+rect.W, maxX)
		y2 := math.Min(rect.Y+rect.H, maxY)
		if x2-x1 < 8 || y2-y1 < 8 {
			return nil
		}
		return [][]float64{{x1, y1}, {x2, y1}, {x2, y2}, {x1, y2}}
	}
	return inside
}

func roofBounds(roof [][]float64) (minX, minY, maxX, maxY float64) {
	if len(roof) == 0 {
		return 0, 0, 1000, 680
	}
	minX, maxX = roof[0][0], roof[0][0]
	minY, maxY = roof[0][1], roof[0][1]
	for _, p := range roof[1:] {
		minX = math.Min(minX, p[0])
		maxX = math.Max(maxX, p[0])
		minY = math.Min(minY, p[1])
		maxY = math.Max(maxY, p[1])
	}
	return
}

func pointInPolygon(pt []float64, poly [][]float64) bool {
	x, y := pt[0], pt[1]
	inside := false
	j := len(poly) - 1
	for i := 0; i < len(poly); i++ {
		xi, yi := poly[i][0], poly[i][1]
		xj, yj := poly[j][0], poly[j][1]
		if ((yi > y) != (yj > y)) && (x < (xj-xi)*(y-yi)/(yj-yi+1e-9)+xi) {
			inside = !inside
		}
		j = i
	}
	return inside
}

func concaveVertices(roof [][]float64) []int {
	n := len(roof)
	if n < 4 {
		return nil
	}
	// CCW polygon: concave if cross product sign differs (interior angle > 180)
	area := signedArea(roof)
	var out []int
	for i := 0; i < n; i++ {
		prev := roof[(i+n-1)%n]
		cur := roof[i]
		next := roof[(i+1)%n]
		cross := (cur[0]-prev[0])*(next[1]-cur[1]) - (cur[1]-prev[1])*(next[0]-cur[0])
		if area > 0 && cross < -1e-6 {
			out = append(out, i)
		}
		if area < 0 && cross > 1e-6 {
			out = append(out, i)
		}
	}
	return out
}

func ensureCCW(poly [][]float64) [][]float64 {
	if len(poly) < 3 || signedArea(poly) > 0 {
		return poly
	}
	out := make([][]float64, len(poly))
	for i := range poly {
		out[i] = poly[len(poly)-1-i]
	}
	return out
}

func signedArea(pts [][]float64) float64 {
	n := len(pts)
	var a float64
	for i := 0; i < n; i++ {
		j := (i + 1) % n
		a += pts[i][0]*pts[j][1] - pts[j][0]*pts[i][1]
	}
	return a / 2
}

func cornerZone(roof [][]float64, idx int, size float64) [][]float64 {
	n := len(roof)
	prev := roof[(idx+n-1)%n]
	cur := roof[idx]
	next := roof[(idx+1)%n]

	// Vectors along incoming and outgoing edges into the vertex (interior wedge at concave corner).
	v1x, v1y := cur[0]-prev[0], cur[1]-prev[1]
	v2x, v2y := next[0]-cur[0], next[1]-cur[1]
	l1 := math.Hypot(v1x, v1y)
	l2 := math.Hypot(v2x, v2y)
	if l1 < 1 || l2 < 1 {
		return nil
	}
	v1x, v1y = v1x/l1*size, v1y/l1*size
	v2x, v2y = v2x/l2*size, v2y/l2*size
	return [][]float64{
		cur,
		{cur[0] + v1x, cur[1] + v1y},
		{cur[0] + v1x + v2x, cur[1] + v1y + v2y},
		{cur[0] + v2x, cur[1] + v2y},
	}
}

func windTravelVector(windFromDeg, northDeg float64) (dx, dy float64) {
	// meteorological deg clockwise from north; plan rotated by northDeg
	adj := (windFromDeg - northDeg) * math.Pi / 180
	// air travels toward opposite of "from"
	dx = math.Sin(adj)
	dy = math.Cos(adj)
	return dx, dy
}

func leeZone(rect Rect, hM, mpp float64, dx, dy float64) Rect {
	depth := math.Min(rect.W*0.8, math.Max(40, hM/mpp*12))
	if math.Abs(dx) >= math.Abs(dy) {
		if dx > 0 {
			return Rect{X: rect.X + rect.W, Y: rect.Y, W: depth, H: rect.H}
		}
		return Rect{X: rect.X - depth, Y: rect.Y, W: depth, H: rect.H}
	}
	if dy > 0 {
		return Rect{X: rect.X, Y: rect.Y + rect.H, W: rect.W, H: depth}
	}
	return Rect{X: rect.X, Y: rect.Y - depth, W: rect.W, H: depth}
}

func parapetStrip(roof [][]float64, edgeIdx int, thickness float64, inward bool) [][]float64 {
	n := len(roof)
	a := roof[edgeIdx]
	b := roof[(edgeIdx+1)%n]
	ex, ey := b[0]-a[0], b[1]-a[1]
	l := math.Hypot(ex, ey)
	if l < 1 {
		return nil
	}
	nx, ny := -ey/l, ex/l
	if !inward {
		nx, ny = -nx, -ny
	}
	off := thickness
	return [][]float64{
		a,
		b,
		{b[0] + nx*off, b[1] + ny*off},
		{a[0] + nx*off, a[1] + ny*off},
	}
}

func distPx(a, b Point) float64 {
	return math.Hypot(a.X-b.X, a.Y-b.Y)
}

func formatM(v float64) string {
	if v < 10 {
		return formatNum1(v)
	}
	return formatNum0(v)
}

func formatNum0(v float64) string {
	n := int(math.Round(v))
	s := itoa(n)
	if n < 1000 {
		return s
	}
	var out []byte
	for i, c := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, ' ')
		}
		out = append(out, byte(c))
	}
	return string(out)
}

func formatNum1(v float64) string {
	s := math.Round(v*10) / 10
	whole := int(s)
	frac := int(math.Round((s - float64(whole)) * 10))
	if frac == 10 {
		whole++
		frac = 0
	}
	if frac == 0 {
		return itoa(whole)
	}
	return itoa(whole) + "," + itoa(frac)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var d []byte
	for n > 0 {
		d = append([]byte{byte('0' + n%10)}, d...)
		n /= 10
	}
	if neg {
		d = append([]byte{'-'}, d...)
	}
	return string(d)
}
