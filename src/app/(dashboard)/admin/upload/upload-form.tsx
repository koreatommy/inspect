"use client"

import { useId, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
import type { UploadProgress, UploadResult } from "@/lib/json-parser/uploader"
import type { DatasetOption } from "./actions"

type Mode = "existing" | "new"

type SSEDoneData = { phase: "done"; result: UploadResult; datasetName: string }
type SSEErrorData = { phase: "error"; error: string }
type SSEData = UploadProgress | SSEDoneData | SSEErrorData

function isSSEDone(data: SSEData): data is SSEDoneData {
  return data.phase === "done" && "result" in data && "datasetName" in data
}

function isSSEError(data: SSEData): data is SSEErrorData {
  return data.phase === "error" && "error" in data
}

type UploadFormProps = {
  datasets: DatasetOption[]
}

export function UploadForm({ datasets }: UploadFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const hasExisting = datasets.length > 0
  const [mode, setMode] = useState<Mode>(hasExisting ? "existing" : "new")
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    hasExisting ? datasets[0]!.id : "",
  )

  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [resultDatasetName, setResultDatasetName] = useState<string>("-")
  const [error, setError] = useState<string | null>(null)

  const datasetModeFieldId = useId()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setIsUploading(true)
    setProgress({ phase: "validating", current: 0, total: 0, message: "시작..." })
    setResult(null)
    setError(null)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "업로드 실패")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("스트림을 읽을 수 없습니다.")
      }

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as SSEData

              if (isSSEDone(data)) {
                setResult(data.result)
                setResultDatasetName(data.datasetName)
                setProgress(null)
                router.refresh()
              } else if (isSSEError(data)) {
                throw new Error(data.error)
              } else {
                setProgress(data)
              }
            } catch (parseError) {
              if (parseError instanceof Error) {
                throw parseError
              }
              console.error("SSE 파싱 오류:", parseError)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.")
      setProgress(null)
    } finally {
      setIsUploading(false)
    }
  }

  const progressPercent =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>업로드 대상 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <fieldset className="space-y-3" disabled={isUploading}>
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
                    disabled={!hasExisting || isUploading}
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
                    disabled={isUploading}
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
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
                    disabled={isUploading}
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
                    disabled={isUploading}
                  />
                  <Input
                    name="newDatasetDescription"
                    placeholder="설명 (선택)"
                    maxLength={200}
                    disabled={isUploading}
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-2" disabled={isUploading}>
              <legend className="text-sm font-medium">JSON 파일</legend>
              <Input
                name="file"
                type="file"
                accept="application/json,.json"
                required
                disabled={isUploading}
              />
            </fieldset>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {progress && (
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {progress.message}
                  </span>
                  {progress.total > 0 && (
                    <span className="tabular-nums">{progressPercent}%</span>
                  )}
                </div>
                {progress.total > 0 && (
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                "업로드 실행"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <UploadResultCard result={result} datasetName={resultDatasetName} />
      )}
    </div>
  )
}

type UploadResultCardProps = {
  result: UploadResult
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
