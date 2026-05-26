"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { getCurrentRole, hasRole } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { validateCompletion } from "@/lib/inspection/complete"
import { parseInspectionItemUpdates } from "@/lib/inspection/parse-item-updates"
import { getPersonNameValidationError } from "@/lib/inspection/person-name"
import { refreshLedgerSnapshotForInspection } from "@/lib/inspection/refresh-ledger-snapshot"
import { buildLedgerRow } from "@/lib/inspection/snapshot"
import { createClient } from "@/lib/supabase/server"

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/)

  if (!match?.[1]) {
    return null
  }

  return Buffer.from(match[1], "base64")
}

async function uploadSignature(
  inspectionId: string,
  field: "safety-manager" | "consigned-inspector",
  dataUrl: string
) {
  const buffer = parseDataUrl(dataUrl)

  if (!buffer) {
    return null
  }

  const supabase = await createClient()
  const path = `${inspectionId}/${field}-${Date.now()}.png`
  const { error } = await supabase.storage
    .from("signatures")
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
    })

  if (error) {
    throw error
  }

  return path
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

async function executeInspectionDraftSave(formData: FormData) {
  const inspectionId = String(formData.get("inspectionId") ?? "")
  const safetyManagerName = String(
    formData.get("safetyManagerName") ?? ""
  ).trim()
  const consignedInspectorName = String(
    formData.get("consignedInspectorName") ?? ""
  ).trim()
  const safetyManagerSignature = String(
    formData.get("safetyManagerSignature") ?? ""
  )
  const consignedInspectorSignature = String(
    formData.get("consignedInspectorSignature") ?? ""
  )

  const supabase = await createClient()
  const role = await getCurrentRole()

  if (!isUuid(inspectionId)) {
    redirect("/inspections/history?error=invalid-inspection")
  }

  if (!hasRole(role, ["ADMIN", "MANAGER", "INSPECTOR"])) {
    redirect(`/inspections/${inspectionId}?error=forbidden`)
  }

  const { data: inspectionState } = await supabase
    .from("monthly_inspections")
    .select("status")
    .eq("id", inspectionId)
    .maybeSingle()

  if (!inspectionState) {
    redirect("/inspections/history?error=not-found")
  }

  if (inspectionState.status === "locked") {
    redirect(`/inspections/${inspectionId}?error=completed-locked`)
  }

  if (
    inspectionState.status === "completed" &&
    !hasPermission(role, "inspection:edit-completed")
  ) {
    redirect(`/inspections/${inspectionId}?error=completed-locked`)
  }

  const { data: ownedItems } = await supabase
    .from("monthly_inspection_items")
    .select("id")
    .eq("inspection_id", inspectionId)
  const ownedItemIds = new Set(ownedItems?.map((item) => item.id) ?? [])
  const updates = parseInspectionItemUpdates(formData, ownedItemIds)

  for (const update of updates) {
    const { error } = await supabase
      .from("monthly_inspection_items")
      .update({
        result_status: update.result_status,
        note: update.note,
      })
      .eq("id", update.id)

    if (error) {
      redirect(`/inspections/${inspectionId}?error=save-failed`)
    }
  }

  const canSignSafety = hasPermission(role, "inspection:sign-safety-manager")
  const canSignConsigned = hasPermission(
    role,
    "inspection:sign-consigned-inspector"
  )

  if (canSignSafety && safetyManagerName) {
    const nameError = getPersonNameValidationError(
      safetyManagerName,
      "안전관리자명"
    )
    if (nameError) {
      redirect(
        `/inspections/${inspectionId}?error=${encodeURIComponent(nameError)}`
      )
    }
  }

  if (canSignConsigned && consignedInspectorName) {
    const nameError = getPersonNameValidationError(
      consignedInspectorName,
      "위탁점검자명"
    )
    if (nameError) {
      redirect(
        `/inspections/${inspectionId}?error=${encodeURIComponent(nameError)}`
      )
    }
  }

  const safetySignaturePath = canSignSafety
    ? await uploadSignature(
        inspectionId,
        "safety-manager",
        safetyManagerSignature
      )
    : null
  const consignedSignaturePath = canSignConsigned
    ? await uploadSignature(
        inspectionId,
        "consigned-inspector",
        consignedInspectorSignature
      )
    : null

  const inspectionUpdate: Partial<{
    safety_manager_name: string | null
    consigned_inspector_name: string | null
    safety_manager_signature_url: string | null
    consigned_inspector_signature_url: string | null
  }> = {}
  if (canSignSafety) {
    inspectionUpdate.safety_manager_name = safetyManagerName || null
  }
  if (canSignConsigned) {
    inspectionUpdate.consigned_inspector_name =
      consignedInspectorName || null
  }
  if (safetySignaturePath) {
    inspectionUpdate.safety_manager_signature_url = safetySignaturePath
  }
  if (consignedSignaturePath) {
    inspectionUpdate.consigned_inspector_signature_url =
      consignedSignaturePath
  }

  const { error } = await supabase
    .from("monthly_inspections")
    .update(inspectionUpdate)
    .eq("id", inspectionId)

  if (error) {
    redirect(`/inspections/${inspectionId}?error=save-failed`)
  }

  if (inspectionState.status === "completed") {
    try {
      await refreshLedgerSnapshotForInspection(supabase, inspectionId)
    } catch {
      redirect(`/inspections/${inspectionId}?error=ledger-create-failed`)
    }
  }

  return inspectionId
}

export async function saveInspectionDraft(formData: FormData) {
  const inspectionId = await executeInspectionDraftSave(formData)
  revalidatePath(`/inspections/${inspectionId}`)
  redirect(`/inspections/${inspectionId}?saved=1`)
}

export async function saveInspectionDraftAndOpenLedger(formData: FormData) {
  const inspectionId = await executeInspectionDraftSave(formData)
  revalidatePath(`/inspections/${inspectionId}`)
  revalidatePath(`/inspections/${inspectionId}/ledger`)
  redirect(`/inspections/${inspectionId}/ledger`)
}

export async function completeInspection(formData: FormData) {
  await executeInspectionDraftSave(formData)

  const inspectionId = String(formData.get("inspectionId") ?? "")
  const supabase = await createClient()

  const [{ data: inspection }, { data: items }] = await Promise.all([
    supabase
      .from("monthly_inspections")
      .select("*")
      .eq("id", inspectionId)
      .maybeSingle(),
    supabase
      .from("monthly_inspection_items")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("sort_order", { ascending: true }),
  ])

  if (!inspection) {
    redirect(`/inspections/${inspectionId}?error=not-found`)
  }

  const completionErrors = validateCompletion(inspection, items ?? [])
  if (completionErrors.length > 0) {
    redirect(
      `/inspections/${inspectionId}?error=${encodeURIComponent(
        completionErrors[0]
      )}`
    )
  }

  const { data: facility } = await supabase
    .from("facilities")
    .select("facility_name,road_address")
    .eq("facility_no", inspection.facility_no)
    .maybeSingle()

  if (!facility) {
    redirect(`/inspections/${inspectionId}?error=facility-not-found`)
  }

  const ledgerRow = buildLedgerRow({
    inspection,
    facility,
    items: items ?? [],
  })

  const { error: deleteError } = await supabase
    .from("inspection_ledger_rows")
    .delete()
    .eq("inspection_id", inspectionId)

  if (deleteError) {
    redirect(`/inspections/${inspectionId}?error=ledger-delete-failed`)
  }

  const { error: ledgerError } = await supabase
    .from("inspection_ledger_rows")
    .insert(ledgerRow)

  if (ledgerError) {
    redirect(`/inspections/${inspectionId}?error=ledger-create-failed`)
  }

  const { error: completeError } = await supabase
    .from("monthly_inspections")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", inspectionId)

  if (completeError) {
    redirect(`/inspections/${inspectionId}?error=complete-failed`)
  }

  redirect(`/inspections/${inspectionId}/ledger`)
}
