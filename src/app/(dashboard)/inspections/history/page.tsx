import Link from "next/link"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatInspectionCompletedAt } from "@/lib/date"
import { getStatusBadge } from "@/lib/inspection/status"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

type HistoryPageProps = {
  searchParams: Promise<{
    month?: string
    q?: string
    page?: string
  }>
}

export default async function InspectionHistoryPage({
  searchParams,
}: HistoryPageProps) {
  const { month = "", q = "", page: pageStr = "1" } = await searchParams
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

  const { data: inspections, count } = await query
  const totalCount = count ?? 0

  const paginationSearchParams: Record<string, string> = {}
  if (month) paginationSearchParams.month = month
  if (q) paginationSearchParams.q = q

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">점검이력</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          시설번호와 점검월 기준으로 완료 및 작성중 이력을 조회합니다.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <form className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
            <Input name="q" defaultValue={q} placeholder="시설번호 검색" />
            <Input name="month" type="month" defaultValue={month} />
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
                    <TableHead className="hidden sm:table-cell">점검일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">안전관리자</TableHead>
                    <TableHead className="hidden md:table-cell">위탁점검자</TableHead>
                    <TableHead className="hidden lg:table-cell">완료일</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inspections ?? []).map((inspection) => {
                    const badge = getStatusBadge(inspection.status)
                    return (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-mono text-xs">{inspection.facility_no}</TableCell>
                        <TableCell>{inspection.inspection_month}</TableCell>
                        <TableCell className="hidden sm:table-cell">{inspection.inspection_date}</TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{inspection.safety_manager_name ?? "-"}</TableCell>
                        <TableCell className="hidden md:table-cell">{inspection.consigned_inspector_name ?? "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatInspectionCompletedAt(inspection.completed_at)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/inspections/${inspection.id}/ledger`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" })
                            )}
                          >
                            대장
                          </Link>
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
                basePath="/inspections/history"
                searchParams={paginationSearchParams}
              />
            </>
          ) : (
            <EmptyState
              title="점검 이력이 없습니다"
              description={q || month ? "검색 조건에 맞는 결과가 없습니다." : "아직 점검을 시작하지 않았습니다."}
              actionLabel={!q && !month ? "새 점검 시작" : undefined}
              actionHref={!q && !month ? "/inspections/new" : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
