package analytics

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
)

//go:embed data/wind-zones.json
var windZonesJSON []byte

//go:embed data/russia_snow_cover_2024-04-10.json
var snowZonesJSON []byte

type geoZoneFile struct {
	Data geoFeatureCollection `json:"data"`
}

type geoFeatureCollection struct {
	Features []geoFeature `json:"features"`
}

type geoFeature struct {
	Geometry geoGeometry    `json:"geometry"`
	Props    map[string]any `json:"properties"`
}

type geoGeometry struct {
	Type        string          `json:"type"`
	Coordinates json.RawMessage `json:"coordinates"`
}

type geoZoneIndex struct {
	features []geoFeature
}

var (
	geoOnce      sync.Once
	windZoneIdx  geoZoneIndex
	snowZoneIdx  geoZoneIndex
)

func loadGeoZones() {
	geoOnce.Do(func() {
		windZoneIdx = parseGeoZoneFile(windZonesJSON, "wind-zones.json")
		snowZoneIdx = parseGeoZoneFile(snowZonesJSON, "russia_snow_cover_2024-04-10.json")
	})
}

func parseGeoZoneFile(raw []byte, name string) geoZoneIndex {
	var wrapper geoZoneFile
	if err := json.Unmarshal(raw, &wrapper); err != nil {
		panic(name + ": " + err.Error())
	}
	return geoZoneIndex{features: wrapper.Data.Features}
}

func LookupWindRegion(lat, lon float64) (string, bool) {
	loadGeoZones()
	zone, ok := lookupZone(windZoneIdx, lat, lon)
	if !ok {
		return "", false
	}
	return windZoneToRoman(zone), true
}

func LookupSnowRegion(lat, lon float64) (string, bool) {
	loadGeoZones()
	zone, ok := lookupZone(snowZoneIdx, lat, lon)
	if !ok {
		return "", false
	}
	return snowZoneToRoman(zone), true
}

func lookupZone(idx geoZoneIndex, lat, lon float64) (string, bool) {
	for _, feat := range idx.features {
		if pointInGeoFeature(lon, lat, feat.Geometry) {
			if z, ok := feat.Props["zone"]; ok {
				return zoneString(z), true
			}
		}
	}
	return "", false
}

func zoneString(v any) string {
	switch z := v.(type) {
	case string:
		return z
	case float64:
		return strconv.Itoa(int(z))
	case int:
		return strconv.Itoa(z)
	default:
		return fmt.Sprint(v)
	}
}

func windZoneToRoman(zone string) string {
	switch zone {
	case "8": // подрайон Ia (0,17 кПа) — в UI нет отдельного значения
		return "I"
	default:
		return numericZoneToRoman(zone)
	}
}

func snowZoneToRoman(zone string) string {
	return numericZoneToRoman(zone)
}

func numericZoneToRoman(zone string) string {
	n, err := strconv.Atoi(zone)
	if err != nil || n < 1 {
		return zone
	}
	romans := []string{"I", "II", "III", "IV", "V", "VI", "VII", "VIII"}
	if n <= len(romans) {
		return romans[n-1]
	}
	return zone
}

func pointInGeoFeature(lon, lat float64, geom geoGeometry) bool {
	switch geom.Type {
	case "Polygon":
		var rings [][][]float64
		if err := json.Unmarshal(geom.Coordinates, &rings); err != nil {
			return false
		}
		return pointInGeoPolygon(lon, lat, rings)
	case "MultiPolygon":
		var polys [][][][]float64
		if err := json.Unmarshal(geom.Coordinates, &polys); err != nil {
			return false
		}
		for _, rings := range polys {
			if pointInGeoPolygon(lon, lat, rings) {
				return true
			}
		}
	}
	return false
}

func pointInGeoPolygon(lon, lat float64, rings [][][]float64) bool {
	if len(rings) == 0 {
		return false
	}
	if !pointInGeoRing(lon, lat, rings[0]) {
		return false
	}
	for _, hole := range rings[1:] {
		if pointInGeoRing(lon, lat, hole) {
			return false
		}
	}
	return true
}

func pointInGeoRing(lon, lat float64, ring [][]float64) bool {
	inside := false
	j := len(ring) - 1
	for i := 0; i < len(ring); i++ {
		xi, yi := ring[i][0], ring[i][1]
		xj, yj := ring[j][0], ring[j][1]
		if ((yi > lat) != (yj > lat)) && (lon < (xj-xi)*(lat-yi)/(yj-yi+1e-15)+xi) {
			inside = !inside
		}
		j = i
	}
	return inside
}

func ApplyGeoRegions(res *ClimateLookupResult, city string, lat, lon float64) bool {
	applied := false
	if sr, ok := LookupSnowRegion(lat, lon); ok {
		res.SnowRegion = sr
		res.Sg = snowLoad(sr)
		applied = true
	}
	if wr, ok := LookupWindRegion(lat, lon); ok {
		res.WindRegion = wr
		res.W0 = windPressure(wr)
		settlement, settlementOk := findSettlement(city)
		if !(settlementOk && len(settlement.JanuaryRose) == 8) {
			loadClimateDB()
			if r, ok := climateDB.WindRosesByRegion[wr]; ok && len(r) > 0 {
				res.WindRose = cloneRose(r)
				res.Prevailing = prevailingWind(res.WindRose)
			}
		}
		applied = true
	}
	return applied
}
