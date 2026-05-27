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
import { pickerTriggerClassName } from "@/components/ui/picker-field-styles"
import {
  formatDateLabel,
  getKoreaDateParts,
  parseDateValue,
  toDateValue,
} from "@/lib/date"
import { cn } from "@/lib/utils"

type DatePickerFieldProps = {
  name: string
  id?: string
  defaultValue?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  /** 선택 가능 연도 하한 (기본: 현재−10) */
  fromYear?: number
  /** 선택 가능 연도 상한 (기본: 현재+1) */
  toYear?: number
}

export function DatePickerField({
  name,
  id,
  defaultValue = "",
  placeholder = "날짜 선택",
  className,
  disabled,
  required,
  clearable = true,
  fromYear,
  toYear,
}: DatePickerFieldProps) {
  const koreaToday = React.useMemo(() => getKoreaDateParts(), [])
  const todayDate = React.useMemo(
    () => parseDateValue(koreaToday.date) ?? new Date(),
    [koreaToday.date]
  )
  const currentYear = todayDate.getFullYear()
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)
  const selected = parseDateValue(value) ?? undefined
  const display = formatDateLabel(value)

  const startYear = fromYear ?? currentYear - 10
  const endYear = toYear ?? currentYear + 1

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
          <Calendar
            mode="single"
            locale={ko}
            selected={selected}
            onSelect={(date) => {
              if (!date) return
              setValue(toDateValue(date))
              setOpen(false)
            }}
            defaultMonth={selected ?? todayDate}
            captionLayout="dropdown"
            startMonth={new Date(startYear, 0)}
            endMonth={new Date(endYear, 11)}
            disabled={(date) =>
              date.getFullYear() < startYear || date.getFullYear() > endYear
            }
            formatters={{
              formatCaption: (date) =>
                format(date, "yyyy년 M월", { locale: ko }),
            }}
          />
          <div className="flex items-center justify-between gap-2 border-t px-2 py-1.5">
            {clearable ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground"
                onClick={() => {
                  setValue("")
                  setOpen(false)
                }}
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
              onClick={() => {
                setValue(koreaToday.date)
                setOpen(false)
              }}
            >
              오늘
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
