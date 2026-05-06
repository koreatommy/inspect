import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { mapEquipment, mapFacility, mapRelatedFacilitySections } from "./mapper"
import {
  normalizeFacilityPayload,
  validateFacilityJson,
  type FacilityJson,
} from "./validator"

export type UploadFailure = {
  index: number
  facilityNo?: string
  reason: string
}

export type UploadResult = {
  total: number
  success: number
  failed: number
  newFacilities: number
  updatedFacilities: number
  newEquipment: number
  updatedEquipment: number
  deactivatedEquipment: number
  failures: UploadFailure[]
}

const emptyResult = (): UploadResult => ({
  total: 0,
  success: 0,
  failed: 0,
  newFacilities: 0,
  updatedFacilities: 0,
  newEquipment: 0,
  updatedEquipment: 0,
  deactivatedEquipment: 0,
  failures: [],
})

async function syncRelatedSections(
  supabase: SupabaseClient<Database>,
  json: FacilityJson
) {
  const facilityNo = json.basic.pfctSn
  const related = mapRelatedFacilitySections(json)

  await Promise.all([
    supabase
      .from("facility_legal_inspections")
      .delete()
      .eq("facility_no", facilityNo),
    supabase.from("safety_educations").delete().eq("facility_no", facilityNo),
    supabase
      .from("liability_insurances")
      .delete()
      .eq("facility_no", facilityNo),
    supabase.from("facility_managers").delete().eq("facility_no", facilityNo),
  ])

  const insertResults = await Promise.all([
    related.legalInspection
      ? supabase.from("facility_legal_inspections").insert(related.legalInspection)
      : Promise.resolve({ error: null }),
    related.safetyEducation
      ? supabase.from("safety_educations").insert(related.safetyEducation)
      : Promise.resolve({ error: null }),
    related.liabilityInsurance
      ? supabase.from("liability_insurances").insert(related.liabilityInsurance)
      : Promise.resolve({ error: null }),
    related.facilityManager
      ? supabase.from("facility_managers").insert(related.facilityManager)
      : Promise.resolve({ error: null }),
  ])

  const errors = insertResults
    .map((result) => result.error)
    .filter((error): error is NonNullable<typeof error> => error !== null)

  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join(", "))
  }
}

async function syncEquipment(
  supabase: SupabaseClient<Database>,
  json: FacilityJson,
  result: UploadResult
) {
  const facilityNo = json.basic.pfctSn
  const equipmentRows = mapEquipment(json)
  const incomingEquipmentNos = new Set(
    equipmentRows.map((equipment) => equipment.equipment_no)
  )

  const { data: existingEquipment } = await supabase
    .from("equipment")
    .select("equipment_no")
    .eq("facility_no", facilityNo)

  const existingNos = new Set(
    existingEquipment?.map((equipment) => equipment.equipment_no) ?? []
  )

  if (equipmentRows.length > 0) {
    const { error } = await supabase.from("equipment").upsert(equipmentRows, {
      onConflict: "facility_no,equipment_no",
    })

    if (error) {
      throw error
    }
  }

  for (const equipment of equipmentRows) {
    if (existingNos.has(equipment.equipment_no)) {
      result.updatedEquipment += 1
    } else {
      result.newEquipment += 1
    }
  }

  const missingEquipmentNos = [...existingNos].filter(
    (equipmentNo) => !incomingEquipmentNos.has(equipmentNo)
  )

  for (const equipmentNo of missingEquipmentNos) {
    const { error } = await supabase
      .from("equipment")
      .update({ is_active: false })
      .eq("facility_no", facilityNo)
      .eq("equipment_no", equipmentNo)

    if (error) {
      throw error
    }

    result.deactivatedEquipment += 1
  }
}

async function uploadFacility(
  supabase: SupabaseClient<Database>,
  json: FacilityJson,
  result: UploadResult
) {
  const facilityNo = json.basic.pfctSn

  const { data: existingFacility } = await supabase
    .from("facilities")
    .select("facility_no")
    .eq("facility_no", facilityNo)
    .maybeSingle()

  const { error } = await supabase.from("facilities").upsert(mapFacility(json), {
    onConflict: "facility_no",
  })

  if (error) {
    throw error
  }

  if (existingFacility) {
    result.updatedFacilities += 1
  } else {
    result.newFacilities += 1
  }

  await syncEquipment(supabase, json, result)
  await syncRelatedSections(supabase, json)
}

export async function uploadFacilityJson(
  supabase: SupabaseClient<Database>,
  input: unknown
) {
  const result = emptyResult()
  const payload = normalizeFacilityPayload(input)
  result.total = payload.length

  for (const [index, item] of payload.entries()) {
    const validated = validateFacilityJson(item)

    if (!validated.ok) {
      result.failed += 1
      result.failures.push({ index, reason: validated.reason })
      continue
    }

    try {
      await uploadFacility(supabase, validated.data, result)
      result.success += 1
    } catch (error) {
      result.failed += 1
      result.failures.push({
        index,
        facilityNo: validated.data.basic.pfctSn,
        reason: error instanceof Error ? error.message : "업로드 실패",
      })
    }
  }

  return result
}
