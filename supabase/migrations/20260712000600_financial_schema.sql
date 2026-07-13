-- ============================================================================
-- SGTI — Financial Schema (Budgets, Contracts, Expenses)
-- Migration: 20260712000600_financial_schema
-- ============================================================================

CREATE TYPE financial."ExpenseCategory" AS ENUM ('OPEX', 'CAPEX');
CREATE TYPE financial."ContractStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING_RENEWAL');

-- ─── Budgets ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial."Budget" (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             TEXT NOT NULL,
    fiscal_year      INTEGER NOT NULL,
    category         financial."ExpenseCategory" NOT NULL,
    allocated_amount NUMERIC(14, 2) NOT NULL CHECK (allocated_amount >= 0),
    spent_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
    owner_id         UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, fiscal_year)
);
CREATE INDEX IF NOT EXISTS idx_budget_fiscal_year ON financial."Budget"(fiscal_year);

CREATE TRIGGER trg_budget_updated_at
    BEFORE UPDATE ON financial."Budget"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_budget
    AFTER INSERT OR UPDATE OR DELETE ON financial."Budget"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Contracts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial."Contract" (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name         TEXT NOT NULL,
    title               TEXT NOT NULL,
    category            financial."ExpenseCategory" NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    value               NUMERIC(14, 2) NOT NULL CHECK (value >= 0),
    renewal_notice_days INTEGER DEFAULT 30,
    status              financial."ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    owner_id            UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contract_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_contract_status  ON financial."Contract"(status);
CREATE INDEX IF NOT EXISTS idx_contract_end_date ON financial."Contract"(end_date);

CREATE TRIGGER trg_contract_updated_at
    BEFORE UPDATE ON financial."Contract"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_contract
    AFTER INSERT OR UPDATE OR DELETE ON financial."Contract"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Expenses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial."Expense" (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id    UUID REFERENCES financial."Budget"(id) ON DELETE SET NULL,
    contract_id  UUID REFERENCES financial."Contract"(id) ON DELETE SET NULL,
    description  TEXT NOT NULL,
    amount       NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approved_by  UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expense_budget ON financial."Expense"(budget_id);

CREATE TRIGGER trg_audit_expense
    AFTER INSERT OR UPDATE OR DELETE ON financial."Expense"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Financial data — IT_MANAGER+ read/write; other IT staff have no access by
-- default (need-to-know, not just "logged in").

ALTER TABLE financial."Budget" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Budget: managers only"
    ON financial."Budget" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE financial."Contract" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contract: managers only"
    ON financial."Contract" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

ALTER TABLE financial."Expense" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expense: managers only"
    ON financial."Expense" FOR ALL
    USING (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]))
    WITH CHECK (shared.has_any_role(ARRAY['SUPER_ADMIN', 'IT_MANAGER']::shared."SystemRole"[]));

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA financial TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA financial TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA financial TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA financial TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA financial
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA financial
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA financial
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
