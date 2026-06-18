package analytics

import (
	"testing"

	"github.com/technonicol/snowbag/api/internal/model"
)

// Выборка климата по городу и сквозной расчёт ТТР+влаги на реальном климате СП 131.
func TestClimateLookupAndCompute(t *testing.T) {
	tc := ThermalClimateFor("Москва")
	if tc.Tot != -1.7 || tc.Zot != 202 {
		t.Fatalf("Москва tot/zot: %v / %v (ожидалось -1.7 / 202)", tc.Tot, tc.Zot)
	}
	vc := VaporClimateFor("Москва")
	if !vc.HasNeg || vc.En <= 0 || vc.EnNeg <= 0 {
		t.Fatalf("климат влаги Москвы некорректен: %+v", vc)
	}

	sys := demoStandartSystem()
	in := model.ThermalInput{CategoryID: "3", TIn: 20, HumidityPct: 55}

	thr := ComputeThermal(in, sys, tc, nil, 5000)
	vap := ComputeVapor(in, sys, vc)

	t.Logf("Москва ГСОП=%.0f → Rтр=%.2f Rпр=%.2f вердикт=%q",
		GSOP(in.TIn, tc.Tot, tc.Zot), thr.Rreq, thr.Rred, thr.Verdict)
	t.Logf("влага: eн=%.0f eн.отр=%.0f z0=%dсут плоскость=%q вердикт=%q",
		vc.En, vc.EnNeg, vc.Z0Days, vap.MaxMoisturePlane, vap.Verdict)

	if thr.Verdict == "" || vap.Verdict == "" {
		t.Fatal("нет вердикта")
	}
}
