"use client"

import { useActionState, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDatasetOptionLabel } from "@/lib/dataset/names"
import {
  uploadJsonAction,
  type DatasetOption,
  type UploadState,
} from "./actions"

type Mode = "existing" | "new"

const initialState: UploadState = {}

type UploadFormProps = {
  datasets: DatasetOption[]
}

export function UploadForm({ datasets }: UploadFormProps) {
  const [state, formAction, isPending] = useActionState(
    uploadJsonAction,
    initialState,
  )
  const hasExisting = datasets.length > 0
  const [mode, setMode] = useState<Mode>(hasExisting ? "existing" : "new")
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    hasExisting ? datasets[0]!.id : "",
  )

  const datasetModeFieldId = useId()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>업로드 대상 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">데이터셋 선택</legend>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    id={`${datasetModeFieldId}-existing`}
                    type="radio"
                    name="datasetMode"
                    value="existing"
                    checked={mode === "existing"}
                    onChange={() => setMode("existing")}
                    disabled={!hasExisting}
                  />
                  기존 데이터셋에 업로드
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    id={`${datasetModeFieldId}-new`}
                    type="radio"
                    name="datasetMode"
                    value="new"
                    checked={mode === "new"}
                    onChange={() => setMode("new")}
                  />
                  새 데이터셋으로 업로드
                </label>
              </div>

              {mode === "existing" ? (
                hasExisting ? (
                  <select
                    name="datasetId"
                    required
                    value={selectedDatasetId}
                    onChange={(e) => setSelectedDatasetId(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {datasets.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        {formatDatasetOptionLabel(ds.name, ds.facility_count)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    등록된 active 데이터셋이 없습니다. 새 데이터셋으로
                    업로드해 주세요.
                  </p>
                )
              ) : (
                <div className="space-y-3">
                  <Input
                    name="newDatasetName"
                    placeholder="데이터셋 이름 (예: 서천군 학교 2026)"
                    required
                    maxLength={80}
                  />
                  <Input
                    name="newDatasetDescription"
                    placeholder="설명 (선택)"
                    maxLength={200}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">JSON 파일</legend>
              <Input
                name="file"
                type="file"
                accept="application/json,.json"
                required
              />
            </fieldset>

            {state.error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}

            {state.warning ? (
              <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                {state.warning}
              </p>
            ) : null}

            <Button type="submit" disabled={isPending}>
              {isPending ? "업로드 중..." : "업로드 실행"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.result ? (
        <UploadResultCard
          result={state.result}
          datasetName={state.datasetName ?? "-"}
        />
      ) : null}
    </div>
  )
}

type UploadResultCardProps = {
  result: NonNullable<UploadState["result"]>
  datasetName: string
}

function UploadResultCard({ result, datasetName }: UploadResultCardProps) {
  const stats: Array<[string, number | string]> = [
    ["대상 데이터셋", datasetName],
    ["전체 요청", result.total],
    ["성공", result.success],
    ["실패", result.failed],
    ["신규 시설", result.newFacilities],
    ["업데이트 시설", result.updatedFacilities],
    ["신규 기구", result.newEquipment],
    ["업데이트 기구", result.updatedEquipment],
    ["비활성 기구", result.deactivatedEquipment],
    ["신규 멤버십", result.newMemberships],
    ["재활성 멤버십", result.reactivatedMemberships],
    ["유지 멤버십", result.retainedMemberships],
    ["비활성 멤버십", result.deactivatedMemberships],
    ["글로벌 비활성 시설", result.deactivatedFacilities],
    ["글로벌 재활성 시설", result.reactivatedFacilities],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>업로드 결과</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {result.failures.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>순번</TableHead>
                <TableHead>시설번호</TableHead>
                <TableHead>실패 사유</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.failures.map((failure, idx) => (
                <TableRow key={`${failure.index}-${failure.facilityNo ?? "post"}-${idx}`}>
                  <TableCell>
                    {failure.index === -1 ? "동기화" : failure.index + 1}
                  </TableCell>
                  <TableCell>{failure.facilityNo ?? "-"}</TableCell>
                  <TableCell>{failure.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  )
}
