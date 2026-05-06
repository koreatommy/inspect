export const INSPECTION_RESULT_STATUSES = [
  "GOOD",
  "CAUTION",
  "REPAIR",
  "STOP_USE",
] as const

export type InspectionResultStatus =
  (typeof INSPECTION_RESULT_STATUSES)[number]

export const INSPECTION_RESULT_LABELS: Record<InspectionResultStatus, string> = {
  GOOD: "양호",
  CAUTION: "요주의",
  REPAIR: "요수리",
  STOP_USE: "이용금지",
}

export const MONTHLY_INSPECTION_STATUSES = [
  "draft",
  "completed",
  "needs_revision",
  "locked",
] as const

export type MonthlyInspectionStatus =
  (typeof MONTHLY_INSPECTION_STATUSES)[number]

export type AppRole = "ADMIN" | "MANAGER" | "INSPECTOR" | "VIEWER"

export function requiresInspectionNote(status: InspectionResultStatus) {
  return status !== "GOOD"
}
