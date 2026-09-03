-- ─────────────────────────────────────────────────────────────────────────
-- SLA Automation (Docs/31_SLA.md, sections 7-9): breach/at-risk detection
-- for Incidents, an immutable breach audit trail, and idempotency markers
-- so the sla-monitor job only notifies once per threshold per incident.
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE ticket."Incident"
  ADD COLUMN sla_at_risk_notified_at timestamptz,
  ADD COLUMN sla_breached_at timestamptz;

-- Immutable record of SLA violations (Docs/31_SLA.md §9.2 — "Violação de
-- SLA é PERMANENTE... AUDITÁVEL: registrada em catalog.SLAHistory").
CREATE TABLE catalog."SLAHistory" (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id uuid NOT NULL REFERENCES ticket."Incident"(id) ON DELETE CASCADE,
    event text NOT NULL CHECK (event = 'BREACHED'),
    event_at timestamptz NOT NULL DEFAULT now(),
    priority catalog."TicketPriority" NOT NULL,
    technician_id uuid REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    elapsed_minutes integer NOT NULL CHECK (elapsed_minutes >= 0),
    deadline_minutes integer NOT NULL CHECK (deadline_minutes > 0),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sla_history_incident ON catalog."SLAHistory"(incident_id);

ALTER TABLE catalog."SLAHistory" ENABLE ROW LEVEL SECURITY;

-- Read-only for IT staff; no INSERT/UPDATE/DELETE policy for any role —
-- only the sla-monitor Edge Function (service_role, which bypasses RLS)
-- writes to this table, matching the immutability of shared.AuditLog.
CREATE POLICY "SLAHistory: IT staff can read" ON catalog."SLAHistory"
    FOR SELECT USING (shared.is_it_staff());
