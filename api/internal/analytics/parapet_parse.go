package analytics

import (
	"regexp"
	"strconv"
	"strings"
)

var parapetNumRe = regexp.MustCompile(`[\d]+[,.]?\d*`)

// ParseParapetMm extracts millimeters from strings like "600 мм" or "0,6 м".
func ParseParapetMm(s string) float64 {
	s = strings.TrimSpace(strings.ToLower(s))
	if s == "" {
		return 600
	}
	if strings.Contains(s, "м") && !strings.Contains(s, "мм") {
		m := parapetNumRe.FindString(s)
		m = strings.ReplaceAll(m, ",", ".")
		if v, err := strconv.ParseFloat(m, 64); err == nil && v > 0 {
			return v * 1000
		}
	}
	m := parapetNumRe.FindString(s)
	m = strings.ReplaceAll(m, ",", ".")
	if v, err := strconv.ParseFloat(m, 64); err == nil && v > 0 {
		return v
	}
	return 600
}
