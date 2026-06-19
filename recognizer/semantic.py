"""Семантика (Этап 2): что за элементы на кровле.

Grounding модели (рамки по всей картинке) на мелком чертеже НЕточен — проверено.
Поэтому гибрид: геометрия кластеризует текстовые подписи (слой *text*), а Qwen-VL
читает каждую подпись по ВЫРЕЗАННОМУ фрагменту (надёжно, как с числом масштаба).
Подпись + выноска указывают на элемент (воронка, аэратор, шахта, надстройка…).

Координаты элемента — детерминированные (центр подписи / конец выноски), классы и
текст — от модели. Снего-критичные элементы помечаются needs_confirmation.
"""
from __future__ import annotations
import re

import pikepdf
from shapely.geometry import LineString
from shapely.ops import unary_union

from vectorgeom import parse_page, PT_MM
from scale import render_page, crop_pt, read_number, _get_model

# Ключевые слова оборудования/элементов кровли (для классификации прочитанного текста).
EQUIP = {
    "воронк": "воронка_водостока",
    "аэратор": "аэратор",
    "шахт": "вентшахта",
    "вент": "вентиляция",
    "надстрой": "надстройка",
    "лестничн": "лестничная_клетка",
    "проходк": "проходка",
    "парапет": "парапет",
    "флюгарк": "флюгарка",
    "дефлектор": "дефлектор",
}
SNOW_CRITICAL = {"надстройка", "вентшахта", "лестничная_клетка", "парапет"}


def text_clusters(parsed, layer_kw="text", buf=7.0, min_w=45.0):
    """Группирует штрихи текстовых слоёв в подписи (связные кластеры).
    Возвращает список bbox (x0,y0,x1,y1) в pt; берём широкие (многобуквенные)."""
    strokes = [
        LineString([s.a, s.b])
        for s in parsed.segments
        if s.layer and layer_kw in s.layer.lower()
    ]
    if not strokes:
        return []
    blobs = unary_union([s.buffer(buf) for s in strokes])
    geoms = list(blobs.geoms) if blobs.geom_type == "MultiPolygon" else [blobs]
    out = []
    for g in geoms:
        x0, y0, x1, y1 = g.bounds
        if (x1 - x0) >= min_w:                       # длинные подписи, не одиночные цифры
            out.append((x0 - buf, y0 - buf, x1 + buf, y1 + buf))
    return out


def classify(text: str) -> str | None:
    low = text.lower()
    for kw, cls in EQUIP.items():
        if kw in low:
            return cls
    return None


def detect_elements(pdf_path: str, mm_per_pt: float | None = None) -> list[dict]:
    pdf = pikepdf.open(pdf_path)
    parsed = parse_page(pdf.pages[0])
    clusters = text_clusters(parsed)
    img, scale, page_h = render_page(pdf_path)
    _get_model()  # прогрев

    elements = []
    for (x0, y0, x1, y1) in clusters:
        crop = crop_pt(img, scale, page_h, x0, y0, x1, y1, pad=3, upscale=3)
        text, raw = read_number(
            crop,
            prompt="Прочитай текст на этом фрагменте чертежа дословно. Ответь только текстом.",
        )
        cls = classify(raw)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        el = {
            "text": raw.strip(),
            "class": cls,
            "center_pt": [round(cx, 1), round(cy, 1)],
            "is_equipment": cls is not None,
        }
        if mm_per_pt:
            el["center_mm"] = [round(cx * mm_per_pt), round(cy * mm_per_pt)]
        if cls in SNOW_CRITICAL:
            el["needs_confirmation"] = True
        elements.append(el)
    return elements


if __name__ == "__main__":
    import json
    import sys

    els = detect_elements(sys.argv[1], mm_per_pt=46.247)
    print(json.dumps(els, ensure_ascii=False, indent=2))
    eq = [e for e in els if e["is_equipment"]]
    print(f"\n>>> Прочитано подписей: {len(els)}; из них оборудование: {len(eq)}")
    for e in eq:
        print(f"    • {e['class']}: «{e['text']}»  @pt{e['center_pt']}")
