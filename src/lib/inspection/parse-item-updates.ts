import {
  INSPECTION_RESULT_STATUSES,
  type InspectionResultStatus,
} from "@/types/inspection"

export type InspectionItemUpdate = {
  id: string
  result_status: InspectionResultStatus
  note: string | null
}

export function parseInspectionItemUpdates(
  formData: FormData,
  ownedItemIds: Set<string>
): InspectionItemUpdate[] {
  const notes = new Map<string, string>()
  const statuses = new Map<string, InspectionResultStatus>()

  for (const [key, raw] of formData.entries()) {
    if (key.startsWith("note:")) {
      const id = key.slice("note:".length)
      if (ownedItemIds.has(id)) {
        notes.set(id, String(raw).trim())
      }
      continue
    }

    if (!key.startsWith("status:")) {
      continue
    }

    const id = key.slice("status:".length)
    const status = String(raw) as InspectionResultStatus

    if (ownedItemIds.has(id) && INSPECTION_RESULT_STATUSES.includes(status)) {
      statuses.set(id, status)
    }
  }

  return [...statuses.entries()].map(([id, result_status]) => ({
    id,
    result_status,
    note: notes.get(id) || null,
  }))
}
