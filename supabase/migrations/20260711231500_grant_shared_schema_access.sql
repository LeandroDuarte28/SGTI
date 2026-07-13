-- ============================================================================
-- SGTI — Grant schema-level access to `shared`
-- Migration: 20260711231500_grant_shared_schema_access
-- Description: Exposing a schema in supabase/config.toml only makes it visible
--              to PostgREST — Postgres itself still requires explicit GRANTs
--              for the anon/authenticated/service_role roles to touch objects
--              outside the `public` schema. RLS policies alone are not enough;
--              without these grants, every query fails with
--              "permission denied for schema shared", regardless of RLS.
-- ============================================================================

GRANT USAGE ON SCHEMA shared TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA shared TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA shared TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA shared TO anon, authenticated, service_role;

-- Ensures tables/sequences/functions created by FUTURE migrations in this
-- schema automatically get the same grants, without needing to repeat this
-- block every time a new module schema gets a new table.
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
