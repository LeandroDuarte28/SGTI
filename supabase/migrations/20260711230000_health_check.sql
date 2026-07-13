-- ============================================================================
-- SGTI — Health Check Table
-- Migration: 20260711230000_health_check
-- Description: Minimal public table used exclusively by /api/health.
--              Deliberately outside any module schema so health checks never
--              depend on business-logic tables or migrations being complete.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public._health_check (
    id          SMALLINT PRIMARY KEY DEFAULT 1,
    checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT _health_check_singleton CHECK (id = 1)
);
COMMENT ON TABLE public._health_check IS
    'Single-row table used only by GET /api/health to verify DB connectivity. Not business data.';

INSERT INTO public._health_check (id) VALUES (1)
    ON CONFLICT (id) DO NOTHING;

-- Readable by anyone, including the anon key — health checks run unauthenticated.
ALTER TABLE public._health_check ENABLE ROW LEVEL SECURITY;

CREATE POLICY "_health_check: anyone can read"
    ON public._health_check FOR SELECT
    USING (true);
