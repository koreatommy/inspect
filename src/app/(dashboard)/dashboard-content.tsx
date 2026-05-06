import {
  MonthlyInspectionTrendChart,
  StatusDonutChart,
} from "@/components/dashboard/dashboard-charts"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { getKoreaDateParts } from "@/lib/date"
import { createClient } from "@/lib/supabase/server"

export async function DashboardContent() {
  const supabase = await createClient()
  const month = getKoreaDateParts().month
  const currentYear = month.slice(0, 4)
  const monthsInYear = Array.from({ length: 12 }, (_, index) => {
    const monthNo = String(index + 1).padStart(2, "0")
    return `${currentYear}-${monthNo}`
  })

  const [
    { count: facilityCount },
    { count: draftCount },
    { count: completedCount },
    { data: recentInspections },
    { data: monthlyStats },
    { count: needsRevisionCount },
  ] = await Promise.all([
    supabase.from("facilities").select("*", { count: "exact", head: true }),
    supabase
      .from("monthly_inspections")
      .select("*", { count: "exact", head: true })
      .eq("inspection_month", month)
      .eq("status", "draft"),
    supabase
      .from("monthly_inspections")
      .select("*", { count: "exact", head: true })
      .eq("inspection_month", month)
      .in("status", ["completed", "locked"]),
    supabase
      .from("monthly_inspections")
      .select("id, facility_no, inspection_month, inspection_date, status")
      .order("inspection_date", { ascending: false })
      .limit(5),
    supabase
      .from("monthly_inspections")
      .select("inspection_month, status")
      .in("inspection_month", monthsInYear),
    supabase
      .from("monthly_inspections")
      .select("*", { count: "exact", head: true })
      .eq("inspection_month", month)
      .eq("status", "needs_revision"),
  ])

  const facilityNos = Array.from(
    new Set((recentInspections ?? []).map((inspection) => inspection.facility_no))
  )

  const { data: facilities } =
    facilityNos.length > 0
      ? await supabase
          .from("facilities")
          .select("facility_no, facility_name")
          .in("facility_no", facilityNos)
      : { data: [] }

  const facilityNameByNo = new Map(
    (facilities ?? []).map((facility) => [facility.facility_no, facility.facility_name])
  )

  const recentInspectionsWithFacilityName = (recentInspections ?? []).map(
    (inspection) => ({
      ...inspection,
      facility_name: facilityNameByNo.get(inspection.facility_no) ?? null,
    })
  )

  const monthlyData = monthsInYear.map((monthValue, index) => {
    const rows = (monthlyStats ?? []).filter(
      (r) => r.inspection_month === monthValue
    )
    return {
      monthLabel: `${index + 1}월`,
      totalCount: rows.length,
    }
  })

  const statusData = [
    { name: "완료", value: completedCount ?? 0, color: "var(--chart-1)" },
    { name: "작성중", value: draftCount ?? 0, color: "var(--chart-2)" },
    { name: "수정요청", value: needsRevisionCount ?? 0, color: "var(--chart-3)" },
  ]

  return (
    <>
      <KpiCards
        facilityCount={facilityCount ?? 0}
        draftCount={draftCount ?? 0}
        completedCount={completedCount ?? 0}
        needsRevisionCount={needsRevisionCount ?? 0}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyInspectionTrendChart data={monthlyData} />
        <StatusDonutChart data={statusData} />
      </div>

      <RecentInspections inspections={recentInspectionsWithFacilityName} />
    </>
  )
}

export function DashboardContentSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[100px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-xl bg-muted" />
        <div className="h-[320px] animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-[280px] animate-pulse rounded-xl bg-muted" />
    </>
  )
}
