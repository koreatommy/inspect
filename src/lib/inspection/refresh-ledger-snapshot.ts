import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { buildLedgerRow } from "./snapshot"

export async function refreshLedgerSnapshotForInspection(
  supabase: SupabaseClient<Database>,
  inspectionId: string
) {
  const [{ data: inspection }, { data: items }] = await Promise.all([
    supabase
      .from("monthly_inspections")
      .select("*")
      .eq("id", inspectionId)
      .maybeSingle(),
    supabase
      .from("monthly_inspection_items")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("sort_order", { ascending: true }),
  ])

  if (!inspection) {
    throw new Error("inspection-not-found")
  }

  const { data: facility } = await supabase
    .from("facilities")
    .select("facility_name,road_address")
    .eq("facility_no", inspection.facility_no)
    .maybeSingle()

  if (!facility) {
    throw new Error("facility-not-found")
  }

  const ledgerRow = buildLedgerRow({
    inspection,
    facility,
    items: items ?? [],
  })

  const { error: deleteError } = await supabase
    .from("inspection_ledger_rows")
    .delete()
    .eq("inspection_id", inspectionId)

  if (deleteError) {
    throw deleteError
  }

  const { error: insertError } = await supabase
    .from("inspection_ledger_rows")
    .insert(ledgerRow)

  if (insertError) {
    throw insertError
  }
}
