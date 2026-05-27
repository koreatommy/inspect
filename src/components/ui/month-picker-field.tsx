"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { pickerTriggerClassName } from "@/components/ui/picker-field-styles"
import {
  formatMonthLabel,
  getKoreaDateParts,
  parseMonthValue,
  toMonthValue,
} from "@/lib/date"
import { cn } from "@/lib/utils"

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
] as const

type MonthPickerFieldProps = {
  name: string
  id?: string
  defaultValue?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
}

export function MonthPickerField({
  name,
  id,
  defaultValue = "",
  placeholder = "점검월 선택",
  className,
  disabled,
  required,
  clearable = true,
}: MonthPickerFieldProps) {
  const koreaToday = React.useMemo(() => getKoreaDateParts(), [])
  const initial = parseMonthValue(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)
  const [viewYear, setViewYear] = React.useState(
    initial?.year ?? Number(koreaToday.month.slice(0, 4))
  )

  const display = formatMonthLabel(value)

  function selectMonth(month: number) {
    setValue(toMonthValue(viewYear, month))
    setOpen(false)
  }

  function selectThisMonth() {
    const parsed = parseMonthValue(koreaToday.month)
    if (!parsed) return
    setViewYear(parsed.year)
    setValue(koreaToday.month)
    setOpen(false)
  }

  function clearValue() {
    setValue("")
    setOpen(false)
  }

  const selected = parseMonthValue(value)

  return (
    <div className={cn("relative", className)}>
      <input type="hidden" name={name} id={id} value={value} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          data-empty={!display}
          aria-label={display || placeholder}
          className={cn(
            pickerTriggerClassName,
            "inline-flex items-center",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <span className="truncate">{display || placeholder}</span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="flex items-center justify-between gap-1 border-b px-2 py-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="이전 해"
              onClick={() => setViewYear((y) => y - 1)}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <span className="min-w-16 text-center text-sm font-semibold tabular-nums">
              {viewYear}년
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="다음 해"
              onClick={() => setViewYear((y) => y + 1)}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {MONTH_LABELS.map((label, index) => {
              const month = index + 1
              const isSelected =
                selected?.year === viewYear && selected.month === month
              const isCurrentMonth =
                koreaToday.month === toMonthValue(viewYear, month)
              return (
                <Button
                  key={label}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-9 font-normal",
                    !isSelected &&
                      isCurrentMonth &&
                      "ring-1 ring-primary/30"
                  )}
                  onClick={() => selectMonth(month)}
                >
                  {label}
                </Button>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5">
            {clearable ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground"
                onClick={clearValue}
              >
                지우기
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={selectThisMonth}
            >
              이번 달
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
