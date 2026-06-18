package analytics

// Snow load shape coefficients for flat roof MVP (СП 20.13330.2016, п. 10.4).
const (
	defaultCe = 1.0 // экспозиция — плоская открытая кровля
	defaultCt = 1.0 // тепловой коэффициент — неотапливаемое здание

	minBagAreaM2 = 5

	// Parapet snow bag depth (m) calibrated to demo Z4/Z6 at mpp≈0.153.
	parapetStripDepthM = 6.7

	// Concave corner zone size (m) for μ=3.2 bags.
	cornerZoneSizeM = 14.5

	// Obstacle lee zone depth (m), calibrated to demo Z2/Z3/Z5.
	leeDepthPerHeightM = 3.0
	leeMinDepthM       = 6.0
	leeMaxDepthM       = 10.0
)
