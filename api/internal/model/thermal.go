package model

import (
	"time"

	"github.com/google/uuid"
)

// Модель данных теплотехнического расчёта (ТТР) и расчёта влагонакопления
// для плоских кровель. Следует «Финальному алгоритму ТТР и влагонакопления»:
// ТТР — СП 50.13330.2024 + СП 230 (неоднородности) + СП 345 + климат СП 131;
// влагонакопление — раздел 8 СП 50.13330.2024.
//
// ВАЖНО: здесь только структура. Конкретные нормативные таблицы и коэффициенты
// (Rтр от ГСОП, ψ/χ по СП 230, табл. 11–12, Δw, давления насыщения по прил. Ж)
// подставляются в пакете analytics из текстов СП — помечены как TODO(СП).

// ---------- Источник №1: цифровая модель кровли (из сервиса распознавания) ----------

// RoofElementType — тип распознанного элемента кровли.
type RoofElementType string

const (
	ElemParapet   RoofElementType = "parapet"   // парапет
	ElemFonar     RoofElementType = "fonar"     // фонарь
	ElemShaft     RoofElementType = "shaft"     // шахта
	ElemNadstroy  RoofElementType = "nadstroy"  // надстройка
	ElemDefShov   RoofElementType = "def_shov"  // деформационный шов
	ElemAerator   RoofElementType = "aerator"   // аэратор
	ElemProhodka  RoofElementType = "prohodka"  // проходка (кабель/труба)
	ElemKolonna   RoofElementType = "kolonna"   // колонна
	ElemEquipment RoofElementType = "equipment" // оборудование
	ElemOther     RoofElementType = "other"     // прочий выступающий элемент
)

// RoofElement — элемент цифровой модели кровли (п. 5 алгоритма).
type RoofElement struct {
	ID            string          `json:"id"`
	Type          RoofElementType `json:"type"`
	Coords        [][]float64     `json:"coords,omitempty"`
	WidthM        float64         `json:"widthM,omitempty"`
	LengthM       float64         `json:"lengthM,omitempty"`
	AreaM2        float64         `json:"areaM2,omitempty"`
	HeightM       float64         `json:"heightM,omitempty"`
	Recognized    bool            `json:"recognized"` // true — авто, false — добавлен вручную
}

// ---------- Неоднородности (СП 230), участвуют только в ТТР ----------

// HeteroKind — линейная или точечная неоднородность (пп. 8–9 алгоритма).
type HeteroKind string

const (
	HeteroLinear HeteroKind = "linear" // линейная (Вт/(м·°C), коэф. ψ)
	HeteroPoint  HeteroKind = "point"  // точечная (Вт/°C, коэф. χ)
)

// HeteroStatus — стадия кандидата (п. 7 алгоритма).
type HeteroStatus string

const (
	HeteroCandidate HeteroStatus = "candidate" // кандидат, не подтверждён
	HeteroConfirmed HeteroStatus = "confirmed" // подтверждён пользователем, в расчёте
	HeteroExcluded  HeteroStatus = "excluded"  // исключён (нет узла СП 230 или снят пользователем)
)

// Heterogeneity — кандидат/учтённая теплотехническая неоднородность.
// Распознанный элемент НЕ является неоднородностью автоматически: он проходит
// путь кандидат → сопоставление с СП 230 → подтверждение пользователем.
type Heterogeneity struct {
	ID        string       `json:"id"`
	ElementID string       `json:"elementId,omitempty"` // ссылка на RoofElement
	Kind      HeteroKind   `json:"kind"`
	Type      string       `json:"type"`              // человекочитаемый тип
	SP230Node string       `json:"sp230Node,omitempty"` // код нормативного узла СП 230 ("" — аналога нет)
	Status    HeteroStatus `json:"status"`
	LengthM   float64      `json:"lengthM,omitempty"` // для линейных
	Count     int          `json:"count,omitempty"`   // для точечных
	// Коэффициенты и вклад — заполняются в analytics по СП 230. TODO(СП 230).
	Psi    float64 `json:"psi,omitempty"`    // ψ, Вт/(м·°C) — линейный
	Chi    float64 `json:"chi,omitempty"`    // χ, Вт/°C — точечный
	DeltaR float64 `json:"deltaR,omitempty"` // вклад в снижение приведённого сопротивления
}

// ---------- Источник №2: ПИМ (системы и материалы) ----------

// MaterialSource — откуда взяты свойства материала (этап 5 алгоритма).
type MaterialSource string

const (
	SourcePIM     MaterialSource = "pim"     // из ПИМ
	SourceLibrary MaterialSource = "library" // корпоративная библиотека
	SourceManual  MaterialSource = "manual"  // ручной ввод пользователя
)

// Material — материал слоя со свойствами, нужными для ТТР и влаги.
type Material struct {
	EKN     string         `json:"ekn,omitempty"` // идентификатор в ПИМ
	Name    string         `json:"name"`
	Lambda  float64        `json:"lambda"`           // λ, Вт/(м·°C) — теплопроводность
	Mu      *float64       `json:"mu,omitempty"`     // μ, мг/(м·ч·Па) — паропроницаемость (для влаги)
	Density *float64       `json:"density,omitempty"` // ρ, кг/м³
	DeltaW  *float64       `json:"deltaW,omitempty"` // допустимое приращение влажности, % (для влаги)
	Source  MaterialSource `json:"source"`
}

// Layer — слой конструкции (снаружи → внутрь).
type Layer struct {
	Material    Material `json:"material"`
	Role        string   `json:"role"`        // Гидроизоляция / Теплоизоляция / Пароизоляция / Несущее основание ...
	ThicknessMM float64  `json:"thicknessMm"` // δ, мм
	IsInsulant  bool     `json:"isInsulant"`  // утеплитель — толщина подбирается на этапе 11
	R           float64  `json:"r"`           // термическое сопротивление слоя = (δ/1000)/λ
}

// ThermalSystem — система кровли ТЕХНОНИКОЛЬ (из ПИМ по ЕКН).
type ThermalSystem struct {
	EKN    string  `json:"ekn,omitempty"`
	Slug   string  `json:"slug"`
	Name   string  `json:"name"`
	Note   string  `json:"note,omitempty"`
	Layers []Layer `json:"layers"`
}

// ---------- Источник №3: климат и нормативы (база теплотехнического калькулятора) ----------

// ThermalClimate — климатические параметры по СП 131 для ТТР и влаги.
// Заполняется из выгрузки СП 131 (отдельный источник, не снеговой климат).
type ThermalClimate struct {
	City            string    `json:"city"`
	Tht             float64   `json:"tht"`             // расчётная зимняя температура наружного воздуха, °C
	Tot             float64   `json:"tot"`             // средняя температура отопительного периода, °C
	Zot             int       `json:"zot"`             // продолжительность отопительного периода, сут
	Dd              float64   `json:"dd"`              // ГСОП, °C·сут = (tв − tot)·zot
	HumidityZone    string    `json:"humidityZone"`    // зона влажности: сухая / нормальная / влажная
	MonthlyTemp     []float64 `json:"monthlyTemp"`     // 12 средних месячных температур (для влаги)
	MonthlyHumidity []float64 `json:"monthlyHumidity"` // 12 средних месячных влажностей, %
	Norm            string    `json:"norm"`
}

// BuildingCategory — категория здания (этап 2 ТТР). Определяет температурно-влажностный
// режим и расчётную температуру помещения по умолчанию (с возможностью ручной правки).
type BuildingCategory struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	Full       string  `json:"full"`
	DefaultTIn float64 `json:"defaultTIn"` // температура помещения по умолчанию для категории. TODO(СП)
}

// ---------- Вход расчёта ----------

// CalcModules — выбранные пользователем расчётные модули (п. 6 алгоритма).
type CalcModules struct {
	Thermal bool `json:"thermal"` // теплотехнический расчёт
	Vapor   bool `json:"vapor"`   // расчёт влагонакопления
}

// ThermalInput — исходные данные расчёта.
type ThermalInput struct {
	Modules       CalcModules `json:"modules"`
	CategoryID    string      `json:"categoryId"`
	TIn           float64     `json:"tIn"`         // температура помещения (авто по категории + ручная правка)
	HumidityPct   float64     `json:"humidityPct"` // влажность помещения, %
	SystemEKN     string      `json:"systemEkn"`   // выбранная система (ЕКН)
	ManualInsulMM *float64    `json:"manualInsulMm,omitempty"` // если только влага — толщина утеплителя задаётся
}

// ---------- Результаты ----------

// SurfaceTempCheck — проверка минимальной температуры внутренней поверхности (этап 10 ТТР).
type SurfaceTempCheck struct {
	Node    string  `json:"node"`
	TauMin  float64 `json:"tauMin"`  // минимальная температура внутренней поверхности, °C
	TauReq  float64 `json:"tauReq"`  // требуемая (точка росы / норматив), °C. TODO(СП)
	Pass    bool    `json:"pass"`
}

// ThermalResult — результат ТТР (п. «Результат ТТР» алгоритма).
type ThermalResult struct {
	Rsi                  float64            `json:"rsi"`
	Rse                  float64            `json:"rse"`
	Rcond                float64            `json:"rcond"`                // условное сопротивление (однородная часть)
	R                    float64            `json:"r"`                    // коэффициент теплотехнической однородности
	Rred                 float64            `json:"rred"`                 // приведённое сопротивление Rпр
	Rreq                 float64            `json:"rreq"`                 // требуемое сопротивление Rтр
	RequiredInsulationMM float64            `json:"requiredInsulationMm"` // требуемая толщина теплоизоляции
	ReservePct           float64            `json:"reservePct"`           // запас, %
	Verdict              string             `json:"verdict"`              // «Соответствует» / «Не соответствует»
	Layers               []Layer            `json:"layers"`               // итоговый состав
	IncludedHetero       []Heterogeneity    `json:"includedHetero"`       // учтённые неоднородности
	ExcludedElements     []RoofElement      `json:"excludedElements"`     // исключённые элементы
	SurfaceTemps         []SurfaceTempCheck `json:"surfaceTemps"`
}

// VaporResult — результат расчёта влагонакопления (п. «Результат» алгоритма, разд. 8 СП 50).
type VaporResult struct {
	MaxMoisturePlane string  `json:"maxMoisturePlane"` // положение плоскости максимального увлажнения
	PlaneLayerIndex  int     `json:"planeLayerIndex"`  // индекс слоя плоскости (в порядке снаружи→внутрь)
	Rvp              float64 `json:"rvp"`              // фактическое сопротивление паропроницанию Rп
	RvpReq1          float64 `json:"rvpReq1"`          // Rптр1 — за годовой период (ф. 8.1)
	RvpReq2          float64 `json:"rvpReq2"`          // Rптр2 — за период влагонакопления (ф. 8.2)
	RvpReqFinal      float64 `json:"rvpReqFinal"`      // итоговое требуемое = max(Rптр1; Rптр2)
	Pass             bool    `json:"pass"`
	Verdict          string  `json:"verdict"`
}

// ThermalCalculation — сохранённый расчёт (вход + результаты) по объекту.
type ThermalCalculation struct {
	ID        uuid.UUID      `json:"id"`
	ProjectID uuid.UUID      `json:"projectId"`
	Input     ThermalInput   `json:"input"`
	Thermal   *ThermalResult `json:"thermal,omitempty"`
	Vapor     *VaporResult   `json:"vapor,omitempty"`
	CreatedAt time.Time      `json:"createdAt"`
}
