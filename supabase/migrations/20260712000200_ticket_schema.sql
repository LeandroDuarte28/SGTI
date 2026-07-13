-- ============================================================================
-- SGTI — Ticket Schema (Incidents, Service Requests, Problems)
-- Migration: 20260712000200_ticket_schema
-- Description: The core ITSM module. Depends on `catalog` (priority enum,
--              SLA, catalog items) and `shared` (users, roles, audit).
-- ============================================================================

-- ─── Status enum ────────────────────────────────────────────────────────────
-- Values match the Tailwind `status` color tokens already defined in
-- tailwind.config.ts (open/in-progress/resolved/closed/pending).
CREATE TYPE ticket."TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED');

-- ─── Incidents ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket."Incident" (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    status       ticket."TicketStatus" NOT NULL DEFAULT 'OPEN',
    priority     catalog."TicketPriority" NOT NULL,
    category_id  UUID REFERENCES catalog."ServiceCategory"(id) ON DELETE SET NULL,
    sla_id       UUID REFERENCES catalog."SLADefinition"(id) ON DELETE SET NULL,
    reporter_id  UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    assignee_id  UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    resolved_at  TIMESTAMPTZ,
    closed_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_incident_status     ON ticket."Incident"(status);
CREATE INDEX IF NOT EXISTS idx_incident_reporter    ON ticket."Incident"(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incident_assignee    ON ticket."Incident"(assignee_id);
CREATE INDEX IF NOT EXISTS idx_incident_priority    ON ticket."Incident"(priority) WHERE status NOT IN ('RESOLVED', 'CLOSED');

CREATE TRIGGER trg_incident_updated_at
    BEFORE UPDATE ON ticket."Incident"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_incident
    AFTER INSERT OR UPDATE OR DELETE ON ticket."Incident"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Service Requests ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket."ServiceRequest" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_item_id UUID NOT NULL REFERENCES catalog."ServiceCatalogItem"(id) ON DELETE RESTRICT,
    requester_id    UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    status          ticket."TicketStatus" NOT NULL DEFAULT 'OPEN',
    justification   TEXT,
    approved_by     UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    approved_at     TIMESTAMPTZ,
    fulfilled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_request_status    ON ticket."ServiceRequest"(status);
CREATE INDEX IF NOT EXISTS idx_service_request_requester ON ticket."ServiceRequest"(requester_id);

CREATE TRIGGER trg_service_request_updated_at
    BEFORE UPDATE ON ticket."ServiceRequest"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_service_request
    AFTER INSERT OR UPDATE OR DELETE ON ticket."ServiceRequest"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Problems ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket."Problem" (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                  TEXT NOT NULL,
    description            TEXT NOT NULL,
    root_cause             TEXT,
    is_known_error         BOOLEAN NOT NULL DEFAULT FALSE,
    status                 ticket."TicketStatus" NOT NULL DEFAULT 'OPEN',
    related_incident_count INTEGER NOT NULL DEFAULT 0,
    owner_id               UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_problem_status ON ticket."Problem"(status);

CREATE TRIGGER trg_problem_updated_at
    BEFORE UPDATE ON ticket."Problem"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_problem
    AFTER INSERT OR UPDATE OR DELETE ON ticket."Problem"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Incident ↔ Problem link (many incidents can relate to one problem) ────
CREATE TABLE IF NOT EXISTS ticket."IncidentProblemLink" (
    incident_id UUID NOT NULL REFERENCES ticket."Incident"(id) ON DELETE CASCADE,
    problem_id  UUID NOT NULL REFERENCES ticket."Problem"(id) ON DELETE CASCADE,
    linked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (incident_id, problem_id)
);

-- ─── Comments (polymorphic across Incident/ServiceRequest/Problem) ─────────
CREATE TYPE ticket."TicketType" AS ENUM ('INCIDENT', 'SERVICE_REQUEST', 'PROBLEM');

CREATE TABLE IF NOT EXISTS ticket."TicketComment" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_type ticket."TicketType" NOT NULL,
    ticket_id   UUID NOT NULL,        -- references Incident.id, ServiceRequest.id, or Problem.id depending on ticket_type
    author_id   UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    body        TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,  -- internal notes hidden from END_USER
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_comment_ticket ON ticket."TicketComment"(ticket_type, ticket_id);
COMMENT ON TABLE ticket."TicketComment" IS
    'Polymorphic comments. No FK on ticket_id by design (spans 3 tables) — integrity enforced at the application layer.';

-- ─── Escalation Records ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket."EscalationRecord" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id   UUID NOT NULL REFERENCES ticket."Incident"(id) ON DELETE CASCADE,
    escalated_to  UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    reason        TEXT NOT NULL,
    escalated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_escalation_incident ON ticket."EscalationRecord"(incident_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE ticket."Incident" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Incident: reporter can read own"
    ON ticket."Incident" FOR SELECT
    USING (reporter_id = auth.uid());
CREATE POLICY "Incident: assignee can read assigned"
    ON ticket."Incident" FOR SELECT
    USING (assignee_id = auth.uid());
CREATE POLICY "Incident: IT staff can read all"
    ON ticket."Incident" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Incident: reporter can create own"
    ON ticket."Incident" FOR INSERT
    WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "Incident: IT staff can update"
    ON ticket."Incident" FOR UPDATE
    USING (shared.is_it_staff());

ALTER TABLE ticket."ServiceRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ServiceRequest: requester can read own"
    ON ticket."ServiceRequest" FOR SELECT
    USING (requester_id = auth.uid());
CREATE POLICY "ServiceRequest: IT staff can read all"
    ON ticket."ServiceRequest" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ServiceRequest: requester can create own"
    ON ticket."ServiceRequest" FOR INSERT
    WITH CHECK (requester_id = auth.uid());
CREATE POLICY "ServiceRequest: IT staff can update"
    ON ticket."ServiceRequest" FOR UPDATE
    USING (shared.is_it_staff());

ALTER TABLE ticket."Problem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problem: IT staff can read all"
    ON ticket."Problem" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Problem: IT staff can manage"
    ON ticket."Problem" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE ticket."IncidentProblemLink" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "IncidentProblemLink: IT staff only"
    ON ticket."IncidentProblemLink" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE ticket."TicketComment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "TicketComment: IT staff can read all"
    ON ticket."TicketComment" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "TicketComment: author can read own"
    ON ticket."TicketComment" FOR SELECT
    USING (author_id = auth.uid() AND is_internal = FALSE);
CREATE POLICY "TicketComment: authenticated can comment"
    ON ticket."TicketComment" FOR INSERT
    WITH CHECK (author_id = auth.uid());

ALTER TABLE ticket."EscalationRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "EscalationRecord: IT staff only"
    ON ticket."EscalationRecord" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

-- ─── Realtime — incidents & comments update live in the UI ─────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE ticket."Incident";
ALTER PUBLICATION supabase_realtime ADD TABLE ticket."TicketComment";

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA ticket TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA ticket TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA ticket TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA ticket TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA ticket
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ticket
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA ticket
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
