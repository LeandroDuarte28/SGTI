/**
 * SGTI — Date formatting utilities
 * All dates are stored in UTC; displayed in America/Sao_Paulo (BRT/BRST).
 */

const TIMEZONE = "America/Sao_Paulo";

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATETIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const RELATIVE_FORMAT = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** Formats a date as DD/MM/YYYY */
export function formatDate(date: Date | string): string {
  return DATE_FORMAT.format(new Date(date));
}

/** Formats a date as DD/MM/YYYY HH:MM */
export function formatDateTime(date: Date | string): string {
  return DATETIME_FORMAT.format(new Date(date));
}

/** Returns a relative time string ("há 2 horas", "em 3 dias") */
export function formatRelative(date: Date | string): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSecs) < 60) {return RELATIVE_FORMAT.format(diffSecs, "seconds");}
  if (Math.abs(diffMins) < 60) {return RELATIVE_FORMAT.format(diffMins, "minutes");}
  if (Math.abs(diffHours) < 24) {return RELATIVE_FORMAT.format(diffHours, "hours");}
  return RELATIVE_FORMAT.format(diffDays, "days");
}

/** Returns ISO string in UTC — use for DB storage */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString();
}
