package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/technonicol/snowbag/api/internal/model"
)

type Store struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	return &Store{pool: pool}, nil
}

func (s *Store) Close() {
	s.pool.Close()
}

func (s *Store) Pool() *pgxpool.Pool {
	return s.pool
}

func (s *Store) WaitReady(ctx context.Context, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		if err := s.pool.Ping(ctx); err == nil {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(time.Second):
		}
	}
	return fmt.Errorf("timeout waiting for database")
}

func (s *Store) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

func (s *Store) ListProjects(ctx context.Context) ([]model.ProjectListItem, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT p.id, p.name, p.number, p.calc_no, p.customer, p.city, p.area_m2, p.status, p.created_at, p.calculation,
		       COALESCE(h.cnt, 0) AS history_cnt
		FROM projects p
		LEFT JOIN (
			SELECT project_id, COUNT(*) AS cnt FROM calculation_runs GROUP BY project_id
		) h ON h.project_id = p.id
		ORDER BY p.updated_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.ProjectListItem
	for rows.Next() {
		var p model.ProjectListItem
		var id uuid.UUID
		var created time.Time
		var calc json.RawMessage
		var historyCnt int
		if err := rows.Scan(&id, &p.Name, &p.Number, &p.CalcNo, &p.Customer, &p.City, &p.AreaM2, &p.Status, &created, &calc, &historyCnt); err != nil {
			return nil, err
		}
		p.ID = id
		p.Created = formatDate(created)
		p.Sensors = sensorsFromCalc(calc)
		p.Status = statusLabel(p.Status)
		p.Calcs = historyCnt
		if len(calc) > 0 && string(calc) != "{}" && string(calc) != "null" {
			p.Calcs++
		}
		items = append(items, p)
	}
	return items, rows.Err()
}

func (s *Store) GetProject(ctx context.Context, id uuid.UUID) (*model.Project, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, name, number, calc_no, customer, address, city, lat, lon, area_m2, roof_type, parapet,
		       status, author, north_deg, snow_region, wind_region, geometry, climate, calculation,
		       underlay_key, created_at, updated_at
		FROM projects WHERE id = $1`, id)
	return scanProject(row)
}

func (s *Store) CreateProject(ctx context.Context, req model.CreateProjectRequest) (*model.Project, error) {
	id := uuid.New()
	clim, _ := json.Marshal(map[string]string{
		"city": req.City, "norm": "СП 20.13330.2016 (изм. № 6)",
	})
	row := s.pool.QueryRow(ctx, `
		INSERT INTO projects (id, name, address, city, customer, number, calc_no, author, status, climate)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9)
		RETURNING id, name, number, calc_no, customer, address, city, lat, lon, area_m2, roof_type, parapet,
		          status, author, north_deg, snow_region, wind_region, geometry, climate, calculation,
		          underlay_key, created_at, updated_at`,
		id, req.Name, req.Address, req.City, req.Customer,
		fmt.Sprintf("КИСО-%d", time.Now().Year()),
		fmt.Sprintf("РС-%d-%04d", time.Now().Year(), time.Now().Unix()%10000),
		"Инженер",
		clim,
	)
	return scanProject(row)
}

func (s *Store) UpdateProject(ctx context.Context, id uuid.UUID, req model.UpdateProjectRequest) (*model.Project, error) {
	cur, err := s.GetProject(ctx, id)
	if err != nil {
		return nil, err
	}
	name, address, city, customer := cur.Name, cur.Address, cur.City, cur.Customer
	lat, lon := cur.Lat, cur.Lon
	areaM2, northDeg := cur.AreaM2, cur.NorthDeg
	snowRegion, windRegion, status := cur.SnowRegion, cur.WindRegion, cur.Status
	geometry, climate, calculation := cur.Geometry, cur.Climate, cur.Calculation

	if req.Name != nil {
		name = *req.Name
	}
	if req.Address != nil {
		address = *req.Address
	}
	if req.City != nil {
		city = *req.City
	}
	if req.Customer != nil {
		customer = *req.Customer
	}
	if req.Lat != nil {
		lat = req.Lat
	}
	if req.Lon != nil {
		lon = req.Lon
	}
	if req.AreaM2 != nil {
		areaM2 = *req.AreaM2
	}
	if req.NorthDeg != nil {
		northDeg = *req.NorthDeg
	}
	if req.SnowRegion != nil {
		snowRegion = *req.SnowRegion
	}
	if req.WindRegion != nil {
		windRegion = *req.WindRegion
	}
	if req.Status != nil {
		status = *req.Status
	}
	if len(req.Geometry) > 0 {
		geometry = req.Geometry
	}
	if len(req.Climate) > 0 {
		climate = req.Climate
	}
	if len(req.Calculation) > 0 {
		calculation = req.Calculation
	}

	row := s.pool.QueryRow(ctx, `
		UPDATE projects SET
			name = $2, address = $3, city = $4, customer = $5, area_m2 = $6,
			north_deg = $7, snow_region = $8, wind_region = $9, status = $10,
			geometry = $11, climate = $12, calculation = $13, lat = $14, lon = $15, updated_at = now()
		WHERE id = $1
		RETURNING id, name, number, calc_no, customer, address, city, lat, lon, area_m2, roof_type, parapet,
		          status, author, north_deg, snow_region, wind_region, geometry, climate, calculation,
		          underlay_key, created_at, updated_at`,
		id, name, address, city, customer, areaM2, northDeg, snowRegion, windRegion, status,
		geometry, climate, calculation, lat, lon,
	)
	return scanProject(row)
}

func (s *Store) SaveCalculation(ctx context.Context, id uuid.UUID, req model.CalculateRequest, geom json.RawMessage, areaM2 float64, calc json.RawMessage) (*model.Project, error) {
	if len(geom) == 0 {
		geom = json.RawMessage(`{}`)
	}
	climate := req.Climate
	if len(climate) == 0 || string(climate) == "{}" {
		cur, err := s.GetProject(ctx, id)
		if err != nil {
			return nil, err
		}
		climate = cur.Climate
	}
	cur, err := s.GetProject(ctx, id)
	if err != nil {
		return nil, err
	}
	nextCalcNo := cur.CalcNo
	if hasCalculation(cur.Calculation) {
		if err := s.ArchiveCurrentCalculation(ctx, id); err != nil {
			return nil, err
		}
		nextCalcNo = newCalcNo()
	}
	_, err = s.pool.Exec(ctx, `
		UPDATE projects SET
			calc_no = $2,
			north_deg = COALESCE(NULLIF($3, 0), north_deg),
			snow_region = COALESCE(NULLIF($4, ''), snow_region),
			wind_region = COALESCE(NULLIF($5, ''), wind_region),
			geometry = $6::jsonb,
			climate = $7::jsonb,
			area_m2 = COALESCE(NULLIF($8, 0), area_m2),
			calculation = $9::jsonb,
			status = 'done',
			updated_at = now()
		WHERE id = $1`, id, nextCalcNo, req.NorthDeg, req.SnowRegion, req.WindRegion, geom, climate, areaM2, calc)
	if err != nil {
		return nil, err
	}
	return s.GetProject(ctx, id)
}

func (s *Store) SetUnderlay(ctx context.Context, projectID uuid.UUID, key string) error {
	_, err := s.pool.Exec(ctx, `UPDATE projects SET underlay_key = $2, updated_at = now() WHERE id = $1`, projectID, key)
	return err
}

func (s *Store) GetUnderlayKey(ctx context.Context, projectID uuid.UUID) (string, error) {
	var key string
	err := s.pool.QueryRow(ctx, `SELECT underlay_key FROM projects WHERE id = $1`, projectID).Scan(&key)
	return key, err
}

func (s *Store) GetUnderlayFile(ctx context.Context, projectID uuid.UUID) (*model.ProjectFile, error) {
	key, err := s.GetUnderlayKey(ctx, projectID)
	if err != nil {
		return nil, err
	}
	if key == "" {
		return nil, nil
	}
	var f model.ProjectFile
	err = s.pool.QueryRow(ctx, `
		SELECT id, project_id, name, mime_type, size_bytes, created_at
		FROM project_files
		WHERE project_id = $1 AND storage_key = $2
		ORDER BY created_at DESC
		LIMIT 1`, projectID, key).Scan(
		&f.ID, &f.ProjectID, &f.Name, &f.MimeType, &f.Size, &f.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &f, nil
}

func (s *Store) ListProjectStorageKeys(ctx context.Context, projectID uuid.UUID) ([]string, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT storage_key FROM project_files WHERE project_id = $1`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []string
	seen := make(map[string]struct{})
	for rows.Next() {
		var key string
		if err := rows.Scan(&key); err != nil {
			return nil, err
		}
		if key != "" {
			if _, ok := seen[key]; !ok {
				seen[key] = struct{}{}
				keys = append(keys, key)
			}
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	underlay, _ := s.GetUnderlayKey(ctx, projectID)
	if underlay != "" {
		if _, ok := seen[underlay]; !ok {
			keys = append(keys, underlay)
		}
	}
	return keys, nil
}

func (s *Store) DeleteProject(ctx context.Context, projectID uuid.UUID) error {
	tag, err := s.pool.Exec(ctx, `DELETE FROM projects WHERE id = $1`, projectID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("project not found")
	}
	return nil
}

func (s *Store) AddFile(ctx context.Context, f model.ProjectFile, storageKey string) (*model.ProjectFile, error) {
	row := s.pool.QueryRow(ctx, `
		INSERT INTO project_files (id, project_id, name, mime_type, size_bytes, storage_key)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, project_id, name, mime_type, size_bytes, created_at`,
		f.ID, f.ProjectID, f.Name, f.MimeType, f.Size, storageKey,
	)
	var out model.ProjectFile
	if err := row.Scan(&out.ID, &out.ProjectID, &out.Name, &out.MimeType, &out.Size, &out.CreatedAt); err != nil {
		return nil, err
	}
	out.URL = f.URL
	return &out, nil
}

func (s *Store) Audit(ctx context.Context, projectID *uuid.UUID, action string, detail any) {
	b, _ := json.Marshal(detail)
	_, _ = s.pool.Exec(ctx, `INSERT INTO audit_log (project_id, action, detail) VALUES ($1, $2, $3)`, projectID, action, b)
}

func hasCalculation(raw json.RawMessage) bool {
	if len(raw) == 0 {
		return false
	}
	s := strings.TrimSpace(string(raw))
	return s != "" && s != "{}" && s != "null"
}

func newCalcNo() string {
	return fmt.Sprintf("РС-%d-%04d", time.Now().Year(), time.Now().Unix()%10000)
}

func (s *Store) ArchiveCurrentCalculation(ctx context.Context, projectID uuid.UUID) error {
	p, err := s.GetProject(ctx, projectID)
	if err != nil {
		return err
	}
	if !hasCalculation(p.Calculation) {
		return nil
	}
	_, err = s.pool.Exec(ctx, `
		INSERT INTO calculation_runs (project_id, calc_no, author, status, north_deg, snow_region, wind_region, geometry, climate, calculation)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		projectID, p.CalcNo, p.Author, p.Status, p.NorthDeg, p.SnowRegion, p.WindRegion,
		p.Geometry, p.Climate, p.Calculation,
	)
	return err
}

func (s *Store) ListCalculationHistory(ctx context.Context, projectID uuid.UUID) (*model.CalculationHistoryResponse, error) {
	p, err := s.GetProject(ctx, projectID)
	if err != nil {
		return nil, err
	}

	rows, err := s.pool.Query(ctx, `
		SELECT id, project_id, calc_no, author, status, created_at, calculation
		FROM calculation_runs
		WHERE project_id = $1
		ORDER BY created_at DESC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.CalculationRun
	for rows.Next() {
		var run model.CalculationRun
		var calc json.RawMessage
		if err := rows.Scan(&run.ID, &run.ProjectID, &run.CalcNo, &run.Author, &run.Status, &run.CreatedAt, &calc); err != nil {
			return nil, err
		}
		run.Created = formatDate(run.CreatedAt)
		run.Status = statusLabel(run.Status)
		run.Sensors = sensorsFromCalc(calc)
		items = append(items, run)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if hasCalculation(p.Calculation) {
		current := model.CalculationRun{
			ID:        p.ID,
			ProjectID: p.ID,
			CalcNo:    p.CalcNo,
			Author:    p.Author,
			Status:    statusLabel(p.Status),
			CreatedAt: p.UpdatedAt,
			Created:   formatDate(p.UpdatedAt),
			Current:   true,
			Sensors:   sensorsFromCalc(p.Calculation),
		}
		items = append([]model.CalculationRun{current}, items...)
	}

	return &model.CalculationHistoryResponse{
		ProjectID: p.ID,
		CalcNo:    p.CalcNo,
		Author:    p.Author,
		Items:     items,
	}, nil
}

func (s *Store) GetCalculationRun(ctx context.Context, projectID, runID uuid.UUID) (*model.CalculationRun, error) {
	if runID == projectID {
		p, err := s.GetProject(ctx, projectID)
		if err != nil {
			return nil, err
		}
		if !hasCalculation(p.Calculation) {
			return nil, fmt.Errorf("calculation not found")
		}
		return &model.CalculationRun{
			ID:          p.ID,
			ProjectID:   p.ID,
			CalcNo:      p.CalcNo,
			Author:      p.Author,
			Status:      statusLabel(p.Status),
			NorthDeg:    p.NorthDeg,
			SnowRegion:  p.SnowRegion,
			WindRegion:  p.WindRegion,
			Geometry:    p.Geometry,
			Climate:     p.Climate,
			Calculation: p.Calculation,
			CreatedAt:   p.UpdatedAt,
			Created:     formatDate(p.UpdatedAt),
			Current:     true,
			Sensors:     sensorsFromCalc(p.Calculation),
		}, nil
	}

	row := s.pool.QueryRow(ctx, `
		SELECT id, project_id, calc_no, author, status, north_deg, snow_region, wind_region,
		       geometry, climate, calculation, created_at
		FROM calculation_runs
		WHERE id = $1 AND project_id = $2`, runID, projectID)

	var run model.CalculationRun
	var status string
	if err := row.Scan(
		&run.ID, &run.ProjectID, &run.CalcNo, &run.Author, &status,
		&run.NorthDeg, &run.SnowRegion, &run.WindRegion,
		&run.Geometry, &run.Climate, &run.Calculation, &run.CreatedAt,
	); err != nil {
		return nil, fmt.Errorf("calculation run not found")
	}
	run.Status = statusLabel(status)
	run.Created = formatDate(run.CreatedAt)
	run.Sensors = sensorsFromCalc(run.Calculation)
	return &run, nil
}

func (s *Store) RecalculateProject(ctx context.Context, projectID uuid.UUID, geomJSON json.RawMessage, areaM2 float64, calcJSON json.RawMessage) (*model.Project, error) {
	if err := s.ArchiveCurrentCalculation(ctx, projectID); err != nil {
		return nil, err
	}
	nextCalcNo := newCalcNo()
	_, err := s.pool.Exec(ctx, `
		UPDATE projects SET
			calc_no = $2,
			geometry = $3::jsonb,
			area_m2 = COALESCE(NULLIF($4, 0), area_m2),
			calculation = $5::jsonb,
			status = 'done',
			updated_at = now()
		WHERE id = $1`,
		projectID, nextCalcNo, geomJSON, areaM2, calcJSON,
	)
	if err != nil {
		return nil, err
	}
	return s.GetProject(ctx, projectID)
}

func scanProject(row pgxRow) (*model.Project, error) {
	var p model.Project
	var underlayKey string
	if err := row.Scan(
		&p.ID, &p.Name, &p.Number, &p.CalcNo, &p.Customer, &p.Address, &p.City, &p.Lat, &p.Lon, &p.AreaM2,
		&p.RoofType, &p.Parapet, &p.Status, &p.Author, &p.NorthDeg, &p.SnowRegion, &p.WindRegion,
		&p.Geometry, &p.Climate, &p.Calculation, &underlayKey, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

type pgxRow interface {
	Scan(dest ...any) error
}

func sensorsFromCalc(raw json.RawMessage) int {
	if len(raw) == 0 {
		return 0
	}
	var m struct {
		Metrics struct {
			Sensors int `json:"sensors"`
		} `json:"metrics"`
	}
	_ = json.Unmarshal(raw, &m)
	return m.Metrics.Sensors
}

func statusLabel(s string) string {
	switch s {
	case "done":
		return "Готово"
	case "draft":
		return "Черновик"
	default:
		return s
	}
}

func formatDate(t time.Time) string {
	months := [...]string{"", "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"}
	return fmt.Sprintf("%d %s %d", t.Day(), months[t.Month()], t.Year())
}

func EnsureMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		ALTER TABLE projects ADD COLUMN IF NOT EXISTS underlay_key TEXT NOT NULL DEFAULT '';
		ALTER TABLE projects ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 7);
		ALTER TABLE projects ADD COLUMN IF NOT EXISTS lon NUMERIC(10, 7);
		CREATE TABLE IF NOT EXISTS project_files (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			mime_type TEXT NOT NULL DEFAULT '',
			size_bytes BIGINT NOT NULL DEFAULT 0,
			storage_key TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
		CREATE TABLE IF NOT EXISTS audit_log (
			id BIGSERIAL PRIMARY KEY,
			project_id UUID,
			action TEXT NOT NULL,
			detail JSONB NOT NULL DEFAULT '{}',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS calculation_runs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
			calc_no TEXT NOT NULL DEFAULT '',
			author TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL DEFAULT 'done',
			north_deg NUMERIC(6, 2) NOT NULL DEFAULT 0,
			snow_region TEXT NOT NULL DEFAULT '',
			wind_region TEXT NOT NULL DEFAULT '',
			geometry JSONB NOT NULL DEFAULT '{}',
			climate JSONB NOT NULL DEFAULT '{}',
			calculation JSONB NOT NULL DEFAULT '{}',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE INDEX IF NOT EXISTS idx_calc_runs_project ON calculation_runs(project_id, created_at DESC);
	`)
	return err
}

func ParseGeometry(raw json.RawMessage, fallback json.RawMessage, areaM2 float64) model.GeometryData {
	var g model.GeometryData
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &g)
	}
	if len(g.Roof) == 0 && len(fallback) > 0 {
		_ = json.Unmarshal(fallback, &g)
	}
	if g.AreaM2 == 0 && areaM2 > 0 {
		g.AreaM2 = areaM2
	}
	return g
}

func GeometryJSON(g model.GeometryData) json.RawMessage {
	b, _ := json.Marshal(g)
	return b
}

func RoofAreaFromGeometry(g model.GeometryData) float64 {
	if g.AreaM2 > 0 {
		return g.AreaM2
	}
	return 0
}

func ClimateFromCity(city string) (snow, wind string) {
	c := strings.ToLower(strings.TrimSpace(city))
	switch {
	case strings.Contains(c, "казан"):
		return "IV", "III"
	case strings.Contains(c, "перм"):
		return "V", "II"
	default:
		return "III", "II"
	}
}
