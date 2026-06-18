package analytics

import (
	"testing"

	"github.com/technonicol/snowbag/api/internal/model"
)

// С подтверждёнными неоднородностями коэффициент r < 1, а приведённое
// сопротивление Rпр < Rусл (СП 230). Элемент без узла СП 230 исключается.
func TestReducedResistanceWithHetero(t *testing.T) {
	elements := []model.RoofElement{
		{ID: "p1", Type: model.ElemParapet, LengthM: 372},
		{ID: "pr1", Type: model.ElemProhodka},
		{ID: "eq1", Type: model.ElemEquipment}, // нет узла СП 230 → исключается
	}
	cands := CandidateHeterogeneities(elements)

	excluded := 0
	for i := range cands {
		if cands[i].Status == model.HeteroExcluded {
			excluded++
		}
		if cands[i].Status == model.HeteroCandidate {
			cands[i].Status = model.HeteroConfirmed // подтверждаем пользователем
		}
	}
	if excluded != 1 {
		t.Fatalf("ожидался 1 исключённый элемент (оборудование), получено %d", excluded)
	}

	sys := demoStandartSystem()
	clim := model.ThermalClimate{City: "Екатеринбург", Tht: -32, Tot: -6, Zot: 230}
	in := model.ThermalInput{CategoryID: "4", TIn: 16}

	res := ComputeThermal(in, sys, clim, cands, 8240)

	if res.R >= 1.0 {
		t.Fatalf("r должно быть < 1 при наличии неоднородностей, получено %.3f", res.R)
	}
	if res.Rred >= res.Rcond {
		t.Fatalf("Rпр(%.2f) должно быть < Rусл(%.2f)", res.Rred, res.Rcond)
	}
	t.Logf("учтено неоднородностей=%d r=%.3f Rусл=%.2f Rпр=%.2f вердикт=%q",
		len(res.IncludedHetero), res.R, res.Rcond, res.Rred, res.Verdict)
}
