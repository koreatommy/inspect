"use client"

import { CheckCircle2, Hourglass, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const overlayAboveSheet = "z-[60]"
const contentAboveSheet = "z-[60]"

type ConfirmProps = {
  open: boolean
  recipient: string
  facilityName: string
  subject: string
  sending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function SendInspectionConfirmDialog({
  open,
  recipient,
  facilityName,
  subject,
  sending,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !sending) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={!sending}
        overlayClassName={overlayAboveSheet}
        className={contentAboveSheet}
      >
        <DialogHeader>
          <DialogTitle>이메일을 보내시겠습니까?</DialogTitle>
          <DialogDescription>
            아래 주소로 점검내용이 발송됩니다. 보낸 뒤에는 취소할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 rounded-xl border bg-muted/40 px-3 py-3 text-sm">
          <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">수신</dt>
            <dd className="break-all font-medium">{recipient}</dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">시설명</dt>
            <dd className="break-words">{facilityName}</dd>
          </div>
          <div className="space-y-0.5">
            <dt className="text-xs text-muted-foreground">제목</dt>
            <dd className="break-words">{subject}</dd>
          </div>
        </dl>
        <DialogFooter className="sm:justify-stretch">
          <Button
            type="button"
            variant="outline"
            disabled={sending}
            onClick={onCancel}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={sending}
            onClick={onConfirm}
            className="flex-1"
          >
            {sending ? (
              <>
                <Hourglass className="size-4 animate-hourglass" aria-hidden />
                보내는 중…
              </>
            ) : (
              <>
                <Mail className="size-4" aria-hidden />
                보내기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type SuccessProps = {
  open: boolean
  recipient: string
  onClose: () => void
}

export function SendInspectionSuccessDialog({
  open,
  recipient,
  onClose,
}: SuccessProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton
        overlayClassName={overlayAboveSheet}
        className={contentAboveSheet}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>점검내용을 송부했습니다</DialogTitle>
              <DialogDescription>
                <span className="break-all font-medium text-foreground">
                  {recipient}
                </span>
                으로 메일을 보냈습니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-stretch">
          <Button type="button" onClick={onClose} className="flex-1">
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
