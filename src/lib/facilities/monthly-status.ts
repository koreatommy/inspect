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
