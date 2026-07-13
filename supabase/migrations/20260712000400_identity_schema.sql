-- ============================================================================
-- SGTI — Identity Schema (IAM: System Access Management)
-- Migration: 20260712000400_identity_schema
-- Description: Tracks which external systems/applications each user has
--              access to (independent of SGTI's own shared."UserRole", which
--              governs access *within* SGTI itself), plus periodic access
--              reviews for compliance (LGPD, SOX-style audits).
-- ============================================================================

CREATE TYPE identity."AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED');
CREATE TYPE identity."AccessReviewDecision" AS ENUM ('CONFIRMED', 'REVOKE', 'PENDING');

-- ─── System Access ──────────────────────────────────────────────────────────
-- One row per (user, system) grant. `system_name` is free text on purpose —
-- the catalog of integrated systems (GLPI, Google Workspace, etc.) grows
-- over time via later integration phases, not a fixed enum.
CREATE TABLE IF NOT EXISTS identity."SystemAccess" (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE CASCADE,
    system_name  TEXT NOT NULL,          -- e.g. 'GLPI', 'Google Workspace', 'VPN'
    access_level TEXT NOT NULL,          -- e.g. 'Admin', 'Standard User', 'Read-Only'
    granted_by   UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    granted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at   TIMESTAMPTZ,
    UNIQUE (user_id, system_name)
);
CREATE INDEX IF NOT EXISTS idx_system_access_user ON identity."SystemAccess"(user_id);

CREATE TRIGGER trg_audit_system_access
    AFTER INSERT OR UPDATE OR DELETE ON identity."SystemAccess"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Access Requests ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS identity."AccessRequest" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id  UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    system_name   TEXT NOT NULL,
    access_level  TEXT NOT NULL,
    justification TEXT NOT NULL,
    status        identity."AccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    reviewed_by   UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    reviewed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_access_request_status ON identity."AccessRequest"(status);

CREATE TRIGGER trg_audit_access_request
    AFTER INSERT OR UPDATE OR DELETE ON identity."AccessRequest"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Access Reviews (periodic recertification campaigns) ──────────────────
CREATE TABLE IF NOT EXISTS identity."AccessReviewCycle" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,          -- e.g. "Q3 2026 Access Recertification"
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at      TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_by  UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS identity."AccessReviewItem" (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id          UUID NOT NULL REFERENCES identity."AccessReviewCycle"(id) ON DELETE CASCADE,
    system_access_id  UUID NOT NULL REFERENCES identity."SystemAccess"(id) ON DELETE CASCADE,
    reviewer_id       UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    decision          identity."AccessReviewDecision" NOT NULL DEFAULT 'PENDING',
    decided_at        TIMESTAMPTZ,
    notes             TEXT
);
CREATE INDEX IF NOT EXISTS idx_review_item_cycle ON identity."AccessReviewItem"(cycle_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- IAM data is sensitive — IT staff manage it; a user may see their own
-- access grants for transparency, but nothing else.

ALTER TABLE identity."SystemAccess" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SystemAccess: user can read own"
    ON identity."SystemAccess" FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "SystemAccess: IT staff can manage"
    ON identity."SystemAccess" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE identity."AccessRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AccessRequest: requester can read own"
    ON identity."AccessRequest" FOR SELECT
    USING (requester_id = auth.uid());
CREATE POLICY "AccessRequest: requester can create own"
    ON identity."AccessRequest" FOR INSERT
    WITH CHECK (requester_id = auth.uid());
CREATE POLICY "AccessRequest: IT staff can manage"
    ON identity."AccessRequest" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE identity."AccessReviewCycle" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AccessReviewCycle: IT manager+ only"
    ON identity."AccessReviewCycle" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE identity."AccessReviewItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AccessReviewItem: reviewer can read/update own assignments"
    ON identity."AccessReviewItem" FOR ALL
    USING (reviewer_id = auth.uid())
    WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "AccessReviewItem: IT manager+ can read all"
    ON identity."AccessReviewItem" FOR SELECT
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA identity TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA identity TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA identity TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA identity TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
