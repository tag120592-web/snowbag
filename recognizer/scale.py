"""Восстановление масштаба чертежа (Этап 1b).

Детерминированно: длины габаритных размерных линий берём из векторных слоёв.
Число (реальный размер в мм) читает Qwen-VL по ВЫРЕЗАННОМУ фрагменту вокруг
размерной линии — кроп даёт точность выше, чем чтение всего листа.

scale = реальные_мм / длина_линии_pt  →  mm_per_pt. Итог уходит на подтверждение
оператору (HIL обязателен для масштаба).
"""
from __future__ import annotations
import re

import pypdfium2 as pdfium

PT_MM = 25.4 / 72.0


def render_page(pdf_path: str, dpi: int = 300):
    """PIL-картинка страницы + коэффициент pt→px и высота страницы (для пересчёта Y)."""
    pdf = pdfium.PdfDocument(pdf_path)
    page = pdf[0]
    _, page_h = page.get_size()
    scale = dpi / 72.0
    img = page.render(scale=scale).to_pil()
    return img, scale, page_h


def crop_pt(img, scale, page_h, x0, y0, x1, y1, pad=2, upscale=4, rotate=0):
    """Вырезает область PDF [x0..x1]×[y0..y1] (в pt, ось Y снизу) из картинки
    (ось Y сверху), с полями pad pt и увеличением ×upscale для читаемости цифр.
    rotate — поворот кропа (для повёрнутого вертикального текста размеров)."""
    px0 = (min(x0, x1) - pad) * scale
    px1 = (max(x0, x1) + pad) * scale
    # PDF y снизу → image y сверху
    iy0 = (page_h - (max(y0, y1) + pad)) * scale
    iy1 = (page_h - (min(y0, y1) - pad)) * scale
    box = (int(px0), int(iy0), int(px1), int(iy1))
    crop = img.crop(box)
    if upscale != 1:
        crop = crop.resize((crop.width * upscale, crop.height * upscale))
    if rotate:
        crop = crop.rotate(rotate, expand=True)
    return crop


_MODEL = None


def _get_model(model_id="mlx-community/Qwen3-VL-8B-Instruct-4bit"):
    global _MODEL
    if _MODEL is None:
        from mlx_vlm import load
        _MODEL = load(model_id)
    return _MODEL


def read_number(crop, prompt="Какое число (размер, мм) написано на этом фрагменте чертежа? Ответь ТОЛЬКО числом без пробелов и единиц.") -> tuple[int | None, str]:
    """Спрашивает Qwen-VL число на кропе. Возвращает (распознанное_число|None, сырой_ответ)."""
    from mlx_vlm import generate
    from mlx_vlm.prompt_utils import apply_chat_template

    model, processor = _get_model()
    tmp = "/tmp/_scale_crop.png"
    crop.save(tmp)
    formatted = apply_chat_template(processor, model.config, prompt, num_images=1)
    res = generate(model, processor, formatted, image=tmp, max_tokens=40, verbose=False)
    text = res.text if hasattr(res, "text") else str(res)
    digits = re.sub(r"[  ]", "", text)
    m = re.search(r"\d{3,6}", digits)  # размеры на плане кровли — обычно 3–6 цифр
    return (int(m.group()) if m else None, text.strip())


def longest_h_dim_line(pdf_path):
    """Самая длинная горизонтальная размерная линия (база для масштаба):
    (length_pt, center_x, y, x0, x1) в pt."""
    import pikepdf
    from vectorgeom import parse_page

    pdf = pikepdf.open(pdf_path)
    parsed = parse_page(pdf.pages[0])
    H = [
        s for s in parsed.segments
        if s.layer and ("dim" in s.layer.lower() or "anno" in s.layer.lower())
        and abs(s.a[1] - s.b[1]) < 1.5 and abs(s.a[0] - s.b[0]) > 50
    ]
    if not H:
        return None
    s = max(H, key=lambda s: abs(s.a[0] - s.b[0]))
    x0, x1 = min(s.a[0], s.b[0]), max(s.a[0], s.b[0])
    return (x1 - x0, (x0 + x1) / 2, s.a[1], x0, x1)


def recover_scale(pdf_path: str) -> dict:
    """Масштаб из самой длинной горизонтальной размерной линии: число над её
    центром читает Qwen-VL → mm_per_pt. Требует подтверждения оператора (HIL)."""
    line = longest_h_dim_line(pdf_path)
    if not line:
        return {"known": False, "mm_per_pt": None, "note": "размерных линий не найдено"}
    length_pt, cx, y, *_ = line
    img, scale, page_h = render_page(pdf_path)
    # число габарита сидит у центра линии; берём полосу ±10pt по Y (над/под линией)
    crop = crop_pt(img, scale, page_h, cx - 45, y - 9, cx + 45, y + 9, upscale=3)
    num, raw = read_number(crop)
    if not num:
        return {"known": False, "mm_per_pt": None, "note": f"число не прочиталось (сырое: {raw!r})"}
    mm_per_pt = num / length_pt
    return {
        "known": True,
        "mm_per_pt": round(mm_per_pt, 4),
        "real_mm": num,
        "length_pt": round(length_pt, 1),
        "source": "longest_horizontal_dimension",
        "raw_read": raw,
        "needs_confirmation": True,
    }


if __name__ == "__main__":
    import json
    import sys

    out = recover_scale(sys.argv[1])
    print(json.dumps(out, ensure_ascii=False, indent=2))
    if out.get("mm_per_pt"):
        mpp = out["mm_per_pt"]
        print(f"\nПроверка: 1 pt = {mpp:.2f} мм реальных. "
              f"Габарит кровли 588pt → {588*mpp:.0f} мм; 316pt → {316*mpp:.0f} мм.")
