package analytics

import (
	"math"
	"sort"

	"github.com/technonicol/snowbag/api/internal/model"
)

// TransferDir is the direction snow drifts (opposite to wind "from").
type TransferDir struct {
	FromDir   string
	ToDir     string
	Deg       float64 // transfer azimuth on plan (0=north/up, clockwise)
	Weight    float64
	DX, DY    float64 // unit vector on plan (x right, y down)
}

var transferToDir = map[string]string{
	"С":  "Ю",
	"СВ": "ЮЗ",
	"В":  "З",
	"ЮВ": "СЗ",
	"Ю":  "С",
	"ЮЗ": "СВ",
	"З":  "В",
	"СЗ": "ЮВ",
}

// rankTransferDirections returns snow transfer directions sorted by wind frequency.
func rankTransferDirections(windRose []model.WindRose, northDeg float64) []TransferDir {
	if len(windRose) == 0 {
		return []TransferDir{planTransferVector(270, 21, northDeg)}
	}
	type item struct {
		td TransferDir
		w  float64
	}
	var items []item
	seen := map[string]bool{}
	for _, w := range windRose {
		to := transferToDir[w.Dir]
		if to == "" {
			to = w.Dir
		}
		key := w.Dir
		if seen[key] {
			continue
		}
		seen[key] = true
		td := planTransferVector(w.Deg, float64(w.V), northDeg)
		td.FromDir = w.Dir
		td.ToDir = to
		items = append(items, item{td: td, w: float64(w.V)})
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].w > items[j].w
	})
	out := make([]TransferDir, len(items))
	for i, it := range items {
		out[i] = it.td
	}
	return out
}

func planTransferVector(windFromDeg, weight, northDeg float64) TransferDir {
	// Meteorological "from" → snow travels opposite; plan rotated by northDeg.
	transferDeg := math.Mod(windFromDeg+180-northDeg, 360)
	rad := transferDeg * math.Pi / 180
	return TransferDir{
		Deg:    transferDeg,
		Weight: weight,
		DX:     math.Sin(rad),
		DY:     -math.Cos(rad),
	}
}

func primaryTransfer(windRose []model.WindRose, northDeg float64) TransferDir {
	ranked := rankTransferDirections(windRose, northDeg)
	if len(ranked) == 0 {
		return planTransferVector(270, 21, northDeg)
	}
	return ranked[0]
}

func compassLabel(deg float64) string {
	labels := []struct {
		d float64
		l string
	}{
		{0, "север"},
		{45, "северо-восток"},
		{90, "восток"},
		{135, "юго-восток"},
		{180, "юг"},
		{225, "юго-запад"},
		{270, "запад"},
		{315, "северо-запад"},
	}
	best := labels[0].l
	bestDiff := 360.0
	for _, item := range labels {
		diff := math.Abs(deg - item.d)
		if diff > 180 {
			diff = 360 - diff
		}
		if diff < bestDiff {
			bestDiff = diff
			best = item.l
		}
	}
	return best
}
