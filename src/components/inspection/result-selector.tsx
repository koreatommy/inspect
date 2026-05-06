import {
  INSPECTION_RESULT_LABELS,
  INSPECTION_RESULT_STATUSES,
  type InspectionResultStatus,
} from "@/types/inspection"

export function ResultSelector({
  itemId,
  defaultValue,
  disabled = false,
}: {
  itemId: string
  defaultValue: InspectionResultStatus
  disabled?: boolean
}) {
  return (
    <select
      name={`status:${itemId}`}
      defaultValue={defaultValue}
      disabled={disabled}
      className="h-8 rounded-lg border border-input bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      {INSPECTION_RESULT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {INSPECTION_RESULT_LABELS[status]}
        </option>
      ))}
    </select>
  )
}
