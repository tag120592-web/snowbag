package export

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/jung-kurt/gofpdf"
	"github.com/technonicol/snowbag/api/internal/model"
	"github.com/xuri/excelize/v2"
)

// PDF собирает отчёт по объекту на русском: снеговая нагрузка (зоны, датчики) и,
// если есть, теплотехнический расчёт. thermal может быть nil.
func PDF(project *model.Project, calc model.CalculationResult, thermal *model.ThermalCalculation) ([]byte, error) {
	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(12, 12, 12)
	// Кириллический шрифт (вшит в бинарь) — иначе русский текст не отрисуется.
	pdf.AddUTF8FontFromBytes("DejaVu", "", dejaVuRegular)
	pdf.AddUTF8FontFromBytes("DejaVu", "B", dejaVuBold)
	pdf.AddPage()

	pdf.SetFont("DejaVu", "B", 14)
	pdf.Cell(0, 8, "Отчёт по объекту — "+orDash(project.Name))
	pdf.Ln(11)

	pdf.SetFont("DejaVu", "", 10)
	for _, line := range []string{
		"Объект: " + orDash(project.Name),
		"Адрес: " + orDash(project.Address),
		fmt.Sprintf("Город: %s   Снеговой район: %s   Ветровой район: %s",
			orDash(project.City), orDash(project.SnowRegion), orDash(project.WindRegion)),
		fmt.Sprintf("Площадь кровли: %s м²   Площадь мешков: %s м²   Датчиков: %d",
			calc.Metrics.RoofArea, calc.Metrics.BagsArea, calc.Metrics.Sensors),
		fmt.Sprintf("Макс. нагрузка: %s кПа   Покрытие: %s %%", calc.Metrics.MaxLoad, calc.Metrics.Coverage),
		"Норматив: СП 20.13330.2016 (изм. 6)",
	} {
		pdf.Cell(0, 6, line)
		pdf.Ln(6)
	}

	// --- Снеговые мешки ---
	section(pdf, "Зоны снегонакопления")
	pdf.SetFont("DejaVu", "", 9)
	if len(calc.Snowbags) == 0 {
		pdf.Cell(0, 5, "— нет данных (расчёт мешков не выполнен)")
		pdf.Ln(5)
	}
	for _, b := range calc.Snowbags {
		pdf.Cell(0, 5, fmt.Sprintf("%s — %s: %d м², μ·нагрузка %s кПа (%s)", b.ID, b.Name, b.Area, b.Load, b.Risk))
		pdf.Ln(5)
	}

	// --- Датчики ---
	section(pdf, "Датчики")
	pdf.SetFont("DejaVu", "", 9)
	if len(calc.Sensors) == 0 {
		pdf.Cell(0, 5, "— датчики не размещены")
		pdf.Ln(5)
	}
	for _, s := range calc.Sensors {
		z := "—"
		if s.Zone != nil {
			z = *s.Zone
		}
		pdf.Cell(0, 5, fmt.Sprintf("%s: x=%.0f y=%.0f зона=%s", s.ID, s.X, s.Y, z))
		pdf.Ln(5)
	}

	// --- Теплотехника ---
	if thermal != nil && thermal.Thermal != nil {
		t := thermal.Thermal
		section(pdf, "Теплотехнический расчёт (СП 50.13330)")
		pdf.SetFont("DejaVu", "", 9)
		for _, line := range []string{
			fmt.Sprintf("Температура помещения: %.0f °C   Влажность: %.0f %%", thermal.Input.TIn, thermal.Input.HumidityPct),
			fmt.Sprintf("R приведённое (Rпр): %.2f   R требуемое (Rтр): %.2f  м²·°C/Вт", t.Rred, t.Rreq),
			fmt.Sprintf("Коэффициент теплотехнической однородности: %.3f   Запас: %.0f %%", t.R, t.ReservePct),
			"Вывод: " + orDash(t.Verdict),
		} {
			pdf.Cell(0, 5, line)
			pdf.Ln(5)
		}
		if thermal.Vapor != nil {
			pdf.Cell(0, 5, "Влагонакопление (разд. 8 СП 50): "+orDash(thermal.Vapor.Verdict))
			pdf.Ln(5)
		}
		pdf.Ln(1)
		pdf.SetFont("DejaVu", "B", 9)
		pdf.Cell(0, 5, "Состав (снаружи → внутрь):")
		pdf.Ln(5)
		pdf.SetFont("DejaVu", "", 9)
		for _, l := range t.Layers {
			pdf.Cell(0, 5, fmt.Sprintf("• %s — %s: δ=%.0f мм, λ=%.3f, R=%.2f",
				orDash(l.Role), l.Material.Name, l.ThicknessMM, l.Material.Lambda, l.R))
			pdf.Ln(5)
		}
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func section(pdf *gofpdf.Fpdf, title string) {
	pdf.Ln(5)
	pdf.SetFont("DejaVu", "B", 11)
	pdf.Cell(0, 6, title)
	pdf.Ln(7)
}

func orDash(s string) string {
	if s == "" {
		return "—"
	}
	return s
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

func ParseCalculation(raw []byte) (model.CalculationResult, error) {
	var c model.CalculationResult
	if len(raw) == 0 {
		return c, fmt.Errorf("empty calculation")
	}
	err := json.Unmarshal(raw, &c)
	return c, err
}
