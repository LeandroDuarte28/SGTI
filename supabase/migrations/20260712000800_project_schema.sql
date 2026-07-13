-- ============================================================================
-- SGTI — Project Schema (IT Projects)
-- Migration: 20260712000800_project_schema
-- Description: References financial."Budget" — must run after financial schema.
-- ============================================================================

CREATE TYPE project."ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE project."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE project."GithubRefType" AS ENUM ('ISSUE', 'PULL_REQUEST', 'COMMIT');

-- ─── Projects ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project."Project" (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT NOT NULL,
    description  TEXT,
    status       project."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    owner_id     UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    budget_id    UUID REFERENCES financial."Budget"(id) ON DELETE SET NULL,
    start_date   DATE,
    end_date     DATE,
    github_repo  TEXT,   -- e.g. 'LeandroDuarte28/SGTI'
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_status ON project."Project"(status);

CREATE TRIGGER trg_project_updated_at
    BEFORE UPDATE ON project."Project"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_project
    AFTER INSERT OR UPDATE OR DELETE ON project."Project"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Milestones ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project."Milestone" (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id   UUID NOT NULL REFERENCES project."Project"(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    due_date     DATE,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_milestone_project ON project."Milestone"(project_id);

-- ─── Risks ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project."Risk" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES project."Project"(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    probability project."RiskLevel" NOT NULL,
    impact      project."RiskLevel" NOT NULL,
    mitigation  TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_risk_project ON project."Risk"(project_id);

-- ─── GitHub References ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project."GithubReference" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES project."Project"(id) ON DELETE CASCADE,
    ref_type    project."GithubRefType" NOT NULL,
    url         TEXT NOT NULL,
    title       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_github_ref_project ON project."GithubReference"(project_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Projects are visible to all IT staff (planning transparency); only
-- managers create/edit at the project level.

ALTER TABLE project."Project" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project: IT staff can read"
    ON project."Project" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Project: owner can update own"
    ON project."Project" FOR UPDATE
    USING (owner_id = auth.uid());
CREATE POLICY "Project: managers can manage all"
    ON project."Project" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE project."Milestone" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Milestone: IT staff can read"
    ON project."Milestone" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Milestone: IT staff can manage"
    ON project."Milestone" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE project."Risk" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Risk: IT staff can read"
    ON project."Risk" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Risk: IT staff can manage"
    ON project."Risk" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE project."GithubReference" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "GithubReference: IT staff can read"
    ON project."GithubReference" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "GithubReference: IT staff can manage"
    ON project."GithubReference" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA project TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA project TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA project TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA project TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA project
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA project
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA project
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
