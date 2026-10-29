"use client"

import { OSAN_INSPECTORS } from "@/lib/osan/inspectors"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  /** 읽기 전용 표시 (완료 후) */
  readOnly?: boolean
}

export function InspectorSelect({
  value,
  onChange,
  disabled = false,
  readOnly = false,
}: Props) {
  if (readOnly) {
    return (
      <p className="text-sm font-medium tabular-nums">
        {value?.trim() || "미선택"}
      </p>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        className="h-9 w-full min-w-0 touch-manipulation"
        aria-label="점검자"
      >
        <SelectValue placeholder="선택" />
      </SelectTrigger>
      <SelectContent align="end">
        {OSAN_INSPECTORS.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
