import Link from "next/link";
import { Bell } from "lucide-react";

import { getAuthUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SignOutButton } from "@/components/auth/sign-out-button";

/**
 * SGTI — Dashboard Layout
 * Wraps every route under (dashboard) with the sidebar and header.
 * getAuthUser() (default redirectIfUnauthenticated=true) already redirects
 * to /login if there's no session — no need to check `user` for null here.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const user = await getAuthUser();

  const supabase = await createClient();
  const { count: unreadCount } = await supabase
    .schema("shared")
    .from("Notification")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "UNREAD");

  return (
    <div className="bg-background flex min-h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="border-border bg-card flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-foreground text-sm font-medium">{user.fullName}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="text-muted-foreground hover:text-foreground relative"
              href="/notifications"
            >
              <Bell className="h-5 w-5" />
              {!!unreadCount && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <div className="w-32">
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
