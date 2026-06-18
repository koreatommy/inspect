import { resolveElevatedSupabaseKey } from "@/lib/supabase/service-key"

/** 대상 사용자의 모든 Auth 세션을 종료한다 (비밀번호 재설정·계정 정지 시). */
export async function revokeUserSessions(userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = resolveElevatedSupabaseKey()
  if (!url || !key) {
    return
  }

  try {
    await fetch(`${url}/auth/v1/admin/users/${userId}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
    })
  } catch {
    // 정지·RLS가 다음 요청에서 차단하므로 세션 revoke 실패는 치명적이지 않음
  }
}
