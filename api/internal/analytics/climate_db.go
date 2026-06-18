package analytics

import (
	_ "embed"
	"encoding/json"
	"strings"
	"sync"

	"github.com/technonicol/snowbag/api/internal/model"
)

//go:embed data/climate_snip.json
var climateSnipJSON []byte

type snipClimateFile struct {
	Norm                string                    `json:"norm"`
	Month               string                    `json:"month"`
	MonthLabel          string                    `json:"monthLabel"`
	Source              string                    `json:"source"`
	WindRosesByRegion   map[string][]model.WindRose `json:"windRosesByRegion"`
	Settlements         []snipSettlement          `json:"settlements"`
}

type snipSettlement struct {
	Name         string            `json:"name"`
	Aliases      []string          `json:"aliases"`
	SnowRegion   string            `json:"snowRegion"`
	WindRegion   string            `json:"windRegion"`
	JanuaryRose  []model.WindRose  `json:"januaryRose"`
}

type ClimateLookupResult struct {
	CityClimate
	Norm          string
	Month         string
	MonthLabel    string
	MatchedCity   string
	MatchQuality  string
	RegionSource  string
	WindRose      []model.WindRose
	Prevailing    model.WindRose
}

var (
	climateOnce sync.Once
	climateDB   snipClimateFile
	byName      map[string]snipSettlement
)

func loadClimateDB() {
	climateOnce.Do(func() {
		if err := json.Unmarshal(climateSnipJSON, &climateDB); err != nil {
			panic("climate_snip.json: " + err.Error())
		}
		byName = make(map[string]snipSettlement, len(climateDB.Settlements)*2)
		for _, s := range climateDB.Settlements {
			byName[normalizeCity(s.Name)] = s
			for _, a := range s.Aliases {
				byName[normalizeCity(a)] = s
			}
		}
	})
}

func LookupClimateFromSNiP(city, snowRegion, windRegion string) ClimateLookupResult {
	loadClimateDB()

	matchQuality := "default"
	matchedCity := ""
	settlement, ok := findSettlement(city)
	if ok {
		matchQuality = "exact"
		matchedCity = settlement.Name
	} else if city != "" {
		settlement, ok = fuzzySettlement(city)
		if ok {
			matchQuality = "fuzzy"
			matchedCity = settlement.Name
		}
	}

	sr := snowRegion
	wr := windRegion
	if ok {
		if sr == "" {
			sr = settlement.SnowRegion
		}
		if wr == "" {
			wr = settlement.WindRegion
		}
	}
	if sr == "" {
		sr = "III"
	}
	if wr == "" {
		wr = "II"
	}

	var rose []model.WindRose
	if ok && len(settlement.JanuaryRose) == 8 {
		rose = cloneRose(settlement.JanuaryRose)
	} else if r, ok := climateDB.WindRosesByRegion[wr]; ok && len(r) > 0 {
		rose = cloneRose(r)
	} else if r, ok := climateDB.WindRosesByRegion["II"]; ok {
		rose = cloneRose(r)
	}

	prev := prevailingWind(rose)
	clim := CityClimate{
		SnowRegion: sr,
		WindRegion: wr,
		Sg:         snowLoad(sr),
		W0:         windPressure(wr),
	}

	return ClimateLookupResult{
		CityClimate:  clim,
		Norm:         climateDB.Norm,
		Month:        climateDB.Month,
		MonthLabel:   climateDB.MonthLabel,
		MatchedCity:  matchedCity,
		MatchQuality: matchQuality,
		WindRose:     rose,
		Prevailing:   prev,
	}
}

func findSettlement(city string) (snipSettlement, bool) {
	key := normalizeCity(city)
	if key == "" {
		return snipSettlement{}, false
	}
	s, ok := byName[key]
	return s, ok
}

func fuzzySettlement(city string) (snipSettlement, bool) {
	key := normalizeCity(city)
	if key == "" {
		return snipSettlement{}, false
	}
	for k, s := range byName {
		if strings.Contains(k, key) || strings.Contains(key, k) {
			return s, true
		}
	}
	return snipSettlement{}, false
}

func cloneRose(in []model.WindRose) []model.WindRose {
	out := make([]model.WindRose, len(in))
	copy(out, in)
	return out
}

func prevailingWind(rose []model.WindRose) model.WindRose {
	if len(rose) == 0 {
		return model.WindRose{Dir: "З", Deg: 270, V: 0}
	}
	best := rose[0]
	for _, w := range rose[1:] {
		if w.V > best.V {
			best = w
		}
	}
	return best
}

// windPressure — нормативное ветровое давление w₀, кПа (СП 20.13330.2016, табл. 11.1).
func windPressure(region string) float64 {
	switch region {
	case "Ia":
		return 0.17
	case "I":
		return 0.23
	case "II":
		return 0.30
	case "III":
		return 0.38
	case "IV":
		return 0.48
	case "V":
		return 0.60
	case "VI":
		return 0.73
	case "VII":
		return 0.85
	default:
		return 0.30
	}
}

func PrevailingWindLabel(rose []model.WindRose) string {
	if len(rose) == 0 {
		return "—"
	}
	type pair struct {
		dir string
		v   float64
	}
	ordered := make([]pair, len(rose))
	for i, w := range rose {
		ordered[i] = pair{w.Dir, float64(w.V)}
	}
	// sort descending by v (simple bubble for 8 items)
	for i := 0; i < len(ordered); i++ {
		for j := i + 1; j < len(ordered); j++ {
			if ordered[j].v > ordered[i].v {
				ordered[i], ordered[j] = ordered[j], ordered[i]
			}
		}
	}
	best := ordered[0].v
	dirs := []string{ordered[0].dir}
	for _, p := range ordered[1:] {
		if p.v >= best*0.85 {
			dirs = append(dirs, p.dir)
		} else {
			break
		}
	}
	return strings.Join(dirs, ", ")
}
