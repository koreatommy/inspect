"use client"

import * as React from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDateLabel, parseDateValue, toDateValue } from "@/lib/date"
import {
  defaultInspectionDate,
  todayKoreaDate,
} from "@/lib/osan/inspection-at"
import { cn } from "@/lib/utils"

type Props = {
  /** `YYYY-MM-DD` */
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
}

export function InspectionAtPicker({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const selected = value ? (parseDateValue(value) ?? undefined) : undefined
  const display = value ? formatDateLabel(value) : ""

  if (readOnly) {
    return (
      <p className="text-sm font-medium tabular-nums">
        {display || "미선택"}
      </p>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        data-empty={!display}
        aria-label={display || "점검일 선택"}
        className={cn(
          "inline-flex h-9 min-w-0 flex-1 items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm touch-manipulation",
          "hover:bg-muted/40 dark:bg-input/30",
          !display && "text-muted-foreground",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span className="truncate tabular-nums">
          {display || "날짜 선택"}
        </span>
        <CalendarIcon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ko}
          selected={selected}
          onSelect={(date) => {
            if (!date) return
            onChange(toDateValue(date))
            setOpen(false)
          }}
          defaultMonth={selected ?? parseDateValue(todayKoreaDate()) ?? undefined}
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 2, 0)}
          endMonth={new Date(new Date().getFullYear() + 1, 11)}
          formatters={{
            formatCaption: (date) =>
              format(date, "yyyy년 M월", { locale: ko }),
          }}
        />
        <div className="flex items-center justify-end border-t px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => {
              onChange(defaultInspectionDate())
              setOpen(false)
            }}
          >
            오늘
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
