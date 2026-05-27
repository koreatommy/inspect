import type { DatasetInspectionStats } from "@/components/dashboard/dataset-inspection-breakdown"
import {
  countIncompleteFacilitiesForDataset,
  type FacilityDatasetMembershipRow,
  type MonthlyInspectionStatusRow,
} from "@/lib/facilities/monthly-status"

type InspectionStatusRow = {
  dataset_id: string | null
  status: string
}

/** 이번 달(또는 지정 월) 점검 행을 데이터셋별 상태 건수로 집계 */
export function groupInspectionsByDataset(
  rows: InspectionStatusRow[],
  datasetNameById: Map<string, string>,
  memberships: ReadonlyArray<FacilityDatasetMembershipRow>,
  monthlyInspections: ReadonlyArray<MonthlyInspectionStatusRow>,
): DatasetInspectionStats[] {
  const byDataset = new Map<
    string,
    { draft: number; completed: number }
  >()

  for (const row of rows) {
    if (!row.dataset_id) continue
    const bucket = byDataset.get(row.dataset_id) ?? {
      draft: 0,
      completed: 0,
    }
    if (row.status === "draft") bucket.draft += 1
    else if (row.status === "completed" || row.status === "locked") {
      bucket.completed += 1
    }
    byDataset.set(row.dataset_id, bucket)
  }

  return [...byDataset.entries()]
    .map(([datasetId, counts]) => ({
      datasetId,
      datasetName: datasetNameById.get(datasetId) ?? "알 수 없음",
      draftCount: counts.draft,
      completedCount: counts.completed,
      incompleteFacilityCount: countIncompleteFacilitiesForDataset(
        datasetId,
        memberships,
        monthlyInspections,
      ),
    }))
    .sort((a, b) => a.datasetName.localeCompare(b.datasetName, "ko"))
}
