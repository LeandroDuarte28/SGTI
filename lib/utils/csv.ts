/**
 * SGTI — CSV export utility (Docs/61_REPORTS.md, lightweight subset).
 * Full "Relatórios" spec (PDF/Excel export, scheduling, e-mail distribution)
 * requires infrastructure this project doesn't have yet — see the PR that
 * added this file. CSV export of the current data is the scoped-down
 * substitute: on-demand only, no scheduling, no distribution.
 */

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; label: string }[],
): string {
  const header = columns.map((c) => escapeCsvField(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c.key])).join(","));
  // Leading BOM so Excel opens UTF-8 (accented Portuguese labels) correctly.
  return `﻿${[header, ...lines].join("\r\n")}`;
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
