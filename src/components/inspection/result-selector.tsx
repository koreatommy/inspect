import {
  INSPECTION_RESULT_LABELS,
  INSPECTION_RESULT_STATUSES,
  type InspectionResultStatus,
} from "@/types/inspection"
import { cn } from "@/lib/utils"

export function ResultSelector({
  itemId,
  defaultValue,
  disabled = false,
  className,
}: {
  itemId: string
  defaultValue: InspectionResultStatus
  disabled?: boolean
  className?: string
}) {
  return (
    <select
      name={`status:${itemId}`}
      defaultValue={defaultValue}
      disabled={disabled}
      className={cn(
        "h-8 rounded-lg border border-input bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {INSPECTION_RESULT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {INSPECTION_RESULT_LABELS[status]}
        </option>
      ))}
    </select>
  )
}
