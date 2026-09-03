import Link from "next/link";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) {
    return "—";
  }
  return `${hours.toFixed(1)}h`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${value.toFixed(1)}%`;
}

export type StatTone = "neutral" | "good" | "bad";

const TONE_CLASS: Record<StatTone, string> = {
  bad: "text-destructive",
  good: "text-status-resolved",
  neutral: "text-foreground",
};

export function StatCard({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  href?: string;
  tone?: StatTone;
}): React.JSX.Element {
  const content = (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${TONE_CLASS[tone]}`}>{value}</p>
    </div>
  );

  if (!href) {
    return content;
  }
  return (
    <Link className="block transition-opacity hover:opacity-80" href={href}>
      {content}
    </Link>
  );
}

/** Green if >=90% (the SLA compliance target used throughout these dashboards), red if below, neutral with no data. */
export function getSlaComplianceTone(percent: number): StatTone {
  if (Number.isNaN(percent)) {
    return "neutral";
  }
  return percent >= 90 ? "good" : "bad";
}

export function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-medium text-foreground">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
