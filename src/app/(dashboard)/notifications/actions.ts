"use server"

import { revalidatePath } from "next/cache"

import { getCurrentUser, requirePermission } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/types/inspection"
import type { NotificationRow } from "@/types/database"

const PAGE_SIZE = 20

export type NotificationListResult = {
  notifications: NotificationRow[]
  unreadCount: number
  hasMore: boolean
}

export async function getNotifications(
  page = 0,
): Promise<NotificationListResult> {
  const user = await getCurrentUser()
  if (!user) return { notifications: [], unreadCount: 0, hasMore: false }

  const supabase = await createClient()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [listRes, countRes] = await Promise.all([
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ])

  return {
    notifications: listRes.data ?? [],
    unreadCount: countRes.count ?? 0,
    hasMore: (listRes.data?.length ?? 0) === PAGE_SIZE,
  }
}

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  const supabase = await createClient()
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null)

  return count ?? 0
}

export async function getRecentNotifications(
  limit = 5,
): Promise<NotificationRow[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function markAsRead(id: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("read_at", null)

  revalidatePath("/settings/notifications")
}

export async function markAllAsRead(): Promise<void> {
  const user = await getCurrentUser()
  if (!user) return

  const supabase = await createClient()
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null)

  revalidatePath("/settings/notifications")
}

// ─── ADMIN 전용 ────────────────────────────────────────────────────────────────

export type SendTarget =
  | { type: "all" }
  | { type: "role"; role: AppRole }
  | { type: "user"; userId: string }

export type SendNotificationInput = {
  target: SendTarget
  notificationType: string
  title: string
  body?: string
  link?: string
}

export type SendNotificationResult = {
  success: boolean
  sentCount: number
  error?: string
}

/** 알림 발송 대상 사용자 목록 (ADMIN 전용) */
export type TargetUser = {
  user_id: string
  display_name: string | null
  role: AppRole
}

export async function getTargetUsers(): Promise<TargetUser[]> {
  await requirePermission("user:manage")

  const supabase = await createClient()
  const { data } = await supabase
    .from("inspection_user_roles")
    .select("user_id, display_name, role")
    .eq("status", "active")
    .order("display_name", { ascending: true })

  return (data ?? []).map((row) => ({
    user_id: row.user_id,
    display_name: row.display_name ?? null,
    role: row.role as AppRole,
  }))
}

/** 알림 발송 (ADMIN 전용) */
export async function sendNotification(
  input: SendNotificationInput,
): Promise<SendNotificationResult> {
  await requirePermission("user:manage")

  const supabase = await createClient()

  // 발송 대상 user_id 목록 결정
  let targetUserIds: string[] = []

  if (input.target.type === "all") {
    const { data } = await supabase
      .from("inspection_user_roles")
      .select("user_id")
      .eq("status", "active")
    targetUserIds = (data ?? []).map((row) => row.user_id)
  } else if (input.target.type === "role") {
    const { data } = await supabase
      .from("inspection_user_roles")
      .select("user_id")
      .eq("role", input.target.role)
      .eq("status", "active")
    targetUserIds = (data ?? []).map((row) => row.user_id)
  } else {
    targetUserIds = [input.target.userId]
  }

  if (targetUserIds.length === 0) {
    return { success: false, sentCount: 0, error: "발송 대상이 없습니다." }
  }

  const rows = targetUserIds.map((userId) => ({
    user_id: userId,
    type: input.notificationType,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  }))

  const { error } = await supabase.from("notifications").insert(rows)

  if (error) {
    return { success: false, sentCount: 0, error: error.message }
  }

  revalidatePath("/settings/notifications")
  return { success: true, sentCount: targetUserIds.length }
}
