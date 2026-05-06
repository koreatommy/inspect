import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

import { InspectionForm } from "@/components/inspection/inspection-form"
import { getCurrentRole } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { createClient } from "@/lib/supabase/server"

type InspectionPageProps = {
  params: Promise<{
    inspectionId: string
  }>
  searchParams: Promise<{
    error?: string
  }>
}

export default async function InspectionPage({
  params,
  searchParams,
}: InspectionPageProps) {
  const role = await getCurrentRole()
  const { inspectionId } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const [{ data: inspection }, { data: items }, { data: facility }] =
    await Promise.all([
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
      supabase
        .from("monthly_inspections")
        .select("facility_no")
        .eq("id", inspectionId)
        .maybeSingle(),
    ])

  if (!inspection) {
    notFound()
  }

  const isCompleted =
    inspection.status === "completed" || inspection.status === "locked"

  if (!isCompleted && !hasPermission(role, "inspection:edit")) {
    redirect("/inspections/history")
  }

  if (isCompleted && !hasPermission(role, "inspection:edit-completed")) {
    redirect(`/inspections/${inspectionId}/ledger`)
  }

  const { data: facilityInfo } = await supabase
    .from("facilities")
    .select("facility_name,road_address,install_place_name,indoor_outdoor_name")
    .eq("facility_no", facility?.facility_no ?? inspection.facility_no)
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {inspection.inspection_month} / {inspection.inspection_date}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {facilityInfo?.facility_name ?? inspection.facility_no}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {facilityInfo?.road_address ?? "주소 없음"} ·{" "}
          {facilityInfo?.install_place_name ?? "설치장소 없음"} ·{" "}
          {facilityInfo?.indoor_outdoor_name ?? "실내외 미확인"}
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(error)}
        </p>
      ) : null}
      <InspectionForm inspection={inspection} items={items ?? []} role={role} />
    </div>
  )
}
