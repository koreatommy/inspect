"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requirePermission } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"

export async function deleteMonthlyInspection(formData: FormData) {
  await requirePermission("settings:inspection-history-manage", "/settings")

  const inspectionId = String(formData.get("inspectionId") ?? "").trim()

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      inspectionId
    )
  ) {
    redirect("/settings/inspection-history?error=invalid-id")
  }

  const supabase = await createClient()

  const { data: inspection } = await supabase
    .from("monthly_inspections")
    .select("facility_no")
    .eq("id", inspectionId)
    .maybeSingle()

  if (!inspection) {
    redirect("/settings/inspection-history?error=not-found")
  }

  const { error } = await supabase
    .from("monthly_inspections")
    .delete()
    .eq("id", inspectionId)

  if (error) {
    redirect("/settings/inspection-history?error=delete-failed")
  }

  revalidatePath("/")
  revalidatePath("/inspections/history")
  revalidatePath(`/facilities/${inspection.facility_no}`)
  revalidatePath("/settings/inspection-history")

  redirect("/settings/inspection-history?deleted=1")
}
