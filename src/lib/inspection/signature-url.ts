import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

export const SIGNATURE_SIGNED_URL_TTL_SEC = 60 * 10

export async function getSignatureSignedUrl(
  supabase: SupabaseClient<Database>,
  path: string | null | undefined
): Promise<string | null> {
  if (!path) {
    return null
  }

  const { data } = await supabase.storage
    .from("signatures")
    .createSignedUrl(path, SIGNATURE_SIGNED_URL_TTL_SEC)

  return data?.signedUrl ?? null
}
