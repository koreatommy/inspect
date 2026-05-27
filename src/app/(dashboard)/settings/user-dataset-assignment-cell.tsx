"use client"

import { useActionState, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  updateUserDatasetAssignmentsAction,
  type UpdateDatasetAssignmentsState,
} from "./user-actions"

export type DatasetOption = {
  id: string
  name: string
}

type Props = {
  userId: string
  /** 시스템 전체 active 데이터셋 */
  datasets: DatasetOption[]
  /** 현재 사용자에게 할당된 dataset id 집합 */
  assignedDatasetIds: string[]
  /** ADMIN 사용자에게는 할당 UI를 노출하지 않음 (의미가 없으므로) */
  isAdminTarget: boolean
}

const initialState: UpdateDatasetAssignmentsState = {}

export function UserDatasetAssignmentCell({
  userId,
  datasets,
  assignedDatasetIds,
  isAdminTarget,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateUserDatasetAssignmentsAction,
    initialState,
  )
  const [isEditing, setIsEditing] = useState(false)

  if (isAdminTarget) {
    return (
      <span className="text-xs text-muted-foreground">
        ADMIN은 전 데이터셋 접근
      </span>
    )
  }

  const assignedSet = new Set(assignedDatasetIds)
  const assignedDatasets = datasets.filter((d) => assignedSet.has(d.id))

  if (datasets.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        등록된 데이터셋이 없습니다
      </span>
    )
  }

  if (!isEditing) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        {assignedDatasets.length === 0 ? (
          <span className="text-xs text-muted-foreground">미할당</span>
        ) : (
          assignedDatasets.map((d) => (
            <Badge key={d.id} variant="secondary" className="text-xs">
              {d.name}
            </Badge>
          ))
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="ml-1 h-7 px-2 text-xs"
          onClick={() => setIsEditing(true)}
        >
          편집
        </Button>
        {state.success ? (
          <span className="ml-1 text-xs text-emerald-600">저장됨</span>
        ) : null}
        {state.error ? (
          <span className="ml-1 text-xs text-destructive">{state.error}</span>
        ) : null}
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border bg-muted/30 p-2">
        {datasets.map((d) => (
          <li key={d.id} className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              name="datasetId"
              value={d.id}
              defaultChecked={assignedSet.has(d.id)}
              id={`assign-${userId}-${d.id}`}
              className="mt-0.5"
            />
            <label htmlFor={`assign-${userId}-${d.id}`} className="leading-tight">
              {d.name}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(false)}
        >
          취소
        </Button>
        {state.error ? (
          <span className="text-xs text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  )
}
