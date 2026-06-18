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

func LookupClimate(city, snowRegion, windRegion string) (CityClimate, []model.WindRose) {
	res := LookupClimateFromSNiP(city, snowRegion, windRegion)
	return res.CityClimate, res.WindRose
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
	return prevailingWind(rose).Deg
}
