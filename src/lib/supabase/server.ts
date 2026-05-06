import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database"
import { getSupabaseEnv } from "./env"

export async function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        console.log("[Supabase] setAll called with", cookiesToSet.length, "cookies")
        cookiesToSet.forEach(({ name, value, options }) => {
          console.log("[Supabase] Setting cookie:", name, "value length:", value?.length ?? 0)
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}
