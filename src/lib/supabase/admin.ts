import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

import { resolveElevatedSupabaseKey } from "./service-key"

/**
 * 서버 전용. resolveElevatedSupabaseKey()가 없으면 null (SERVICE_ROLE 또는 SECRET_KEY).
 * 클라이언트 컴포넌트에서 import 하지 마세요.
 */
export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = resolveElevatedSupabaseKey()

  if (!url || !key) {
    return null
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
