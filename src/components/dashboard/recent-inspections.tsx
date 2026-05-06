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
import { getStatusBadge } from "@/lib/inspection/status"
import { cn } from "@/lib/utils"

type Inspection = {
  id: string
  facility_no: string
  facility_name: string | null
  inspection_month: string
  inspection_date: string | null
  status: string
}

export function RecentInspections({ inspections }: { inspections: Inspection[] }) {
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
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{inspection.facility_no}</span>
                        <span
                          className="max-w-[12rem] truncate text-muted-foreground"
                          title={inspection.facility_name ?? ""}
                        >
                          {inspection.facility_name ?? "-"}
                        </span>
                      </div>
                    </TableCell>
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
