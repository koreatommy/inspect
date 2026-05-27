"use server"

import { redirect } from "next/navigation"

import {
  getAccessibleDatasetIds,
  getCurrentRole,
  hasRole,
} from "@/lib/auth/helpers"
import { getKoreaDateParts } from "@/lib/date"
import { createClient } from "@/lib/supabase/server"

function currentMonth() {
  return getKoreaDateParts().month
}

function currentDate() {
  return getKoreaDateParts().date
}

export async function createMonthlyInspection(formData: FormData) {
  const facilityNo = String(formData.get("facilityNo") ?? "").trim()
  const datasetId = String(formData.get("datasetId") ?? "").trim()
  const inspectionMonth =
    String(formData.get("inspectionMonth") ?? "").trim() || currentMonth()
  const inspectionDate =
    String(formData.get("inspectionDate") ?? "").trim() || currentDate()

  if (!facilityNo) {
    redirect("/inspections/new?error=facility-required")
  }
  if (!datasetId) {
    redirect("/inspections/new?error=dataset-required")
  }

  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN", "MANAGER", "INSPECTOR"])) {
    redirect("/inspections/new?error=forbidden")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1) 사용자가 해당 데이터셋에 접근할 수 있는지 (active + 할당)
  const accessibleDatasetIds = await getAccessibleDatasetIds(user.id, role)
  if (!accessibleDatasetIds.includes(datasetId)) {
    redirect("/inspections/new?error=dataset-not-allowed")
  }

  // 2) 해당 시설이 데이터셋 활성 멤버십 + 글로벌 활성인지
  const { data: membership } = await supabase
    .from("facility_dataset_memberships")
    .select("id")
    .eq("facility_no", facilityNo)
    .eq("dataset_id", datasetId)
    .eq("is_active", true)
    .maybeSingle()

  if (!membership) {
    redirect(
      `/inspections/new?error=facility-not-in-dataset&facilityNo=${encodeURIComponent(facilityNo)}`,
    )
  }

  const { data: facilityRow } = await supabase
    .from("facilities")
    .select("is_active")
    .eq("facility_no", facilityNo)
    .maybeSingle()

  if (!facilityRow?.is_active) {
    redirect(
      `/inspections/new?error=facility-inactive&facilityNo=${encodeURIComponent(facilityNo)}`,
    )
  }

  // 3) 중복 검사 — (facility_no, inspection_month, dataset_id) 단위
  const { data: existing } = await supabase
    .from("monthly_inspections")
    .select("id,status")
    .eq("facility_no", facilityNo)
    .eq("inspection_month", inspectionMonth)
    .eq("dataset_id", datasetId)
    .maybeSingle()

  if (existing) {
    redirect(`/inspections/${existing.id}`)
  }

  const { data: equipment } = await supabase
    .from("equipment")
    .select(
      "equipment_no,equipment_name,equipment_type_name,equipment_subtype_name,equipment_location,certification_no",
    )
    .eq("facility_no", facilityNo)
    .eq("is_active", true)
    .order("equipment_name", { ascending: true })

  const { data: inspection, error } = await supabase
    .from("monthly_inspections")
    .insert({
      facility_no: facilityNo,
      inspection_month: inspectionMonth,
      inspection_date: inspectionDate,
      status: "draft",
      created_by: user.id,
      dataset_id: datasetId,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      const { data: raceExisting } = await supabase
        .from("monthly_inspections")
        .select("id")
        .eq("facility_no", facilityNo)
        .eq("inspection_month", inspectionMonth)
        .eq("dataset_id", datasetId)
        .maybeSingle()

      if (raceExisting) {
        redirect(`/inspections/${raceExisting.id}`)
      }
    }

    redirect(
      `/inspections/new?error=create-failed&facilityNo=${encodeURIComponent(facilityNo)}`,
    )
  }

  if (!inspection) {
    redirect(
      `/inspections/new?error=create-failed&facilityNo=${encodeURIComponent(facilityNo)}`,
    )
  }

  const items =
    equipment?.map((item, index) => ({
      inspection_id: inspection.id,
      facility_no: facilityNo,
      equipment_no: item.equipment_no,
      equipment_name: item.equipment_name,
      equipment_type_name: item.equipment_type_name,
      equipment_subtype_name: item.equipment_subtype_name,
      equipment_location: item.equipment_location,
      certification_no: item.certification_no,
      result_status: "GOOD",
      sort_order: index + 1,
    })) ?? []

  if (items.length > 0) {
    const { error: itemError } = await supabase
      .from("monthly_inspection_items")
      .insert(items)

    if (itemError) {
      await supabase
        .from("monthly_inspections")
        .delete()
        .eq("id", inspection.id)
      redirect(
        `/inspections/new?error=item-create-failed&facilityNo=${encodeURIComponent(facilityNo)}`,
      )
    }
  }

  redirect(`/inspections/${inspection.id}`)
}
