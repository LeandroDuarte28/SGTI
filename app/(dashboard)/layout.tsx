import { getAuthUser } from "@/lib/auth/get-user";
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="w-32">
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
