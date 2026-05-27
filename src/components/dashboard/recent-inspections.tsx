import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TruncatedText } from "@/components/ui/truncated-text"
import { DatasetNameBadge } from "@/components/dashboard/dataset-inspection-breakdown"
import { getStatusBadge } from "@/lib/inspection/status"
import { cn } from "@/lib/utils"

type Inspection = {
  id: string
  facility_no: string
  facility_name: string | null
  dataset_name: string | null
  inspection_month: string
  inspection_date: string | null
  status: string
}

type RecentInspectionsProps = {
  inspections: Inspection[]
  showDatasetColumn?: boolean
}

export function RecentInspections({
  inspections,
  showDatasetColumn = false,
}: RecentInspectionsProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">최근 점검</CardTitle>
        <Link
          href="/inspections/history"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
        >
          전체 보기
        </Link>
      </CardHeader>
      <CardContent>
        {inspections.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시설번호</TableHead>
                <TableHead className="min-w-[6rem]">시설명</TableHead>
                {showDatasetColumn ? <TableHead>데이터셋</TableHead> : null}
                <TableHead>점검월</TableHead>
                <TableHead className="hidden sm:table-cell">점검일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => {
                const badge = getStatusBadge(inspection.status)
                return (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      {inspection.facility_no}
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={inspection.facility_name} />
                    </TableCell>
                    {showDatasetColumn ? (
                      <TableCell>
                        {inspection.dataset_name ? (
                          <DatasetNameBadge name={inspection.dataset_name} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell>{inspection.inspection_month}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {inspection.inspection_date ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/inspections/${inspection.id}/ledger`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        대장
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="아직 점검 이력이 없습니다"
            description="새 점검을 시작해 보세요."
            actionLabel="새 점검 시작"
            actionHref="/inspections/new"
          />
        )}
      </CardContent>
    </Card>
  )
}
