package store

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/technonicol/snowbag/api/internal/model"
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

		-- Демо-данные ставятся ТОЛЬКО если систем ещё нет (свежая база). После
		-- синка с ПИМ (scripts/pim_sync.py) реальные системы остаются нетронутыми.
		DO $seed$
		BEGIN
		IF NOT EXISTS (SELECT 1 FROM thermal_systems) THEN
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
				('demo-sys-balast',   'tn-balast',   'ТН-КРОВЛЯ Балласт',  '');
			INSERT INTO thermal_system_layers (system_ekn, ord, material_ekn, role, default_thickness_mm, is_insulant) VALUES
				('demo-sys-standart', 1, 'demo-logicroof',  'Гидроизоляция',              1.5, FALSE),
				('demo-sys-standart', 2, 'demo-xps-carbon', 'Теплоизоляция',              150, TRUE),
				('demo-sys-standart', 3, 'demo-tehnoruf',   'Теплоизоляция / разуклонка', 60,  TRUE),
				('demo-sys-standart', 4, 'demo-parabarier', 'Пароизоляция',               0.5, FALSE),
				('demo-sys-standart', 5, 'demo-proflist',   'Несущее основание',          0.8, FALSE);
		END IF;
		END $seed$;
	`)
	return err
}

// GetThermalSystem загружает систему кровли и её состав (слои + материалы)
// по ЕКН или слагу. Структура «под ПИМ»: позже источником станет ПИМ.
func (s *Store) GetThermalSystem(ctx context.Context, eknOrSlug string) (model.ThermalSystem, error) {
	var sys model.ThermalSystem
	err := s.pool.QueryRow(ctx,
		`SELECT ekn, slug, name, note FROM thermal_systems WHERE ekn = $1 OR slug = $1`,
		eknOrSlug,
	).Scan(&sys.EKN, &sys.Slug, &sys.Name, &sys.Note)
	if err != nil {
		return sys, err
	}

	rows, err := s.pool.Query(ctx,
		`SELECT l.role, l.default_thickness_mm, l.is_insulant,
		        m.ekn, m.name, m.lambda, m.mu, m.density, m.delta_w, m.source
		 FROM thermal_system_layers l
		 JOIN thermal_materials m ON m.ekn = l.material_ekn
		 WHERE l.system_ekn = $1
		 ORDER BY l.ord`, sys.EKN)
	if err != nil {
		return sys, err
	}
	defer rows.Close()
	for rows.Next() {
		var l model.Layer
		var m model.Material
		var source string
		if err := rows.Scan(&l.Role, &l.ThicknessMM, &l.IsInsulant,
			&m.EKN, &m.Name, &m.Lambda, &m.Mu, &m.Density, &m.DeltaW, &source); err != nil {
			return sys, err
		}
		m.Source = model.MaterialSource(source)
		l.Material = m
		sys.Layers = append(sys.Layers, l)
	}
	return sys, rows.Err()
}

// SaveThermalCalculation сохраняет вход и результаты теплотехнического расчёта.
func (s *Store) SaveThermalCalculation(ctx context.Context, c model.ThermalCalculation) error {
	input, err := json.Marshal(c.Input)
	if err != nil {
		return err
	}
	var thermal, vapor []byte
	if c.Thermal != nil {
		if thermal, err = json.Marshal(c.Thermal); err != nil {
			return err
		}
	}
	if c.Vapor != nil {
		if vapor, err = json.Marshal(c.Vapor); err != nil {
			return err
		}
	}
	_, err = s.pool.Exec(ctx,
		`INSERT INTO thermal_calculations (id, project_id, input, thermal_result, vapor_result)
		 VALUES ($1, $2, $3, $4, $5)`,
		c.ID, c.ProjectID, input, thermal, vapor)
	return err
}

// GetLatestThermalCalculation возвращает последний сохранённый теплотехнический расчёт
// проекта (вход + ТТР + влага) или nil, если расчёта нет. Нужен для PDF-отчёта.
func (s *Store) GetLatestThermalCalculation(ctx context.Context, projectID uuid.UUID) (*model.ThermalCalculation, error) {
	var c model.ThermalCalculation
	var input, thermal, vapor []byte
	err := s.pool.QueryRow(ctx, `
		SELECT id, project_id, input, thermal_result, vapor_result, created_at
		FROM thermal_calculations
		WHERE project_id = $1
		ORDER BY created_at DESC
		LIMIT 1`, projectID).Scan(&c.ID, &c.ProjectID, &input, &thermal, &vapor, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(input, &c.Input)
	if len(thermal) > 0 {
		c.Thermal = &model.ThermalResult{}
		_ = json.Unmarshal(thermal, c.Thermal)
	}
	if len(vapor) > 0 {
		c.Vapor = &model.VaporResult{}
		_ = json.Unmarshal(vapor, c.Vapor)
	}
	return &c, nil
}
