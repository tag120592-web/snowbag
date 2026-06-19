"""Сквозной конвейер распознавания (Этап 1): вектор PDF → JSON-контракт с
геометрией кровли В РЕАЛЬНЫХ МЕТРАХ.

Геометрия — детерминированно (vectorgeom). Масштаб — длина размерной линии +
число от Qwen-VL (scale). На выходе контур в мм реальных, площадь в м², плюс
список того, что обязан подтвердить оператор (HIL).

Семантика (классы элементов: воронки, парапеты, надстройки) — отдельный шаг
Этапа 2, добавится в этот же контракт.
"""
from __future__ import annotations
import json
import sys

import pikepdf

from vectorgeom import PT_MM, parse_page, roof_contour, snap_orthogonal
from scale import recover_scale
from semantic import detect_elements


def run(pdf_path: str, simplify_pt: float = 4.0) -> dict:
    pdf = pikepdf.open(pdf_path)
    parsed = parse_page(pdf.pages[0])
    roof, _ = roof_contour(parsed)
    sc = recover_scale(pdf_path)
    mpp = sc.get("mm_per_pt")

    by_layer: dict[str | None, int] = {}
    for s in parsed.segments:
        by_layer[s.layer] = by_layer.get(s.layer, 0) + 1

    contract: dict = {
        "source": {"file": pdf_path.split("/")[-1], "kind": "vector_pdf"},
        "page": {"width_pt": parsed.page_box[2], "height_pt": parsed.page_box[3]},
        "layers": by_layer,
        "scale": sc,
        "roof": None,
        "needs_confirmation": [],
    }

    if roof is not None:
        simp = roof.simplify(simplify_pt, preserve_topology=True)
        ring = simp.exterior if simp.geom_type == "Polygon" else roof.exterior
        verts_pt = [(round(x, 1), round(y, 1)) for x, y in list(ring.coords)[:-1]]
        verts_pt = snap_orthogonal(verts_pt)  # выровнять рёбра по верт./гориз. (симметрия)
        mnx, mny, mxx, mxy = roof.bounds
        roof_obj: dict = {
            "vertex_count": len(verts_pt),
            "vertices_pt": verts_pt,
            "holes": len(list(roof.interiors)),
        }
        if mpp:
            # начало координат — в левый-нижний угол bbox, оси Y вверх (как на плане)
            verts_mm = [(round((x - mnx) * mpp), round((y - mny) * mpp)) for x, y in verts_pt]
            roof_obj["vertices_mm"] = verts_mm
            roof_obj["bbox_mm"] = [round((mxx - mnx) * mpp), round((myy := mxy - mny) * mpp)]
            roof_obj["area_m2"] = round(roof.area * mpp * mpp / 1e6, 1)
        contract["roof"] = roof_obj
        contract["needs_confirmation"].append(
            {"what": "roof_contour", "why": "контур автоматический — подтвердить оператору"}
        )
    if mpp:
        contract["needs_confirmation"].append(
            {"what": "scale", "why": f"масштаб {mpp} мм/pt (число «{sc.get('real_mm')}») — подтвердить"}
        )

    # семантика: элементы оборудования (модель грузится один раз, переиспользуется)
    elements = detect_elements(pdf_path, mm_per_pt=mpp)
    # координаты элементов — в ту же систему, что и контур: от левого-нижнего угла
    # bbox кровли, ось Y вверх (иначе origin расходится с roof.vertices_mm).
    if roof is not None and mpp:
        rmnx, rmny, _, _ = roof.bounds
        for el in elements:
            cx, cy = el["center_pt"]
            el["center_mm"] = [round((cx - rmnx) * mpp), round((cy - rmny) * mpp)]
    contract["elements"] = elements
    for el in elements:
        if el.get("needs_confirmation"):
            contract["needs_confirmation"].append(
                {"what": f"element:{el['class']}", "why": f"снего-критичный элемент «{el['text'][:40]}»"}
            )
    return contract


if __name__ == "__main__":
    out = run(sys.argv[1])
    print(json.dumps(out, ensure_ascii=False, indent=2))
    r = out.get("roof") or {}
    if r.get("area_m2"):
        bb = r["bbox_mm"]
        print(f"\n>>> Кровля: {bb[0]/1000:.1f} × {bb[1]/1000:.1f} м, площадь {r['area_m2']} м², "
              f"{r['vertex_count']} вершин, отверстий {r['holes']}.")
    eq = [e for e in out.get("elements", []) if e.get("is_equipment")]
    if eq:
        print(f">>> Элементы ({len(eq)}): " + ", ".join(f"{e['class']}" for e in eq))
