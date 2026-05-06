import Link from "next/link"
import { notFound } from "next/navigation"

import { FacilityTabs } from "@/components/facility/facility-tabs"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type FacilityDetailPageProps = {
  params: Promise<{
    facilityNo: string
  }>
}

export default async function FacilityDetailPage({
  params,
}: FacilityDetailPageProps) {
  const { facilityNo } = await params
  const decodedFacilityNo = decodeURIComponent(facilityNo)
  const supabase = await createClient()

  const [
    { data: facility },
    { data: equipment },
    { data: legalInspections },
    { data: safetyEducations },
    { data: liabilityInsurances },
    { data: facilityManagers },
    { data: monthlyInspections },
  ] = await Promise.all([
    supabase
      .from("facilities")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .maybeSingle(),
    supabase
      .from("equipment")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("equipment_name", { ascending: true }),
    supabase
      .from("facility_legal_inspections")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("inspection_date", { ascending: false }),
    supabase
      .from("safety_educations")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("education_date", { ascending: false }),
    supabase
      .from("liability_insurances")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("join_date", { ascending: false }),
    supabase
      .from("facility_managers")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_inspections")
      .select("*")
      .eq("facility_no", decodedFacilityNo)
      .order("inspection_month", { ascending: false }),
  ])

  if (!facility) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            시설번호 {facility.facility_no}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {facility.facility_name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {facility.road_address ?? facility.lot_address ?? "주소 없음"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/facilities"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            목록
          </Link>
          <Link
            href={`/inspections/new?facilityNo=${facility.facility_no}`}
            className={cn(buttonVariants())}
          >
            점검 시작
          </Link>
        </div>
      </div>
      <FacilityTabs
        facility={facility}
        equipment={equipment ?? []}
        legalInspections={legalInspections ?? []}
        safetyEducations={safetyEducations ?? []}
        liabilityInsurances={liabilityInsurances ?? []}
        facilityManagers={facilityManagers ?? []}
        monthlyInspections={monthlyInspections ?? []}
      />
    </div>
  )
}
