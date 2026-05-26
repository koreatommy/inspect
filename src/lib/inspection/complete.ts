import { getPersonNameValidationError } from "@/lib/inspection/person-name"
import type { MonthlyInspectionItemRow, MonthlyInspectionRow } from "@/types/database"
import { requiresInspectionNote } from "@/types/inspection"

export function validateCompletion(
  inspection: MonthlyInspectionRow,
  items: MonthlyInspectionItemRow[]
) {
  const errors: string[] = []

  if (!inspection.inspection_month) errors.push("점검월이 없습니다.")
  if (!inspection.inspection_date) errors.push("점검일이 없습니다.")
  if (items.length === 0) errors.push("점검 항목이 없습니다.")

  for (const item of items) {
    if (requiresInspectionNote(item.result_status) && !item.note?.trim()) {
      errors.push(`${item.equipment_name}의 점검내용을 입력해 주세요.`)
    }
  }

  const safetyManagerName = inspection.safety_manager_name?.trim() ?? ""
  if (!safetyManagerName) {
    errors.push("안전관리자명을 입력해 주세요.")
  } else {
    const nameError = getPersonNameValidationError(
      safetyManagerName,
      "안전관리자명"
    )
    if (nameError) errors.push(nameError)
  }

  const consignedInspectorName =
    inspection.consigned_inspector_name?.trim() ?? ""
  if (consignedInspectorName) {
    const nameError = getPersonNameValidationError(
      consignedInspectorName,
      "위탁점검자명"
    )
    if (nameError) errors.push(nameError)
  }

  if (!inspection.safety_manager_signature_url) {
    errors.push("안전관리자 서명을 입력해 주세요.")
  }

  return errors
}
