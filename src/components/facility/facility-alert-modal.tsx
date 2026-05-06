"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type FacilityAlertModalProps = {
  deleted?: string
  error?: string
}

export function FacilityAlertModal({ deleted, error }: FacilityAlertModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const content = useMemo(() => {
    if (deleted === "1") {
      return {
        title: "점검 이력 삭제 완료",
        description: "점검 이력이 정상적으로 삭제되었습니다.",
      }
    }

    if (error === "not-found") {
      return {
        title: "삭제 실패",
        description: "해당 점검 이력을 찾을 수 없습니다.",
      }
    }

    if (error === "delete-failed") {
      return {
        title: "삭제 실패",
        description: "삭제에 실패했습니다. 권한을 확인해 주세요.",
      }
    }

    if (error === "invalid-id") {
      return {
        title: "요청 오류",
        description: "요청을 처리할 수 없습니다.",
      }
    }

    return null
  }, [deleted, error])

  const [open, setOpen] = useState(Boolean(content))

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("deleted")
      params.delete("error")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }
  }

  if (!content) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => handleOpenChange(false)}>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
