"use server"

import { revalidatePath } from "next/cache"

import { logDatasetAudit } from "@/lib/dataset/audit-log"
import { syncDatasetUserAssignments } from "@/lib/dataset/assignments"
import { getCurrentRole, getCurrentUser, hasRole } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"

export type DatasetListRow = {
  id: string
  name: string
  description: string | null
  facility_count: number
  status: "active" | "archived"
  source_file: string | null
  created_at: string
  updated_at: string
  assigned_user_count: number
}

export type DatasetDetail = DatasetListRow

export type DatasetMembershipRow = {
  facility_no: string
  is_active: boolean
  facility_name: string | null
  road_address: string | null
  lot_address: string | null
}

export type AssignableUserRow = {
  user_id: string
  display_name: string | null
  role: string
  organization: string
}

export type ArchiveToggleState = { error?: string; success?: string }
export type DatasetUserAssignmentsState = { error?: string; success?: string }

import { MEMBERSHIP_PAGE_SIZE } from "./constants"

export async function listAllDatasets(): Promise<DatasetListRow[]> {
  const supabase = await createClient()
  const { data: datasets, error } = await supabase
    .from("facility_datasets")
    .select(
      "id,name,description,facility_count,status,source_file,created_at,updated_at",
    )
    .order("created_at", { ascending: false })

  if (error || !datasets) {
    return []
  }

  const { data: assignmentCounts } = await supabase
    .from("user_dataset_assignments")
    .select("dataset_id")

  const countByDataset = new Map<string, number>()
  for (const row of assignmentCounts ?? []) {
    countByDataset.set(
      row.dataset_id,
      (countByDataset.get(row.dataset_id) ?? 0) + 1,
    )
  }

  return datasets.map((row) => ({
    ...row,
    assigned_user_count: countByDataset.get(row.id) ?? 0,
  }))
}

export async function getDatasetDetail(
  datasetId: string,
): Promise<DatasetDetail | null> {
  const supabase = await createClient()
  const { data: dataset, error } = await supabase
    .from("facility_datasets")
    .select(
      "id,name,description,facility_count,status,source_file,created_at,updated_at",
    )
    .eq("id", datasetId)
    .maybeSingle()

  if (error || !dataset) {
    return null
  }

  const { count: assignedUserCount } = await supabase
    .from("user_dataset_assignments")
    .select("*", { count: "exact", head: true })
    .eq("dataset_id", datasetId)

  return {
    ...dataset,
    assigned_user_count: assignedUserCount ?? 0,
  }
}

export async function listDatasetMemberships(
  datasetId: string,
  page: number,
  activeOnly = false,
): Promise<{ rows: DatasetMembershipRow[]; totalCount: number }> {
  const supabase = await createClient()
  const from = (page - 1) * MEMBERSHIP_PAGE_SIZE
  const to = from + MEMBERSHIP_PAGE_SIZE - 1

  let query = supabase
    .from("facility_dataset_memberships")
    .select("facility_no,is_active", { count: "exact" })
    .eq("dataset_id", datasetId)
    .order("facility_no", { ascending: true })
    .range(from, to)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data: memberships, count, error } = await query

  if (error || !memberships?.length) {
    return { rows: [], totalCount: count ?? 0 }
  }

  const facilityNos = memberships.map((m) => m.facility_no)
  const { data: facilities } = await supabase
    .from("facilities")
    .select("facility_no,facility_name,road_address,lot_address")
    .in("facility_no", facilityNos)

  const facilityByNo = new Map(
    (facilities ?? []).map((f) => [f.facility_no, f]),
  )

  const rows: DatasetMembershipRow[] = memberships.map((row) => {
    const facility = facilityByNo.get(row.facility_no)
    return {
      facility_no: row.facility_no,
      is_active: row.is_active,
      facility_name: facility?.facility_name ?? null,
      road_address: facility?.road_address ?? null,
      lot_address: facility?.lot_address ?? null,
    }
  })

  return { rows, totalCount: count ?? 0 }
}

export async function listAssignableUsers(): Promise<AssignableUserRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inspection_user_roles")
    .select("user_id,role,display_name,organization")
    .neq("role", "ADMIN")
    .order("display_name", { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map((row) => ({
    user_id: row.user_id,
    display_name: row.display_name,
    role: row.role,
    organization: row.organization,
  }))
}

export async function listAssignedUserIdsForDataset(
  datasetId: string,
): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_dataset_assignments")
    .select("user_id")
    .eq("dataset_id", datasetId)

  return (data ?? []).map((row) => row.user_id)
}

export async function toggleDatasetArchiveAction(
  _previous: ArchiveToggleState,
  formData: FormData,
): Promise<ArchiveToggleState> {
  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const datasetId = String(formData.get("datasetId") ?? "").trim()
  const nextStatus = String(formData.get("nextStatus") ?? "").trim()

  if (!datasetId) {
    return { error: "데이터셋을 지정해 주세요." }
  }
  if (nextStatus !== "active" && nextStatus !== "archived") {
    return { error: "상태 값이 올바르지 않습니다." }
  }

  const supabase = await createClient()
  const { data: current, error: fetchError } = await supabase
    .from("facility_datasets")
    .select("id,name,status")
    .eq("id", datasetId)
    .maybeSingle()

  if (fetchError || !current) {
    return { error: "데이터셋을 찾을 수 없습니다." }
  }

  if (current.status === nextStatus) {
    return { success: "이미 해당 상태입니다." }
  }

  const { error: updateError } = await supabase
    .from("facility_datasets")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", datasetId)

  if (updateError) {
    return { error: "상태 변경에 실패했습니다." }
  }

  const actor = await getCurrentUser()
  if (actor) {
    await logDatasetAudit(supabase, {
      datasetId,
      actorId: actor.id,
      action: nextStatus === "archived" ? "archive" : "activate",
      details: {
        datasetName: current.name,
        previousStatus: current.status,
        nextStatus,
      },
    })
  }

  revalidatePath("/admin/datasets")
  revalidatePath(`/admin/datasets/${datasetId}`)
  revalidatePath("/admin/upload")
  revalidatePath("/settings/users")

  return {
    success:
      nextStatus === "archived"
        ? `"${current.name}" 데이터셋을 보관 처리했습니다.`
        : `"${current.name}" 데이터셋을 활성화했습니다.`,
  }
}

export async function updateDatasetUserAssignmentsAction(
  _previous: DatasetUserAssignmentsState,
  formData: FormData,
): Promise<DatasetUserAssignmentsState> {
  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN"])) {
    return { error: "관리자만 사용할 수 있습니다." }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { error: "로그인이 필요합니다." }
  }

  const datasetId = String(formData.get("datasetId") ?? "").trim()
  if (!datasetId) {
    return { error: "데이터셋을 지정해 주세요." }
  }

  const requestedUserIds = formData
    .getAll("userId")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0)

  const supabase = await createClient()

  const { data: dataset, error: datasetError } = await supabase
    .from("facility_datasets")
    .select("id,name,status")
    .eq("id", datasetId)
    .maybeSingle()

  if (datasetError || !dataset) {
    return { error: "데이터셋을 찾을 수 없습니다." }
  }

  if (dataset.status !== "active" && requestedUserIds.length > 0) {
    return {
      error:
        "보관(archived)된 데이터셋에는 사용자를 새로 할당할 수 없습니다. 활성화 후 시도해 주세요.",
    }
  }

  if (requestedUserIds.length > 0) {
    const { data: roles, error: rolesError } = await supabase
      .from("inspection_user_roles")
      .select("user_id,role")
      .in("user_id", requestedUserIds)

    if (rolesError) {
      return { error: "사용자 검증 중 오류가 발생했습니다." }
    }

    const adminIds = (roles ?? [])
      .filter((r) => r.role === "ADMIN")
      .map((r) => r.user_id)
    if (adminIds.length > 0) {
      return { error: "ADMIN 사용자는 데이터셋 할당 대상이 아닙니다." }
    }
  }

  try {
    const syncResult = await syncDatasetUserAssignments(
      supabase,
      datasetId,
      requestedUserIds,
      user.id,
    )

    await logDatasetAudit(supabase, {
      datasetId,
      actorId: user.id,
      action: "user_assignments_sync",
      details: {
        scope: "dataset",
        datasetName: dataset.name,
        requestedUserIds,
        inserted: syncResult.inserted,
        deleted: syncResult.deleted,
      },
    })

    revalidatePath(`/admin/datasets/${datasetId}`)
    revalidatePath("/admin/datasets")
    revalidatePath("/settings/users")

    return { success: "사용자 할당을 저장했습니다." }
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "할당 저장에 실패했습니다.",
    }
  }
}
