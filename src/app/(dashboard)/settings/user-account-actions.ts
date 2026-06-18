"use server"

import { revalidatePath } from "next/cache"

import { buildReactivatePatch, buildSuspendPatch } from "@/lib/auth/account-status"
import { getCurrentRole, getCurrentUser, hasRole } from "@/lib/auth/helpers"
import { revokeUserSessions } from "@/lib/auth/revoke-user-sessions"
import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/types/inspection"

export type AccountActionState = {
  success?: boolean
  error?: string
}

function parseSuspendedUntil(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  const date = new Date(`${trimmed}T23:59:59.999+09:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

export async function suspendUserAction(
  _previousState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const currentRole = await getCurrentRole()

  if (!hasRole(currentRole, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: "로그인이 필요합니다." }
  }

  const userId = String(formData.get("userId") ?? "").trim()
  const suspendReason = String(formData.get("suspendReason") ?? "").trim()
  const suspendedUntilRaw = String(formData.get("suspendedUntil") ?? "").trim()

  if (!userId) {
    return { error: "사용자를 선택해 주세요." }
  }

  if (userId === currentUser.id) {
    return { error: "본인 계정은 정지할 수 없습니다." }
  }

  const supabase = await createClient()

  const { data: targetRow } = await supabase
    .from("inspection_user_roles")
    .select("role, status")
    .eq("user_id", userId)
    .maybeSingle()

  if (!targetRow) {
    return { error: "사용자 정보를 찾을 수 없습니다." }
  }

  if ((targetRow.role as AppRole) === "ADMIN") {
    return { error: "시스템 관리자 계정은 정지할 수 없습니다." }
  }

  if (targetRow.status === "suspended") {
    return { error: "이미 정지된 계정입니다." }
  }

  const suspendedUntil = parseSuspendedUntil(suspendedUntilRaw)
  if (suspendedUntilRaw && !suspendedUntil) {
    return { error: "해제 예정일 형식이 올바르지 않습니다." }
  }

  const patch = buildSuspendPatch({
    reason: suspendReason || null,
    suspendedUntil,
    suspendedBy: currentUser.id,
  })

  const { error } = await supabase
    .from("inspection_user_roles")
    .update(patch)
    .eq("user_id", userId)

  if (error) {
    return { error: "계정 정지에 실패했습니다." }
  }

  await revokeUserSessions(userId)

  revalidatePath("/settings")
  revalidatePath("/settings/users")
  return { success: true }
}

export async function reactivateUserAction(
  _previousState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const currentRole = await getCurrentRole()

  if (!hasRole(currentRole, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const userId = String(formData.get("userId") ?? "").trim()

  if (!userId) {
    return { error: "사용자를 선택해 주세요." }
  }

  const supabase = await createClient()

  const { data: targetRow } = await supabase
    .from("inspection_user_roles")
    .select("role, status")
    .eq("user_id", userId)
    .maybeSingle()

  if (!targetRow) {
    return { error: "사용자 정보를 찾을 수 없습니다." }
  }

  if ((targetRow.role as AppRole) === "ADMIN") {
    return { error: "시스템 관리자 계정은 이 화면에서 변경할 수 없습니다." }
  }

  if (targetRow.status !== "suspended") {
    return { error: "정지 상태가 아닌 계정입니다." }
  }

  const patch = buildReactivatePatch()

  const { error } = await supabase
    .from("inspection_user_roles")
    .update(patch)
    .eq("user_id", userId)

  if (error) {
    return { error: "계정 해제에 실패했습니다." }
  }

  revalidatePath("/settings")
  revalidatePath("/settings/users")
  return { success: true }
}
