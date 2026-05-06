/**
 * 서버 전용 elevated 키 (Legacy service_role JWT 또는 Dashboard Secret sb_secret_...).
 * Publishable(sb_publishable_)는 관리자 API에서 거절됩니다.
 */
export function resolveElevatedSupabaseKey(): string | null {
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SECRET_KEY?.trim()

  if (!raw) {
    return null
  }

  // .env 에 따옴표를 넣은 경우
  const key = raw.replace(/^["']|["']$/g, "").trim()
  return key.length > 0 ? key : null
}

/** 사용자 설정 실수 시 안내용 */
export function elevatedKeySetupHint(key: string | null): string | null {
  if (!key) {
    return null
  }
  if (key.startsWith("sb_publishable_")) {
    return "현재 키는 Publishable(공개) 키 형식입니다. Dashboard의 Secret 키(sb_secret_…) 또는 Legacy API Keys 탭의 service_role(JWT)를 SUPABASE_SERVICE_ROLE_KEY에 넣어 주세요."
  }
  return null
}

/** listUsers 등 Auth Admin 실패 시 추가 안내 */
export function authAdminKeyErrorHint(apiMessage: string): string {
  const lower = apiMessage.toLowerCase()
  if (
    lower.includes("invalid api key") ||
    lower.includes("invalid jwt") ||
    lower.includes("jwt")
  ) {
    return (
      `${apiMessage} — ` +
      "Dashboard Settings → API Keys에서 이 프로젝트의 Secret 키 또는 Legacy «service_role» JWT를 복사했는지, NEXT_PUBLIC_SUPABASE_URL과 같은 프로젝트인지 확인해 주세요. Publishable 키(sb_publishable_)는 사용할 수 없습니다."
    )
  }
  return apiMessage
}
