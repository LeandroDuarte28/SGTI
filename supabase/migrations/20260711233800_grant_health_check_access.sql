-- ============================================================================
-- SGTI — Grant SELECT on _health_check + default privileges for public
-- Migration: 20260711233800_grant_health_check_access
-- Description: anon/authenticated had no SELECT grant on public._health_check
--              (confirmed via information_schema.role_table_grants — only
--              TRUNCATE/REFERENCES/TRIGGER were present, no SELECT/INSERT/
--              UPDATE/DELETE). RLS policies are evaluated only AFTER the
--              underlying GRANT already allows the operation — without the
--              GRANT, RLS never even gets a chance to run.
--
--              Also sets ALTER DEFAULT PRIVILEGES for `public`, so future
--              tables created there don't repeat this same problem.
-- ============================================================================

GRANT SELECT ON public._health_check TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
