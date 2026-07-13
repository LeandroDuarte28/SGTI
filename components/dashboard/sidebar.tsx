"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Ticket,
  LayoutGrid,
  ClipboardList,
  Laptop,
  Search,
  KeyRound,
  ShieldCheck,
  Wallet,
  ShoppingCart,
  FolderKanban,
  BookOpen,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

/** All 10 SGTI modules now have a screen — no more "coming soon" items. */
const ACTIVE_NAV_ITEMS = [
  { href: "/incidents", icon: Ticket, label: "Incidentes" },
  { href: "/requests", icon: ClipboardList, label: "Requisições" },
  { href: "/problems", icon: Search, label: "Problemas" },
  { href: "/assets", icon: Laptop, label: "Ativos" },
  { href: "/identity", icon: KeyRound, label: "Identidade" },
  { href: "/compliance", icon: ShieldCheck, label: "Compliance" },
  { href: "/financial", icon: Wallet, label: "Financeiro" },
  { href: "/procurement", icon: ShoppingCart, label: "Compras" },
  { href: "/projects", icon: FolderKanban, label: "Projetos" },
  { href: "/knowledge", icon: BookOpen, label: "Base de Conhecimento" },
  { href: "/catalog", icon: LayoutGrid, label: "Catálogo" },
] as const;

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
      </nav>
    </aside>
  );
}
