"use server"

import { revalidatePath } from "next/cache"

import { getPersonNameValidationError } from "@/lib/inspection/person-name"
import { getSafeUser } from "@/lib/supabase/auth-session"
import { createClient } from "@/lib/supabase/server"
import {
  getKoreanMobilePhoneValidationError,
  normalizeKoreanMobilePhone,
} from "@/lib/validation/korean-phone"

export type PasswordChangeState = {
  success?: boolean
  error?: string
}

export type ProfileUpdateState = {
  success?: boolean
  error?: string
}

export async function changePasswordAction(
  _previousState: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const password = String(formData.get("password") ?? "")
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "")

  if (!password || !passwordConfirm) {
    return { error: "새 비밀번호와 확인 비밀번호를 모두 입력해 주세요." }
  }

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." }
  }

  if (password !== passwordConfirm) {
    return { error: "비밀번호와 확인 비밀번호가 일치하지 않습니다." }
  }

  const supabase = await createClient()
  const user = await getSafeUser(supabase)

  if (!user) {
    return { error: "로그인이 필요합니다." }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요." }
  }

  revalidatePath("/settings")
  revalidatePath("/settings/account")
  return { success: true }
}

export async function updateMyProfileAction(
  _previousState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const displayName = String(formData.get("displayName") ?? "").trim()
  const organization = String(formData.get("organization") ?? "").trim()
  const phoneRaw = String(formData.get("phone") ?? "").trim()

  if (!displayName) {
    return { error: "이름을 입력해 주세요." }
  }
  if (!organization) {
    return { error: "소속을 입력해 주세요." }
  }
  const nameError = getPersonNameValidationError(displayName, "이름")
  if (nameError) {
    return { error: nameError }
  }

  const phoneError = getKoreanMobilePhoneValidationError(phoneRaw)
  if (phoneError) {
    return { error: phoneError }
  }

  const supabase = await createClient()
  const user = await getSafeUser(supabase)

  if (!user) {
    return { error: "로그인이 필요합니다." }
  }

  const phone = normalizeKoreanMobilePhone(phoneRaw)

  const { error } = await supabase
    .from("inspection_user_roles")
    .update({ display_name: displayName, organization, phone })
    .eq("user_id", user.id)

  if (error) {
    return {
      error: "내 정보 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    }
  }

  revalidatePath("/settings")
  revalidatePath("/settings/account")
  return { success: true }
}
