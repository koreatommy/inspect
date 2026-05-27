import type { SupabaseClient } from "@supabase/supabase-js"

import type { UploadResult } from "@/lib/json-parser/uploader"
import type { Database, Json } from "@/types/database"

export type DatasetAuditAction =
  | "upload"
  | "archive"
  | "activate"
  | "user_assignments_sync"

type AuditClient = SupabaseClient<Database>

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json
}

/** 업로드 실행 이력 + 감사 로그 (실패해도 업로드 결과는 유지). 경고 문구 반환. */
export async function recordDatasetUpload(
  supabase: AuditClient,
  params: {
    datasetId: string
    uploadedBy: string
    sourceFile: string | null
    result: UploadResult
  },
): Promise<string | null> {
  const { datasetId, uploadedBy, sourceFile, result } = params
  const summary = {
    newFacilities: result.newFacilities,
    updatedFacilities: result.updatedFacilities,
    newEquipment: result.newEquipment,
    updatedEquipment: result.updatedEquipment,
    deactivatedEquipment: result.deactivatedEquipment,
    newMemberships: result.newMemberships,
    reactivatedMemberships: result.reactivatedMemberships,
    retainedMemberships: result.retainedMemberships,
    deactivatedMemberships: result.deactivatedMemberships,
    deactivatedFacilities: result.deactivatedFacilities,
    reactivatedFacilities: result.reactivatedFacilities,
    failureCount: result.failures.length,
  }

  const { error: uploadError } = await supabase
    .from("facility_dataset_uploads")
    .insert({
      dataset_id: datasetId,
      source_file: sourceFile,
      uploaded_by: uploadedBy,
      total_count: result.total,
      success_count: result.success,
      failed_count: result.failed,
      result_summary: toJson(summary),
    })

  const warnings: string[] = []

  if (uploadError) {
    console.error("[recordDatasetUpload] upload history insert failed", uploadError)
    warnings.push("업로드 이력 기록에 실패했습니다.")
  }

  const auditWarning = await logDatasetAudit(supabase, {
    datasetId,
    actorId: uploadedBy,
    action: "upload",
    details: {
      sourceFile,
      total: result.total,
      success: result.success,
      failed: result.failed,
      summary,
    },
  })
  if (auditWarning) warnings.push(auditWarning)

  return warnings.length > 0 ? warnings.join(" ") : null
}

export async function logDatasetAudit(
  supabase: AuditClient,
  params: {
    datasetId: string | null
    actorId: string
    action: DatasetAuditAction
    details: Record<string, unknown>
  },
): Promise<string | null> {
  const { error } = await supabase.from("dataset_audit_log").insert({
    dataset_id: params.datasetId,
    actor_id: params.actorId,
    action: params.action,
    details: toJson(params.details),
  })

  if (error) {
    console.error("[logDatasetAudit] insert failed", params.action, error)
    return "감사 로그 기록에 실패했습니다."
  }
  return null
}
