package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// EnsureThermalSchema создаёт таблицы модуля теплотехники/влагонакопления.
// Идемпотентно (CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING) — безопасно
// вызывать при каждом старте, как EnsureMigrations. Зеркалит migrations/005_thermal.sql.
// Справочники систем/материалов спроектированы «под ПИМ» (поле ekn); сейчас демо-данные.
func EnsureThermalSchema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS thermal_materials (
			ekn        TEXT PRIMARY KEY,
			name       TEXT NOT NULL,
			lambda     DOUBLE PRECISION NOT NULL,
			mu         DOUBLE PRECISION,
			density    DOUBLE PRECISION,
			delta_w    DOUBLE PRECISION,
			source     TEXT NOT NULL DEFAULT 'pim',
			raw_json   JSONB NOT NULL DEFAULT '{}',
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS thermal_systems (
			ekn        TEXT PRIMARY KEY,
			slug       TEXT NOT NULL UNIQUE,
			name       TEXT NOT NULL,
			note       TEXT NOT NULL DEFAULT '',
			raw_json   JSONB NOT NULL DEFAULT '{}',
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS thermal_system_layers (
			id                   BIGSERIAL PRIMARY KEY,
			system_ekn           TEXT NOT NULL REFERENCES thermal_systems(ekn) ON DELETE CASCADE,
			ord                  INTEGER NOT NULL,
			material_ekn         TEXT NOT NULL REFERENCES thermal_materials(ekn),
			role                 TEXT NOT NULL,
			default_thickness_mm DOUBLE PRECISION NOT NULL DEFAULT 0,
			is_insulant          BOOLEAN NOT NULL DEFAULT FALSE,
			UNIQUE (system_ekn, ord)
		);
		CREATE TABLE IF NOT EXISTS thermal_calculations (
			id             UUID PRIMARY KEY,
			project_id     UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			input          JSONB NOT NULL DEFAULT '{}',
			thermal_result JSONB,
			vapor_result   JSONB,
			created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE INDEX IF NOT EXISTS idx_thermal_calculations_project ON thermal_calculations(project_id);

		INSERT INTO thermal_materials (ekn, name, lambda, source) VALUES
			('demo-logicroof',  'Гидроизоляция LOGICROOF V-RP', 0.17,  'pim'),
			('demo-xps-carbon', 'XPS ТЕХНОНИКОЛЬ CARBON PROF',  0.034, 'pim'),
			('demo-tehnoruf',   'Минвата ТЕХНОРУФ Н30',         0.038, 'pim'),
			('demo-parabarier', 'Пароизоляция ПАРАБАРЬЕР СА500', 0.17, 'pim'),
			('demo-proflist',   'Профлист Н75 (основание)',     58.0,  'library')
		ON CONFLICT (ekn) DO NOTHING;

		INSERT INTO thermal_systems (ekn, slug, name, note) VALUES
			('demo-sys-standart', 'tn-standart', 'ТН-КРОВЛЯ Стандарт', 'Механически закрепляемая, ПВХ-мембрана'),
			('demo-sys-prof',     'tn-prof',     'ТН-КРОВЛЯ Проф',     ''),
			('demo-sys-smart',    'tn-smart',    'ТН-КРОВЛЯ Смарт',    ''),
			('demo-sys-balast',   'tn-balast',   'ТН-КРОВЛЯ Балласт',  '')
		ON CONFLICT (ekn) DO NOTHING;

		INSERT INTO thermal_system_layers (system_ekn, ord, material_ekn, role, default_thickness_mm, is_insulant) VALUES
			('demo-sys-standart', 1, 'demo-logicroof',  'Гидроизоляция',              1.5, FALSE),
			('demo-sys-standart', 2, 'demo-xps-carbon', 'Теплоизоляция',              150, TRUE),
			('demo-sys-standart', 3, 'demo-tehnoruf',   'Теплоизоляция / разуклонка', 60,  TRUE),
			('demo-sys-standart', 4, 'demo-parabarier', 'Пароизоляция',               0.5, FALSE),
			('demo-sys-standart', 5, 'demo-proflist',   'Несущее основание',          0.8, FALSE)
		ON CONFLICT (system_ekn, ord) DO NOTHING;
	`)
	return err
}
