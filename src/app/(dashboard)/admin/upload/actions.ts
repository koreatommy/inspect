"use server"

import { revalidatePath } from "next/cache"

import { recordDatasetUpload } from "@/lib/dataset/audit-log"
import { uploadFacilityJson, type UploadResult } from "@/lib/json-parser/uploader"
import { getCurrentRole, getCurrentUser, hasRole } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"

export type UploadState = {
  result?: UploadResult
  datasetName?: string
  error?: string
  warning?: string
}

export type DatasetOption = {
  id: string
  name: string
  description: string | null
  facility_count: number
}

export async function uploadJsonAction(
  _previousState: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return { error: "업로드할 JSON 파일을 선택해 주세요." }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "JSON 파일은 최대 10MB까지 업로드할 수 있습니다." }
  }

  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    return { error: "JSON 파일만 업로드할 수 있습니다." }
  }

  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN"])) {
    return { error: "시설정보 업로드는 관리자만 사용할 수 있습니다." }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { error: "세션이 만료되었습니다. 다시 로그인해 주세요." }
  }

  const mode = formData.get("datasetMode")
  if (mode !== "existing" && mode !== "new") {
    return { error: "데이터셋 선택 방식이 올바르지 않습니다." }
  }

  const supabase = await createClient()

  let datasetId: string
  let datasetName: string

  if (mode === "new") {
    const nameRaw = formData.get("newDatasetName")
    const name =
      typeof nameRaw === "string" ? nameRaw.trim() : ""
    if (!name) {
      return { error: "신규 데이터셋 이름을 입력해 주세요." }
    }
    if (name.length > 80) {
      return { error: "데이터셋 이름은 80자 이내로 입력해 주세요." }
    }

    const descRaw = formData.get("newDatasetDescription")
    const description =
      typeof descRaw === "string" && descRaw.trim().length > 0
        ? descRaw.trim()
        : null

    const { data: created, error: insertError } = await supabase
      .from("facility_datasets")
      .insert({
        name,
        description,
        status: "active",
        uploaded_by: user.id,
        source_file: file.name,
      })
      .select("id,name")
      .single()

    if (insertError || !created) {
      return {
        error:
          insertError?.message ?? "데이터셋 생성 중 오류가 발생했습니다.",
      }
    }

    datasetId = created.id
    datasetName = created.name
  } else {
    const idRaw = formData.get("datasetId")
    if (typeof idRaw !== "string" || idRaw.length === 0) {
      return { error: "사용할 기존 데이터셋을 선택해 주세요." }
    }

    const { data: dataset, error: fetchError } = await supabase
      .from("facility_datasets")
      .select("id,name,status")
      .eq("id", idRaw)
      .maybeSingle()

    if (fetchError || !dataset) {
      return { error: "선택한 데이터셋을 찾을 수 없습니다." }
    }

    if (dataset.status !== "active") {
      return {
        error:
          "보관(archived) 상태의 데이터셋에는 업로드할 수 없습니다. 다른 데이터셋을 선택하거나 신규로 생성해 주세요.",
      }
    }

    datasetId = dataset.id
    datasetName = dataset.name
  }

  try {
    const text = await file.text()
    const payload = JSON.parse(text) as unknown
    const result = await uploadFacilityJson(supabase, payload, {
      datasetId,
      sourceFile: file.name,
      uploadedBy: user.id,
    })

    const auditWarning = await recordDatasetUpload(supabase, {
      datasetId,
      uploadedBy: user.id,
      sourceFile: file.name,
      result,
    })

    revalidatePath("/admin/upload")
    revalidatePath("/admin/datasets")
    revalidatePath("/facilities")
    revalidatePath("/")

    return {
      result,
      datasetName,
      warning: auditWarning ?? undefined,
    }
  } catch (error) {
    return {
      error:
        error instanceof SyntaxError
          ? "JSON 형식이 올바르지 않습니다."
          : "시설정보 업로드 중 오류가 발생했습니다.",
    }
  }
}

export async function listActiveDatasets(): Promise<DatasetOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("facility_datasets")
    .select("id,name,description,facility_count")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    facility_count: row.facility_count,
  }))
}
