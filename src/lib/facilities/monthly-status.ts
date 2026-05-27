/** 월간점검 완료로 간주하는 status */
export function isMonthlyInspectionCompleted(status: string): boolean {
  return status === "completed" || status === "locked"
}

/**
 * 시설별·데이터셋별 월간점검 완료 여부.
 * 해당 시설이 속한(활성 멤버십) 각 데이터셋마다 완료 점검이 있어야 전체 완료.
 */
export function resolveFacilityMonthlyStatus(
  facilityNo: string,
  datasetIdsForFacility: Iterable<string>,
  inspections: ReadonlyArray<{
    facility_no: string
    dataset_id: string
    status: string
  }>,
): "완료" | "미완료" {
  const datasetIds = [...datasetIdsForFacility]
  if (datasetIds.length === 0) {
    return "미완료"
  }

  const byDataset = new Map<string, string>()
  for (const row of inspections) {
    if (row.facility_no === facilityNo) {
      byDataset.set(row.dataset_id, row.status)
    }
  }

  const allComplete = datasetIds.every((datasetId) =>
    isMonthlyInspectionCompleted(byDataset.get(datasetId) ?? ""),
  )
  return allComplete ? "완료" : "미완료"
}

export type MonthlyInspectionStatusRow = {
  facility_no: string
  dataset_id: string
  status: string
}

export type FacilityDatasetMembershipRow = {
  facility_no: string
  dataset_id: string
}

/** 활성 멤버십 목록 → 시설번호별 데이터셋 ID 목록 */
export function buildDatasetIdsByFacility(
  memberships: ReadonlyArray<FacilityDatasetMembershipRow>,
): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const row of memberships) {
    const list = map.get(row.facility_no) ?? []
    list.push(row.dataset_id)
    map.set(row.facility_no, list)
  }
  return map
}

/** 멤버십이 있는 시설 기준 월간점검 완료·미완료 시설 수 */
export function countFacilitiesByMonthlyStatus(
  memberships: ReadonlyArray<FacilityDatasetMembershipRow>,
  inspections: ReadonlyArray<MonthlyInspectionStatusRow>,
): { complete: number; incomplete: number } {
  const datasetIdsByFacility = buildDatasetIdsByFacility(memberships)
  let complete = 0
  let incomplete = 0

  for (const facilityNo of datasetIdsByFacility.keys()) {
    const status = resolveFacilityMonthlyStatus(
      facilityNo,
      datasetIdsByFacility.get(facilityNo) ?? [],
      inspections,
    )
    if (status === "완료") complete += 1
    else incomplete += 1
  }

  return { complete, incomplete }
}

/** 데이터셋별: 해당 데이터셋에서 월간점검이 완료되지 않은 시설 수 */
export function countIncompleteFacilitiesForDataset(
  datasetId: string,
  memberships: ReadonlyArray<FacilityDatasetMembershipRow>,
  inspections: ReadonlyArray<MonthlyInspectionStatusRow>,
): number {
  const facilityNos = [
    ...new Set(
      memberships
        .filter((m) => m.dataset_id === datasetId)
        .map((m) => m.facility_no),
    ),
  ]

  return facilityNos.filter((facilityNo) => {
    const row = inspections.find(
      (i) => i.facility_no === facilityNo && i.dataset_id === datasetId,
    )
    return !row || !isMonthlyInspectionCompleted(row.status)
  }).length
}

/** 점검 생성 링크용: 활성 멤버십 데이터셋이 정확히 1개일 때만 datasetId 부여 */
export function inspectionNewHref(
  facilityNo: string,
  datasetIdsForFacility: Iterable<string>,
): string {
  const ids = [...datasetIdsForFacility]
  const base = `/inspections/new?facilityNo=${encodeURIComponent(facilityNo)}`
  if (ids.length === 1) {
    return `${base}&datasetId=${encodeURIComponent(ids[0]!)}`
  }
  return base
}
