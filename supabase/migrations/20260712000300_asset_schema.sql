-- ============================================================================
-- SGTI — Asset Schema (ITAM: Hardware, Software Licenses, Maintenance)
-- Migration: 20260712000300_asset_schema
-- Description: IT Asset Management. Assets can optionally be linked to
--              incidents (ticket schema) — that FK is added in a later
--              migration once both schemas exist, to avoid circular
--              creation-order dependencies.
-- ============================================================================

CREATE TYPE asset."AssetType" AS ENUM ('HARDWARE', 'SOFTWARE_LICENSE', 'PERIPHERAL', 'NETWORK_EQUIPMENT', 'MOBILE_DEVICE');
CREATE TYPE asset."AssetStatus" AS ENUM ('IN_USE', 'IN_STOCK', 'IN_MAINTENANCE', 'RETIRED', 'LOST');

-- ─── Assets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset."Asset" (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag         TEXT NOT NULL UNIQUE,   -- internal inventory code, e.g. "NB-0042"
    type              asset."AssetType" NOT NULL,
    status            asset."AssetStatus" NOT NULL DEFAULT 'IN_STOCK',
    name              TEXT NOT NULL,
    manufacturer      TEXT,
    model             TEXT,
    serial_number     TEXT,
    purchase_date     DATE,
    purchase_value    NUMERIC(12, 2),
    warranty_expires  DATE,
    assigned_to       UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    location          TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_asset_status      ON asset."Asset"(status);
CREATE INDEX IF NOT EXISTS idx_asset_assigned_to  ON asset."Asset"(assigned_to);
CREATE INDEX IF NOT EXISTS idx_asset_type         ON asset."Asset"(type);

CREATE TRIGGER trg_asset_updated_at
    BEFORE UPDATE ON asset."Asset"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_asset
    AFTER INSERT OR UPDATE OR DELETE ON asset."Asset"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Software Licenses ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset."SoftwareLicense" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software_name    TEXT NOT NULL,
    license_key      TEXT,
    seats_total      INTEGER NOT NULL CHECK (seats_total > 0),
    seats_used       INTEGER NOT NULL DEFAULT 0 CHECK (seats_used >= 0),
    vendor           TEXT,
    purchase_date    DATE,
    expires_at       DATE,
    annual_cost      NUMERIC(12, 2),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT seats_used_within_total CHECK (seats_used <= seats_total)
);
CREATE INDEX IF NOT EXISTS idx_license_expires ON asset."SoftwareLicense"(expires_at);

CREATE TRIGGER trg_license_updated_at
    BEFORE UPDATE ON asset."SoftwareLicense"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_license
    AFTER INSERT OR UPDATE OR DELETE ON asset."SoftwareLicense"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- Which users hold a seat on a given license
CREATE TABLE IF NOT EXISTS asset."LicenseAssignment" (
    license_id  UUID NOT NULL REFERENCES asset."SoftwareLicense"(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (license_id, user_id)
);

-- ─── Maintenance Records ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset."AssetMaintenanceRecord" (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id      UUID NOT NULL REFERENCES asset."Asset"(id) ON DELETE CASCADE,
    description   TEXT NOT NULL,
    performed_by  UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    cost          NUMERIC(12, 2),
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON asset."AssetMaintenanceRecord"(asset_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Asset inventory is operational IT data — not exposed to END_USER, except
-- each user can see the assets currently assigned to them.

ALTER TABLE asset."Asset" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Asset: assigned user can read own"
    ON asset."Asset" FOR SELECT
    USING (assigned_to = auth.uid());
CREATE POLICY "Asset: IT staff can manage"
    ON asset."Asset" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE asset."SoftwareLicense" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SoftwareLicense: IT staff only"
    ON asset."SoftwareLicense" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE asset."LicenseAssignment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "LicenseAssignment: user can read own"
    ON asset."LicenseAssignment" FOR SELECT
    USING (user_id = auth.uid());
CREATE POLICY "LicenseAssignment: IT staff can manage"
    ON asset."LicenseAssignment" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE asset."AssetMaintenanceRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AssetMaintenanceRecord: IT staff only"
    ON asset."AssetMaintenanceRecord" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA asset TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA asset TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA asset TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA asset TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA asset
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA asset
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA asset
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
