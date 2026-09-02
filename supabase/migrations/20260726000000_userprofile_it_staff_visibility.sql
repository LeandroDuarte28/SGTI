-- ============================================================================
-- SGTI — UserProfile visibility for IT staff
-- Migration: 20260726000000_userprofile_it_staff_visibility
-- Description: shared."UserProfile" only allows reading your own profile row.
--              That silently breaks name resolution wherever a page reads
--              other users' profiles without filtering by id — e.g. the
--              "Atribuído a" owner name on /assets, or an asset reassignment
--              picker for IT staff. Adds the same "IT staff can read all"
--              shape already used on ticket."Incident" and shared."UserRole".
--              No new GRANT needed: shared schema already has blanket GRANTs
--              from 20260711231500_grant_shared_schema_access.sql.
--
--              NOTE: this is the same fix as
--              20260725000100_userprofile_it_staff_visibility.sql on the
--              feat/incident-escalation branch (PR #2), found independently
--              while building this branch's asset reassignment feature.
--              Whichever PR merges first should let the other drop its copy
--              during rebase — CREATE POLICY on the same name errors on a
--              second apply.
-- ============================================================================

CREATE POLICY "UserProfile: IT staff can read all"
    ON shared."UserProfile" FOR SELECT
    USING (shared.is_it_staff());
