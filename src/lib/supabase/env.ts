const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
/** Publishable(sb_publishable_…) 또는 Dashboard Legacy «anon» JWT(eyJ…) — 반드시 URL과 같은 프로젝트 것만 사용 */
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export function getSupabaseEnv() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured")
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured",
    )
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  }
}
