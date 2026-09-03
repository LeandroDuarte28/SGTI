-- ─────────────────────────────────────────────────────────────────────────
-- Drop the original Fase 02 Compliance tables, superseded by the Bloco 6
-- rebuild (Consultancy/Norm/ComplianceAudit/ComplianceFinding/... in
-- 20260727000000_compliance_findings_schema.sql). All four tables are
-- empty and have no external references — confirmed before this migration.
-- ─────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS compliance."Evidence";
DROP TABLE IF EXISTS compliance."NonConformance";
DROP TABLE IF EXISTS compliance."AuditCycle";
DROP TABLE IF EXISTS compliance."Control";
DROP TABLE IF EXISTS compliance."Policy";
