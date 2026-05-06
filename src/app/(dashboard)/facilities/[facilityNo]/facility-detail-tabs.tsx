import { FacilityTabs } from "@/components/facility/facility-tabs"
import { createClient } from "@/lib/supabase/server"
import type { FacilityRow } from "@/types/database"

type FacilityDetailTabsProps = {
  facility: FacilityRow
  facilityNo: string
}

export async function FacilityDetailTabs({
  facility,
  facilityNo,
}: FacilityDetailTabsProps) {
  const supabase = await createClient()

  const [
    { data: equipment },
    { data: legalInspections },
    { data: safetyEducations },
    { data: liabilityInsurances },
    { data: facilityManagers },
    { data: monthlyInspections },
  ] = await Promise.all([
    supabase
      .from("equipment")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("equipment_name", { ascending: true }),
    supabase
      .from("facility_legal_inspections")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("inspection_date", { ascending: false }),
    supabase
      .from("safety_educations")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("education_date", { ascending: false }),
    supabase
      .from("liability_insurances")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("join_date", { ascending: false }),
    supabase
      .from("facility_managers")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_inspections")
      .select("*")
      .eq("facility_no", facilityNo)
      .order("inspection_month", { ascending: false }),
  ])

  return (
    <FacilityTabs
      facility={facility}
      equipment={equipment ?? []}
      legalInspections={legalInspections ?? []}
      safetyEducations={safetyEducations ?? []}
      liabilityInsurances={liabilityInsurances ?? []}
      facilityManagers={facilityManagers ?? []}
      monthlyInspections={monthlyInspections ?? []}
    />
  )
}

export function FacilityDetailTabsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-20 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="h-[400px] animate-pulse rounded-xl bg-muted" />
    </div>
  )
}
