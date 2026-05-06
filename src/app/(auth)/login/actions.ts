"use server"

import { createClient } from "@/lib/supabase/server"

export type LoginState = {
  error?: string
  success?: boolean
}

function normalizeLoginIdentifier(identifier: string) {
  const trimmed = identifier.trim()

  if (!trimmed) {
    return ""
  }

  if (trimmed.includes("@")) {
    return trimmed
  }

  return `${trimmed}@inspect.local`
}

export async function signInWithPassword(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "")
  const email = normalizeLoginIdentifier(identifier)
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "아이디(또는 이메일)와 비밀번호를 모두 입력해 주세요." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const msg = error.message ?? ""
    if (/invalid api key/i.test(msg)) {
      console.error("[Login] Supabase auth error:", msg, error.status)
      return {
        error:
          "Supabase API 키가 거부되었습니다. Dashboard에서 이 프로젝트 URL과 짝이 맞는 Publishable 키 또는 Legacy anon 키를 복사했는지 확인해 주세요.",
      }
    }
    if (/invalid login credentials/i.test(msg)) {
      console.warn("[Login] signInWithPassword: invalid credentials")
      return {
        error:
          "아이디(이메일) 또는 비밀번호가 일치하지 않습니다. Supabase Dashboard → Authentication → Users 에 사용자를 등록했는지 확인해 주세요.",
      }
    }
    console.error("[Login] Supabase auth error:", msg, error.status)
    return { error: "로그인 정보가 올바르지 않습니다." }
  }

  if (!data.session) {
    console.error("[Login] No session returned from Supabase")
    return { error: "세션 생성에 실패했습니다." }
  }

  console.log("[Login] Success - user:", data.user?.email, "session exists:", !!data.session)

  return { success: true }
}
