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

import { MonthlyInspectionHistoryDeleteButton } from "./monthly-inspection-history-delete-button"

const statusLabel: Record<MonthlyInspectionRow["status"], string> = {
  draft: "작성중",
  completed: "완료",
  needs_revision: "수정필요",
  locked: "잠금",
}

export function MonthlyInspectionHistoryTab({
  inspections,
  facilityNo,
}: {
  inspections: MonthlyInspectionRow[]
  facilityNo: string
}) {
  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-10 text-center">
        <p className="text-sm text-muted-foreground">
          월간 안전점검 이력이 없습니다. 점검을 시작하면 이력이 여기에 표시됩니다.
        </p>
        <Link
          href={`/inspections/new?facilityNo=${encodeURIComponent(facilityNo)}`}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          바로 점검하기
        </Link>
      </div>
    )
  }

  return (
    <Table className="rounded-lg border">
      <TableHeader>
        <TableRow>
          <TableHead>점검월</TableHead>
          <TableHead className="hidden sm:table-cell">점검일</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="hidden md:table-cell">안전관리자</TableHead>
          <TableHead className="hidden md:table-cell">위탁점검자</TableHead>
          <TableHead className="hidden lg:table-cell">완료일</TableHead>
          <TableHead className="text-right">액션</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell>{inspection.inspection_month}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {inspection.inspection_date}
            </TableCell>
            <TableCell>{statusLabel[inspection.status]}</TableCell>
            <TableCell className="hidden md:table-cell">
              {inspection.safety_manager_name ?? "-"}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {inspection.consigned_inspector_name ?? "-"}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {formatInspectionCompletedAt(inspection.completed_at)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Link
                  href={`/inspections/${inspection.id}/ledger`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  대장
                </Link>
                <Link
                  href={`/inspections/${inspection.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  편집
                </Link>
                <MonthlyInspectionHistoryDeleteButton
                  inspectionId={inspection.id}
                  facilityNo={facilityNo}
                  inspectionMonth={inspection.inspection_month}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
