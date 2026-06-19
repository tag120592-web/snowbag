"""HTTP-сервис распознавания (Этап 3a). Работает на ХОСТЕ (Apple Silicon/mlx),
Go-API в Docker зовёт его через host.docker.internal.

Эндпоинты:
  GET  /health           — жив ли сервис, загружена ли модель
  POST /recognize        — multipart-файл чертежа (PDF) → JSON-контракт (pipeline.run)

Модель грузится один раз (ленивым _get_model в scale.py) и переиспользуется.
Запуск:  .venv/bin/uvicorn server:app --host 0.0.0.0 --port 8090
"""
from __future__ import annotations
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile

from pipeline import run

app = FastAPI(title="snowbag recognizer", version="0.1")


@app.get("/health")
def health():
    from scale import _MODEL
    return {"status": "ok", "model_loaded": _MODEL is not None}


@app.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    data = await file.read()
    # проверяем по содержимому (магия %PDF), а не по имени — имена в multipart
    # бывают искажены (кириллица), а суть одна: это должен быть PDF.
    if not data[:5].startswith(b"%PDF"):
        raise HTTPException(400, "ожидается векторный PDF (получен не-PDF: картинка/иной формат)")
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            contract = run(tmp.name)
        except Exception as e:  # noqa: BLE001 — отдаём причину наверх, не роняем сервис
            raise HTTPException(500, f"ошибка распознавания: {e}")
    return contract
