-- ============================================================================
-- SGTI — UserProfile visibility for IT staff
-- Migration: 20260725000100_userprofile_it_staff_visibility
-- Description: shared."UserProfile" only allowed "read own profile" so far.
--              That silently broke name resolution across the app (incident
--              reporter/assignee, comment authors, escalation target) for
--              anyone other than the viewer themselves — found while testing
--              the incident escalation feature. Adds the same "IT staff can
--              read all" shape already used on ticket."Incident" and
--              shared."UserRole" (20260725000000). No new GRANT needed:
--              shared schema already has blanket GRANTs from
--              20260711231500_grant_shared_schema_access.sql.
-- ============================================================================

CREATE POLICY "UserProfile: IT staff can read all"
    ON shared."UserProfile" FOR SELECT
    USING (shared.is_it_staff());
