-- ============================================================================
-- SGTI — Catalog Schema (Service Catalog + SLA)
-- Migration: 20260712000100_catalog_schema
-- Description: Service categories, catalog items, and SLA definitions.
--              `ticket` schema (next migration) depends on these tables —
--              hence created first.
-- ============================================================================

-- ─── Priority enum ──────────────────────────────────────────────────────────
-- Shared across catalog (SLA) and ticket (Incident/Request/Problem priority).
-- Values match the Tailwind `priority` color tokens already defined in
-- tailwind.config.ts (critical/high/medium/low).
CREATE TYPE catalog."TicketPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- ─── SLA Definitions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog."SLADefinition" (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    TEXT NOT NULL,
    priority                catalog."TicketPriority" NOT NULL,
    response_time_minutes   INTEGER NOT NULL CHECK (response_time_minutes > 0),
    resolution_time_minutes INTEGER NOT NULL CHECK (resolution_time_minutes > 0),
    business_hours_only     BOOLEAN NOT NULL DEFAULT TRUE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name)
);
COMMENT ON TABLE catalog."SLADefinition" IS
    'Response/resolution time targets per priority level. Referenced by tickets and catalog items.';

CREATE TRIGGER trg_sla_definition_updated_at
    BEFORE UPDATE ON catalog."SLADefinition"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();

-- ─── Service Categories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog."ServiceCategory" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    description TEXT,
    icon        TEXT,               -- lucide-react icon name, rendered in the catalog UI
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name)
);

-- ─── Service Catalog Items ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS catalog."ServiceCatalogItem" (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id            UUID NOT NULL REFERENCES catalog."ServiceCategory"(id) ON DELETE RESTRICT,
    name                   TEXT NOT NULL,
    description            TEXT,
    default_sla_id         UUID REFERENCES catalog."SLADefinition"(id) ON DELETE SET NULL,
    estimated_delivery_days INTEGER CHECK (estimated_delivery_days >= 0),
    is_active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_catalog_item_category ON catalog."ServiceCatalogItem"(category_id);

CREATE TRIGGER trg_catalog_item_updated_at
    BEFORE UPDATE ON catalog."ServiceCatalogItem"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Catalog data is readable by any authenticated user (it's what END_USERs
-- browse to open a request). Only IT staff can manage it.

ALTER TABLE catalog."SLADefinition" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SLADefinition: authenticated can read"
    ON catalog."SLADefinition" FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "SLADefinition: IT staff can manage"
    ON catalog."SLADefinition" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE catalog."ServiceCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ServiceCategory: authenticated can read"
    ON catalog."ServiceCategory" FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "ServiceCategory: IT staff can manage"
    ON catalog."ServiceCategory" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE catalog."ServiceCatalogItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ServiceCatalogItem: authenticated can read"
    ON catalog."ServiceCatalogItem" FOR SELECT
    USING (auth.uid() IS NOT NULL);
CREATE POLICY "ServiceCatalogItem: IT staff can manage"
    ON catalog."ServiceCatalogItem" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

-- ─── Grants (schema-level + table-level + future tables) ───────────────────
-- Learned the hard way in Fase 01: RLS alone does nothing without these.
GRANT USAGE ON SCHEMA catalog TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA catalog TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA catalog TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA catalog TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
