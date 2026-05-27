import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

type MembershipUpsertCounters = {
  newMemberships: number
  reactivatedMemberships: number
  retainedMemberships: number
}

/**
 * 시설을 해당 데이터셋의 멤버십에 활성 상태로 upsert한다.
 * 호출자는 시설별로 한 번씩 호출한다. (uploadFacility 단위)
 */
export async function upsertActiveMembership(
  supabase: SupabaseClient<Database>,
  facilityNo: string,
  datasetId: string,
  counters: MembershipUpsertCounters,
) {
  const { data: existing } = await supabase
    .from("facility_dataset_memberships")
    .select("id,is_active")
    .eq("facility_no", facilityNo)
    .eq("dataset_id", datasetId)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase
      .from("facility_dataset_memberships")
      .insert({
        facility_no: facilityNo,
        dataset_id: datasetId,
        is_active: true,
      })
    if (error) throw error
    counters.newMemberships += 1
    return
  }

  if (existing.is_active) {
    counters.retainedMemberships += 1
    return
  }

  const { error } = await supabase
    .from("facility_dataset_memberships")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
  if (error) throw error
  counters.reactivatedMemberships += 1
}

type DeactivationResult = {
  deactivatedMemberships: number
  affectedFacilityNos: string[]
}

/**
 * 업로드 JSON에 포함되지 않은 동일 데이터셋의 활성 멤버십을 비활성한다.
 * 비활성된 시설들의 facility_no를 반환하여 후속 글로벌 보정에 사용한다.
 */
export async function deactivateMissingMemberships(
  supabase: SupabaseClient<Database>,
  datasetId: string,
  uploadedFacilityNos: Set<string>,
): Promise<DeactivationResult> {
  const { data: currentActive, error: selectError } = await supabase
    .from("facility_dataset_memberships")
    .select("facility_no")
    .eq("dataset_id", datasetId)
    .eq("is_active", true)
  if (selectError) throw selectError

  const toDeactivate = (currentActive ?? [])
    .map((row) => row.facility_no)
    .filter((facilityNo) => !uploadedFacilityNos.has(facilityNo))

  if (toDeactivate.length === 0) {
    return { deactivatedMemberships: 0, affectedFacilityNos: [] }
  }

  const { error: updateError } = await supabase
    .from("facility_dataset_memberships")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("dataset_id", datasetId)
    .in("facility_no", toDeactivate)
  if (updateError) throw updateError

  return {
    deactivatedMemberships: toDeactivate.length,
    affectedFacilityNos: toDeactivate,
  }
}

type FacilityActiveSyncResult = {
  deactivatedFacilities: number
  reactivatedFacilities: number
}

/**
 * 영향받은 facility_no들의 글로벌 facilities.is_active를
 * "활성 멤버십 합집합이 1건 이상이면 true, 아니면 false"로 보정한다.
 *
 * uploadedFacilityNos는 항상 활성 멤버십을 갖게 되므로 true로 세팅,
 * deactivatedFacilityNos는 멤버십 합집합을 다시 계산해 결정한다.
 */
export async function syncFacilitiesActiveFlag(
  supabase: SupabaseClient<Database>,
  uploadedFacilityNos: string[],
  deactivatedFacilityNos: string[],
): Promise<FacilityActiveSyncResult> {
  const result: FacilityActiveSyncResult = {
    deactivatedFacilities: 0,
    reactivatedFacilities: 0,
  }

  // 1) 업로드된 시설은 항상 활성: 현재 상태가 false였던 것만 true로 갱신하여 카운트.
  if (uploadedFacilityNos.length > 0) {
    const { data: inactiveAmongUploaded } = await supabase
      .from("facilities")
      .select("facility_no")
      .in("facility_no", uploadedFacilityNos)
      .eq("is_active", false)

    const toReactivate = (inactiveAmongUploaded ?? []).map((r) => r.facility_no)
    if (toReactivate.length > 0) {
      const { error } = await supabase
        .from("facilities")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .in("facility_no", toReactivate)
      if (error) throw error
      result.reactivatedFacilities = toReactivate.length
    }
  }

  // 2) 멤버십이 비활성된 시설은 다른 데이터셋에 활성 멤버십이 남아있는지 확인.
  if (deactivatedFacilityNos.length === 0) {
    return result
  }

  const { data: stillActive, error: aliveError } = await supabase
    .from("facility_dataset_memberships")
    .select("facility_no")
    .in("facility_no", deactivatedFacilityNos)
    .eq("is_active", true)
  if (aliveError) throw aliveError

  const aliveSet = new Set((stillActive ?? []).map((r) => r.facility_no))
  const toDeactivate = deactivatedFacilityNos.filter((fno) => !aliveSet.has(fno))

  if (toDeactivate.length === 0) {
    return result
  }

  const { error: deactivateError } = await supabase
    .from("facilities")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in("facility_no", toDeactivate)
  if (deactivateError) throw deactivateError

  result.deactivatedFacilities = toDeactivate.length
  return result
}

/**
 * 업로드 마무리 단계에서 facility_datasets 메타데이터(facility_count, source_file,
 * uploaded_by, updated_at)를 갱신한다.
 */
export async function refreshDatasetMetadata(
  supabase: SupabaseClient<Database>,
  datasetId: string,
  sourceFile: string | null,
  uploadedBy: string | null,
) {
  const { count, error: countError } = await supabase
    .from("facility_dataset_memberships")
    .select("id", { count: "exact", head: true })
    .eq("dataset_id", datasetId)
    .eq("is_active", true)
  if (countError) throw countError

  const { error: updateError } = await supabase
    .from("facility_datasets")
    .update({
      facility_count: count ?? 0,
      source_file: sourceFile,
      uploaded_by: uploadedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", datasetId)
  if (updateError) throw updateError
}
