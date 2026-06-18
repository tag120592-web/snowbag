package analytics

import "testing"

func TestLookupGeoZones(t *testing.T) {
	cases := []struct {
		name     string
		lat, lon float64
		wantSnow string
		wantWind string
	}{
		{"Ekaterinburg", 56.8389, 60.6057, "III", "I"},
		{"Moscow", 55.7558, 37.6173, "III", "I"},
		{"Kazan", 55.7887, 49.1221, "IV", "II"},
		{"Perm", 58.0105, 56.2502, "V", "I"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			snow, ok := LookupSnowRegion(tc.lat, tc.lon)
			if !ok {
				t.Fatalf("snow region not found")
			}
			if snow != tc.wantSnow {
				t.Fatalf("snow = %q, want %q", snow, tc.wantSnow)
			}
			wind, ok := LookupWindRegion(tc.lat, tc.lon)
			if !ok {
				t.Fatalf("wind region not found")
			}
			if wind != tc.wantWind {
				t.Fatalf("wind = %q, want %q", wind, tc.wantWind)
			}
		})
	}
}
