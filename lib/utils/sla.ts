/**
 * SGTI — SLA calculation utilities (Docs/31_SLA.md §2, §7, §8).
 *
 * Business hours are fixed at 08:00–18:00, Monday–Friday, America/Sao_Paulo
 * (UTC-3). Brazil has not observed DST since 2019, so a fixed offset is used
 * instead of full IANA timezone math. National/regional holidays (§2.1) are
 * not modeled yet — there is no holiday calendar table in the schema, so
 * business-hours SLAs currently run through holidays uncounted as paused.
 */

const BRAZIL_UTC_OFFSET_MS = -3 * 60 * 60 * 1000;
const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 18;

/** Business minutes elapsed between two instants, Mon–Fri 08:00–18:00 BRT. */
export function businessMinutesBetween(start: Date, end: Date): number {
  if (end.getTime() <= start.getTime()) {
    return 0;
  }

  const startBrazil = new Date(start.getTime() + BRAZIL_UTC_OFFSET_MS);
  const endBrazil = new Date(end.getTime() + BRAZIL_UTC_OFFSET_MS);

  let cursor = startBrazil;
  let totalMinutes = 0;

  while (cursor.getTime() < endBrazil.getTime()) {
    const dayStart = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), BUSINESS_START_HOUR, 0, 0),
    );
    const dayEnd = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), BUSINESS_END_HOUR, 0, 0),
    );
    const nextMidnight = new Date(
      Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate() + 1, 0, 0, 0),
    );

    const dayOfWeek = cursor.getUTCDay(); // 0 = Sunday .. 6 = Saturday
    const segmentEnd = endBrazil.getTime() < nextMidnight.getTime() ? endBrazil : nextMidnight;
    const windowStart = cursor.getTime() > dayStart.getTime() ? cursor : dayStart;
    const windowEnd = segmentEnd.getTime() < dayEnd.getTime() ? segmentEnd : dayEnd;

    if (dayOfWeek >= 1 && dayOfWeek <= 5 && windowEnd.getTime() > windowStart.getTime()) {
      totalMinutes += (windowEnd.getTime() - windowStart.getTime()) / 60000;
    }

    cursor = nextMidnight;
  }

  return totalMinutes;
}

/** Calendar minutes elapsed between two instants (used for 24x7 SLAs). */
export function calendarMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000);
}

export type SlaHealthStatus = "ok" | "at_risk" | "breached";

export interface SlaEvaluation {
  status: SlaHealthStatus;
  elapsedMinutes: number;
  deadlineMinutes: number;
  percentConsumed: number;
}

/**
 * Evaluates SLA resolution-time consumption for a ticket. Time in PENDING
 * is not currently excluded from the count (Docs/31_SLA.md §5 pause/resume
 * would require a status-transition history table that doesn't exist yet).
 */
export function evaluateResolutionSla(params: {
  createdAt: Date;
  resolutionTimeMinutes: number;
  businessHoursOnly: boolean;
  now?: Date;
}): SlaEvaluation {
  const now = params.now ?? new Date();
  const elapsedMinutes = params.businessHoursOnly
    ? businessMinutesBetween(params.createdAt, now)
    : calendarMinutesBetween(params.createdAt, now);
  const percentConsumed = elapsedMinutes / params.resolutionTimeMinutes;

  let status: SlaHealthStatus = "ok";
  if (percentConsumed >= 1) {
    status = "breached";
  } else if (percentConsumed >= 0.8) {
    status = "at_risk";
  }

  return { status, elapsedMinutes, deadlineMinutes: params.resolutionTimeMinutes, percentConsumed };
}
