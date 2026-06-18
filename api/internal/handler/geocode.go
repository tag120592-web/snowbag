package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
)

type geocodeResponse struct {
	Address     string  `json:"address"`
	Label       string  `json:"label,omitempty"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	PlaceRank   int     `json:"-"`
	AddressType string  `json:"-"`
	HouseNumber string  `json:"-"`
}

var russianCityCoords = map[string][2]float64{
	"москва":          {55.7558, 37.6173},
	"санкт-петербург": {59.9343, 30.3351},
	"екатеринбург":    {56.8389, 60.6057},
	"новосибирск":     {55.0084, 82.9357},
	"казань":          {55.7963, 49.1088},
	"нижний новгород": {56.3269, 44.0059},
	"челябинск":       {55.1644, 61.4368},
	"самара":          {53.1959, 50.1002},
	"омск":            {54.9885, 73.3242},
	"ростов-на-дону":  {47.2357, 39.7015},
	"уфа":             {54.7388, 55.9721},
	"красноярск":      {56.0153, 92.8932},
	"воронеж":         {51.6720, 39.1843},
	"пермь":           {58.0105, 56.2502},
	"волгоград":       {48.7082, 44.5153},
	"краснодар":       {45.0355, 38.9753},
	"тюмень":          {57.153, 65.5343},
}

func (h *Handler) geocode(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	projectCity := strings.TrimSpace(r.URL.Query().Get("city"))
	if q == "" {
		writeError(w, http.StatusBadRequest, "q is required")
		return
	}

	search := q
	if !strings.Contains(strings.ToLower(search), "россия") {
		search = search + ", Россия"
	}
	ctx := r.Context()

	if res, err := h.geocodeYandex(ctx, search); err == nil {
		res.Address = q
		writeJSON(w, http.StatusOK, res)
		return
	}
	if parsed, ok := parseRussianAddress(q); ok {
		if res, err := h.geocodeNominatimStructured(ctx, parsed); err == nil {
			res.Address = q
			writeJSON(w, http.StatusOK, res)
			return
		}
	}
	if res, err := h.geocodeNominatim(ctx, search); err == nil && isPreciseEnough(res, q) {
		res.Address = q
		writeJSON(w, http.StatusOK, res)
		return
	}
	for _, variant := range nominatimVariants(q, projectCity) {
		if res, err := h.geocodeNominatim(ctx, variant); err == nil && isPreciseEnough(res, q) {
			res.Address = q
			writeJSON(w, http.StatusOK, res)
			return
		}
	}
	if parsed, ok := parseRussianAddress(q); ok {
		if res, err := h.geocodeNominatimStructured(ctx, parsed); err == nil {
			res.Address = q
			writeJSON(w, http.StatusOK, res)
			return
		}
	}
	if cityInQuery, ok := cityMentionedInQuery(q); ok {
		if res, err := h.geocodeNominatim(ctx, cityInQuery+", Россия"); err == nil && !queryHasHouseNumber(q) {
			res.Address = q
			writeJSON(w, http.StatusOK, res)
			return
		}
		if !queryHasHouseNumber(q) {
			if res, ok := geocodeCityByName(cityInQuery); ok {
				res.Address = q
				writeJSON(w, http.StatusOK, res)
				return
			}
		}
	}
	if res, ok := geocodeCityFallback(projectCity, q); ok && !queryHasHouseNumber(q) {
		res.Address = q
		writeJSON(w, http.StatusOK, res)
		return
	}
	if res, err := h.geocodeNominatim(ctx, search); err == nil {
		res.Address = q
		writeJSON(w, http.StatusOK, res)
		return
	}

	writeError(w, http.StatusNotFound, "address not found")
}

type nominatimItem struct {
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
	DisplayName string `json:"display_name"`
	PlaceRank   int    `json:"place_rank"`
	AddressType string `json:"addresstype"`
	Address     struct {
		HouseNumber string `json:"house_number"`
		Road        string `json:"road"`
		City        string `json:"city"`
	} `json:"address"`
}

type parsedAddress struct {
	City   string
	Street string
}

var houseNumberPattern = regexp.MustCompile(`(?i)(?:^|[\s,]+)(\d+[а-яa-z]?)(?:[\s,]|$)`)

func queryHasHouseNumber(query string) bool {
	return houseNumberPattern.MatchString(query)
}

func isPreciseEnough(res geocodeResponse, query string) bool {
	if !queryHasHouseNumber(query) {
		return true
	}
	if res.PlaceRank >= 26 {
		return true
	}
	if res.AddressType == "building" || res.AddressType == "house" {
		return true
	}
	if res.HouseNumber != "" {
		return true
	}
	return false
}

func parseRussianAddress(query string) (parsedAddress, bool) {
	parts := strings.Split(query, ",")
	clean := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			clean = append(clean, part)
		}
	}
	if len(clean) == 0 {
		return parsedAddress{}, false
	}

	var city, street string
	if len(clean) == 1 {
		if cityName, ok := cityMentionedInQuery(clean[0]); ok {
			return parsedAddress{City: cityName}, true
		}
		return parsedAddress{}, false
	}

	first := clean[0]
	last := clean[len(clean)-1]
	if cityName, ok := cityMentionedInQuery(first); ok {
		city = cityName
		street = strings.Join(clean[1:], ", ")
	} else if cityName, ok := cityMentionedInQuery(last); ok {
		city = cityName
		street = strings.Join(clean[:len(clean)-1], ", ")
	} else {
		city = first
		street = strings.Join(clean[1:], ", ")
	}

	street = strings.NewReplacer(
		"г.", "", "г ", "", "ул.", "", "улица", "", "пр.", "", "проспект", "",
		"пер.", "", "д.", "", "дом", "",
	).Replace(street)
	street = strings.Join(strings.Fields(street), " ")
	city = strings.NewReplacer("г.", "", "г ", "").Replace(strings.TrimSpace(city))
	city = titleFirst(city)

	if city == "" || street == "" {
		return parsedAddress{}, false
	}
	return parsedAddress{City: city, Street: street}, true
}

func (h *Handler) geocodeNominatimStructured(ctx context.Context, parsed parsedAddress) (geocodeResponse, error) {
	u, _ := url.Parse("https://nominatim.openstreetmap.org/search")
	q := u.Query()
	q.Set("street", parsed.Street)
	q.Set("city", parsed.City)
	q.Set("country", "Russia")
	q.Set("format", "json")
	q.Set("limit", "1")
	q.Set("addressdetails", "1")
	u.RawQuery = q.Encode()
	return h.fetchNominatim(ctx, u.String())
}

func normalizeCityKey(city string) string {
	return strings.ToLower(strings.TrimSpace(strings.TrimPrefix(strings.TrimPrefix(city, "г."), "г ")))
}

func titleFirst(s string) string {
	if s == "" {
		return s
	}
	runes := []rune(s)
	runes[0] = []rune(strings.ToUpper(string(runes[0])))[0]
	return string(runes)
}

func cityMentionedInQuery(query string) (string, bool) {
	lower := strings.ToLower(query)
	// Longer names first (санкт-петербург before пермь etc.)
	names := []string{
		"санкт-петербург", "ростов-на-дону", "нижний новгород",
		"екатеринбург", "новосибирск", "волгоград", "красноярск", "краснодар",
		"челябинск", "москва", "казань", "самара", "воронеж", "пермь", "уфа", "омск", "тюмень",
	}
	for _, name := range names {
		if strings.Contains(lower, name) {
			return name, true
		}
	}
	return "", false
}

func queryMentionsOtherCity(query, projectCity string) bool {
	if mentioned, ok := cityMentionedInQuery(query); ok {
		return normalizeCityKey(mentioned) != normalizeCityKey(projectCity)
	}
	return false
}

func nominatimVariants(query, projectCity string) []string {
	replacer := strings.NewReplacer(
		"г.", "", "г ", "", "ул.", "", "улица", "", "пр.", "", "проспект", "",
		"пер.", "", "д.", "", "дом", "",
	)
	simplified := strings.Join(strings.Fields(replacer.Replace(query)), " ")
	variants := []string{}
	if simplified != "" {
		variants = append(variants, simplified+", Россия")
	}
	if projectCity != "" && simplified != "" && !queryMentionsOtherCity(query, projectCity) {
		if !strings.Contains(strings.ToLower(simplified), normalizeCityKey(projectCity)) {
			variants = append(variants, projectCity+", "+simplified+", Россия")
		}
	}
	return variants
}

func geocodeCityByName(name string) (geocodeResponse, bool) {
	key := normalizeCityKey(name)
	if coords, ok := russianCityCoords[key]; ok {
		return geocodeResponse{Label: name, Lat: coords[0], Lon: coords[1]}, true
	}
	return geocodeResponse{}, false
}

func geocodeCityFallback(projectCity, query string) (geocodeResponse, bool) {
	if res, ok := geocodeCityByName(query); ok {
		return res, true
	}
	if projectCity != "" && !queryMentionsOtherCity(query, projectCity) {
		if res, ok := geocodeCityByName(projectCity); ok {
			return res, true
		}
	}
	return geocodeResponse{}, false
}

func (h *Handler) geocodeYandex(ctx context.Context, search string) (geocodeResponse, error) {
	if h.cfg.YandexMapsAPIKey == "" {
		return geocodeResponse{}, fmt.Errorf("no key")
	}
	u, _ := url.Parse("https://geocode-maps.yandex.ru/1.x/")
	q := u.Query()
	q.Set("apikey", h.cfg.YandexMapsAPIKey)
	q.Set("geocode", search)
	q.Set("format", "json")
	q.Set("results", "1")
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return geocodeResponse{}, err
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return geocodeResponse{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return geocodeResponse{}, fmt.Errorf("yandex status %d", res.StatusCode)
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return geocodeResponse{}, err
	}
	var payload struct {
		Response struct {
			GeoObjectCollection struct {
				FeatureMember []struct {
					GeoObject struct {
						Point struct {
							Pos string `json:"pos"`
						} `json:"Point"`
						MetaDataProperty struct {
							GeocoderMetaData struct {
								Text string `json:"text"`
							} `json:"GeocoderMetaData"`
						} `json:"metaDataProperty"`
					} `json:"GeoObject"`
				} `json:"featureMember"`
			} `json:"GeoObjectCollection"`
		} `json:"response"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return geocodeResponse{}, err
	}
	members := payload.Response.GeoObjectCollection.FeatureMember
	if len(members) == 0 {
		return geocodeResponse{}, fmt.Errorf("not found")
	}
	pos := strings.Fields(members[0].GeoObject.Point.Pos)
	if len(pos) != 2 {
		return geocodeResponse{}, fmt.Errorf("bad coords")
	}
	var lon, lat float64
	if _, err := fmt.Sscanf(pos[0], "%f", &lon); err != nil {
		return geocodeResponse{}, err
	}
	if _, err := fmt.Sscanf(pos[1], "%f", &lat); err != nil {
		return geocodeResponse{}, err
	}
	return geocodeResponse{
		Label: members[0].GeoObject.MetaDataProperty.GeocoderMetaData.Text,
		Lat:   lat,
		Lon:   lon,
	}, nil
}

func (h *Handler) geocodeNominatim(ctx context.Context, search string) (geocodeResponse, error) {
	u, _ := url.Parse("https://nominatim.openstreetmap.org/search")
	q := u.Query()
	q.Set("q", search)
	q.Set("format", "json")
	q.Set("limit", "1")
	q.Set("countrycodes", "ru")
	q.Set("addressdetails", "1")
	u.RawQuery = q.Encode()
	return h.fetchNominatim(ctx, u.String())
}

func (h *Handler) fetchNominatim(ctx context.Context, rawURL string) (geocodeResponse, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return geocodeResponse{}, err
	}
	req.Header.Set("User-Agent", "Snowbag/1.0 (roof monitoring app)")
	req.Header.Set("Accept-Language", "ru")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return geocodeResponse{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return geocodeResponse{}, fmt.Errorf("nominatim status %d", res.StatusCode)
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return geocodeResponse{}, err
	}
	var items []nominatimItem
	if err := json.Unmarshal(body, &items); err != nil {
		return geocodeResponse{}, err
	}
	if len(items) == 0 {
		return geocodeResponse{}, fmt.Errorf("not found")
	}
	var lat, lon float64
	if _, err := fmt.Sscanf(items[0].Lat, "%f", &lat); err != nil {
		return geocodeResponse{}, err
	}
	if _, err := fmt.Sscanf(items[0].Lon, "%f", &lon); err != nil {
		return geocodeResponse{}, err
	}
	return geocodeResponse{
		Label:       items[0].DisplayName,
		Lat:         lat,
		Lon:         lon,
		PlaceRank:   items[0].PlaceRank,
		AddressType: items[0].AddressType,
		HouseNumber: items[0].Address.HouseNumber,
	}, nil
}
