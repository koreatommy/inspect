import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

const INVALID_SESSION_ERROR_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
  "session_expired",
  "invalid_refresh_token",
  "bad_jwt",
])

function hasInvalidRefreshTokenMessage(message: string): boolean {
  return /refresh token/i.test(message)
}

export function isInvalidSessionError(
  error: AuthError | null | undefined
): boolean {
  if (!error) return false
  if (error.code && INVALID_SESSION_ERROR_CODES.has(error.code)) return true
  if (error.code === "validation_failed" && hasInvalidRefreshTokenMessage(error.message)) {
    return true
  }
  return hasInvalidRefreshTokenMessage(error.message)
}

/**
 * 서버에서 getUser() 호출 시 만료·폐기된 refresh token으로 인한 오류를
 * signOut으로 쿠키를 정리한 뒤 null을 반환합니다.
 */
export async function getSafeUser(
  supabase: SupabaseClient<Database>
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (!error) {
    return user
  }

  if (isInvalidSessionError(error)) {
    await supabase.auth.signOut({ scope: "local" })
    return null
  }

  return user
}
