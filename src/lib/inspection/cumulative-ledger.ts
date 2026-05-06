import type { SupabaseClient } from "@supabase/supabase-js"

import type { LedgerDisplayRow } from "@/components/ledger/ledger-table"
import { buildLedgerRow } from "@/lib/inspection/snapshot"
import type {
  Database,
  FacilityRow,
  LedgerRow,
  MonthlyInspectionItemRow,
  MonthlyInspectionRow,
} from "@/types/database"

function parseYearMonth(
  inspectionMonth: string
): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(inspectionMonth.trim())
  if (!m) {
    return null
  }
  const year = Number(m[1])
  const month = Number(m[2])
  if (!Number.isFinite(year) || month < 1 || month > 12) {
    return null
  }
  return { year, month }
}

function resolveLedgerYearEndMonth(inspection: MonthlyInspectionRow): {
  year: number
  endMonth: number
} {
  const parsed = parseYearMonth(inspection.inspection_month)
  if (parsed) {
    return { year: parsed.year, endMonth: parsed.month }
  }
  const d = /^(\d{4})-(\d{2})-\d{2}/.exec(inspection.inspection_date.trim())
  if (d) {
    const year = Number(d[1])
    const month = Number(d[2])
    if (Number.isFinite(year) && month >= 1 && month <= 12) {
      return { year, endMonth: month }
    }
  }
  const y = new Date().getFullYear()
  return { year: y, endMonth: 1 }
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

function ledgerToDisplay(row: LedgerRow): LedgerDisplayRow {
  const { rendered_at: _omit, ...rest } = row
  return rest
}

function groupItemsByInspectionId(
  items: MonthlyInspectionItemRow[]
): Map<string, MonthlyInspectionItemRow[]> {
  const m = new Map<string, MonthlyInspectionItemRow[]>()
  for (const item of items) {
    const arr = m.get(item.inspection_id) ?? []
    arr.push(item)
    m.set(item.inspection_id, arr)
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  }
  return m
}

export async function loadCumulativeLedgerRowsByMonth(
  supabase: SupabaseClient<Database>,
  args: {
    facilityNo: string
    anchorInspectionId: string
    anchorInspection: MonthlyInspectionRow
    facility: Pick<FacilityRow, "facility_name" | "road_address">
    anchorItems: MonthlyInspectionItemRow[]
    anchorStoredLedger: LedgerRow | null
  }
): Promise<{ endMonth: number; rowsByMonth: Map<number, LedgerDisplayRow> }> {
  const { year, endMonth } = resolveLedgerYearEndMonth(args.anchorInspection)

  const monthKeys: string[] = []
  for (let mo = 1; mo <= endMonth; mo++) {
    monthKeys.push(monthKey(year, mo))
  }

  const { data: inspections } = await supabase
    .from("monthly_inspections")
    .select("*")
    .eq("facility_no", args.facilityNo)
    .in("inspection_month", monthKeys)

  const byMonthKey = new Map<string, MonthlyInspectionRow>()
  for (const row of inspections ?? []) {
    byMonthKey.set(row.inspection_month, row)
  }

  const ids = (inspections ?? []).map((i) => i.id)
  const { data: ledgers } =
    ids.length > 0
      ? await supabase
          .from("inspection_ledger_rows")
          .select("*")
          .in("inspection_id", ids)
      : { data: [] as LedgerRow[] }

  const ledgerByInspectionId = new Map<string, LedgerRow>()
  for (const ledger of ledgers ?? []) {
    ledgerByInspectionId.set(ledger.inspection_id, ledger)
  }

  const idsNeedingItems = new Set<string>()
  for (let mo = 1; mo <= endMonth; mo++) {
    const mk = monthKey(year, mo)
    const insp = byMonthKey.get(mk)
    if (!insp) {
      continue
    }
    if (ledgerByInspectionId.has(insp.id)) {
      continue
    }
    if (insp.id === args.anchorInspectionId) {
      continue
    }
    idsNeedingItems.add(insp.id)
  }

  const { data: extraItems } =
    idsNeedingItems.size > 0
      ? await supabase
          .from("monthly_inspection_items")
          .select("*")
          .in("inspection_id", [...idsNeedingItems])
          .order("sort_order", { ascending: true })
      : { data: [] as MonthlyInspectionItemRow[] }

  const itemsByInspectionId = groupItemsByInspectionId(extraItems ?? [])

  const rowsByMonth = new Map<number, LedgerDisplayRow>()

  for (let mo = 1; mo <= endMonth; mo++) {
    const mk = monthKey(year, mo)
    const insp = byMonthKey.get(mk)
    if (!insp) {
      continue
    }

    const ledger = ledgerByInspectionId.get(insp.id)
    if (ledger) {
      rowsByMonth.set(mo, ledgerToDisplay(ledger))
      continue
    }

    if (insp.id === args.anchorInspectionId) {
      if (args.anchorStoredLedger) {
        rowsByMonth.set(mo, ledgerToDisplay(args.anchorStoredLedger))
      } else {
        rowsByMonth.set(
          mo,
          buildLedgerRow({
            inspection: insp,
            facility: args.facility,
            items: args.anchorItems,
          })
        )
      }
      continue
    }

    const items = itemsByInspectionId.get(insp.id) ?? []
    rowsByMonth.set(
      mo,
      buildLedgerRow({
        inspection: insp,
        facility: args.facility,
        items,
      })
    )
  }

  return { endMonth, rowsByMonth }
}
