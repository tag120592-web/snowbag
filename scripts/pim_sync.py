#!/usr/bin/env python3
"""Синхронизация систем кровли ТЕХНОНИКОЛЬ из ПИМ (QRC API) в базу теплотехники.

Тянет состав систем (слои из associations) и свойства материалов (λ, μ, ρ),
формирует SQL для таблиц thermal_systems / thermal_materials / thermal_system_layers.

Запуск:
    PIM_TOKEN=... python3 scripts/pim_sync.py | docker compose exec -T postgres psql -U snowbag -d snowbag

Токен — из переменной окружения PIM_TOKEN (в код не хардкодим).
"""
import os
import re
import sys
import json
import time
import urllib.request

BASE = os.environ.get("PIM_BASE_URL", "https://qrcai.tndev.ru/api")
TOKEN = os.environ.get("PIM_TOKEN", "")

# Системы кровли: ЕКН → (слаг, название) — по данным заказчика.
SYSTEMS = [
    ("10000008", "tn-standart", "ТН-КРОВЛЯ Стандарт"),
    ("10000025", "tn-prof", "ТН-КРОВЛЯ Проф"),
    ("10000006", "tn-smart", "ТН-КРОВЛЯ Смарт"),
    ("10000013", "tn-balast", "ТН-КРОВЛЯ Балласт"),
]

# Коды λ в порядке предпочтения (λБ — консервативно). TODO(инженер): сверить выбор λА/λБ.
LAMBDA_CODES = ["atr_term_expl_b", "atr_term_expl_a", "thermal_d", "atr_thermal_tepl_25_ru", "thermal_B", "thermal_A"]
MAT_ATTRS = ",".join(["atr_name_for_website", "name_web", "vapor", "atr_density", "Thikness"] + LAMBDA_CODES)


def fetch(ekn, attrs=None):
    url = f"{BASE}/v1/product/{ekn}"
    if attrs:
        url += f"?attributes={attrs}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    for _ in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except Exception as e:
            sys.stderr.write(f"  ⚠️ {ekn}: {e}, повтор...\n")
            time.sleep(2)
    return None


def classify_role(role_key):
    """role_key → (label, утеплитель?, толщина по умолчанию мм) или None (пропустить слой)."""
    r = role_key.lower()
    if any(s in r for s in ("fasten", "primer", "separat", "filter", "geotext", "drain", "addit")):
        return None  # крепёж/грунтовка/разделит./фильтр — без теплотехнического вклада
    if "wedge" in r:
        return ("Клиновидная теплоизоляция", True, 50)
    if "therm_ins" in r or "thermal_ins" in r or re.search(r"(^|_)ins(_|$)", r):
        return ("Теплоизоляция", True, 150)
    if "vapor_bar" in r:
        return ("Пароизоляция", False, 0.5)
    if any(s in r for s in ("roofcarp", "toplay", "botlay", "sinlay", "membrane")):
        return ("Гидроизоляция (ковёр)", False, 4)
    if "car_base" in r or r.endswith("_base") or "base" in r:
        return ("Несущее основание", False, 100)
    if "screed" in r:
        return ("Стяжка", False, 50)
    if "slope" in r:
        return ("Уклонообразующий слой", False, 50)
    if "ballast" in r:
        return ("Балластный слой", False, 50)
    return (role_key, False, 10)  # неизвестная роль — включаем как есть


def lambda_fallback(label, insulant):
    if insulant:
        return 0.038
    lo = label.lower()
    if "несущее" in lo or "основание" in lo:
        return 1.92
    if "стяжка" in lo:
        return 0.93
    return 0.17


def attr_value(card, code):
    for attrs in (card.get("groups") or {}).values():
        if isinstance(attrs, dict) and code in attrs and isinstance(attrs[code], dict):
            return attrs[code].get("value")
    return None


def discover_layers(assoc):
    """Возвращает {порядок N: (role_key, products)} — главный приоритетнее марки/альтернативного."""
    by_order = {}
    for key, node in assoc.items():
        if not isinstance(node, dict) or not node.get("products"):
            continue
        m = re.match(r"^syst_(main|alt)_(?:(series)_)?(.+)_(\d+)$", key)
        if not m:
            continue
        variant, series, role_key, n = m.group(1), m.group(2), m.group(3), int(m.group(4))
        priority = (0 if variant == "main" else 2) + (1 if series else 0)
        if n not in by_order or priority < by_order[n][2]:
            by_order[n] = (role_key, node["products"], priority)
    return by_order


def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"


def main():
    if not TOKEN:
        sys.stderr.write("Нет PIM_TOKEN в окружении\n")
        sys.exit(1)

    materials = {}
    sys_layers = {}

    for sys_ekn, slug, name in SYSTEMS:
        sys.stderr.write(f"Система {name} ({sys_ekn})...\n")
        card = fetch(sys_ekn)
        if not card:
            continue
        by_order = discover_layers(card.get("associations") or {})
        layers = []
        for n in sorted(by_order):
            role_key, products, _ = by_order[n]
            info = classify_role(role_key)
            if info is None:
                continue
            label, insulant, dthick = info
            mat_ekn = str(products[0])
            if mat_ekn not in materials:
                m = fetch(mat_ekn, MAT_ATTRS)
                time.sleep(0.5)  # лимит 2 rps
                if not m:
                    continue
                lam = None
                for code in LAMBDA_CODES:
                    v = attr_value(m, code)
                    if v not in (None, "", "None"):
                        try:
                            lam = float(v)
                            break
                        except (ValueError, TypeError):
                            pass
                if lam is None:
                    lam = lambda_fallback(label, insulant)
                mu = attr_value(m, "vapor")
                dens = attr_value(m, "atr_density")
                mname = attr_value(m, "atr_name_for_website") or attr_value(m, "name_web") or f"Материал {mat_ekn}"
                materials[mat_ekn] = (mname, lam, mu, dens)
                sys.stderr.write(f"    слой {n} {label}: {str(mname)[:42]} λ={lam} μ={mu}\n")
            layers.append((n, mat_ekn, label, dthick, insulant))
        sys_layers[sys_ekn] = layers

    out = ["BEGIN;",
           "DELETE FROM thermal_system_layers;",
           "DELETE FROM thermal_systems;",
           "DELETE FROM thermal_materials WHERE source = 'pim';"]
    for ekn, (mname, lam, mu, dens) in materials.items():
        mu_s = mu if mu not in (None, "", "None") else "NULL"
        dens_s = dens if dens not in (None, "", "None") else "NULL"
        out.append(
            f"INSERT INTO thermal_materials (ekn, name, lambda, mu, density, source) "
            f"VALUES ({sql_str(ekn)}, {sql_str(mname)}, {lam}, {mu_s}, {dens_s}, 'pim') "
            f"ON CONFLICT (ekn) DO UPDATE SET name=EXCLUDED.name, lambda=EXCLUDED.lambda, "
            f"mu=EXCLUDED.mu, density=EXCLUDED.density, source='pim';")
    for sys_ekn, slug, name in SYSTEMS:
        if not sys_layers.get(sys_ekn):
            continue
        out.append(
            f"INSERT INTO thermal_systems (ekn, slug, name) "
            f"VALUES ({sql_str(sys_ekn)}, {sql_str(slug)}, {sql_str(name)}) "
            f"ON CONFLICT (ekn) DO UPDATE SET slug=EXCLUDED.slug, name=EXCLUDED.name;")
        for n, mat_ekn, label, thick, insulant in sys_layers[sys_ekn]:
            out.append(
                f"INSERT INTO thermal_system_layers (system_ekn, ord, material_ekn, role, default_thickness_mm, is_insulant) "
                f"VALUES ({sql_str(sys_ekn)}, {n}, {sql_str(mat_ekn)}, {sql_str(label)}, {thick}, {str(insulant).upper()});")
    out.append("COMMIT;")
    print("\n".join(out))
    sys.stderr.write(f"\nГотово: систем {len([s for s in sys_layers.values() if s])}, материалов {len(materials)}\n")


if __name__ == "__main__":
    main()
