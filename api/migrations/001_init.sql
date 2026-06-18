CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    number TEXT NOT NULL DEFAULT '',
    calc_no TEXT NOT NULL DEFAULT '',
    customer TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    area_m2 NUMERIC(12, 2) NOT NULL DEFAULT 0,
    roof_type TEXT NOT NULL DEFAULT '',
    parapet TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    author TEXT NOT NULL DEFAULT '',
    north_deg NUMERIC(6, 2) NOT NULL DEFAULT 0,
    snow_region TEXT NOT NULL DEFAULT '',
    wind_region TEXT NOT NULL DEFAULT '',
    geometry JSONB NOT NULL DEFAULT '{}',
    climate JSONB NOT NULL DEFAULT '{}',
    calculation JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

INSERT INTO projects (id, name, number, calc_no, customer, address, city, area_m2, roof_type, parapet, status, author, north_deg, snow_region, wind_region, geometry, climate, calculation)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'ЛК «Север-2»',
    'КИСО-2024-0185',
    'РС-2025-0042',
    'ООО «Северная логистика»',
    'г. Екатеринбург, Сибирский тракт, 12',
    'Екатеринбург',
    8240,
    'Плоская, рулонная (ПВХ-мембрана)',
    '600 мм',
    'draft',
    'Громов А. И.',
    -18,
    'III',
    'II',
    '{"roof":[[90,90],[910,90],[910,440],[560,440],[560,590],[90,590]],"obstacles":[{"id":"shaft-1","type":"Лестнично-лифтовая надстройка","short":"Надстройка","shape":"rect","x":690,"y":150,"w":150,"h":110},{"id":"vent-1","type":"Вентиляционная установка","short":"Вентустановка","shape":"rect","x":360,"y":150,"w":130,"h":74}],"walkway":[[120,430],[520,430],[520,560]]}',
    '{"city":"Екатеринбург","snowRegion":"III","sg":"1,5","windRegion":"II","w0":"0,30","norm":"СП 20.13330.2016 (изм. № 6)"}',
    '{}'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'ТРЦ «Гранат»',
    'КИСО-2024-0177',
    'РС-2025-0038',
    'АО «Гранат-Девелопмент»',
    'г. Казань, ул. Павлюхина, 91',
    'Казань',
    22100,
    'Плоская, ПВХ-мембрана',
    '800 мм',
    'done',
    'Лебедев П. С.',
    0,
    'IV',
    'III',
    '{}',
    '{}',
    '{"sensors":31,"bagsArea":3200}'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'Склад № 7 · Уралхим',
    'КИСО-2024-0162',
    'РС-2025-0029',
    'ПАО «Уралхим»',
    'г. Пермь, промзона',
    'Пермь',
    5600,
    'Плоская',
    '500 мм',
    'done',
    'Громов А. И.',
    12,
    'V',
    'II',
    '{}',
    '{}',
    '{"sensors":9,"bagsArea":890}'
)
ON CONFLICT (id) DO NOTHING;
