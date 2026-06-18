package analytics

import "github.com/technonicol/snowbag/api/internal/model"

// Каталог теплотехнических неоднородностей по СП 230.1325800.2015.
//
// ВАЖНО: в СП 230 ψ/χ зависят от параметров конструкции (теплопроводность
// основания стены λо, высота утепления парапета Иут, сопротивления слоёв,
// сечение крепежа и т.п.) — полные параметрические таблицы (Г.69–Г.116 и др.)
// очень обширны, а фасадные узлы (кронштейны) к плоской кровле не относятся.
// Здесь — ПРЕДСТАВИТЕЛЬНЫЕ значения из диапазонов СП 230 для MVP. Подлежат
// уточнению по фактической конструкции и проверке инженером.
// TODO(СП 230): полный параметрический подбор ψ/χ по узлам и параметрам стены.

type sp230Node struct {
	kind  model.HeteroKind
	coeff float64 // ψ, Вт/(м·°C) — линейный узел; χ, Вт/°C — точечный
	ref   string
	title string
}

// sp230Catalog — типовые удельные потери теплоты для узлов плоской кровли.
var sp230Catalog = map[string]sp230Node{
	"parapet":  {model.HeteroLinear, 0.25, "СП 230 табл. Г.113–Г.116 (диапазон 0,15–0,69)", "Сопряжение стены с покрытием (парапет)"},
	"fonar":    {model.HeteroLinear, 0.30, "СП 230 (примыкание к фонарю)", "Примыкание к фонарю"},
	"junction": {model.HeteroLinear, 0.30, "СП 230 (примыкание к надстройке/шахте)", "Примыкание к надстройке/шахте"},
	"def_shov": {model.HeteroLinear, 0.35, "СП 230 (деформационный шов)", "Деформационный шов"},
	"prohodka": {model.HeteroPoint, 0.06, "СП 230 (проходка)", "Проходка трубы/кабеля"},
	"aerator":  {model.HeteroPoint, 0.04, "СП 230 (аэратор)", "Аэратор"},
	"kolonna":  {model.HeteroPoint, 0.10, "СП 230 (колонна)", "Колонна"},
	"krepezh":  {model.HeteroPoint, 0.004, "СП 230 табл. Г.69–Г.80 (крепёж, невелики)", "Телескопический крепёж"},
}

// elementToNode сопоставляет распознанный элемент кровли с узлом СП 230
// (этап 7 алгоритма). Пустой ключ — нормативного аналога нет, в расчёт не идёт.
func elementToNode(t model.RoofElementType) string {
	switch t {
	case model.ElemParapet:
		return "parapet"
	case model.ElemFonar:
		return "fonar"
	case model.ElemShaft, model.ElemNadstroy:
		return "junction"
	case model.ElemDefShov:
		return "def_shov"
	case model.ElemProhodka:
		return "prohodka"
	case model.ElemAerator:
		return "aerator"
	case model.ElemKolonna:
		return "kolonna"
	default:
		return "" // оборудование/прочее — без нормативного узла СП 230
	}
}

// CandidateHeterogeneities формирует кандидатов в неоднородности из распознанных
// элементов (этап 7). Элемент без узла СП 230 помечается исключённым: он не
// участвует в расчёте до подтверждения/назначения узла пользователем.
func CandidateHeterogeneities(elements []model.RoofElement) []model.Heterogeneity {
	var out []model.Heterogeneity
	for _, e := range elements {
		h := model.Heterogeneity{ID: "het-" + e.ID, ElementID: e.ID, Type: string(e.Type)}
		node, ok := sp230Catalog[elementToNode(e.Type)]
		if !ok {
			h.Status = model.HeteroExcluded
			out = append(out, h)
			continue
		}
		h.Kind = node.kind
		h.SP230Node = elementToNode(e.Type)
		h.Type = node.title
		h.Status = model.HeteroCandidate
		if node.kind == model.HeteroLinear {
			h.Psi = node.coeff
			h.LengthM = e.LengthM
		} else {
			h.Chi = node.coeff
			h.Count = 1
		}
		out = append(out, h)
	}
	return out
}

// ApplyCoefficients проставляет ψ/χ по узлу СП 230, если не заданы вручную
// (например, после ручной правки пользователем типа узла).
func ApplyCoefficients(h *model.Heterogeneity) {
	node, ok := sp230Catalog[h.SP230Node]
	if !ok {
		return
	}
	if h.Kind == "" {
		h.Kind = node.kind
	}
	if h.Type == "" {
		h.Type = node.title
	}
	switch node.kind {
	case model.HeteroLinear:
		if h.Psi == 0 {
			h.Psi = node.coeff
		}
	case model.HeteroPoint:
		if h.Chi == 0 {
			h.Chi = node.coeff
		}
	}
}
