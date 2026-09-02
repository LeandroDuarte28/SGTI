-- ============================================================================
-- SGTI — Compliance Findings Schema (Audits, Norms, Findings, Evidence, Risk)
-- Migration: 20260727000000_compliance_findings_schema
-- Description: The structural compliance.Control/Policy/AuditCycle/
--              NonConformance/Evidence tables from 20260712000500 modeled a
--              generic, lightweight compliance tracker. Docs/45_COMPLIANCE.md
--              describes a much richer entity model (Auditoria/Norma/Item
--              Normativo/Apontamento/Plano de Ação/Risco) with ~100 business
--              rules (CMP-001–CMP-100) built around THAT model, not the
--              simpler one. This migration adds the richer model additively
--              — the older tables are left in place (nothing else references
--              them) rather than dropped, since editing an already-applied
--              migration is not safe.
--
--              Roles referenced by the doc (COMPLIANCE_OFFICER, IT_SPECIALIST,
--              FINANCIAL_ANALYST) do not exist in shared."SystemRole" (only
--              SUPER_ADMIN/IT_MANAGER/IT_ANALYST/IT_TECHNICIAN/AUDITOR/
--              END_USER were actually built — see 20260609000000). Mapped
--              down to what exists: IT_MANAGER+SUPER_ADMIN take the
--              COMPLIANCE_OFFICER "manager" responsibilities; IT_ANALYST/
--              IT_TECHNICIAN are the "analyst" who works assigned findings;
--              AUDITOR stays strictly read-only per its existing role
--              comment.
--
--              Out of scope for this migration/feature (not buildable as
--              synchronous CRUD — need infra this project doesn't have yet):
--              scheduled notification jobs (CMP-008/015/025/036/037/063/073/
--              081/088/091/096), Realtime dashboard (CMP-059/087), CSV bulk
--              import (CMP-068), ZIP/PDF/Excel export (CMP-069/083/093),
--              presigned-URL access logging (CMP-018/045/075/100 partially).
--              Everything else — required fields, status-transition guards,
--              SoD, immutability, RLS-based read scoping — is implemented
--              in this migration + the app's Server Actions.
-- ============================================================================

CREATE TYPE compliance."NormType" AS ENUM ('INTERNATIONAL', 'REGULATORY_BR', 'FRAMEWORK', 'INTERNAL');
CREATE TYPE compliance."ItemCriticality" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION');
CREATE TYPE compliance."ItemImplementationStatus" AS ENUM ('NOT_STARTED', 'PARTIAL', 'IMPLEMENTED', 'NOT_APPLICABLE');
CREATE TYPE compliance."ConsultancyStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE compliance."AuditType" AS ENUM ('INTERNAL', 'EXTERNAL', 'CONSULTORIA', 'REGULATORY');
CREATE TYPE compliance."AuditStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'PENDING_RESPONSES', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');
CREATE TYPE compliance."FindingType" AS ENUM ('NON_CONFORMITY', 'OBSERVATION', 'IMPROVEMENT_OPPORTUNITY');
CREATE TYPE compliance."FindingStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING_EVIDENCE', 'IN_VALIDATION', 'CONCLUDED', 'CANCELLED', 'NOT_APPLICABLE', 'REOPENED');
CREATE TYPE compliance."EvidenceType" AS ENUM ('SCREENSHOT', 'DOCUMENT', 'LOG', 'REPORT', 'CERTIFICATE', 'OTHER');
CREATE TYPE compliance."EvidenceReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE compliance."ActionItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE');
CREATE TYPE compliance."RiskLevel1to5" AS ENUM ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');
CREATE TYPE compliance."RiskCategory" AS ENUM ('REGULATORY', 'OPERATIONAL', 'REPUTATIONAL', 'FINANCIAL', 'SECURITY', 'PRIVACY');
CREATE TYPE compliance."RiskStatus" AS ENUM ('IDENTIFIED', 'MONITORING', 'MATERIALIZED', 'MITIGATED', 'ACCEPTED');

-- ─── Consultancies (Docs §3) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."Consultancy" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_name       TEXT NOT NULL,
    legal_name       TEXT NOT NULL,
    cnpj             TEXT,
    cpf              TEXT,
    contact_name     TEXT NOT NULL,
    contact_email    TEXT NOT NULL,
    contact_phone    TEXT,
    website          TEXT,
    specialties      TEXT[] NOT NULL DEFAULT '{}',
    status           compliance."ConsultancyStatus" NOT NULL DEFAULT 'ACTIVE',
    nda_signed       BOOLEAN NOT NULL DEFAULT FALSE,
    nda_date         DATE,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT consultancy_document_present CHECK (cnpj IS NOT NULL OR cpf IS NOT NULL)
);
CREATE TRIGGER trg_consultancy_updated_at
    BEFORE UPDATE ON compliance."Consultancy"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_consultancy
    AFTER INSERT OR UPDATE OR DELETE ON compliance."Consultancy"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Norms (Docs §5) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."Norm" (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code           TEXT NOT NULL UNIQUE,        -- e.g. 'ISO_27001'
    full_name      TEXT NOT NULL,
    version        TEXT,
    issuing_body   TEXT NOT NULL,
    type           compliance."NormType" NOT NULL,
    description    TEXT,
    official_url   TEXT,
    effective_date DATE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_norm_updated_at
    BEFORE UPDATE ON compliance."Norm"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_norm
    AFTER INSERT OR UPDATE OR DELETE ON compliance."Norm"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Norm Items (Docs §6) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."NormItem" (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    norm_id                UUID NOT NULL REFERENCES compliance."Norm"(id) ON DELETE CASCADE,
    item_code              TEXT NOT NULL,        -- e.g. 'A.9.2.1', 'Art. 46'
    item_name              TEXT NOT NULL,
    description            TEXT NOT NULL,
    domain_section         TEXT,
    default_criticality    compliance."ItemCriticality" NOT NULL,
    is_applicable          BOOLEAN NOT NULL DEFAULT TRUE,
    exclusion_justification TEXT,
    implementation_status  compliance."ItemImplementationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    owner_id               UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (norm_id, item_code),
    -- CMP-021: item marked not-applicable requires a justification.
    CONSTRAINT norm_item_exclusion_justified CHECK (is_applicable OR exclusion_justification IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_norm_item_norm ON compliance."NormItem"(norm_id);

CREATE TRIGGER trg_norm_item_updated_at
    BEFORE UPDATE ON compliance."NormItem"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_norm_item
    AFTER INSERT OR UPDATE OR DELETE ON compliance."NormItem"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Audit code sequence: AUD-<year>-<seq>, monotonic (not reset per year —
-- a per-year reset would need a more elaborate per-year counter table; this
-- is a deliberate simplification, codes stay unique and sortable) ──────────
CREATE SEQUENCE IF NOT EXISTS compliance.audit_code_seq;
CREATE SEQUENCE IF NOT EXISTS compliance.finding_code_seq;

-- ─── Audits (Docs §4) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."ComplianceAudit" (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                   TEXT NOT NULL UNIQUE,
    name                   TEXT NOT NULL,
    type                   compliance."AuditType" NOT NULL,
    consultancy_id         UUID REFERENCES compliance."Consultancy"(id) ON DELETE SET NULL,
    scope                  TEXT NOT NULL,
    start_date             DATE NOT NULL,
    end_date               DATE NOT NULL,
    lead_auditor_name      TEXT,
    internal_auditor_id    UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    status                 compliance."AuditStatus" NOT NULL DEFAULT 'PLANNED',
    final_report_path      TEXT,
    compliance_score_final NUMERIC(5, 2),
    cancellation_reason    TEXT,
    notes                  TEXT,
    created_by             UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- CMP-058: end date cannot precede start date.
    CONSTRAINT audit_end_after_start CHECK (end_date >= start_date),
    -- CMP-051: cancelling an audit requires a justification.
    CONSTRAINT audit_cancellation_justified CHECK (status != 'CANCELLED' OR cancellation_reason IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_status ON compliance."ComplianceAudit"(status);

CREATE TRIGGER trg_compliance_audit_updated_at
    BEFORE UPDATE ON compliance."ComplianceAudit"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_compliance_audit
    AFTER INSERT OR UPDATE OR DELETE ON compliance."ComplianceAudit"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

CREATE OR REPLACE FUNCTION compliance.set_audit_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'AUD-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('compliance.audit_code_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_compliance_audit_code
    BEFORE INSERT ON compliance."ComplianceAudit"
    FOR EACH ROW EXECUTE FUNCTION compliance.set_audit_code();

-- Normas avaliadas por auditoria (array FK do Docs §4 modelado como tabela de
-- junção, mais simples de indexar e de aplicar RLS do que um array de UUIDs).
CREATE TABLE IF NOT EXISTS compliance."ComplianceAuditNorm" (
    audit_id UUID NOT NULL REFERENCES compliance."ComplianceAudit"(id) ON DELETE CASCADE,
    norm_id  UUID NOT NULL REFERENCES compliance."Norm"(id) ON DELETE RESTRICT,
    PRIMARY KEY (audit_id, norm_id)
);

-- ─── Findings — "Apontamentos" (Docs §7) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."ComplianceFinding" (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code              TEXT NOT NULL UNIQUE,
    audit_id          UUID NOT NULL REFERENCES compliance."ComplianceAudit"(id) ON DELETE RESTRICT,
    norm_id           UUID NOT NULL REFERENCES compliance."Norm"(id) ON DELETE RESTRICT,
    norm_item_id      UUID NOT NULL REFERENCES compliance."NormItem"(id) ON DELETE RESTRICT,
    finding_type      compliance."FindingType" NOT NULL,
    title             TEXT NOT NULL,
    description       TEXT NOT NULL,
    criticality       compliance."ItemCriticality" NOT NULL,
    department_id     UUID,     -- no shared.Department table exists yet; kept as a free FK-shaped column for a future migration to constrain
    analyst_id        UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    due_date          DATE NOT NULL,
    status            compliance."FindingStatus" NOT NULL DEFAULT 'NEW',
    is_recurrent      BOOLEAN NOT NULL DEFAULT FALSE,
    is_urgent         BOOLEAN NOT NULL DEFAULT FALSE,
    cancellation_reason TEXT,
    reopen_reason     TEXT,
    estimated_cost    NUMERIC(15, 2),
    project_id        UUID,     -- links to project."Project" once Bloco 7 CRUD exists; FK added in a later migration
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- CMP-002: due date cannot be in the past when the finding is created.
    -- Enforced only on INSERT (via trigger below), since an old finding can
    -- legitimately still have a past due_date once it's overdue.
    -- CMP-026: cancelling requires a reason of at least 30 characters.
    CONSTRAINT finding_cancellation_justified CHECK (status != 'CANCELLED' OR char_length(cancellation_reason) >= 30),
    -- CMP-042: reopening requires a reason.
    CONSTRAINT finding_reopen_justified CHECK (status != 'REOPENED' OR reopen_reason IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_compliance_finding_status ON compliance."ComplianceFinding"(status);
CREATE INDEX IF NOT EXISTS idx_compliance_finding_audit ON compliance."ComplianceFinding"(audit_id);
CREATE INDEX IF NOT EXISTS idx_compliance_finding_analyst ON compliance."ComplianceFinding"(analyst_id);
CREATE INDEX IF NOT EXISTS idx_compliance_finding_norm_item ON compliance."ComplianceFinding"(norm_item_id);

CREATE TRIGGER trg_compliance_finding_updated_at
    BEFORE UPDATE ON compliance."ComplianceFinding"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_compliance_finding
    AFTER INSERT OR UPDATE OR DELETE ON compliance."ComplianceFinding"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

CREATE OR REPLACE FUNCTION compliance.set_finding_code_and_recurrence()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'CMP-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('compliance.finding_code_seq')::text, 6, '0');
    END IF;

    -- CMP-002: due date must not be in the past at creation time.
    IF NEW.due_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'due_date não pode estar no passado';
    END IF;

    -- CMP-022: flag recurrence if the same norm item was already the
    -- subject of an earlier finding.
    NEW.is_recurrent := EXISTS (
        SELECT 1 FROM compliance."ComplianceFinding"
        WHERE norm_item_id = NEW.norm_item_id
    );

    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_compliance_finding_insert
    BEFORE INSERT ON compliance."ComplianceFinding"
    FOR EACH ROW EXECUTE FUNCTION compliance.set_finding_code_and_recurrence();

-- ─── Finding Evidence (Docs §8) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."FindingEvidence" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id       UUID NOT NULL REFERENCES compliance."ComplianceFinding"(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    evidence_type    compliance."EvidenceType" NOT NULL,
    storage_path     TEXT NOT NULL,
    sha256_hash      TEXT NOT NULL,
    evidence_date    DATE NOT NULL,
    uploaded_by      UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    review_status    compliance."EvidenceReviewStatus" NOT NULL DEFAULT 'PENDING',
    reviewed_by      UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- CMP-007: evidence date cannot be in the future.
    CONSTRAINT evidence_date_not_future CHECK (evidence_date <= CURRENT_DATE),
    -- CMP-023: an analyst cannot approve their own evidence (SoD).
    CONSTRAINT evidence_review_sod CHECK (reviewed_by IS NULL OR reviewed_by != uploaded_by),
    -- CMP-041: rejecting requires a reason of at least 30 characters.
    CONSTRAINT evidence_rejection_justified CHECK (review_status != 'REJECTED' OR char_length(rejection_reason) >= 30)
);
CREATE INDEX IF NOT EXISTS idx_finding_evidence_finding ON compliance."FindingEvidence"(finding_id);

-- CMP-016: an approved evidence row cannot be deleted (soft-delete only —
-- since this table has no deleted_at column, this simply blocks DELETE
-- outright once approved).
CREATE OR REPLACE FUNCTION compliance.prevent_approved_evidence_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.review_status = 'APPROVED' THEN
        RAISE EXCEPTION 'Evidência aprovada não pode ser excluída';
    END IF;
    RETURN OLD;
END;
$$;
CREATE TRIGGER trg_prevent_approved_evidence_delete
    BEFORE DELETE ON compliance."FindingEvidence"
    FOR EACH ROW EXECUTE FUNCTION compliance.prevent_approved_evidence_delete();

CREATE TRIGGER trg_audit_finding_evidence
    AFTER INSERT OR UPDATE OR DELETE ON compliance."FindingEvidence"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Action Plan Items (Docs §9) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."ActionItem" (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id            UUID NOT NULL REFERENCES compliance."ComplianceFinding"(id) ON DELETE CASCADE,
    sequence_number       INTEGER NOT NULL,
    description           TEXT NOT NULL CHECK (char_length(description) >= 30),
    responsible_id        UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    due_date              DATE NOT NULL,
    status                compliance."ActionItemStatus" NOT NULL DEFAULT 'PENDING',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    linked_evidence_id    UUID REFERENCES compliance."FindingEvidence"(id) ON DELETE SET NULL,
    notes                 TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (finding_id, sequence_number)
);
CREATE INDEX IF NOT EXISTS idx_action_item_finding ON compliance."ActionItem"(finding_id);

CREATE TRIGGER trg_action_item_updated_at
    BEFORE UPDATE ON compliance."ActionItem"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_action_item
    AFTER INSERT OR UPDATE OR DELETE ON compliance."ActionItem"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- CMP-019: an action item's due date cannot be after its parent finding's.
CREATE OR REPLACE FUNCTION compliance.check_action_item_due_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    _finding_due_date DATE;
BEGIN
    SELECT due_date INTO _finding_due_date FROM compliance."ComplianceFinding" WHERE id = NEW.finding_id;
    IF NEW.due_date > _finding_due_date THEN
        RAISE EXCEPTION 'O prazo do item de plano de ação não pode ser posterior ao prazo do apontamento';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_action_item_due_date
    BEFORE INSERT OR UPDATE ON compliance."ActionItem"
    FOR EACH ROW EXECUTE FUNCTION compliance.check_action_item_due_date();

-- ─── Risks (Docs §10) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS compliance."FindingRisk" (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- One risk assessment per finding — simplification, not explicit in the
    -- doc, but matches its singular "Apontamento" FK framing in §10.1.
    finding_id         UUID NOT NULL UNIQUE REFERENCES compliance."ComplianceFinding"(id) ON DELETE CASCADE,
    description        TEXT NOT NULL,
    probability        compliance."RiskLevel1to5" NOT NULL,
    impact             compliance."RiskLevel1to5" NOT NULL,
    category           compliance."RiskCategory" NOT NULL,
    contingency_plan   TEXT,
    status             compliance."RiskStatus" NOT NULL DEFAULT 'IDENTIFIED',
    responsible_id     UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_finding_risk_finding ON compliance."FindingRisk"(finding_id);

CREATE TRIGGER trg_finding_risk_updated_at
    BEFORE UPDATE ON compliance."FindingRisk"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_finding_risk
    AFTER INSERT OR UPDATE OR DELETE ON compliance."FindingRisk"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- CMP-085: a CRITICAL or HIGH-level risk (probability × impact, per the 5×5
-- matrix in Docs §10.2) requires a contingency plan. Levels 15-25 = Crítico,
-- 10-14 = Alto — checked here since the level itself isn't a stored column.
CREATE OR REPLACE FUNCTION compliance.check_risk_contingency_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    _prob_rank INTEGER;
    _impact_rank INTEGER;
    _levels TEXT[] := ARRAY['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
BEGIN
    _prob_rank := array_position(_levels, NEW.probability::text);
    _impact_rank := array_position(_levels, NEW.impact::text);
    IF (_prob_rank * _impact_rank) >= 10 AND NEW.contingency_plan IS NULL THEN
        RAISE EXCEPTION 'Risco CRITICAL ou HIGH exige plano de contingência';
    END IF;
    RETURN NEW;
END;
$$;
CREATE TRIGGER trg_risk_contingency_plan
    BEFORE INSERT OR UPDATE ON compliance."FindingRisk"
    FOR EACH ROW EXECUTE FUNCTION compliance.check_risk_contingency_plan();

-- ─── Storage bucket for evidence files (Docs §8.3) ─────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('compliance-evidence', 'compliance-evidence', FALSE, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "compliance-evidence: IT staff can read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'compliance-evidence' AND shared.is_it_staff());
CREATE POLICY "compliance-evidence: IT staff can read (auditor)"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'compliance-evidence' AND shared.has_any_role(ARRAY['AUDITOR']::shared."SystemRole"[]));
CREATE POLICY "compliance-evidence: IT staff can upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'compliance-evidence' AND shared.is_it_staff());
CREATE POLICY "compliance-evidence: IT staff can delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'compliance-evidence' AND shared.is_it_staff());

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Same shape used across every table here: AUDITOR + managers (IT_MANAGER/
-- SUPER_ADMIN) can read everything; only managers can write, except the
-- analyst assigned to a finding can update that finding/its evidence/action
-- items (the "work the finding" path), never create/delete the finding
-- itself or touch someone else's.

ALTER TABLE compliance."Consultancy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Consultancy: IT staff can read"
    ON compliance."Consultancy" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Consultancy: managers can manage"
    ON compliance."Consultancy" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."Norm" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Norm: IT staff can read"
    ON compliance."Norm" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Norm: managers can manage"
    ON compliance."Norm" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."NormItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "NormItem: IT staff can read"
    ON compliance."NormItem" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "NormItem: managers can manage"
    ON compliance."NormItem" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."ComplianceAudit" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ComplianceAudit: IT staff can read"
    ON compliance."ComplianceAudit" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ComplianceAudit: managers can manage"
    ON compliance."ComplianceAudit" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."ComplianceAuditNorm" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ComplianceAuditNorm: IT staff can read"
    ON compliance."ComplianceAuditNorm" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ComplianceAuditNorm: managers can manage"
    ON compliance."ComplianceAuditNorm" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE compliance."ComplianceFinding" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ComplianceFinding: IT staff can read"
    ON compliance."ComplianceFinding" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ComplianceFinding: managers can manage"
    ON compliance."ComplianceFinding" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));
CREATE POLICY "ComplianceFinding: analyst can update own"
    ON compliance."ComplianceFinding" FOR UPDATE
    USING (analyst_id = auth.uid())
    WITH CHECK (analyst_id = auth.uid());

ALTER TABLE compliance."FindingEvidence" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FindingEvidence: IT staff can read"
    ON compliance."FindingEvidence" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "FindingEvidence: managers can manage"
    ON compliance."FindingEvidence" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));
CREATE POLICY "FindingEvidence: analyst can upload to own finding"
    ON compliance."FindingEvidence" FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid()
        AND EXISTS (
            SELECT 1 FROM compliance."ComplianceFinding" f
            WHERE f.id = finding_id AND f.analyst_id = auth.uid()
        )
    );

ALTER TABLE compliance."ActionItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ActionItem: IT staff can read"
    ON compliance."ActionItem" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "ActionItem: managers can manage"
    ON compliance."ActionItem" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));
CREATE POLICY "ActionItem: responsible can update own"
    ON compliance."ActionItem" FOR UPDATE
    USING (responsible_id = auth.uid())
    WITH CHECK (responsible_id = auth.uid());
CREATE POLICY "ActionItem: analyst can create on own finding"
    ON compliance."ActionItem" FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM compliance."ComplianceFinding" f
            WHERE f.id = finding_id AND f.analyst_id = auth.uid()
        )
    );

ALTER TABLE compliance."FindingRisk" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FindingRisk: IT staff can read"
    ON compliance."FindingRisk" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "FindingRisk: managers can manage"
    ON compliance."FindingRisk" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));
CREATE POLICY "FindingRisk: analyst can create/update on own finding"
    ON compliance."FindingRisk" FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM compliance."ComplianceFinding" f
            WHERE f.id = finding_id AND f.analyst_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM compliance."ComplianceFinding" f
            WHERE f.id = finding_id AND f.analyst_id = auth.uid()
        )
    );

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA compliance TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA compliance TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA compliance TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA compliance
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ─── Seed: pre-registered norms (Docs §5.1) ────────────────────────────────
INSERT INTO compliance."Norm" (code, full_name, version, issuing_body, type) VALUES
    ('ISO_27001', 'ISO/IEC 27001:2022', '2022', 'ISO', 'INTERNATIONAL'),
    ('LGPD', 'Lei Geral de Proteção de Dados (Lei 13.709/2018)', NULL, 'ANPD', 'REGULATORY_BR'),
    ('PCI_DSS', 'PCI DSS', 'v4.0', 'PCI Security Standards Council', 'INTERNATIONAL'),
    ('BACEN_4893', 'Resolução BACEN 4.893/2021', NULL, 'BACEN', 'REGULATORY_BR'),
    ('BACEN_4658', 'Resolução BACEN 4.658/2018', NULL, 'BACEN', 'REGULATORY_BR'),
    ('COBIT_2019', 'COBIT', '2019', 'ISACA', 'FRAMEWORK'),
    ('ITIL_V4', 'ITIL', 'v4', 'AXELOS', 'FRAMEWORK'),
    ('ISO_20000', 'ISO/IEC 20000:2018', '2018', 'ISO', 'INTERNATIONAL'),
    ('SOC_2', 'SOC 2', NULL, 'AICPA', 'INTERNATIONAL'),
    ('INTERNAL_POLICY', 'Política Interna', NULL, 'PinPag', 'INTERNAL')
ON CONFLICT (code) DO NOTHING;

-- ─── Seed: example norm items (Docs §6.3) ──────────────────────────────────
INSERT INTO compliance."NormItem" (norm_id, item_code, item_name, description, domain_section, default_criticality)
SELECT n.id, v.item_code, v.item_name, v.description, v.domain_section, v.criticality::compliance."ItemCriticality"
FROM (VALUES
    ('ISO_27001', 'A.5.1.1', 'Políticas para Segurança da Informação', 'Um conjunto de políticas de segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado.', 'A.5 — Políticas de Segurança da Informação', 'MAJOR'),
    ('ISO_27001', 'A.9.2.1', 'Registro e Cancelamento de Usuário', 'Um processo formal de registro e cancelamento de usuário deve ser implementado.', 'A.9 — Controle de Acesso', 'CRITICAL'),
    ('ISO_27001', 'A.9.2.3', 'Gerenciamento de Direitos de Acesso Privilegiado', 'A concessão e o uso de direitos de acesso privilegiado devem ser restritos e controlados.', 'A.9 — Controle de Acesso', 'CRITICAL'),
    ('ISO_27001', 'A.12.3.1', 'Backup de Informações', 'Cópias de segurança das informações, software e sistemas devem ser mantidas e testadas.', 'A.12 — Segurança nas Operações', 'CRITICAL'),
    ('LGPD', 'Art. 6', 'Princípios do tratamento de dados pessoais', 'O tratamento de dados pessoais deve observar boa-fé e os princípios de finalidade, adequação, necessidade, entre outros.', NULL, 'CRITICAL'),
    ('LGPD', 'Art. 37', 'Registro das atividades de tratamento', 'O controlador e o operador devem manter registro das operações de tratamento de dados pessoais.', NULL, 'MAJOR'),
    ('LGPD', 'Art. 46', 'Medidas de segurança, técnicas e administrativas', 'Os agentes de tratamento devem adotar medidas de segurança aptas a proteger dados pessoais.', NULL, 'CRITICAL'),
    ('LGPD', 'Art. 48', 'Comunicação de incidentes de segurança', 'O controlador deverá comunicar à autoridade nacional e ao titular a ocorrência de incidente de segurança.', NULL, 'CRITICAL')
) AS v(norm_code, item_code, item_name, description, domain_section, criticality)
JOIN compliance."Norm" n ON n.code = v.norm_code
ON CONFLICT (norm_id, item_code) DO NOTHING;
