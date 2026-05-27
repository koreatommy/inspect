import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database"

export type SyncAssignmentsResult = {
  inserted: number
  deleted: number
}

/** 데이터셋 기준: 할당된 user_id 목록을 교체한다. */
export async function syncDatasetUserAssignments(
  supabase: SupabaseClient<Database>,
  datasetId: string,
  requestedUserIds: string[],
  assignedBy: string,
): Promise<SyncAssignmentsResult> {
  const { data: existing, error: fetchError } = await supabase
    .from("user_dataset_assignments")
    .select("user_id")
    .eq("dataset_id", datasetId)

  if (fetchError) {
    throw new Error("기존 할당 조회에 실패했습니다.")
  }

  const existingIds = new Set((existing ?? []).map((row) => row.user_id))
  const requestedIds = new Set(requestedUserIds)

  const toInsert = [...requestedIds].filter((id) => !existingIds.has(id))
  const toDelete = [...existingIds].filter((id) => !requestedIds.has(id))

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("user_dataset_assignments")
      .insert(
        toInsert.map((userId) => ({
          user_id: userId,
          dataset_id: datasetId,
          assigned_by: assignedBy,
        })),
      )

    if (insertError) {
      throw new Error("할당 추가에 실패했습니다.")
    }
  }

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_dataset_assignments")
      .delete()
      .eq("dataset_id", datasetId)
      .in("user_id", toDelete)

    if (deleteError) {
      throw new Error("할당 해제에 실패했습니다.")
    }
  }

  return { inserted: toInsert.length, deleted: toDelete.length }
}

/** 사용자 기준: 할당된 dataset_id 목록을 교체한다. */
export async function syncUserDatasetAssignments(
  supabase: SupabaseClient<Database>,
  userId: string,
  requestedDatasetIds: string[],
  assignedBy: string,
): Promise<SyncAssignmentsResult> {
  const { data: existing, error: fetchError } = await supabase
    .from("user_dataset_assignments")
    .select("dataset_id")
    .eq("user_id", userId)

  if (fetchError) {
    throw new Error("기존 할당 조회에 실패했습니다.")
  }

  const existingIds = new Set((existing ?? []).map((row) => row.dataset_id))
  const requestedIds = new Set(requestedDatasetIds)

  const toInsert = [...requestedIds].filter((id) => !existingIds.has(id))
  const toDelete = [...existingIds].filter((id) => !requestedIds.has(id))

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("user_dataset_assignments")
      .insert(
        toInsert.map((datasetId) => ({
          user_id: userId,
          dataset_id: datasetId,
          assigned_by: assignedBy,
        })),
      )

    if (insertError) {
      throw new Error("데이터셋 할당에 실패했습니다.")
    }
  }

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("user_dataset_assignments")
      .delete()
      .eq("user_id", userId)
      .in("dataset_id", toDelete)

    if (deleteError) {
      throw new Error("데이터셋 할당 해제에 실패했습니다.")
    }
  }

  return { inserted: toInsert.length, deleted: toDelete.length }
}
