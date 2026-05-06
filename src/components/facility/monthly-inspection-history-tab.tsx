import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatInspectionCompletedAt } from "@/lib/date"
import type { MonthlyInspectionRow } from "@/types/database"
import { cn } from "@/lib/utils"

const statusLabel: Record<MonthlyInspectionRow["status"], string> = {
  draft: "작성중",
  completed: "완료",
  needs_revision: "수정필요",
  locked: "잠금",
}

export function MonthlyInspectionHistoryTab({
  inspections,
}: {
  inspections: MonthlyInspectionRow[]
}) {
  if (inspections.length === 0) {
    return (
      <div className="space-y-2 py-4">
        <p className="text-center text-sm text-muted-foreground">
          월간 안전점검 이력이 없습니다. 「점검 시작」으로 월간 점검을 생성하면
          여기에 표시됩니다.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>점검월</TableHead>
          <TableHead>점검일</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>안전관리자</TableHead>
          <TableHead>위탁점검자</TableHead>
          <TableHead>완료일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell>{inspection.inspection_month}</TableCell>
            <TableCell>{inspection.inspection_date}</TableCell>
            <TableCell>{statusLabel[inspection.status]}</TableCell>
            <TableCell>{inspection.safety_manager_name ?? "-"}</TableCell>
            <TableCell>
              {inspection.consigned_inspector_name ?? "-"}
            </TableCell>
            <TableCell>
              {formatInspectionCompletedAt(inspection.completed_at)}
            </TableCell>
            <TableCell className="text-right">
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
        ))}
      </TableBody>
    </Table>
  )
}
