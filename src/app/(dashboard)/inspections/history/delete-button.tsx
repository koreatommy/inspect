"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { deleteMonthlyInspectionFromHistory } from "./actions"

export function DeleteInspectionButton({
  inspectionId,
  facilityNo,
  inspectionMonth,
}: {
  inspectionId: string
  facilityNo: string
  inspectionMonth: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm" />
        }
      >
        삭제
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>점검 이력 삭제</DialogTitle>
          <DialogDescription>
            시설 <strong>{facilityNo}</strong>의{" "}
            <strong>{inspectionMonth}</strong> 점검 데이터를 삭제합니다.
            연결된 점검 항목·대장 행도 함께 삭제되며 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <form action={deleteMonthlyInspectionFromHistory}>
            <input type="hidden" name="inspectionId" value={inspectionId} />
            <Button type="submit" variant="destructive">
              삭제
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
