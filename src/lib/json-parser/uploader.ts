import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import { chunk, mapWithConcurrency } from "@/lib/utils/concurrency"
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

export type UploadProgress = {
  phase:
    | "validating"
    | "prefetching"
    | "facilities"
    | "equipment"
    | "memberships"
    | "related"
    | "cleanup"
    | "done"
    | "error"
  current: number
  total: number
  message: string
  result?: UploadResult
}

export type UploadOptionsWithProgress = UploadOptions & {
  onProgress?: (progress: UploadProgress) => void
}

const BATCH_SIZE = 50
const CONCURRENCY = 5

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

type ValidatedItem = {
  index: number
  data: FacilityJson
}

type PrefetchResult = {
  existingFacilitySet: Set<string>
  existingEquipmentMap: Map<string, Set<string>>
  existingMembershipMap: Map<string, boolean>
}

async function prefetchExistingData(
  supabase: SupabaseClient<Database>,
  facilityNos: string[],
  datasetId: string,
): Promise<PrefetchResult> {
  if (facilityNos.length === 0) {
    return {
      existingFacilitySet: new Set(),
      existingEquipmentMap: new Map(),
      existingMembershipMap: new Map(),
    }
  }

  const [facilitiesResult, equipmentResult, membershipsResult] =
    await Promise.all([
      supabase
        .from("facilities")
        .select("facility_no")
        .in("facility_no", facilityNos),
      supabase
        .from("equipment")
        .select("facility_no, equipment_no")
        .in("facility_no", facilityNos),
      supabase
        .from("facility_dataset_memberships")
        .select("facility_no, is_active")
        .eq("dataset_id", datasetId)
        .in("facility_no", facilityNos),
    ])

  const existingFacilitySet = new Set(
    (facilitiesResult.data ?? []).map((f) => f.facility_no),
  )

  const existingEquipmentMap = new Map<string, Set<string>>()
  for (const eq of equipmentResult.data ?? []) {
    if (!existingEquipmentMap.has(eq.facility_no)) {
      existingEquipmentMap.set(eq.facility_no, new Set())
    }
    existingEquipmentMap.get(eq.facility_no)!.add(eq.equipment_no)
  }

  const existingMembershipMap = new Map(
    (membershipsResult.data ?? []).map((m) => [m.facility_no, m.is_active]),
  )

  return { existingFacilitySet, existingEquipmentMap, existingMembershipMap }
}

export async function uploadFacilityJsonWithProgress(
  supabase: SupabaseClient<Database>,
  input: unknown,
  options: UploadOptionsWithProgress,
): Promise<UploadResult> {
  const { datasetId, sourceFile = null, uploadedBy = null, onProgress } = options
  const result = emptyResult(datasetId)

  const emit = (
    phase: UploadProgress["phase"],
    current: number,
    total: number,
    message: string,
  ) => {
    onProgress?.({ phase, current, total, message })
  }

  // Phase 1: 검증 단계 (DB 작업 없음)
  emit("validating", 0, 0, "JSON 검증 중...")
  const payload = normalizeFacilityPayload(input)
  const validatedItems: ValidatedItem[] = []

  for (const [index, item] of payload.entries()) {
    const validated = validateFacilityJson(item)
    if (validated.ok) {
      validatedItems.push({ index, data: validated.data })
    } else {
      result.failed += 1
      result.failures.push({ index, reason: validated.reason })
    }
  }

  const total = validatedItems.length
  result.total = payload.length

  if (total === 0) {
    emit("done", 0, 0, "처리할 시설이 없습니다")
    return result
  }

  const facilityNosInJson = new Set(validatedItems.map((v) => v.data.basic.pfctSn))

  // Phase 2: 사전 조회
  emit("prefetching", 0, total, "기존 데이터 조회 중...")
  const { existingFacilitySet, existingEquipmentMap, existingMembershipMap } =
    await prefetchExistingData(supabase, [...facilityNosInJson], datasetId)

  // Phase 3: 시설 배치 upsert
  const facilityRows = validatedItems.map((v) => mapFacility(v.data))
  const facilityBatches = chunk(facilityRows, BATCH_SIZE)
  let processedFacilities = 0

  for (const batch of facilityBatches) {
    const { error } = await supabase.from("facilities").upsert(batch, {
      onConflict: "facility_no",
    })
    if (error) {
      for (const row of batch) {
        result.failures.push({
          index: -1,
          facilityNo: row.facility_no,
          reason: `시설 upsert 실패: ${error.message}`,
        })
      }
    }
    processedFacilities += batch.length
    emit(
      "facilities",
      processedFacilities,
      total,
      `시설 ${processedFacilities}/${total}`,
    )
  }

  // 시설 카운팅
  for (const row of facilityRows) {
    if (existingFacilitySet.has(row.facility_no)) {
      result.updatedFacilities += 1
    } else {
      result.newFacilities += 1
    }
  }

  // Phase 4: 기구 배치 upsert
  emit("equipment", 0, total, "기구 처리 중...")
  const allEquipmentRows = validatedItems.flatMap((v) => mapEquipment(v.data))
  const incomingEquipmentMap = new Map<string, Set<string>>()
  for (const eq of allEquipmentRows) {
    if (!incomingEquipmentMap.has(eq.facility_no)) {
      incomingEquipmentMap.set(eq.facility_no, new Set())
    }
    incomingEquipmentMap.get(eq.facility_no)!.add(eq.equipment_no)
  }

  if (allEquipmentRows.length > 0) {
    const equipmentBatches = chunk(allEquipmentRows, BATCH_SIZE)
    for (const batch of equipmentBatches) {
      const { error } = await supabase.from("equipment").upsert(batch, {
        onConflict: "facility_no,equipment_no",
      })
      if (error) {
        result.failures.push({
          index: -1,
          reason: `기구 upsert 실패: ${error.message}`,
        })
      }
    }
  }

  // 기구 카운팅
  for (const eq of allEquipmentRows) {
    const existingNos = existingEquipmentMap.get(eq.facility_no)
    if (existingNos?.has(eq.equipment_no)) {
      result.updatedEquipment += 1
    } else {
      result.newEquipment += 1
    }
  }

  // Phase 5: 멤버십 배치 upsert
  emit("memberships", 0, total, "멤버십 처리 중...")
  const membershipRows = validatedItems.map((v) => ({
    facility_no: v.data.basic.pfctSn,
    dataset_id: datasetId,
    is_active: true,
  }))

  const membershipBatches = chunk(membershipRows, BATCH_SIZE)
  for (const batch of membershipBatches) {
    const { error } = await supabase
      .from("facility_dataset_memberships")
      .upsert(batch, { onConflict: "facility_no,dataset_id" })
    if (error) {
      result.failures.push({
        index: -1,
        reason: `멤버십 upsert 실패: ${error.message}`,
      })
    }
  }

  // 멤버십 카운팅
  for (const row of membershipRows) {
    const existingIsActive = existingMembershipMap.get(row.facility_no)
    if (existingIsActive === undefined) {
      result.newMemberships += 1
    } else if (existingIsActive) {
      result.retainedMemberships += 1
    } else {
      result.reactivatedMemberships += 1
    }
  }

  // Phase 6: 관련 정보 (시설 단위 + 병렬 처리)
  let relatedDone = 0
  await mapWithConcurrency(
    validatedItems,
    async (item) => {
      try {
        await syncRelatedSections(supabase, item.data)
      } catch (error) {
        result.failures.push({
          index: item.index,
          facilityNo: item.data.basic.pfctSn,
          reason:
            error instanceof Error
              ? `관련 정보 동기화 실패: ${error.message}`
              : "관련 정보 동기화 실패",
        })
      }
      relatedDone++
      emit("related", relatedDone, total, `관련 정보 ${relatedDone}/${total}`)
    },
    CONCURRENCY,
  )

  // Phase 7: 후처리
  emit("cleanup", 0, total, "정리 중...")

  // 기구 비활성화
  const toDeactivateEquipment: Array<{
    facility_no: string
    equipment_no: string
  }> = []
  for (const [facilityNo, existingNos] of existingEquipmentMap) {
    const incomingNos = incomingEquipmentMap.get(facilityNo) ?? new Set()
    for (const eqNo of existingNos) {
      if (!incomingNos.has(eqNo)) {
        toDeactivateEquipment.push({
          facility_no: facilityNo,
          equipment_no: eqNo,
        })
      }
    }
  }

  if (toDeactivateEquipment.length > 0) {
    const deactivateBatches = chunk(toDeactivateEquipment, BATCH_SIZE)
    for (const batch of deactivateBatches) {
      for (const { facility_no, equipment_no } of batch) {
        await supabase
          .from("equipment")
          .update({ is_active: false })
          .eq("facility_no", facility_no)
          .eq("equipment_no", equipment_no)
      }
    }
    result.deactivatedEquipment = toDeactivateEquipment.length
  }

  // 멤버십 비활성화
  try {
    const { deactivatedMemberships, affectedFacilityNos } =
      await deactivateMissingMemberships(supabase, datasetId, facilityNosInJson)
    result.deactivatedMemberships = deactivatedMemberships

    const { deactivatedFacilities, reactivatedFacilities } =
      await syncFacilitiesActiveFlag(
        supabase,
        [...facilityNosInJson],
        affectedFacilityNos,
      )
    result.deactivatedFacilities = deactivatedFacilities
    result.reactivatedFacilities = reactivatedFacilities
  } catch (error) {
    result.failures.push({
      index: -1,
      reason:
        error instanceof Error
          ? `멤버십 동기화 실패: ${error.message}`
          : "멤버십 동기화 실패",
    })
  }

  // 메타데이터 갱신
  try {
    await refreshDatasetMetadata(supabase, datasetId, sourceFile, uploadedBy)
  } catch (error) {
    result.failures.push({
      index: -1,
      reason:
        error instanceof Error
          ? `메타데이터 갱신 실패: ${error.message}`
          : "메타데이터 갱신 실패",
    })
  }

  result.success = total - result.failures.filter((f) => f.index >= 0).length
  emit("done", total, total, "완료")

  return result
}
