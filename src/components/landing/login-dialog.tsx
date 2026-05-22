"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoginForm } from "@/app/(auth)/login/login-form"
import { BrandLogo } from "@/components/landing/brand-logo"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectedFrom?: string | null
}

export function LoginDialog({
  open,
  onOpenChange,
  redirectedFrom,
}: LoginDialogProps) {
  const isRedirectLogin = Boolean(redirectedFrom)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-[rgba(15,23,42,0.55)] backdrop-blur-sm"
        className="light-auth w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.25)] ring-0 sm:p-0"
      >
        <div className="max-h-[min(90dvh,720px)] overflow-y-auto px-7 py-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9 sm:py-8">
          <DialogHeader className="items-center gap-3 text-center">
            <BrandLogo size={22} className="justify-center" />
            <DialogTitle className="text-lg font-semibold text-label-strong">
              어린이놀이시설 안전점검 관리 시스템
            </DialogTitle>
            {isRedirectLogin ? (
              <div
                className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm text-orange-800"
                role="status"
              >
                이 페이지를 이용하려면 로그인이 필요합니다.
                <br />
                로그인 후 요청하신 페이지로 이동합니다.
              </div>
            ) : (
              <DialogDescription className="text-label-neutral">
                010-2327-1730으로 문의바람
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-7 w-full">
            <LoginForm
              redirectedFrom={redirectedFrom}
              autoFocus={open}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
