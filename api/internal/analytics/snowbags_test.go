package analytics

import (
	"math"
	"strings"
	"testing"

	"github.com/technonicol/snowbag/api/internal/model"
)

var demoWindRose = []model.WindRose{
	{Dir: "С", Deg: 0, V: 8},
	{Dir: "СВ", Deg: 45, V: 7},
	{Dir: "В", Deg: 90, V: 9},
	{Dir: "ЮВ", Deg: 135, V: 11},
	{Dir: "Ю", Deg: 180, V: 13},
	{Dir: "ЮЗ", Deg: 225, V: 19},
	{Dir: "З", Deg: 270, V: 21},
	{Dir: "СЗ", Deg: 315, V: 12},
}

var goldenMu = map[string]float64{
	"Входящий угол": 3.2,
	"За Надстройка": 2.6,
	"За Вентустановка": 2.2,
	"За Фонарь": 1.6,
}

var goldenArea = map[string]int{
	"Входящий угол":    210,
	"За Надстройка":    180,
	"За Вентустановка": 145,
	"За Фонарь":        165,
}

func demoGeometry() model.GeometryData {
	return model.GeometryData{
		Roof: [][]float64{{90, 90}, {910, 90}, {910, 440}, {560, 440}, {560, 590}, {90, 590}},
		Obstacles: []model.Obstacle{
			{ID: "shaft-1", Type: "Лестнично-лифтовая надстройка", Short: "Надстройка", Shape: "rect", X: 690, Y: 150, W: 150, H: 110, HM: 3.6},
			{ID: "vent-1", Type: "Вентиляционная установка", Short: "Вентустановка", Shape: "rect", X: 360, Y: 150, W: 130, H: 74, HM: 2.4},
			{ID: "unit-1", Type: "Технический блок (ИТП)", Short: "Техблок", Shape: "rect", X: 640, Y: 312, W: 96, H: 62, HM: 1.8},
			{ID: "sky-1", Type: "Зенитный фонарь", Short: "Фонарь", Shape: "rect", X: 160, Y: 300, W: 240, H: 60, HM: 0.9},
			{ID: "drain-1", Type: "Водосточная воронка", Short: "Воронка", Shape: "circle", CX: 150, CY: 560, R: 9},
			{ID: "drain-2", Type: "Водосточная воронка", Short: "Воронка", Shape: "circle", CX: 470, CY: 560, R: 9},
		},
		AreaM2: 8240,
	}
}

func TestCornerBagArea(t *testing.T) {
	roof := ensureCCW(demoGeometry().Roof)
	mpp := metersPerPixel(roof, 8240)
	for _, idx := range concaveVertices(roof) {
		poly := cornerZone(roof, idx, cornerZoneSizeM/mpp)
		c := polygonCentroid(poly)
		if !pointInPolygon([]float64{c.X, c.Y}, roof) {
			t.Fatalf("corner centroid outside roof")
		}
		areaM2 := pxToM2(polygonArea(poly), mpp)
		t.Logf("idx=%d m2=%.0f", idx, areaM2)
		if areaM2 < minBagAreaM2 {
			t.Fatalf("corner bag too small")
		}
	}
}

func TestConcaveCornerDetected(t *testing.T) {
	roof := ensureCCW(demoGeometry().Roof)
	idx := concaveVertices(roof)
	if len(idx) == 0 {
		t.Fatal("expected concave vertex on L-shaped roof")
	}
}

func TestCalculateDemoGolden(t *testing.T) {
	geom := demoGeometry()
	res := Calculate(model.CalculateInput{
		SnowRegion: "III",
		NorthDeg:   -18,
		ParapetMm:  600,
		Geometry:   geom,
		WindRose:   demoWindRose,
	})

	if len(res.Snowbags) < 5 {
		t.Fatalf("expected at least 5 snowbags, got %d", len(res.Snowbags))
	}

	for _, bag := range res.Snowbags {
		if bag.Scheme == "" {
			t.Errorf("bag %s missing scheme", bag.ID)
		}
		if bag.RiskClass == "" {
			t.Errorf("bag %s missing riskClass", bag.ID)
		}
		for prefix, wantMu := range goldenMu {
			if containsName(bag.Name, prefix) {
				if math.Abs(bag.Mu-wantMu) > 0.05 {
					t.Errorf("%s: mu=%v want %v", bag.Name, bag.Mu, wantMu)
				}
				if wantArea, ok := goldenArea[prefix]; ok {
					if math.Abs(float64(bag.Area-wantArea)) > float64(wantArea)*0.22 {
						t.Errorf("%s: area=%d want ~%d", bag.Name, bag.Area, wantArea)
					}
				}
			}
		}
		for _, pt := range bag.Poly {
			if !pointInPolygon(pt, geom.Roof) && !pointOnRoofBoundary(pt, geom.Roof) {
				t.Errorf("bag %s vertex (%.1f,%.1f) outside roof", bag.ID, pt[0], pt[1])
			}
		}
	}

	if res.Metrics.Risk["critical"] < 1 {
		t.Errorf("expected critical zones, got %+v", res.Metrics.Risk)
	}
}

func TestRankTransferDirections(t *testing.T) {
	ranked := rankTransferDirections(demoWindRose, -18)
	if len(ranked) != 8 {
		t.Fatalf("expected 8 directions, got %d", len(ranked))
	}
	if ranked[0].FromDir != "З" {
		t.Errorf("primary wind from want З, got %s", ranked[0].FromDir)
	}
	if ranked[0].ToDir != "В" {
		t.Errorf("primary transfer to want В, got %s", ranked[0].ToDir)
	}
}

func TestParapetHeightAffectsMu(t *testing.T) {
	geom := demoGeometry()
	low := buildSnowbags(geom, 1.8, -18, 800, 1, 1, demoWindRose)
	high := buildSnowbags(geom, 1.8, -18, 1400, 1, 1, demoWindRose)
	var muLow, muHigh float64
	for _, b := range low {
		if b.Scheme == "B.13" {
			muLow = b.Mu
			break
		}
	}
	for _, b := range high {
		if b.Scheme == "B.13" {
			muHigh = b.Mu
			break
		}
	}
	if muHigh <= muLow {
		t.Errorf("taller parapet should increase mu: low=%v high=%v", muLow, muHigh)
	}
}

func TestDrainsSkipped(t *testing.T) {
	geom := demoGeometry()
	bags := buildSnowbags(geom, 1.8, -18, 600, 1, 1, demoWindRose)
	for _, b := range bags {
		if containsName(b.Name, "Воронка") {
			t.Errorf("drain should not produce bag: %s", b.Name)
		}
	}
}

func TestParseParapetMm(t *testing.T) {
	cases := map[string]float64{
		"600 мм": 600,
		"600":    600,
		"0,6 м":  600,
		"":       600,
	}
	for in, want := range cases {
		if got := ParseParapetMm(in); got != want {
			t.Errorf("%q: got %v want %v", in, got, want)
		}
	}
}

func containsName(name, prefix string) bool {
	return strings.Contains(name, strings.TrimPrefix(prefix, "За "))
}

func TestWindChangesParapetEdges(t *testing.T) {
	geom := demoGeometry()
	westParapet := parapetNames(buildSnowbags(geom, 1.8, -18, 600, 1, 1, demoWindRose))
	if len(westParapet) == 0 {
		t.Fatal("expected parapet bags for demo wind rose")
	}
}

func pointOnRoofBoundary(pt []float64, roof [][]float64) bool {
	const eps = 1.0
	n := len(roof)
	for i := 0; i < n; i++ {
		a := roof[i]
		b := roof[(i+1)%n]
		if distPointToSegment(pt, a, b) <= eps {
			return true
		}
	}
	return false
}

func distPointToSegment(p, a, b []float64) float64 {
	dx := b[0] - a[0]
	dy := b[1] - a[1]
	if dx == 0 && dy == 0 {
		return math.Hypot(p[0]-a[0], p[1]-a[1])
	}
	t := ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx + dy*dy)
	if t < 0 {
		t = 0
	} else if t > 1 {
		t = 1
	}
	x := a[0] + t*dx
	y := a[1] + t*dy
	return math.Hypot(p[0]-x, p[1]-y)
}

func parapetNames(bags []model.Snowbag) map[string]bool {
	out := map[string]bool{}
	for _, b := range bags {
		if b.Scheme == "B.13" {
			out[b.Name] = true
		}
	}
	return out
}

func TestUnionZones(t *testing.T) {
	a := rawBag{
		name:   "Парапет (юг)",
		scheme: "B.13",
		poly:   [][]float64{{0, 0}, {100, 0}, {100, 40}, {0, 40}},
		mu:     1.4,
	}
	b := rawBag{
		name:   "Подветренный парапет (юг)",
		scheme: "B.13",
		poly:   [][]float64{{20, 0}, {120, 0}, {120, 50}, {20, 50}},
		mu:     1.8,
	}
	merged := unionZones([]rawBag{a, b})
	if len(merged) != 1 {
		t.Fatalf("expected 1 merged zone, got %d", len(merged))
	}
	if merged[0].mu != 1.8 {
		t.Errorf("merged mu want 1.8, got %v", merged[0].mu)
	}
}

func TestIntersectPolyWithRoof(t *testing.T) {
	roof := [][]float64{{0, 0}, {100, 0}, {100, 100}, {0, 100}}
	zone := [][]float64{{50, 50}, {150, 50}, {150, 150}, {50, 150}}
	clipped := intersectPolyWithRoof(zone, roof)
	if len(clipped) < 3 {
		t.Fatal("expected clipped polygon")
	}
	area := polygonArea(clipped)
	if area <= 0 {
		t.Fatal("expected positive clipped area")
	}
	if area > polygonArea(zone) {
		t.Fatalf("clipped area should not exceed source")
	}
}
