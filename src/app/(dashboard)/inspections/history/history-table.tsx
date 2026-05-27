import Link from "next/link"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatasetNameBadge } from "@/components/dashboard/dataset-inspection-breakdown"
import {
  getAccessibleDatasets,
  getCurrentRole,
  getCurrentUser,
} from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { formatInspectionCompletedAt } from "@/lib/date"
import { fetchDatasetNameMap } from "@/lib/dataset/names"
import { getStatusBadge } from "@/lib/inspection/status"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { DeleteInspectionButton } from "./delete-button"

const PAGE_SIZE = 20

type HistoryTableProps = {
  q: string
  month: string
  statusFilter: string
  currentPage: number
}

export async function HistoryTable({
  q,
  month,
  statusFilter,
  currentPage,
}: HistoryTableProps) {
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const user = await getCurrentUser()
  const role = await getCurrentRole()
  const canManageHistory = hasPermission(role, "settings:inspection-history-manage")
  const accessibleDatasets = user
    ? await getAccessibleDatasets(user.id, role)
    : []
  const showDatasetColumn = accessibleDatasets.length > 1

  const supabase = await createClient()
  let query = supabase
    .from("monthly_inspections")
    .select(
      "id, facility_no, inspection_month, inspection_date, status, safety_manager_name, consigned_inspector_name, completed_at, dataset_id",
      { count: "exact" }
    )
    .order("inspection_date", { ascending: false })
    .range(from, to)

  if (month) query = query.eq("inspection_month", month)
  if (q) query = query.ilike("facility_no", `%${q}%`)
  const validStatuses = ["draft", "completed"] as const
  type InspectionStatus = (typeof validStatuses)[number]
  if (statusFilter && validStatuses.includes(statusFilter as InspectionStatus)) {
    query = query.eq("status", statusFilter as InspectionStatus)
  }

  const { data: inspections, count } = await query
  const totalCount = count ?? 0

  const datasetNameById = showDatasetColumn
    ? await fetchDatasetNameMap(
        supabase,
        (inspections ?? []).map((row) => row.dataset_id),
      )
    : new Map<string, string>()

  const paginationSearchParams: Record<string, string> = {}
  if (month) paginationSearchParams.month = month
  if (q) paginationSearchParams.q = q
  if (statusFilter) paginationSearchParams.status = statusFilter

  if ((inspections ?? []).length === 0) {
    return (
      <EmptyState
        title="점검 이력이 없습니다"
        description={
          q || month || statusFilter
            ? "검색 조건에 맞는 결과가 없습니다."
            : "아직 점검을 시작하지 않았습니다."
        }
        actionLabel={!q && !month && !statusFilter ? "새 점검 시작" : undefined}
        actionHref={!q && !month && !statusFilter ? "/inspections/new" : undefined}
      />
    )
  }

  return (
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
            {showDatasetColumn ? <TableHead>데이터셋</TableHead> : null}
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
            const canEditInspection =
              inspection.status === "completed"
                ? hasPermission(role, "inspection:edit-completed")
                : hasPermission(role, "inspection:edit")
            const showEditButton =
              inspection.status !== "locked" && canEditInspection

            return (
              <TableRow key={inspection.id}>
                <TableCell className="font-mono text-xs">{inspection.facility_no}</TableCell>
                {showDatasetColumn ? (
                  <TableCell>
                    {inspection.dataset_id ? (
                      <DatasetNameBadge
                        name={
                          datasetNameById.get(inspection.dataset_id) ?? "알 수 없음"
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                ) : null}
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
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/inspections/${inspection.id}/ledger`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      대장
                    </Link>
                    {showEditButton ? (
                      <Link
                        href={`/inspections/${inspection.id}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        편집
                      </Link>
                    ) : null}
                    {canManageHistory ? (
                      <DeleteInspectionButton
                        inspectionId={inspection.id}
                        facilityNo={inspection.facility_no}
                        inspectionMonth={inspection.inspection_month}
                      />
                    ) : null}
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
        basePath="/inspections/history"
        searchParams={paginationSearchParams}
      />
    </>
  )
}

export function HistoryTableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
