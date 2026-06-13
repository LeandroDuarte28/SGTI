/**
 * SGTI — Dashboard Layout
 * Sprint 0: Structure placeholder.
 * Full implementation in Phase 03 (Authentication + Layout) — 80_IMPLEMENTATION_ORDER.md
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className="min-h-screen bg-background">{children}</div>;
}
