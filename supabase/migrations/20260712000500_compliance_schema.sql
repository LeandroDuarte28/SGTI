-- ============================================================================
-- SGTI — Compliance Schema (Controls, Policies, Audits, Evidence)
-- Migration: 20260712000500_compliance_schema
-- Description: Supports the 100 business rules (CMP-001–CMP-100) documented
--              in Docs/45_COMPLIANCE.md. Structural tables only — the actual
--              rule catalog lives in application/seed data, not as DDL.
-- ============================================================================

CREATE TYPE compliance."ControlStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'IN_REMEDIATION', 'NOT_APPLICABLE');
CREATE TYPE compliance."PolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'RETIRED');
CREATE TYPE compliance."NonConformanceSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');
CREATE TYPE compliance."NonConformanceStatus" AS ENUM ('OPEN', 'IN_REMEDIATION', 'RESOLVED', 'ACCEPTED_RISK');

-- ─── Controls ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."Control" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        TEXT NOT NULL UNIQUE,   -- e.g. 'CMP-001'
    title       TEXT NOT NULL,
    description TEXT,
    framework   TEXT,                   -- e.g. 'LGPD', 'ISO 27001', 'Internal'
    category    TEXT,
    status      compliance."ControlStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    owner_id    UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_control_status ON compliance."Control"(status);

CREATE TRIGGER trg_control_updated_at
    BEFORE UPDATE ON compliance."Control"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_control
    AFTER INSERT OR UPDATE OR DELETE ON compliance."Control"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Policies ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."Policy" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title         TEXT NOT NULL,
    content       TEXT,
    version       TEXT NOT NULL DEFAULT '1.0.0',
    status        compliance."PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    effective_date DATE,
    review_date   DATE,
    owner_id      UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_policy_updated_at
    BEFORE UPDATE ON compliance."Policy"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_policy
    AFTER INSERT OR UPDATE OR DELETE ON compliance."Policy"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Audit Cycles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."AuditCycle" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    framework     TEXT,
    started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at        TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    created_by    UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL
);

-- ─── Non-Conformances ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."NonConformance" (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id     UUID REFERENCES compliance."Control"(id) ON DELETE SET NULL,
    audit_cycle_id UUID REFERENCES compliance."AuditCycle"(id) ON DELETE SET NULL,
    description    TEXT NOT NULL,
    severity       compliance."NonConformanceSeverity" NOT NULL,
    status         compliance."NonConformanceStatus" NOT NULL DEFAULT 'OPEN',
    identified_by  UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    owner_id       UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    resolved_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nonconformance_status ON compliance."NonConformance"(status);
CREATE INDEX IF NOT EXISTS idx_nonconformance_control ON compliance."NonConformance"(control_id);

CREATE TRIGGER trg_nonconformance_updated_at
    BEFORE UPDATE ON compliance."NonConformance"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_nonconformance
    AFTER INSERT OR UPDATE OR DELETE ON compliance."NonConformance"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Evidence ───────────────────────────────────────────────────────────────
-- File itself lives in Supabase Storage; this row tracks metadata + linkage.
CREATE TABLE IF NOT EXISTS compliance."Evidence" (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id          UUID REFERENCES compliance."Control"(id) ON DELETE SET NULL,
    non_conformance_id  UUID REFERENCES compliance."NonConformance"(id) ON DELETE SET NULL,
    storage_path        TEXT NOT NULL,   -- path within the Supabase Storage bucket
    description         TEXT,
    uploaded_by         UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT evidence_linked_to_something CHECK (control_id IS NOT NULL OR non_conformance_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_evidence_control ON compliance."Evidence"(control_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- AUDITOR role gets read-only access to everything in this schema — that's
-- its entire purpose (see shared."SystemRole" comment: 'Read-only access to
-- compliance and audit logs'). IT_MANAGER/SUPER_ADMIN manage.

ALTER TABLE compliance."Control" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Control: auditors and managers can read"
    ON compliance."Control" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER', 'AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "Control: managers can manage"
    ON compliance."Control" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."Policy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Policy: auditors and managers can read"
    ON compliance."Policy" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER', 'AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "Policy: managers can manage"
    ON compliance."Policy" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."AuditCycle" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AuditCycle: auditors and managers can read"
    ON compliance."AuditCycle" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER', 'AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "AuditCycle: managers can manage"
    ON compliance."AuditCycle" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."NonConformance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NonConformance: auditors and managers can read"
    ON compliance."NonConformance" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER', 'AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "NonConformance: owner can update own"
    ON compliance."NonConformance" FOR UPDATE
    USING (owner_id = auth.uid());
CREATE POLICY "NonConformance: managers can manage"
    ON compliance."NonConformance" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."Evidence" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evidence: auditors and managers can read"
    ON compliance."Evidence" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER', 'AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "Evidence: IT staff can upload"
    ON compliance."Evidence" FOR INSERT
    WITH CHECK (shared.is_it_staff());

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA compliance TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA compliance TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA compliance TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA compliance TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
