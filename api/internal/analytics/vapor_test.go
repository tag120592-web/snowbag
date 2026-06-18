package analytics

import (
	"testing"

	"github.com/technonicol/snowbag/api/internal/model"
)

// Расчёт влагонакопления должен отработать на демо-конструкции и дать вердикт,
// положение плоскости максимального увлажнения и требуемые сопротивления.
func TestComputeVapor(t *testing.T) {
	sys := demoStandartSystem()
	in := model.ThermalInput{CategoryID: "4", TIn: 16, HumidityPct: 45}
	clim := VaporClimate{
		En:       700,  // среднегодовое eн, Па
		EnNeg:    200,  // eн,отр, Па
		Z0Days:   150,  // период влагонакопления, сут
		TNegMean: -10,  // средняя t периода, °C
		HasNeg:   true,
	}

	res := ComputeVapor(in, sys, clim)

	if res.Verdict == "" {
		t.Fatal("нет вердикта по влаге")
	}
	if res.MaxMoisturePlane == "" {
		t.Fatal("не определена плоскость максимального увлажнения")
	}
	if res.RvpReqFinal < 0 {
		t.Fatalf("итоговое требуемое сопротивление не должно быть отрицательным: %v", res.RvpReqFinal)
	}
	t.Logf("плоскость=%q Rп.вн=%.2f Rптр1=%.2f Rптр2=%.2f итог=%.2f вердикт=%q",
		res.MaxMoisturePlane, res.Rvp, res.RvpReq1, res.RvpReq2, res.RvpReqFinal, res.Verdict)
}
