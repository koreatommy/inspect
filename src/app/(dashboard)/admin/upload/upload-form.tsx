"use client"

import { useActionState } from "react"

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
import { uploadJsonAction, type UploadState } from "./actions"

const initialState: UploadState = {}

export function UploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadJsonAction,
    initialState
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>시설정보 JSON 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <Input name="file" type="file" accept="application/json,.json" />
            {state.error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={isPending}>
              {isPending ? "업로드 중..." : "업로드 실행"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.result ? (
        <Card>
          <CardHeader>
            <CardTitle>업로드 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ["전체 요청", state.result.total],
                ["성공", state.result.success],
                ["실패", state.result.failed],
                ["신규 시설", state.result.newFacilities],
                ["업데이트 시설", state.result.updatedFacilities],
                ["신규 기구", state.result.newEquipment],
                ["업데이트 기구", state.result.updatedEquipment],
                ["비활성 기구", state.result.deactivatedEquipment],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {state.result.failures.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>순번</TableHead>
                    <TableHead>시설번호</TableHead>
                    <TableHead>실패 사유</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.result.failures.map((failure) => (
                    <TableRow key={`${failure.index}-${failure.facilityNo}`}>
                      <TableCell>{failure.index + 1}</TableCell>
                      <TableCell>{failure.facilityNo ?? "-"}</TableCell>
                      <TableCell>{failure.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
