import type { LedgerRow, MonthlyInspectionItemRow } from "@/types/database"
import type { InspectionResultStatus } from "@/types/inspection"

const NOTE_LINE_PATTERN = /^\s*\d+\.\s*(.+?):\s*(.+)\s*$/

function parseNames(value: string | null): Set<string> {
  if (!value || value.trim() === "-" || value.trim() === "") {
    return new Set()
  }
  return new Set(
    value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
  )
}

function parseNotes(value: string | null): Map<string, string> {
  const notes = new Map<string, string>()
  if (!value || value.trim() === "-" || value.trim() === "") {
    return notes
  }

  for (const line of value.split("\n")) {
    const matched = NOTE_LINE_PATTERN.exec(line)
    if (!matched) {
      continue
    }
    const [, equipmentName, note] = matched
    notes.set(equipmentName.trim(), note.trim())
  }

  return notes
}

export function hydrateInspectionItemsFromLedger(
  items: MonthlyInspectionItemRow[],
  ledger: LedgerRow | null
): MonthlyInspectionItemRow[] {
  if (!ledger || items.length === 0) {
    return items
  }

  const cautionNames = parseNames(ledger.caution_items)
  const repairNames = parseNames(ledger.repair_items)
  const stopUseNames = parseNames(ledger.stop_use_items)
  const noteByName = parseNotes(ledger.special_notes)

  return items.map((item) => {
    let resultStatus: InspectionResultStatus = item.result_status
    if (stopUseNames.has(item.equipment_name)) {
      resultStatus = "STOP_USE"
    } else if (repairNames.has(item.equipment_name)) {
      resultStatus = "REPAIR"
    } else if (cautionNames.has(item.equipment_name)) {
      resultStatus = "CAUTION"
    }

    const note = noteByName.get(item.equipment_name) ?? item.note
    return {
      ...item,
      result_status: resultStatus,
      note,
    }
  })
}
