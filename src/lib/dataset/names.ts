import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

/** 드롭다운 등: 이름 끝에 이미 (N) 또는 (N 시설)이 있으면 name만 표시 */
export function formatDatasetOptionLabel(
  name: string,
  facilityCount: number,
): string {
  const trimmed = name.trim()
  if (new RegExp(`\\(${facilityCount}\\s*시설?\\)\\s*$`).test(trimmed)) {
    return trimmed
  }
  if (trimmed.endsWith(`(${facilityCount})`)) {
    return trimmed
  }
  return `${trimmed} (${facilityCount} 시설)`
}

/** facility_datasets.id → name 맵 (빈 입력 시 빈 Map) */
export async function fetchDatasetNameMap(
  supabase: SupabaseClient<Database>,
  datasetIds: Iterable<string | null | undefined>,
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(
      [...datasetIds].filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ]
  if (unique.length === 0) return new Map()

  const { data, error } = await supabase
    .from("facility_datasets")
    .select("id,name")
    .in("id", unique)

  if (error) {
    console.error("[fetchDatasetNameMap] query failed", error)
    return new Map()
  }

  return new Map((data ?? []).map((row) => [row.id, row.name]))
}
