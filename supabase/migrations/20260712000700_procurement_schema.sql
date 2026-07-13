-- ============================================================================
-- SGTI — Procurement Schema (Suppliers, Purchase Orders)
-- Migration: 20260712000700_procurement_schema
-- ============================================================================

CREATE TYPE procurement."PurchaseOrderStatus" AS ENUM (
    'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED'
);

-- ─── Suppliers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procurement."Supplier" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    tax_id        TEXT,          -- CNPJ
    contact_email TEXT,
    contact_phone TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tax_id)
);

CREATE TRIGGER trg_supplier_updated_at
    BEFORE UPDATE ON procurement."Supplier"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();

-- ─── Purchase Orders ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procurement."PurchaseOrder" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id   UUID NOT NULL REFERENCES procurement."Supplier"(id) ON DELETE RESTRICT,
    requested_by  UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE RESTRICT,
    approved_by   UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    status        procurement."PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    total_amount  NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_po_status ON procurement."PurchaseOrder"(status);

CREATE TRIGGER trg_po_updated_at
    BEFORE UPDATE ON procurement."PurchaseOrder"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_po
    AFTER INSERT OR UPDATE OR DELETE ON procurement."PurchaseOrder"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Purchase Order Items ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procurement."PurchaseOrderItem" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES procurement."PurchaseOrder"(id) ON DELETE CASCADE,
    description      TEXT NOT NULL,
    quantity         INTEGER NOT NULL CHECK (quantity > 0),
    unit_price       NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0)
);
CREATE INDEX IF NOT EXISTS idx_po_item_order ON procurement."PurchaseOrderItem"(purchase_order_id);

-- ─── Receiving Records ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS procurement."ReceivingRecord" (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES procurement."PurchaseOrder"(id) ON DELETE CASCADE,
    received_by       UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes             TEXT
);
CREATE INDEX IF NOT EXISTS idx_receiving_po ON procurement."ReceivingRecord"(purchase_order_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE procurement."Supplier" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Supplier: IT staff can read"
    ON procurement."Supplier" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Supplier: managers can manage"
    ON procurement."Supplier" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE procurement."PurchaseOrder" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PurchaseOrder: requester can read own"
    ON procurement."PurchaseOrder" FOR SELECT
    USING (requested_by = auth.uid());
CREATE POLICY "PurchaseOrder: requester can create own"
    ON procurement."PurchaseOrder" FOR INSERT
    WITH CHECK (requested_by = auth.uid());
CREATE POLICY "PurchaseOrder: managers can manage all"
    ON procurement."PurchaseOrder" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE procurement."PurchaseOrderItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PurchaseOrderItem: IT staff can read"
    ON procurement."PurchaseOrderItem" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "PurchaseOrderItem: managers can manage"
    ON procurement."PurchaseOrderItem" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE procurement."ReceivingRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ReceivingRecord: IT staff only"
    ON procurement."ReceivingRecord" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA procurement TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA procurement TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA procurement TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA procurement TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA procurement
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA procurement
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA procurement
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
