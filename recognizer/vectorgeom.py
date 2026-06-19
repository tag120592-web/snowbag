"""Детерминированный парсер геометрии векторного PDF (раздел АР — план кровли).

Идея (Этап 1 ТЗ): геометрию берём ТОЛЬКО отсюда, не от модели.
Ключевой приём — фильтрация по слоям OCG: контур кровли лежит на «толстом»
слое, а размеры/оси/текст — на своих. Читаем content-stream, отслеживаем
метки слоёв (/OC … BDC … EMC) и матрицу преобразования (CTM), собираем
сегменты только с нужных слоёв → polygonize → контур кровли.

Лицензии зависимостей: pikepdf (MPL-2.0), shapely (BSD), pdfminer.six (MIT) — все разрешённые.
"""
from __future__ import annotations
from dataclasses import dataclass, field

import pikepdf
from shapely.geometry import LineString, MultiPolygon, Polygon
from shapely.ops import polygonize, unary_union

PT_MM = 25.4 / 72.0  # пункт PDF → мм на бумаге

# Имена слоёв у каждого автора свои, поэтому НЕ хардкодим «толстый = кровля».
# Отбрасываем по СМЫСЛУ (ключевые слова в имени слоя): оси, размеры, текст,
# аннотации, осевые. Всё остальное — кандидат конструктивной геометрии.
# Профиль под конкретный стандарт оформления вынесем в конфиг (layer_rules.yaml).
DROP_LAYER_KEYWORDS = ("axis", "dim", "text", "anno", "ось", "оси", "разм")


def _mat_mul(a, b):
    """Перемножение аффинных матриц PDF [a b c d e f] (a∘b — сначала b, потом a)."""
    a0, a1, a2, a3, a4, a5 = a
    b0, b1, b2, b3, b4, b5 = b
    return (
        a0 * b0 + a2 * b1,
        a1 * b0 + a3 * b1,
        a0 * b2 + a2 * b3,
        a1 * b2 + a3 * b3,
        a0 * b4 + a2 * b5 + a4,
        a1 * b4 + a3 * b5 + a5,
    )


def _apply(m, x, y):
    return (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])


def _bezier(p0, p1, p2, p3, n=8):
    """Сэмплируем кубическую кривую Безье в n отрезков."""
    out = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


@dataclass
class _GState:
    ctm: tuple = (1, 0, 0, 1, 0, 0)


@dataclass
class Segment:
    a: tuple
    b: tuple
    layer: str | None


@dataclass
class ParsedPage:
    segments: list[Segment] = field(default_factory=list)
    layers_seen: set = field(default_factory=set)
    page_box: tuple = (0, 0, 0, 0)


def _resolve_oc_name(page, operands) -> str | None:
    """`/OC /MC0 BDC` → имя слоя через Resources.Properties[MC0].Name."""
    if len(operands) < 2 or str(operands[0]) != "/OC":
        return None
    prop_name = str(operands[1]).lstrip("/")
    try:
        props = page.Resources.Properties
        ocg = props[pikepdf.Name("/" + prop_name)]
    except Exception:
        return None
    # OCG напрямую или OCMD со списком /OCGs
    name = ocg.get("/Name")
    if name is None and "/OCGs" in ocg:
        ocgs = ocg.OCGs
        first = ocgs[0] if isinstance(ocgs, pikepdf.Array) else ocgs
        name = first.get("/Name")
    return str(name) if name is not None else None


def parse_page(page) -> ParsedPage:
    """Извлекает сегменты из content-stream с привязкой к слою OCG и учётом CTM."""
    res = ParsedPage()
    box = page.MediaBox
    res.page_box = (float(box[0]), float(box[1]), float(box[2]), float(box[3]))

    gstack: list[_GState] = []
    g = _GState()
    layer_stack: list[str | None] = []  # стек активных меток (innermost — текущий слой)

    cur: tuple | None = None      # текущая точка (в исходных координатах пути)
    start: tuple | None = None    # начало субпути (для h — замыкание)
    subpath: list[tuple] = []     # точки текущего субпути (в координатах пути)

    def flush(close: bool):
        nonlocal subpath
        if len(subpath) >= 2:
            layer = next((l for l in reversed(layer_stack) if l is not None), None)
            pts = list(subpath)
            if close and pts[0] != pts[-1]:
                pts.append(pts[0])
            for p, q in zip(pts, pts[1:]):
                pa = _apply(g.ctm, *p)
                pb = _apply(g.ctm, *q)
                if (pa[0] - pb[0]) ** 2 + (pa[1] - pb[1]) ** 2 > 0.25:
                    res.segments.append(Segment(pa, pb, layer))
        subpath = []

    for instr in pikepdf.parse_content_stream(page):
        op = str(instr.operator)
        a = instr.operands

        if op == "q":
            gstack.append(_GState(g.ctm))
        elif op == "Q":
            g = gstack.pop() if gstack else _GState()
        elif op == "cm":
            m = tuple(float(x) for x in a[:6])
            g = _GState(_mat_mul(g.ctm, m))
        elif op in ("BDC", "BMC"):
            layer_stack.append(_resolve_oc_name(page, a) if op == "BDC" else None)
        elif op == "EMC":
            if layer_stack:
                layer_stack.pop()
        # построение пути
        elif op == "m":
            cur = (float(a[0]), float(a[1]))
            start = cur
            subpath = [cur]
        elif op == "l":
            cur = (float(a[0]), float(a[1]))
            subpath.append(cur)
        elif op == "c":
            p1 = (float(a[0]), float(a[1])); p2 = (float(a[2]), float(a[3])); p3 = (float(a[4]), float(a[5]))
            subpath.extend(_bezier(cur, p1, p2, p3)); cur = p3
        elif op == "v":
            p2 = (float(a[0]), float(a[1])); p3 = (float(a[2]), float(a[3]))
            subpath.extend(_bezier(cur, cur, p2, p3)); cur = p3
        elif op == "y":
            p1 = (float(a[0]), float(a[1])); p3 = (float(a[2]), float(a[3]))
            subpath.extend(_bezier(cur, p1, p3, p3)); cur = p3
        elif op == "re":
            x, y, w, h = (float(a[0]), float(a[1]), float(a[2]), float(a[3]))
            flush(False)
            subpath = [(x, y), (x + w, y), (x + w, y + h), (x, y + h), (x, y)]
            flush(False)
            cur = start = None
        elif op == "h":
            if start:
                subpath.append(start)
        # покраска/завершение пути
        elif op in ("S", "s", "f", "F", "f*", "B", "B*", "b", "b*", "n"):
            flush(close=op in ("s", "b", "b*", "f", "F", "f*", "B", "B*"))
            cur = start = None

    res.layers_seen = {s.layer for s in res.segments if s.layer}
    return res


def snap_orthogonal(verts, tol=14.0):
    """Ортогонализация прямоугольного контура: близкие X-координаты вершин (и Y)
    сводим к среднему по кластеру. Делает рёбра строго верт./гориз. и устраняет мелкую
    асимметрию (правое ребро = левому). tol в пунктах PDF. Безопасно: сливает только
    близкие координаты, реальные далёкие углы не трогает."""
    def cluster(vals):
        rep, group = {}, []
        for v in sorted(set(vals)):
            if group and v - group[-1] > tol:
                m = sum(group) / len(group)
                rep.update({g: m for g in group})
                group = []
            group.append(v)
        if group:
            m = sum(group) / len(group)
            rep.update({g: m for g in group})
        return rep

    rx = cluster([v[0] for v in verts])
    ry = cluster([v[1] for v in verts])
    return [[round(rx[v[0]], 1), round(ry[v[1]], 1)] for v in verts]


def _is_kept(layer: str | None) -> bool:
    """Слой не отброшен по смыслу? (None — рамка/без слоя — пока пропускаем,
    рамку листа отфильтруем геометрически по размеру.)"""
    if layer is None:
        return True
    low = layer.lower()
    return not any(k in low for k in DROP_LAYER_KEYWORDS)


def roof_contour(parsed: ParsedPage, gap=3.0):
    """Собирает контур кровли из конструктивных слоёв (не оси/размеры/текст):
    polygonize → отсекаем рамку листа (по ширине/высоте) и тонкие «кольца»
    двойных линий (по заполненности bbox) → сшиваем сплошные грани через буфер
    (закрываем зазор парапета) → крупнейшая связная область = контур кровли.
    Возвращает (Polygon|None, faces)."""
    px0, py0, px1, py1 = parsed.page_box
    page_w, page_h = abs(px1 - px0), abs(py1 - py0)

    segs = [LineString([s.a, s.b]) for s in parsed.segments if _is_kept(s.layer)]
    if not segs:
        return None, []
    faces = list(polygonize(unary_union(segs)))
    if not faces:
        return None, []

    solid = []
    for f in faces:
        mnx, mny, mxx, mxy = f.bounds
        w, h = mxx - mnx, mxy - mny
        if w >= 0.9 * page_w or h >= 0.9 * page_h:
            continue                      # рамка листа
        bbox_area = w * h
        if bbox_area <= 0 or f.area / bbox_area < 0.5:
            continue                      # тонкое «кольцо» двойной линии
        solid.append(f)
    if not solid:
        return None, faces

    # сшиваем смежные блоки через зазор парапета (буфер +gap, потом -gap).
    # join_style=mitre — сохраняем прямые углы (без скруглений), чтобы контур
    # остался многоугольником с минимумом вершин.
    glued = unary_union([f.buffer(gap, join_style="mitre", mitre_limit=5) for f in solid])
    comps = list(glued.geoms) if isinstance(glued, MultiPolygon) else [glued]
    comps.sort(key=lambda p: p.area, reverse=True)
    roof = comps[0].buffer(-gap, join_style="mitre", mitre_limit=5)
    if isinstance(roof, MultiPolygon):
        roof = max(roof.geoms, key=lambda p: p.area)
    return roof, faces


def extract(pdf_path: str, simplify_pt: float = 4.0) -> dict:
    """Полный детерминированный проход по странице → JSON-контракт (ТЗ §6).

    Геометрия — в пунктах PDF и в мм НА БУМАГЕ. Реальный масштаб (мм объекта)
    пока неизвестен: для него нужен один распознанный размер (OCR) — см. scale.
    """
    pdf = pikepdf.open(pdf_path)
    parsed = parse_page(pdf.pages[0])
    roof, _ = roof_contour(parsed)

    by_layer: dict[str | None, int] = {}
    for s in parsed.segments:
        by_layer[s.layer] = by_layer.get(s.layer, 0) + 1

    contract: dict = {
        "source": {"file": pdf_path.split("/")[-1], "kind": "vector_pdf"},
        "page": {"width_pt": parsed.page_box[2], "height_pt": parsed.page_box[3]},
        "layers": by_layer,
        "scale": {"known": False, "mm_per_pt": None, "note": "нужен OCR одного размера"},
        "roof": None,
        "needs_confirmation": [],
    }
    if roof is not None:
        simp = roof.simplify(simplify_pt, preserve_topology=True)
        ring = simp.exterior if simp.geom_type == "Polygon" else roof.exterior
        verts_pt = [(round(x, 1), round(y, 1)) for x, y in list(ring.coords)[:-1]]
        verts_mm = [(round(x * PT_MM, 1), round(y * PT_MM, 1)) for x, y in verts_pt]
        mnx, mny, mxx, mxy = roof.bounds
        contract["roof"] = {
            "vertices_pt": verts_pt,
            "vertices_mm_paper": verts_mm,
            "vertex_count": len(verts_pt),
            "bbox_mm_paper": [round((mxx - mnx) * PT_MM, 1), round((mxy - mny) * PT_MM, 1)],
            "area_pt2": round(roof.area, 1),
            "holes": len(list(roof.interiors)),
        }
        contract["needs_confirmation"].append(
            {"what": "scale", "why": "реальный масштаб не восстановлен (нет OCR размеров)"}
        )
        contract["needs_confirmation"].append(
            {"what": "roof_contour", "why": "контур получен автоматически — подтвердить оператору"}
        )
    return contract


if __name__ == "__main__":
    import json
    import sys

    out = extract(sys.argv[1])
    print(json.dumps(out, ensure_ascii=False, indent=2))
