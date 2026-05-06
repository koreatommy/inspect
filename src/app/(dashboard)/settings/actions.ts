"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type PasswordChangeState = {
  success?: boolean
  error?: string
}

export type EmailChangeState = {
  success?: boolean
  error?: string
  message?: string
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

export async function updateAccountEmailAction(
  _previousState: EmailChangeState,
  formData: FormData
): Promise<EmailChangeState> {
  const newEmail = String(formData.get("newEmail") ?? "")
    .trim()
    .toLowerCase()

  if (!newEmail) {
    return { error: "변경할 이메일 주소를 입력해 주세요." }
  }

  if (!newEmail.includes("@")) {
    return { error: "올바른 이메일 형식이 아닙니다." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: "로그인이 필요합니다." }
  }

  const current = user.email.trim().toLowerCase()
  if (newEmail === current) {
    return { error: "현재 사용 중인 이메일과 동일합니다." }
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes("already") || msg.includes("registered")) {
      return { error: "이미 사용 중인 이메일입니다." }
    }
    return {
      error:
        "이메일 변경에 실패했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.",
    }
  }

  revalidatePath("/settings/account")
  return {
    success: true,
    message:
      "변경 요청이 접수되었습니다. 프로젝트 설정에 따라 새 이메일로 확인 링크가 발송될 수 있습니다.",
  }
}
