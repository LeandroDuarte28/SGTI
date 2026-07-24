-- ============================================================================
-- SGTI — Fix TicketComment visibility for ticket participants
-- Migration: 20260724000000_fix_ticket_comment_visibility
-- Description: The original policies only let a comment's AUTHOR read their
--              own non-internal comments, and IT staff read everything. That
--              means a reporter could never see a technician's public reply
--              on their own incident — a real gap for the comments feature
--              to work as intended. This adds visibility for the reporter/
--              assignee of the underlying Incident, for non-internal
--              comments only (internal notes stay IT-staff only).
-- ============================================================================

CREATE POLICY "TicketComment: incident participants can read public comments"
    ON ticket."TicketComment" FOR SELECT
    USING (
        ticket_type = 'INCIDENT'
        AND is_internal = FALSE
        AND EXISTS (
            SELECT 1 FROM ticket."Incident" i
            WHERE i.id = "TicketComment".ticket_id
              AND (i.reporter_id = auth.uid() OR i.assignee_id = auth.uid())
        )
    );
