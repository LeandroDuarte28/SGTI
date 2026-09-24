"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
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
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
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
    <aside className="bg-sidebar border-sidebar-border flex h-screen w-64 flex-col border-r">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5">
          <Image alt="PinPag" className="h-4 w-auto" height={16} src="/branding/pinpag-logo.jpg" width={64} />
        </div>
        <span className="text-sidebar-foreground text-base font-bold tracking-wide">SGTI</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ACTIVE_NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary/15 border-sidebar-primary text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
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
