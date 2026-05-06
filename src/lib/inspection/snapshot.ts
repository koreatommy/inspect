import type {
  FacilityRow,
  LedgerRow,
  MonthlyInspectionItemRow,
  MonthlyInspectionRow,
} from "@/types/database"

function joinItems(items: MonthlyInspectionItemRow[], status: string) {
  const names = items
    .filter((item) => item.result_status === status)
    .map((item) => item.equipment_name)

  return names.length > 0 ? names.join(", ") : "-"
}

function buildSpecialNotes(items: MonthlyInspectionItemRow[]) {
  const notes = items.filter(
    (item) => item.result_status !== "GOOD" && item.note?.trim()
  )

  return notes.length > 0
    ? notes
        .map((item, index) => `${index + 1}. ${item.equipment_name}: ${item.note}`)
        .join("\n")
    : "-"
}

export function buildLedgerRow({
  inspection,
  facility,
  items,
}: {
  inspection: MonthlyInspectionRow
  facility: Pick<FacilityRow, "facility_name" | "road_address">
  items: MonthlyInspectionItemRow[]
}): Omit<LedgerRow, "id" | "rendered_at"> {
  return {
    inspection_id: inspection.id,
    facility_no: inspection.facility_no,
    facility_name_snapshot: facility.facility_name,
    road_address_snapshot: facility.road_address,
    inspection_date: inspection.inspection_date,
    good_items: joinItems(items, "GOOD"),
    caution_items: joinItems(items, "CAUTION"),
    repair_items: joinItems(items, "REPAIR"),
    stop_use_items: joinItems(items, "STOP_USE"),
    special_notes: buildSpecialNotes(items),
    safety_manager_name_snapshot: inspection.safety_manager_name,
    consigned_inspector_name_snapshot: inspection.consigned_inspector_name,
    safety_manager_signature_url: inspection.safety_manager_signature_url,
    consigned_inspector_signature_url:
      inspection.consigned_inspector_signature_url,
  }
}
