import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { mapEquipment, mapFacility, mapRelatedFacilitySections } from "./mapper"
import {
  deactivateMissingMemberships,
  refreshDatasetMetadata,
  syncFacilitiesActiveFlag,
  upsertActiveMembership,
} from "./membership-sync"
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
  datasetId: string
  newFacilities: number
  updatedFacilities: number
  newEquipment: number
  updatedEquipment: number
  deactivatedEquipment: number
  newMemberships: number
  reactivatedMemberships: number
  retainedMemberships: number
  deactivatedMemberships: number
  deactivatedFacilities: number
  reactivatedFacilities: number
  failures: UploadFailure[]
}

export type UploadOptions = {
  datasetId: string
  sourceFile?: string | null
  uploadedBy?: string | null
}

const emptyResult = (datasetId: string): UploadResult => ({
  total: 0,
  success: 0,
  failed: 0,
  datasetId,
  newFacilities: 0,
  updatedFacilities: 0,
  newEquipment: 0,
  updatedEquipment: 0,
  deactivatedEquipment: 0,
  newMemberships: 0,
  reactivatedMemberships: 0,
  retainedMemberships: 0,
  deactivatedMemberships: 0,
  deactivatedFacilities: 0,
  reactivatedFacilities: 0,
  failures: [],
})

async function syncRelatedSections(
  supabase: SupabaseClient<Database>,
  json: FacilityJson,
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
  result: UploadResult,
) {
  const facilityNo = json.basic.pfctSn
  const equipmentRows = mapEquipment(json)
  const incomingEquipmentNos = new Set(
    equipmentRows.map((equipment) => equipment.equipment_no),
  )

  const { data: existingEquipment } = await supabase
    .from("equipment")
    .select("equipment_no")
    .eq("facility_no", facilityNo)

  const existingNos = new Set(
    existingEquipment?.map((equipment) => equipment.equipment_no) ?? [],
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
    (equipmentNo) => !incomingEquipmentNos.has(equipmentNo),
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
  datasetId: string,
  result: UploadResult,
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

  // 데이터셋 멤버십을 활성으로 upsert. (Phase 3 핵심 추가)
  await upsertActiveMembership(supabase, facilityNo, datasetId, result)

  await syncEquipment(supabase, json, result)
  await syncRelatedSections(supabase, json)
}

export async function uploadFacilityJson(
  supabase: SupabaseClient<Database>,
  input: unknown,
  options: UploadOptions,
): Promise<UploadResult> {
  const { datasetId, sourceFile = null, uploadedBy = null } = options
  const result = emptyResult(datasetId)
  const payload = normalizeFacilityPayload(input)
  result.total = payload.length

  // 멤버십 동기화: JSON에 포함된 시설(검증 통과) 기준. 업로드 실패 시설은 비활성 대상에서 제외.
  const successfullyUploadedFacilityNos = new Set<string>()
  const facilityNosInJson = new Set<string>()

  for (const [index, item] of payload.entries()) {
    const validated = validateFacilityJson(item)

    if (!validated.ok) {
      result.failed += 1
      result.failures.push({ index, reason: validated.reason })
      continue
    }

    facilityNosInJson.add(validated.data.basic.pfctSn)

    try {
      await uploadFacility(supabase, validated.data, datasetId, result)
      successfullyUploadedFacilityNos.add(validated.data.basic.pfctSn)
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

  // 후처리: 동기화·보정·메타 갱신. 일부 실패가 있어도 성공한 시설 기준으로 진행한다.
  try {
    const { deactivatedMemberships, affectedFacilityNos } =
      await deactivateMissingMemberships(
        supabase,
        datasetId,
        facilityNosInJson,
      )
    result.deactivatedMemberships = deactivatedMemberships

    const { deactivatedFacilities, reactivatedFacilities } =
      await syncFacilitiesActiveFlag(
        supabase,
        [...successfullyUploadedFacilityNos],
        affectedFacilityNos,
      )
    result.deactivatedFacilities = deactivatedFacilities
    result.reactivatedFacilities = reactivatedFacilities

    await refreshDatasetMetadata(supabase, datasetId, sourceFile, uploadedBy)
  } catch (error) {
    result.failures.push({
      index: -1,
      reason:
        error instanceof Error
          ? `데이터셋 동기화 후처리 실패: ${error.message}`
          : "데이터셋 동기화 후처리 실패",
    })
  }

  return result
}
