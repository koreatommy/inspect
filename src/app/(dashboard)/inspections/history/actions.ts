"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"

export async function deleteMonthlyInspectionFromHistory(formData: FormData) {
  await requirePermission("settings:inspection-history-manage", "/inspections/history")

  const inspectionId = String(formData.get("inspectionId") ?? "").trim()

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      inspectionId
    )
  ) {
    redirect("/inspections/history?error=invalid-id")
  }

  const supabase = await createClient()

  const { data: deletedInspection, error } = await supabase
    .from("monthly_inspections")
    .delete()
    .eq("id", inspectionId)
    .select("facility_no")
    .maybeSingle()

  if (error) {
    redirect("/inspections/history?error=delete-failed")
  }

  if (!deletedInspection) {
    redirect("/inspections/history?error=not-found")
  }

  revalidatePath("/inspections/history")
  revalidatePath(`/facilities/${deletedInspection.facility_no}`)

  redirect("/inspections/history?deleted=1")
}
