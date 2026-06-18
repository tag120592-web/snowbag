package analytics

import "testing"

func TestSnowLoadSP20Table101(t *testing.T) {
	cases := map[string]float64{
		"I": 0.5, "II": 1.0, "III": 1.5, "IV": 2.0,
		"V": 2.5, "VI": 3.0, "VII": 3.5, "VIII": 4.0,
	}
	for region, want := range cases {
		if got := snowLoad(region); got != want {
			t.Errorf("snowLoad(%s) = %v, want %v", region, got, want)
		}
	}
}

func TestWindPressureSP20Table111(t *testing.T) {
	cases := map[string]float64{
		"Ia": 0.17, "I": 0.23, "II": 0.30, "III": 0.38,
		"IV": 0.48, "V": 0.60, "VI": 0.73, "VII": 0.85,
	}
	for region, want := range cases {
		if got := windPressure(region); got != want {
			t.Errorf("windPressure(%s) = %v, want %v", region, got, want)
		}
	}
}
