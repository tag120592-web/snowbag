package export

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"
	"github.com/technonicol/snowbag/api/internal/model"
	"github.com/xuri/excelize/v2"
)

func PDF(project *model.Project, calc model.CalculationResult) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(12, 12, 12)
	pdf.AddPage()
	pdf.SetFont("Helvetica", "B", 14)
	pdf.Cell(0, 8, pdfSafe("Snowbag — "+project.Name))
	pdf.Ln(10)
	pdf.SetFont("Helvetica", "", 10)
	lines := []string{
		fmt.Sprintf("Object: %s", project.Name),
		fmt.Sprintf("Address: %s", project.Address),
		fmt.Sprintf("City: %s  Snow region: %s  Wind region: %s", project.City, project.SnowRegion, project.WindRegion),
		fmt.Sprintf("Roof area: %s m2  Snow bags: %s m2  Sensors: %d",
			calc.Metrics.RoofArea, calc.Metrics.BagsArea, calc.Metrics.Sensors),
		fmt.Sprintf("Max load: %s kPa  Coverage: %s%%", calc.Metrics.MaxLoad, calc.Metrics.Coverage),
		"Norm: SP 20.13330.2016 (amend. 6)",
	}
	for _, line := range lines {
		pdf.Cell(0, 6, pdfSafe(line))
		pdf.Ln(6)
	}
	pdf.Ln(4)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(0, 6, pdfSafe("Snow accumulation zones"))
	pdf.Ln(7)
	pdf.SetFont("Helvetica", "", 9)
	for _, b := range calc.Snowbags {
		pdf.Cell(0, 5, pdfSafe(fmt.Sprintf("%s — %s: %d m2, mu-load %s kPa (%s)", b.ID, b.Name, b.Area, b.Load, b.Risk)))
		pdf.Ln(5)
	}
	pdf.Ln(4)
	pdf.SetFont("Helvetica", "B", 11)
	pdf.Cell(0, 6, pdfSafe("Sensors"))
	pdf.Ln(7)
	pdf.SetFont("Helvetica", "", 9)
	for _, s := range calc.Sensors {
		z := "—"
		if s.Zone != nil {
			z = *s.Zone
		}
		pdf.Cell(0, 5, pdfSafe(fmt.Sprintf("%s: x=%.0f y=%.0f zone=%s", s.ID, s.X, s.Y, z)))
		pdf.Ln(5)
	}
	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func Excel(project *model.Project, calc model.CalculationResult) ([]byte, error) {
	f := excelize.NewFile()
	defer f.Close()
	summary := "Summary"
	areas := "Areas"
	sensors := "Sensors"
	obs := "Obstacles"
	_ = f.SetSheetName("Sheet1", summary)
	_, _ = f.NewSheet(areas)
	_, _ = f.NewSheet(sensors)
	_, _ = f.NewSheet(obs)

	_ = f.SetCellValue(summary, "A1", "Проект")
	_ = f.SetCellValue(summary, "B1", project.Name)
	_ = f.SetCellValue(summary, "A2", "Адрес")
	_ = f.SetCellValue(summary, "B2", project.Address)
	_ = f.SetCellValue(summary, "A3", "Площадь кровли, м²")
	_ = f.SetCellValue(summary, "B3", calc.Metrics.RoofArea)
	_ = f.SetCellValue(summary, "A4", "Площадь мешков, м²")
	_ = f.SetCellValue(summary, "B4", calc.Metrics.BagsArea)
	_ = f.SetCellValue(summary, "A5", "Датчики, шт.")
	_ = f.SetCellValue(summary, "B5", calc.Metrics.Sensors)

	headers := []string{"ID", "Название", "Площадь м²", "μ", "Нагрузка кПа", "Риск"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(areas, cell, h)
	}
	for r, b := range calc.Snowbags {
		row := r + 2
		_ = f.SetCellValue(areas, cellAt(1, row), b.ID)
		_ = f.SetCellValue(areas, cellAt(2, row), b.Name)
		_ = f.SetCellValue(areas, cellAt(3, row), b.Area)
		_ = f.SetCellValue(areas, cellAt(4, row), b.Mu)
		_ = f.SetCellValue(areas, cellAt(5, row), b.Load)
		_ = f.SetCellValue(areas, cellAt(6, row), b.Risk)
	}

	sh := []string{"ID", "X", "Y", "Зона"}
	for i, h := range sh {
		_ = f.SetCellValue(sensors, cellAt(i+1, 1), h)
	}
	for r, s := range calc.Sensors {
		row := r + 2
		z := ""
		if s.Zone != nil {
			z = *s.Zone
		}
		_ = f.SetCellValue(sensors, cellAt(1, row), s.ID)
		_ = f.SetCellValue(sensors, cellAt(2, row), s.X)
		_ = f.SetCellValue(sensors, cellAt(3, row), s.Y)
		_ = f.SetCellValue(sensors, cellAt(4, row), z)
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func cellAt(col, row int) string {
	c, _ := excelize.CoordinatesToCellName(col, row)
	return c
}

func pdfSafe(s string) string {
	r := strings.NewReplacer("«", "\"", "»", "\"", "—", "-", "μ", "u", "²", "2", "№", "No")
	out := r.Replace(s)
	var b strings.Builder
	for _, ch := range out {
		if ch < 128 {
			b.WriteRune(ch)
		} else {
			b.WriteRune('?')
		}
	}
	return b.String()
}

func ParseCalculation(raw []byte) (model.CalculationResult, error) {
	var c model.CalculationResult
	if len(raw) == 0 {
		return c, fmt.Errorf("empty calculation")
	}
	err := json.Unmarshal(raw, &c)
	return c, err
}
