"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import {
  toggleDatasetArchiveAction,
  type ArchiveToggleState,
} from "../actions"

const initialState: ArchiveToggleState = {}

type Props = {
  datasetId: string
  status: "active" | "archived"
  datasetName: string
}

export function DatasetArchiveToggle({ datasetId, status, datasetName }: Props) {
  const [state, formAction, isPending] = useActionState(
    toggleDatasetArchiveAction,
    initialState,
  )

  const nextStatus = status === "active" ? "archived" : "active"
  const label =
    status === "active"
      ? "보관 처리"
      : "활성화"

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="datasetId" value={datasetId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <Button
        type="submit"
        variant={status === "active" ? "outline" : "default"}
        size="sm"
        disabled={isPending}
      >
        {isPending ? "처리 중…" : label}
      </Button>
      <p className="text-xs text-muted-foreground">
        {status === "active"
          ? `보관 시 "${datasetName}"에 신규 업로드·점검 생성이 차단됩니다. 기존 점검 조회는 유지됩니다.`
          : "활성화하면 업로드·신규 점검 생성이 다시 가능합니다."}
      </p>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {state.success}
        </p>
      ) : null}
    </form>
  )
}
