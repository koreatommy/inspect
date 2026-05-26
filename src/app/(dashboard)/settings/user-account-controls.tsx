"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  resolveEffectiveStatus,
  type AccountStatus,
} from "@/lib/auth/account-status"
import {
  reactivateUserAction,
  suspendUserAction,
  type AccountActionState,
} from "./user-account-actions"

type UserAccountRow = {
  user_id: string
  role: string
  status: AccountStatus
  suspended_until: string | null
  suspend_reason: string | null
}

function formatUntil(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })
}

export function UserAccountControls({ user }: { user: UserAccountRow }) {
  const isAdminRow = user.role === "ADMIN"
  const effectiveStatus = resolveEffectiveStatus({
    status: user.status,
    suspended_until: user.suspended_until,
  })
  const isSuspended = effectiveStatus === "suspended"

  const suspendInitial: AccountActionState = {}
  const [suspendState, suspendAction, suspendPending] = useActionState(
    suspendUserAction,
    suspendInitial
  )

  const reactivateInitial: AccountActionState = {}
  const [reactivateState, reactivateAction, reactivatePending] = useActionState(
    reactivateUserAction,
    reactivateInitial
  )

  const [showSuspendForm, setShowSuspendForm] = useState(false)

  if (isAdminRow) {
    return (
      <span className="text-xs text-muted-foreground">
        시스템 관리자 계정은 정지할 수 없습니다.
      </span>
    )
  }

  if (isSuspended) {
    const untilLabel = formatUntil(user.suspended_until)
    return (
      <div className="flex flex-col gap-2">
        {user.suspend_reason ? (
          <span className="text-xs text-muted-foreground">
            사유: {user.suspend_reason}
          </span>
        ) : null}
        {untilLabel ? (
          <span className="text-xs text-muted-foreground">
            해제 예정: {untilLabel}
          </span>
        ) : null}
        <form action={reactivateAction} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={user.user_id} />
          <Button type="submit" size="sm" variant="outline" disabled={reactivatePending}>
            {reactivatePending ? "처리 중..." : "해제"}
          </Button>
          {reactivateState.error ? (
            <span className="text-xs text-destructive">{reactivateState.error}</span>
          ) : null}
          {reactivateState.success ? (
            <span className="text-xs text-emerald-600">해제됨</span>
          ) : null}
        </form>
      </div>
    )
  }

  if (!showSuspendForm) {
    return (
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={() => setShowSuspendForm(true)}
      >
        일시 정지
      </Button>
    )
  }

  return (
    <form
      action={suspendAction}
      className="flex min-w-[200px] flex-col gap-2"
      onSubmit={() => setShowSuspendForm(false)}
    >
      <input type="hidden" name="userId" value={user.user_id} />
      <Input
        name="suspendReason"
        placeholder="정지 사유 (선택)"
        className="h-8 text-sm"
      />
      <Input
        name="suspendedUntil"
        type="date"
        className="h-8 text-sm"
        title="해제 예정일 (선택)"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={suspendPending}>
          {suspendPending ? "처리 중..." : "정지 확정"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowSuspendForm(false)}
        >
          취소
        </Button>
        {suspendState.error ? (
          <span className="text-xs text-destructive">{suspendState.error}</span>
        ) : null}
        {suspendState.success ? (
          <span className="text-xs text-emerald-600">정지됨</span>
        ) : null}
      </div>
    </form>
  )
}

export function AccountStatusBadge({
  status,
  suspendedUntil,
}: {
  status: AccountStatus
  suspendedUntil: string | null
}) {
  const effective = resolveEffectiveStatus({
    status,
    suspended_until: suspendedUntil,
  })

  if (effective === "suspended") {
    const until = formatUntil(suspendedUntil)
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="inline-flex w-fit rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          일시정지
        </span>
        {until ? (
          <span className="text-[10px] text-muted-foreground">~{until}</span>
        ) : null}
      </span>
    )
  }

  return (
    <span className="inline-flex w-fit rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      활성
    </span>
  )
}
