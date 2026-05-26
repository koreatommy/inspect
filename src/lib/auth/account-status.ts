export type AccountStatus = "active" | "suspended"

export type AccountStatusRow = {
  status: AccountStatus
  suspended_until: string | null
  suspend_reason?: string | null
}

/** DB 행 기준 유효 상태 (만료된 일시정지는 active로 간주) */
export function resolveEffectiveStatus(
  row: AccountStatusRow | null | undefined
): AccountStatus {
  if (!row) {
    return "active"
  }

  if (row.status === "active") {
    return "active"
  }

  if (
    row.suspended_until &&
    new Date(row.suspended_until).getTime() <= Date.now()
  ) {
    return "active"
  }

  return "suspended"
}

export function isLoginBlocked(row: AccountStatusRow | null | undefined) {
  return resolveEffectiveStatus(row) === "suspended"
}

export function getSuspendedMessage(reason?: string | null) {
  const base =
    "계정이 일시 정지되었습니다. 이용이 필요하시면 시스템 관리자에게 문의해 주세요."
  if (reason?.trim()) {
    return `${base} (사유: ${reason.trim()})`
  }
  return base
}

/** 만료된 일시정지를 DB에서 active로 복구할 때 사용 */
export function buildReactivatePatch() {
  return {
    status: "active" as const,
    suspended_at: null,
    suspended_until: null,
    suspend_reason: null,
    suspended_by: null,
  }
}

export function buildSuspendPatch(params: {
  reason?: string | null
  suspendedUntil?: string | null
  suspendedBy: string
}) {
  return {
    status: "suspended" as const,
    suspended_at: new Date().toISOString(),
    suspended_until: params.suspendedUntil ?? null,
    suspend_reason: params.reason?.trim() || null,
    suspended_by: params.suspendedBy,
  }
}
