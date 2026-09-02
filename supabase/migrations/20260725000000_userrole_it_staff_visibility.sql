-- ============================================================================
-- SGTI — UserRole visibility for IT staff
-- Migration: 20260725000000_userrole_it_staff_visibility
-- Description: IT staff need to list their peers (e.g. to pick who an
--              incident is escalated to). shared."UserRole" only allowed
--              "read own roles" so far — this adds the same "IT staff can
--              read all" shape already used on ticket."Incident" and friends.
--              No new GRANT needed: shared schema already has blanket GRANTs
--              from 20260711231500_grant_shared_schema_access.sql.
-- ============================================================================

CREATE POLICY "UserRole: IT staff can read all"
    ON shared."UserRole" FOR SELECT
    USING (shared.is_it_staff());
