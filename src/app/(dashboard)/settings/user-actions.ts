"use server"

import { revalidatePath } from "next/cache"

import { getCurrentRole, getCurrentUser, hasRole } from "@/lib/auth/helpers"
import { getServiceRoleClient } from "@/lib/supabase/admin"
import { resolveElevatedSupabaseKey } from "@/lib/supabase/service-key"
import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/types/inspection"

const ASSIGNABLE_ROLES: AppRole[] = ["MANAGER", "INSPECTOR", "VIEWER"]

const MIN_PASSWORD_LEN = 8

function mapCreateUserError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes("already been registered") || m.includes("already registered")) {
    return "이미 등록된 이메일(아이디)입니다."
  }
  if (m.includes("password") && m.includes("weak")) {
    return "비밀번호가 정책에 맞지 않습니다. 더 길거나 복잡하게 설정해 주세요."
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "올바른 이메일(아이디) 형식이 아닙니다."
  }
  return "사용자 생성에 실패했습니다. 잠시 후 다시 시도해 주세요."
}

export type UpdateRoleState = {
  success?: boolean
  error?: string
}

export type CreateUserState = {
  success?: boolean
  error?: string
}

export async function createUserAction(
  _previousState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const currentRole = await getCurrentRole()

  if (!hasRole(currentRole, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const adminClient = getServiceRoleClient()
  if (!resolveElevatedSupabaseKey()) {
    return {
      error:
        "서버에 SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_SECRET_KEY)가 설정되지 않았습니다.",
    }
  }
  if (!adminClient) {
    return {
      error:
        "Supabase URL과 elevated 키 조합이 올바르지 않습니다. 환경 변수를 확인해 주세요.",
    }
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "")
  const role = String(formData.get("role") ?? "").trim() as AppRole

  if (!email) {
    return { error: "이메일(아이디)을 입력해 주세요." }
  }

  if (!email.includes("@")) {
    return { error: "로그인 아이디는 이메일 주소 형식이어야 합니다." }
  }

  if (password.length < MIN_PASSWORD_LEN) {
    return { error: `비밀번호는 ${MIN_PASSWORD_LEN}자 이상이어야 합니다.` }
  }

  if (password !== passwordConfirm) {
    return { error: "비밀번호와 확인이 일치하지 않습니다." }
  }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { error: "선택한 역할로는 계정을 만들 수 없습니다." }
  }

  const { error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { inspection_role: role },
  })

  if (error) {
    return { error: mapCreateUserError(error.message) }
  }

  revalidatePath("/settings")
  revalidatePath("/settings/users")
  return { success: true }
}

async function countAdminUsers(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inspection_user_roles")
    .select("user_id")
    .eq("role", "ADMIN")

  if (error || !data) {
    return 0
  }
  return data.length
}

export async function updateUserRoleAction(
  _previousState: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  const currentRole = await getCurrentRole()

  if (!hasRole(currentRole, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { error: "로그인이 필요합니다." }
  }

  const userId = String(formData.get("userId") ?? "").trim()
  const newRole = String(formData.get("role") ?? "").trim() as AppRole

  if (!userId) {
    return { error: "사용자를 선택해 주세요." }
  }

  if (!ASSIGNABLE_ROLES.includes(newRole)) {
    return { error: "해당 역할로 변경할 수 없습니다." }
  }

  const supabase = await createClient()

  const { data: targetRow } = await supabase
    .from("inspection_user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()

  const previousRole = (targetRow?.role as AppRole | undefined) ?? "VIEWER"

  if (previousRole === "ADMIN") {
    return { error: "시스템 관리자 역할은 이 화면에서 변경할 수 없습니다." }
  }

  if (
    userId === currentUser.id &&
    currentRole === "ADMIN" &&
    newRole !== "ADMIN"
  ) {
    const adminCount = await countAdminUsers()
    if (adminCount <= 1) {
      return {
        error: "마지막 시스템 관리자는 역할을 변경할 수 없습니다.",
      }
    }
  }

  const { data: updated, error } = await supabase
    .from("inspection_user_roles")
    .update({ role: newRole })
    .eq("user_id", userId)
    .select("user_id")

  if (error) {
    return { error: "역할 변경에 실패했습니다." }
  }

  if (!updated?.length) {
    return {
      error:
        "역할 정보를 찾을 수 없습니다. 계정이 올바르게 생성되었는지 확인해 주세요.",
    }
  }

  revalidatePath("/settings")
  revalidatePath("/settings/users")
  return { success: true }
}
