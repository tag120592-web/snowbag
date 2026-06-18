package analytics

import (
	"testing"

	"github.com/technonicol/snowbag/api/internal/model"
)

func demoStandartSystem() model.ThermalSystem {
	mk := func(name string, lam, t float64, role string, ins bool) model.Layer {
		return model.Layer{
			Material:    model.Material{Name: name, Lambda: lam},
			ThicknessMM: t, Role: role, IsInsulant: ins,
		}
	}
	return model.ThermalSystem{
		Slug: "tn-standart", Name: "ТН-КРОВЛЯ Стандарт",
		Layers: []model.Layer{
			mk("LOGICROOF V-RP", 0.17, 1.5, "Гидроизоляция", false),
			mk("XPS CARBON PROF", 0.034, 150, "Теплоизоляция", true),
			mk("ТЕХНОРУФ Н30", 0.038, 60, "Теплоизоляция", true),
			mk("ПАРАБАРЬЕР СА500", 0.17, 0.5, "Пароизоляция", false),
			mk("Профлист Н75", 58, 0.8, "Несущее основание", false),
		},
	}
}

// Однородная часть «Стандарта» по СП 50 должна давать Rусл ≈ 6,16 (м²·°C)/Вт.
func TestComputeThermal_Rcond(t *testing.T) {
	sys := demoStandartSystem()
	clim := model.ThermalClimate{City: "Екатеринбург", Tht: -32, Tot: -6, Zot: 230}
	in := model.ThermalInput{CategoryID: "4", TIn: 16}

	res := ComputeThermal(in, sys, clim, nil, 8240)

	if res.Rcond < 6.0 || res.Rcond > 6.3 {
		t.Fatalf("Rусл ожидалось ~6,16, получено %v", res.Rcond)
	}
	if res.Verdict == "" {
		t.Fatal("нет вердикта")
	}
	t.Logf("Rусл=%.2f Rтр=%.2f Rпр=%.2f r=%.3f утепл=%.0fмм вердикт=%q запас=%.1f%%",
		res.Rcond, res.Rreq, res.Rred, res.R, res.RequiredInsulationMM, res.Verdict, res.ReservePct)
}

// Если конструкция не проходит — подбирается толщина утеплителя (Rпр ≥ Rтр).
func TestPickInsulation(t *testing.T) {
	sys := demoStandartSystem()
	sys.Layers[1].ThicknessMM = 20 // заведомо мало
	clim := model.ThermalClimate{City: "Екатеринбург", Tht: -32, Tot: -6, Zot: 230}
	in := model.ThermalInput{CategoryID: "1", TIn: 20} // жилое — выше требования

	res := ComputeThermal(in, sys, clim, nil, 8240)

	if res.Rred < res.Rreq {
		t.Fatalf("после подбора Rпр(%.2f) должно быть ≥ Rтр(%.2f)", res.Rred, res.Rreq)
	}
	t.Logf("после подбора: утепл=%.0fмм Rпр=%.2f Rтр=%.2f вердикт=%q",
		res.RequiredInsulationMM, res.Rred, res.Rreq, res.Verdict)
}
