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
