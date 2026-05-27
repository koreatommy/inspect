import { Suspense } from "react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MonthPickerField } from "@/components/ui/month-picker-field"
import { cn } from "@/lib/utils"

import { HistoryTable, HistoryTableSkeleton } from "./history-table"

type HistoryPageProps = {
  searchParams: Promise<{
    month?: string
    q?: string
    status?: string
    page?: string
    deleted?: string
    error?: string
  }>
}

export default async function InspectionHistoryPage({
  searchParams,
}: HistoryPageProps) {
  const {
    month = "",
    q = "",
    status: statusFilter = "",
    page: pageStr = "1",
    deleted,
    error,
  } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">점검이력</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          시설번호와 점검월 기준으로 완료 및 작성중 이력을 조회합니다.
        </p>
      </div>
      {deleted === "1" ? (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-800 dark:text-green-300">
          점검 이력이 삭제되었습니다.
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error === "not-found"
            ? "해당 점검 이력을 찾을 수 없습니다."
            : error === "delete-failed"
              ? "삭제에 실패했습니다. 권한을 확인해 주세요."
              : error === "invalid-id"
                ? "유효하지 않은 점검 ID입니다."
                : "요청을 처리할 수 없습니다."}
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-4">
          <form className="grid gap-2 sm:grid-cols-[1fr_180px_140px_auto]">
            <Input name="q" defaultValue={q} placeholder="시설번호 검색" />
            <MonthPickerField name="month" defaultValue={month} placeholder="전체 점검월" />
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            >
              <option value="">전체 상태</option>
              <option value="draft">작성중</option>
              <option value="completed">완료</option>
            </select>
            <button className={cn(buttonVariants())}>검색</button>
          </form>

          <Suspense
            key={`${q}-${month}-${statusFilter}-${currentPage}`}
            fallback={<HistoryTableSkeleton />}
          >
            <HistoryTable
              q={q}
              month={month}
              statusFilter={statusFilter}
              currentPage={currentPage}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
