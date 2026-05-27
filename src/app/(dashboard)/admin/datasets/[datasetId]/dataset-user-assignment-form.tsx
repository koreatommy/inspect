"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import type { AppRole } from "@/types/inspection"

import {
  updateDatasetUserAssignmentsAction,
  type AssignableUserRow,
  type DatasetUserAssignmentsState,
} from "../actions"

const initialState: DatasetUserAssignmentsState = {}

type Props = {
  datasetId: string
  datasetStatus: "active" | "archived"
  users: AssignableUserRow[]
  assignedUserIds: string[]
}

export function DatasetUserAssignmentForm({
  datasetId,
  datasetStatus,
  users,
  assignedUserIds,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateDatasetUserAssignmentsAction,
    initialState,
  )

  const assignedSet = new Set(assignedUserIds)
  const readOnly = datasetStatus === "archived"

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="datasetId" value={datasetId} />
      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          보관된 데이터셋은 할당을 변경할 수 없습니다. 활성화 후 편집해 주세요.
        </p>
      ) : null}
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          할당 가능한 사용자가 없습니다. 사용자 관리에서 계정을 먼저
          생성해 주세요.
        </p>
      ) : (
        <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border bg-muted/30 p-3">
          {users.map((user) => {
            const label =
              user.display_name?.trim() ||
              user.organization ||
              user.user_id.slice(0, 8)
            return (
              <li key={user.user_id} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="userId"
                  value={user.user_id}
                  defaultChecked={assignedSet.has(user.user_id)}
                  id={`ds-user-${datasetId}-${user.user_id}`}
                  disabled={readOnly || isPending}
                  className="mt-1"
                />
                <label
                  htmlFor={`ds-user-${datasetId}-${user.user_id}`}
                  className="leading-snug"
                >
                  <span className="font-medium">{label}</span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {ROLE_LABELS[user.role as AppRole] ?? user.role}
                    {user.organization ? ` · ${user.organization}` : ""}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={readOnly || isPending}>
          {isPending ? "저장 중…" : "할당 저장"}
        </Button>
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
        {state.success ? (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            {state.success}
          </span>
        ) : null}
      </div>
    </form>
  )
}
