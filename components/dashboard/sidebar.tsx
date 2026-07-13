"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Ticket, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Modules already built (real links) vs. planned (shown disabled, so we
 * never point next/link at a route that doesn't exist yet — with
 * typedRoutes enabled, that would fail the build anyway).
 */
const ACTIVE_NAV_ITEMS = [
  { href: "/incidents", icon: Ticket, label: "Incidentes" },
  { href: "/catalog", icon: LayoutGrid, label: "Catálogo" },
] as const;

const PLANNED_NAV_ITEMS = ["Requisições", "Problemas", "Ativos", "Compliance", "Base de Conhecimento"];

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <LayoutDashboard className="h-5 w-5 text-primary" />
        <span className="text-lg font-semibold text-foreground">SGTI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ACTIVE_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-4 space-y-1">
          {PLANNED_NAV_ITEMS.map((label) => (
            <div
              className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50"
              key={label}
            >
              {label}
              <span className="text-xs">Em breve</span>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
