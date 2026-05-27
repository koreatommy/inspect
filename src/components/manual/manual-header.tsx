"use client"

import { CalendarDays, Printer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MANUAL_LAST_UPDATED,
  MANUAL_VERSION,
  SERVICE_NAME,
} from "@/lib/manual-data"

type ManualHeaderProps = {
  searchSlot?: React.ReactNode
}

export function ManualHeader({ searchSlot }: ManualHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border/60 pb-6 print:border-none print:pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="font-normal">
            사용자 매뉴얼 v{MANUAL_VERSION}
          </Badge>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            {SERVICE_NAME}
            <span className="mt-1 block text-lg font-semibold text-muted-foreground md:text-xl">
              온라인 사용자 매뉴얼
            </span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            어린이놀이시설 안전점검 SaaS의 주요 기능과 사용 방법을 안내합니다.
            역할·조직 설정에 따라 화면과 메뉴는 달라질 수 있습니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="print:hidden"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          인쇄 / PDF
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          최종 업데이트: {MANUAL_LAST_UPDATED}
        </span>
      </div>

      {searchSlot ? <div className="max-w-xl print:hidden">{searchSlot}</div> : null}
    </header>
  )
}
