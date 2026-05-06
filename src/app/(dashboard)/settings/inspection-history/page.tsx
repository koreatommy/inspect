import Link from "next/link"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requirePermission } from "@/lib/auth/helpers"
import { formatInspectionCompletedAt } from "@/lib/date"
import { getStatusBadge } from "@/lib/inspection/status"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { DeleteInspectionButton } from "./delete-button"

const PAGE_SIZE = 20

type AdminHistoryPageProps = {
  searchParams: Promise<{
    month?: string
    q?: string
    status?: string
    page?: string
    deleted?: string
    error?: string
  }>
}

export default async function InspectionHistoryAdminPage({
  searchParams,
}: AdminHistoryPageProps) {
  await requirePermission("settings:inspection-history-manage", "/settings")

  const {
    month = "",
    q = "",
    status: statusFilter = "",
    page: pageStr = "1",
    deleted,
    error,
  } = await searchParams

  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from("monthly_inspections")
    .select("*", { count: "exact" })
    .order("inspection_date", { ascending: false })
    .range(from, to)

  if (month) query = query.eq("inspection_month", month)
  if (q) query = query.ilike("facility_no", `%${q}%`)
  const validStatuses = ["draft", "completed", "needs_revision", "locked"] as const
  type InspectionStatus = (typeof validStatuses)[number]
  if (statusFilter && validStatuses.includes(statusFilter as InspectionStatus)) {
    query = query.eq("status", statusFilter as InspectionStatus)
  }

  const { data: inspections, count } = await query
  const totalCount = count ?? 0

  const paginationSearchParams: Record<string, string> = {}
  if (month) paginationSearchParams.month = month
  if (q) paginationSearchParams.q = q
  if (statusFilter) paginationSearchParams.status = statusFilter

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          점검이력 관리
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          점검 이력을 편집하거나 삭제합니다. 삭제 시 연결된 점검 항목·대장 행도
          함께 제거됩니다.
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
              : "요청을 처리할 수 없습니다."}
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-4 pt-4">
          <form className="grid gap-2 sm:grid-cols-[1fr_180px_140px_auto]">
            <Input name="q" defaultValue={q} placeholder="시설번호 검색" />
            <Input name="month" type="month" defaultValue={month} />
            <select
              name="status"
              defaultValue={statusFilter}
              className="h-10 rounded-lg border border-input bg-background px-2.5 text-sm"
            >
              <option value="">전체 상태</option>
              <option value="draft">작성중</option>
              <option value="completed">완료</option>
              <option value="needs_revision">수정요청</option>
              <option value="locked">잠김</option>
            </select>
            <button className={cn(buttonVariants())}>검색</button>
          </form>

          {(inspections ?? []).length > 0 ? (
            <>
              <div className="flex justify-end">
                <PaginationRangeSummary
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시설번호</TableHead>
                    <TableHead>점검월</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      점검일
                    </TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">
                      안전관리자
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      위탁점검자
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      완료일
                    </TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inspections ?? []).map((inspection) => {
                    const badge = getStatusBadge(inspection.status)
                    return (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-mono text-xs">
                          {inspection.facility_no}
                        </TableCell>
                        <TableCell>{inspection.inspection_month}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {inspection.inspection_date}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {inspection.safety_manager_name ?? "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {inspection.consigned_inspector_name ?? "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatInspectionCompletedAt(inspection.completed_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/inspections/${inspection.id}/ledger`}
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                })
                              )}
                            >
                              대장
                            </Link>
                            <Link
                              href={`/inspections/${inspection.id}`}
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                })
                              )}
                            >
                              편집
                            </Link>
                            <DeleteInspectionButton
                              inspectionId={inspection.id}
                              facilityNo={inspection.facility_no}
                              inspectionMonth={inspection.inspection_month}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                basePath="/settings/inspection-history"
                searchParams={paginationSearchParams}
              />
            </>
          ) : (
            <EmptyState
              title="점검 이력이 없습니다"
              description={
                q || month || statusFilter
                  ? "검색 조건에 맞는 결과가 없습니다."
                  : "아직 점검을 시작하지 않았습니다."
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
