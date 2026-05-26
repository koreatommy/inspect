import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

import {
  type AccountStatusRow,
  buildReactivatePatch,
  isLoginBlocked,
  resolveEffectiveStatus,
} from "./account-status"

export type AccountAccessResult = {
  blocked: boolean
  row: AccountStatusRow | null
  suspendReason: string | null
}

function parseSyncPayload(data: unknown): AccountStatusRow | null {
  if (!data || typeof data !== "object") {
    return null
  }
  const o = data as Record<string, unknown>
  const status = o.status === "suspended" ? "suspended" : "active"
  return {
    status,
    suspended_until:
      typeof o.suspended_until === "string" ? o.suspended_until : null,
    suspend_reason:
      typeof o.suspend_reason === "string" ? o.suspend_reason : null,
  }
}

/** 로그인·세션 가드용: 만료 정지 자동 복구 후 접근 가능 여부 */
export async function resolveAccountAccess(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<AccountAccessResult> {
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "sync_my_account_status"
  )

  if (!rpcError && rpcData) {
    const row = parseSyncPayload(rpcData)
    return {
      blocked: isLoginBlocked(row),
      row,
      suspendReason: row?.suspend_reason ?? null,
    }
  }

  const { data } = await supabase
    .from("inspection_user_roles")
    .select("status, suspended_until, suspend_reason")
    .eq("user_id", userId)
    .maybeSingle()

  const row = data as AccountStatusRow | null

  if (
    row?.status === "suspended" &&
    row.suspended_until &&
    new Date(row.suspended_until).getTime() <= Date.now()
  ) {
    const patch = buildReactivatePatch()
    await supabase
      .from("inspection_user_roles")
      .update(patch)
      .eq("user_id", userId)

    return {
      blocked: false,
      row: { status: "active", suspended_until: null, suspend_reason: null },
      suspendReason: null,
    }
  }

  return {
    blocked: isLoginBlocked(row),
    row,
    suspendReason: row?.suspend_reason ?? null,
  }
}

export function isEffectivelySuspended(row: AccountStatusRow | null) {
  return resolveEffectiveStatus(row) === "suspended"
}
