"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/** Marks a single notification as read. RLS: owner can update own. */
export async function markNotificationRead(formData: FormData): Promise<void> {
  const notificationId = formData.get("notification_id");
  if (typeof notificationId !== "string" || notificationId.length === 0) {
    throw new Error("Notificação inválida.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("shared")
    .from("Notification")
    .update({ status: "READ", read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    throw new Error(`Não foi possível marcar a notificação como lida: ${error.message}`);
  }

  revalidatePath("/notifications");
}

/** Marks every unread notification for the current user as read. */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const { error } = await supabase
    .schema("shared")
    .from("Notification")
    .update({ status: "READ", read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "UNREAD");

  if (error) {
    throw new Error(`Não foi possível marcar as notificações como lidas: ${error.message}`);
  }

  revalidatePath("/notifications");
}
