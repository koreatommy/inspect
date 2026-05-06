import type { MonthlyInspectionItemRow, MonthlyInspectionRow } from "@/types/database"

export function validateCompletion(
  inspection: MonthlyInspectionRow,
  items: MonthlyInspectionItemRow[]
) {
  const errors: string[] = []

  if (!inspection.inspection_month) errors.push("점검월이 없습니다.")
  if (!inspection.inspection_date) errors.push("점검일이 없습니다.")
  if (items.length === 0) errors.push("점검 항목이 없습니다.")

  for (const item of items) {
    if (item.result_status !== "GOOD" && !item.note?.trim()) {
      errors.push(`${item.equipment_name}의 점검내용을 입력해 주세요.`)
    }
  }

  if (!inspection.safety_manager_name?.trim()) {
    errors.push("안전관리자명을 입력해 주세요.")
  }

  if (!inspection.safety_manager_signature_url) {
    errors.push("안전관리자 서명을 입력해 주세요.")
  }

  return errors
}
