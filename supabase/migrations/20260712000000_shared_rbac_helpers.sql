-- ============================================================================
-- SGTI — Shared RBAC helpers + generic audit trigger
-- Migration: 20260712000000_shared_rbac_helpers
-- Description: Reusable functions so every module schema (catalog, ticket,
--              asset, identity, compliance, financial, procurement, project,
--              knowledge) can enforce role-based RLS and audit logging
--              without duplicating logic. Created once here in `shared`.
-- ============================================================================

-- ─── shared.has_role ────────────────────────────────────────────────────────
-- Checks if the currently authenticated user holds a specific role.
-- SECURITY DEFINER: runs with the privileges of the function owner (postgres),
-- bypassing RLS on shared."UserRole" — otherwise this would recurse into RLS
-- checks on UserRole itself when used inside another table's RLS policy.
CREATE OR REPLACE FUNCTION shared.has_role(_role shared."SystemRole")
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = shared, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM shared."UserRole"
        WHERE user_id = auth.uid()
          AND role = _role
          AND (expires_at IS NULL OR expires_at > NOW())
    );
$$;
COMMENT ON FUNCTION shared.has_role IS
    'Returns true if the authenticated user currently holds the given role. Used inside RLS policies across all module schemas.';

-- ─── shared.has_any_role ────────────────────────────────────────────────────
-- Checks if the authenticated user holds ANY of the given roles.
CREATE OR REPLACE FUNCTION shared.has_any_role(_roles shared."SystemRole"[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = shared, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM shared."UserRole"
        WHERE user_id = auth.uid()
          AND role = ANY(_roles)
          AND (expires_at IS NULL OR expires_at > NOW())
    );
$$;
COMMENT ON FUNCTION shared.has_any_role IS
    'Returns true if the authenticated user currently holds any of the given roles.';

-- ─── shared.is_it_staff ─────────────────────────────────────────────────────
-- Convenience shorthand — the roles that can see/manage IT operational data
-- across most modules (as opposed to END_USER, who only sees their own).
CREATE OR REPLACE FUNCTION shared.is_it_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = shared, pg_temp
AS $$
    SELECT shared.has_any_role(ARRAY[
        'SUPER_ADMIN', 'IT_MANAGER', 'IT_ANALYST', 'IT_TECHNICIAN'
    ]::shared."SystemRole"[]);
$$;
COMMENT ON FUNCTION shared.is_it_staff IS
    'True for SUPER_ADMIN, IT_MANAGER, IT_ANALYST, IT_TECHNICIAN — the roles that operate the IT modules, as opposed to END_USER.';

-- ─── shared.audit_trigger ───────────────────────────────────────────────────
-- Generic trigger function: any table across any module schema can attach
-- this trigger to automatically log INSERT/UPDATE/DELETE into shared.AuditLog,
-- without writing bespoke logging code per table.
CREATE OR REPLACE FUNCTION shared.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = shared, pg_temp
AS $$
DECLARE
    _action TEXT;
    _entity_id UUID;
    _old_values JSONB;
    _new_values JSONB;
BEGIN
    _action := lower(TG_TABLE_NAME) || '.' || lower(TG_OP);

    IF TG_OP = 'DELETE' THEN
        _entity_id := OLD.id;
        _old_values := to_jsonb(OLD);
        _new_values := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        _entity_id := NEW.id;
        _old_values := to_jsonb(OLD);
        _new_values := to_jsonb(NEW);
    ELSE -- INSERT
        _entity_id := NEW.id;
        _old_values := NULL;
        _new_values := to_jsonb(NEW);
    END IF;

    INSERT INTO shared."AuditLog" (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (auth.uid(), _action, TG_TABLE_NAME, _entity_id, _old_values, _new_values);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;
COMMENT ON FUNCTION shared.audit_trigger IS
    'Generic audit-log trigger. Attach via: CREATE TRIGGER trg_audit_<table> AFTER INSERT OR UPDATE OR DELETE ON <schema>.<table> FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();';

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION shared.has_role(shared."SystemRole") TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION shared.has_any_role(shared."SystemRole"[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION shared.is_it_staff() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION shared.audit_trigger() TO anon, authenticated, service_role;
