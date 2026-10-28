import { createClient } from "@supabase/supabase-js"

import { resolveElevatedSupabaseKey } from "@/lib/supabase/service-key"
import { OSAN_BUCKET } from "./constants"

export { OSAN_BUCKET }

/**
 * 서버 전용. osan 스키마로 스코프된 service_role 클라이언트.
 * 공개 페이지이므로 RLS 정책이 없고, service_role이 우회하여 접근합니다.
 * 클라이언트 컴포넌트에서 import 하지 마세요.
 */
export function getOsanClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = resolveElevatedSupabaseKey()

  if (!url || !key) {
    return null
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "osan" },
  })
}

/** 공개 버킷 객체의 공개 URL */
export function osanPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  return `${url}/storage/v1/object/public/${OSAN_BUCKET}/${storagePath}`
}
