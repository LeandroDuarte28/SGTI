import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

import { markAllNotificationsRead, markNotificationRead } from "./actions";

export const metadata: Metadata = { title: "Notificações" };

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `há ${diffDays}d`;
}

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const { data: notifications, error } = await supabase
    .schema("shared")
    .from("Notification")
    .select("id, title, body, link, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = notifications ?? [];
  const hasUnread = rows.some((n) => n.status === "UNREAD");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notificações</h1>
          <p className="text-sm text-muted-foreground">Alertas do sistema, incluindo violações e riscos de SLA.</p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button size="sm" type="submit" variant="outline">
              Marcar todas como lidas
            </Button>
          </form>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar as notificações: {error.message}
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
        </div>
      )}

      {!error && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((notification) => {
            const isUnread = notification.status === "UNREAD";
            return (
              <li
                className={`rounded-lg border p-4 shadow-sm ${
                  isUnread ? "border-primary/30 bg-accent/40" : "border-border bg-card"
                }`}
                key={notification.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatRelativeDate(notification.created_at)}</p>
                  </div>
                  {isUnread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {notification.link && (
                    <a className="text-xs text-primary underline" href={notification.link}>
                      Ver detalhes
                    </a>
                  )}
                  {isUnread && (
                    <form action={markNotificationRead}>
                      <input name="notification_id" type="hidden" value={notification.id} />
                      <Button size="sm" type="submit" variant="ghost">
                        Marcar como lida
                      </Button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
