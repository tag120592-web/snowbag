#!/usr/bin/env python3
"""Update climate_snip.json januaryRose from stroydocs.com (СНиП 2.01.01-82)."""
from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIMATE_PATH = ROOT / "api" / "internal" / "analytics" / "data" / "climate_snip.json"
REPORT_PATH = ROOT / "data" / "exports" / "climate_snip_update_report.json"
SOURCE_URL = "http://stroydocs.com/info/getVeterByAjax"
SOURCE_PAGE = "https://stroydocs.com/info/e_veter"

ROSE_DIRS = [
    ("С", 0, "jan_s"),
    ("СВ", 45, "jan_sv"),
    ("В", 90, "jan_v"),
    ("ЮВ", 135, "jan_uv"),
    ("Ю", 180, "jan_u"),
    ("ЮЗ", 225, "jan_uz"),
    ("З", 270, "jan_z"),
    ("СЗ", 315, "jan_sz"),
]

# Населённые пункты из climate_snip.json -> название в базе stroydocs (СНиП / опечатки).
STROYDOCS_ALIASES: dict[str, str] = {
    "тюмень": "Гюмень",
    "тверь": "Калинин",
    "великий новгород": "Новгород",
    "владикавказ": "Орджоникидзе",
    "каменск-шахтинск": "Каменск-Шахтинский",
    "находка": "Находка, бухта",
    "магадан": "Нагаева, бухта",
}

# При нескольких строках с одним названием — подсказка по региону.
REGION_HINTS: dict[str, list[str]] = {
    "омск": ["омская"],
}


def normalize_city(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"^г\.?\s*", "", s)
    s = s.replace("ё", "е")
    s = re.sub(r"\s+", " ", s)
    return s


def fetch_stroydocs_rows() -> list[dict]:
    body = urllib.parse.urlencode({"draw": "1", "start": 0, "length": 700}).encode()
    req = urllib.request.Request(
        SOURCE_URL,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "snowbag-climate-sync/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    rows = payload["data"]
    expected = payload.get("recordsTotal", 0)
    if expected != len(rows):
        raise RuntimeError(f"expected {expected} rows, got {len(rows)}")
    return rows


def build_lookup(rows: list[dict]) -> dict[str, list[dict]]:
    by_city: dict[str, list[dict]] = {}
    for row in rows:
        by_city.setdefault(normalize_city(row["city"]), []).append(row)
    return by_city


def january_rose(row: dict) -> list[dict]:
    return [
        {"dir": direction, "deg": deg, "v": int(row[key])}
        for direction, deg, key in ROSE_DIRS
    ]


def pick_row(candidates: list[dict], settlement_name: str) -> dict:
    if len(candidates) == 1:
        return candidates[0]

    name = normalize_city(settlement_name)
    for hint in REGION_HINTS.get(name, []):
        for row in candidates:
            if hint in normalize_city(row.get("region", "")):
                return row

    stem = name[: min(5, len(name))]
    for row in candidates:
        region = normalize_city(row.get("region", ""))
        if stem and stem in region:
            return row

    return candidates[0]


def lookup_keys(settlement: dict) -> list[str]:
    keys = [normalize_city(settlement["name"])]
    keys.extend(normalize_city(a) for a in settlement.get("aliases", []))
    mapped = STROYDOCS_ALIASES.get(keys[0])
    if mapped:
        keys.insert(0, normalize_city(mapped))
    return keys


def find_row(
    settlement: dict, by_city: dict[str, list[dict]]
) -> tuple[dict | None, str, list[dict]]:
    keys = lookup_keys(settlement)
    for key in keys:
        if key in by_city:
            rows = by_city[key]
            return pick_row(rows, settlement["name"]), "exact", rows
    return None, "missing", []


def main() -> int:
    dry_run = "--dry-run" in sys.argv
    climate = json.loads(CLIMATE_PATH.read_text(encoding="utf-8"))
    rows = fetch_stroydocs_rows()
    by_city = build_lookup(rows)

    updated: list[dict] = []
    unchanged: list[str] = []
    missing: list[str] = []
    ambiguous: list[dict] = []

    for settlement in climate["settlements"]:
        name = settlement["name"]
        row, match_kind, candidates = find_row(settlement, by_city)
        if row is None:
            missing.append(name)
            continue

        if len(candidates) > 1:
            ambiguous.append(
                {
                    "settlement": name,
                    "pickedRegion": row.get("region"),
                    "stroydocsCity": row.get("city"),
                    "regions": [c.get("region") for c in candidates],
                }
            )

        new_rose = january_rose(row)
        old_rose = settlement.get("januaryRose", [])
        if old_rose == new_rose:
            unchanged.append(name)
            continue

        if not dry_run:
            settlement["januaryRose"] = new_rose
        updated.append(
            {
                "settlement": name,
                "stroydocsCity": row["city"],
                "region": row.get("region"),
                "match": match_kind,
                "januaryRose": new_rose,
            }
        )

    climate["source"] = (
        "Приложение 4, повторяемость направлений ветра за январь "
        f"(актуализировано из {SOURCE_PAGE})"
    )

    report = {
        "source": SOURCE_PAGE,
        "api": SOURCE_URL,
        "stroydocsRows": len(rows),
        "settlementsTotal": len(climate["settlements"]),
        "updatedCount": len(updated),
        "unchangedCount": len(unchanged),
        "missing": missing,
        "ambiguous": ambiguous,
        "updated": updated,
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    if not dry_run:
        CLIMATE_PATH.write_text(
            json.dumps(climate, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
