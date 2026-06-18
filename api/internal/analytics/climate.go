package analytics

import (
	"strings"

	"github.com/technonicol/snowbag/api/internal/model"
)

type CityClimate struct {
	SnowRegion string
	WindRegion string
	Sg         float64
	W0         float64
}

var cityClimate = map[string]CityClimate{
	"екатеринбург":    {SnowRegion: "III", WindRegion: "II", Sg: 1.8, W0: 0.30},
	"казань":          {SnowRegion: "IV", WindRegion: "III", Sg: 2.4, W0: 0.38},
	"пермь":           {SnowRegion: "V", WindRegion: "II", Sg: 3.2, W0: 0.30},
	"москва":          {SnowRegion: "III", WindRegion: "I", Sg: 1.8, W0: 0.23},
	"санкт-петербург": {SnowRegion: "III", WindRegion: "II", Sg: 1.8, W0: 0.30},
	"новосибирск":     {SnowRegion: "III", WindRegion: "III", Sg: 1.8, W0: 0.38},
	"челябинск":       {SnowRegion: "III", WindRegion: "II", Sg: 1.8, W0: 0.30},
	"тюмень":          {SnowRegion: "III", WindRegion: "II", Sg: 1.8, W0: 0.30},
}

var windRoseByRegion = map[string][]model.WindRose{
	"I": {
		{Dir: "С", Deg: 0, V: 6}, {Dir: "СВ", Deg: 45, V: 5}, {Dir: "В", Deg: 90, V: 7},
		{Dir: "ЮВ", Deg: 135, V: 8}, {Dir: "Ю", Deg: 180, V: 10}, {Dir: "ЮЗ", Deg: 225, V: 14},
		{Dir: "З", Deg: 270, V: 18}, {Dir: "СЗ", Deg: 315, V: 9},
	},
	"II": {
		{Dir: "С", Deg: 0, V: 8}, {Dir: "СВ", Deg: 45, V: 7}, {Dir: "В", Deg: 90, V: 9},
		{Dir: "ЮВ", Deg: 135, V: 11}, {Dir: "Ю", Deg: 180, V: 13}, {Dir: "ЮЗ", Deg: 225, V: 19},
		{Dir: "З", Deg: 270, V: 21}, {Dir: "СЗ", Deg: 315, V: 12},
	},
	"III": {
		{Dir: "С", Deg: 0, V: 7}, {Dir: "СВ", Deg: 45, V: 8}, {Dir: "В", Deg: 90, V: 10},
		{Dir: "ЮВ", Deg: 135, V: 12}, {Dir: "Ю", Deg: 180, V: 11}, {Dir: "ЮЗ", Deg: 225, V: 15},
		{Dir: "З", Deg: 270, V: 17}, {Dir: "СЗ", Deg: 315, V: 10},
	},
}

func LookupClimate(city, snowRegion, windRegion string) (CityClimate, []model.WindRose) {
	key := normalizeCity(city)
	if c, ok := cityClimate[key]; ok {
		if snowRegion != "" {
			c.Sg = snowLoad(snowRegion)
			c.SnowRegion = snowRegion
		}
		if windRegion != "" {
			c.WindRegion = windRegion
		}
		rose := windRoseByRegion[c.WindRegion]
		if rose == nil {
			rose = windRoseByRegion["II"]
		}
		return c, rose
	}
	sr := snowRegion
	if sr == "" {
		sr = "III"
	}
	wr := windRegion
	if wr == "" {
		wr = "II"
	}
	rose := windRoseByRegion[wr]
	if rose == nil {
		rose = windRoseByRegion["II"]
	}
	return CityClimate{SnowRegion: sr, WindRegion: wr, Sg: snowLoad(sr), W0: 0.30}, rose
}

func normalizeCity(city string) string {
	s := strings.TrimSpace(city)
	s = strings.ToLower(s)
	for _, p := range []string{"г.", "г "} {
		s = strings.TrimPrefix(s, p)
	}
	return strings.TrimSpace(s)
}

func prevailingWindDeg(rose []model.WindRose) float64 {
	if len(rose) == 0 {
		return 270
	}
	best := rose[0]
	for _, w := range rose[1:] {
		if w.V > best.V {
			best = w
		}
	}
	return best.Deg
}
