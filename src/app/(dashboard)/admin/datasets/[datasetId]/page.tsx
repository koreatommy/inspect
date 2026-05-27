import Link from "next/link"
import { notFound } from "next/navigation"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requirePermission } from "@/lib/auth/helpers"
import { cn } from "@/lib/utils"

import {
  getDatasetDetail,
  listAssignableUsers,
  listAssignedUserIdsForDataset,
  listDatasetMemberships,
} from "../actions"
import { MEMBERSHIP_PAGE_SIZE } from "../constants"
import { DatasetArchiveToggle } from "./archive-toggle"
import { DatasetUserAssignmentForm } from "./dataset-user-assignment-form"

type PageProps = {
  params: Promise<{ datasetId: string }>
  searchParams: Promise<{ page?: string; membership?: string }>
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function DatasetDetailPage({
  params,
  searchParams,
}: PageProps) {
  await requirePermission("facility:upload")

  const { datasetId } = await params
  const { page: pageRaw, membership: membershipFilter } = await searchParams
  const currentPage = Math.max(1, Number(pageRaw) || 1)
  const activeOnly = membershipFilter === "active"

  const dataset = await getDatasetDetail(datasetId)
  if (!dataset) {
    notFound()
  }

  const [memberships, assignableUsers, assignedUserIds] = await Promise.all([
    listDatasetMemberships(datasetId, currentPage, activeOnly),
    listAssignableUsers(),
    listAssignedUserIdsForDataset(datasetId),
  ])

  const paginationParams: Record<string, string> = {}
  if (activeOnly) paginationParams.membership = "active"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/datasets"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← 데이터셋 목록
          </Link>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {dataset.name}
          </h2>
          {dataset.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {dataset.description}
            </p>
          ) : null}
        </div>
        <Badge
          variant={dataset.status === "active" ? "default" : "secondary"}
          className="shrink-0"
        >
          {dataset.status === "active" ? "활성" : "보관"}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">개요</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <dl className="grid grid-cols-[7rem_1fr] gap-1">
              <dt className="text-muted-foreground">시설 수</dt>
              <dd className="tabular-nums">{dataset.facility_count}</dd>
              <dt className="text-muted-foreground">할당 사용자</dt>
              <dd className="tabular-nums">{dataset.assigned_user_count}</dd>
              <dt className="text-muted-foreground">최근 파일</dt>
              <dd className="truncate">{dataset.source_file ?? "-"}</dd>
              <dt className="text-muted-foreground">생성</dt>
              <dd>{formatDateTime(dataset.created_at)}</dd>
              <dt className="text-muted-foreground">수정</dt>
              <dd>{formatDateTime(dataset.updated_at)}</dd>
            </dl>
            <div className="border-t pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                보관 상태
              </p>
              <DatasetArchiveToggle
                datasetId={dataset.id}
                status={dataset.status}
                datasetName={dataset.name}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">사용자 할당</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">
              이 데이터셋에 접근할 MANAGER·INSPECTOR·VIEWER를 선택합니다.
              사용자 관리 화면과 동기화됩니다.
            </p>
            <DatasetUserAssignmentForm
              datasetId={dataset.id}
              datasetStatus={dataset.status}
              users={assignableUsers}
              assignedUserIds={assignedUserIds}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">멤버십 시설</CardTitle>
          <div className="flex gap-2">
            <Link
              href={`/admin/datasets/${datasetId}`}
              className={cn(
                buttonVariants({
                  variant: activeOnly ? "outline" : "secondary",
                  size: "sm",
                }),
              )}
            >
              전체
            </Link>
            <Link
              href={`/admin/datasets/${datasetId}?membership=active`}
              className={cn(
                buttonVariants({
                  variant: activeOnly ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
            >
              활성만
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <PaginationRangeSummary
            currentPage={currentPage}
            totalCount={memberships.totalCount}
            pageSize={MEMBERSHIP_PAGE_SIZE}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시설번호</TableHead>
                <TableHead>시설명</TableHead>
                <TableHead className="hidden md:table-cell">주소</TableHead>
                <TableHead>멤버십</TableHead>
                <TableHead>상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {activeOnly
                      ? "활성 멤버십 시설이 없습니다."
                      : "멤버십이 등록된 시설이 없습니다."}
                  </TableCell>
                </TableRow>
              ) : (
                memberships.rows.map((row) => (
                  <TableRow key={row.facility_no}>
                    <TableCell className="font-mono text-xs">
                      {row.facility_no}
                    </TableCell>
                    <TableCell>{row.facility_name ?? "-"}</TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell text-xs text-muted-foreground">
                      {row.road_address ?? row.lot_address ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={row.is_active ? "default" : "secondary"}
                      >
                        {row.is_active ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/facilities/${row.facility_no}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        보기
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={currentPage}
            totalCount={memberships.totalCount}
            pageSize={MEMBERSHIP_PAGE_SIZE}
            basePath={`/admin/datasets/${datasetId}`}
            searchParams={paginationParams}
          />
        </CardContent>
      </Card>
    </div>
  )
}
