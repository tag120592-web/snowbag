package analytics

import (
	"math"

	"github.com/technonicol/snowbag/api/internal/model"
)

const defaultCellSizeM = 0.25

func calculateLoadGrid(
	geom model.GeometryData,
	sg, northDeg, parapetMm, ce, ct float64,
	windDirectionDeg *float64,
	windRose []model.WindRose,
	cellSizeM float64,
) *model.LoadGrid {
	roof := geom.Roof
	if len(roof) < 3 {
		return nil
	}
	if cellSizeM <= 0 {
		cellSizeM = defaultCellSizeM
	}
	if ce <= 0 {
		ce = defaultCe
	}
	if ct <= 0 {
		ct = defaultCt
	}
	if parapetMm <= 0 {
		parapetMm = 600
	}
	parapetM := parapetMm / 1000

	roof = ensureCCW(roof)
	mpp := metersPerPixel(roof, geom.AreaM2)
	cellPx := cellSizeM / mpp

	minX, minY, maxX, maxY := roofBounds(roof)
	width := int(math.Max(1, math.Ceil((maxX-minX)/cellPx)))
	height := int(math.Max(1, math.Ceil((maxY-minY)/cellPx)))

	windDeg := resolveWindDirectionDeg(windDirectionDeg, windRose)
	localWind := math.Mod(windDeg-northDeg+360, 360)
	windX, windY := windFromVector(localWind)
	sBase := sp20BaseLoad(sg, ce, ct, 1)

	var grid []model.GridCell
	minVal := math.MaxFloat64
	maxVal := 0.0

	for row := 0; row < height; row++ {
		for col := 0; col < width; col++ {
			px := minX + (float64(col)+0.5)*cellPx
			py := minY + (float64(row)+0.5)*cellPx
			if !pointInPolygon([]float64{px, py}, roof) {
				continue
			}
			mu := muAtPoint(px, py, roof, geom, parapetM, sBase, mpp, windX, windY)
			val := sp20BaseLoad(sg, ce, ct, mu)
			xM := (px - minX) * mpp
			yM := (py - minY) * mpp
			grid = append(grid, model.GridCell{X: xM, Y: yM, ValueKpa: val})
			if val < minVal {
				minVal = val
			}
			if val > maxVal {
				maxVal = val
			}
		}
	}

	if len(grid) == 0 {
		minVal = 0
	}

	return &model.LoadGrid{
		Grid:                  grid,
		Width:                 width,
		Height:                height,
		CellSizeM:             cellSizeM,
		MinValueKpa:           minVal,
		MaxValueKpa:           maxVal,
		Bounds:                model.GridBounds{MinX: 0, MinY: 0, MaxX: (maxX - minX) * mpp, MaxY: (maxY - minY) * mpp},
		WindDirectionDeg:      windDeg,
		LocalWindDirectionDeg: localWind,
		NorthDirectionDeg:     northDeg,
	}
}
