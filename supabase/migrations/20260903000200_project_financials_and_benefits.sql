-- ─────────────────────────────────────────────────────────────────────────
-- Project financial tracking (CAPEX/OPEX approved vs. realized) and
-- benefits management (Docs/48_PROJECT_MANAGEMENT.md §12, §27) — a
-- focused extension, not the full PMO rebuild: no approval workflow,
-- WBS/Gantt, Change Requests or Sponsor/PMO roles.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE project."Project"
  ADD COLUMN capex_approved numeric(15,2),
  ADD COLUMN opex_approved numeric(15,2),
  ADD COLUMN capex_realized numeric(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN opex_realized numeric(15,2) NOT NULL DEFAULT 0;

CREATE TYPE project."BenefitType" AS ENUM ('FINANCIAL', 'EFFICIENCY', 'RISK_REDUCTION', 'COMPLIANCE', 'QUALITY', 'INNOVATION');
CREATE TYPE project."BenefitStatus" AS ENUM ('PLANNED', 'PENDING_MEASUREMENT', 'REALIZED', 'NOT_REALIZED', 'PARTIALLY_REALIZED');

CREATE TABLE project."ProjectBenefit" (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id           UUID NOT NULL REFERENCES project."Project"(id) ON DELETE CASCADE,
    description          TEXT NOT NULL,
    benefit_type         project."BenefitType" NOT NULL,
    expected_value       NUMERIC(15,2),
    realization_deadline DATE NOT NULL,
    realized_value       NUMERIC(15,2),
    measured_at          TIMESTAMPTZ,
    measured_by          UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    status               project."BenefitStatus" NOT NULL DEFAULT 'PLANNED',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_benefit_project ON project."ProjectBenefit"(project_id);

CREATE TRIGGER trg_project_benefit_updated_at
    BEFORE UPDATE ON project."ProjectBenefit"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();

ALTER TABLE project."ProjectBenefit" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ProjectBenefit: IT staff can read"
    ON project."ProjectBenefit" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ProjectBenefit: IT staff can manage"
    ON project."ProjectBenefit" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

GRANT ALL ON ALL TABLES IN SCHEMA project TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA project TO anon, authenticated, service_role;
