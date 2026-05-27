import {
  MonthlyInspectionTrendChart,
  StatusDonutChart,
} from "@/components/dashboard/dashboard-charts"
import { DatasetInspectionBreakdown } from "@/components/dashboard/dataset-inspection-breakdown"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { MonthlyResultRealtimeChart } from "@/components/inspection/monthly-result-realtime-chart"
import {
  getAccessibleDatasets,
  getCurrentRole,
  getCurrentUser,
} from "@/lib/auth/helpers"
import { groupInspectionsByDataset } from "@/lib/dataset/inspection-stats"
import { fetchDatasetNameMap } from "@/lib/dataset/names"
import { getKoreaDateParts } from "@/lib/date"
import { countFacilitiesByMonthlyStatus } from "@/lib/facilities/monthly-status"
import { createClient } from "@/lib/supabase/server"

export async function DashboardContent() {
  const supabase = await createClient()
  const user = await getCurrentUser()
  const role = await getCurrentRole()
  const accessibleDatasets = user
    ? await getAccessibleDatasets(user.id, role)
    : []
  const showDatasetColumn = accessibleDatasets.length > 1

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
    { data: currentMonthByDataset },
    { data: currentMonthInspections },
    { data: memberships },
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
      .select(
        "id, facility_no, inspection_month, inspection_date, status, dataset_id",
      )
      .order("inspection_date", { ascending: false })
      .limit(5),
    supabase
      .from("monthly_inspections")
      .select("inspection_month, status, dataset_id")
      .in("inspection_month", monthsInYear),
    supabase
      .from("monthly_inspections")
      .select("dataset_id, status")
      .eq("inspection_month", month),
    supabase
      .from("monthly_inspections")
      .select("facility_no, dataset_id, status")
      .eq("inspection_month", month),
    supabase
      .from("facility_dataset_memberships")
      .select("facility_no, dataset_id")
      .eq("is_active", true),
  ])

  const monthlyInspectionRows = (currentMonthInspections ?? [])
    .filter((row) => row.dataset_id != null)
    .map((row) => ({
      facility_no: row.facility_no,
      dataset_id: row.dataset_id!,
      status: row.status,
    }))
  const membershipRows = memberships ?? []
  const { complete: completeFacilityCount, incomplete: incompleteFacilityCount } =
    countFacilitiesByMonthlyStatus(membershipRows, monthlyInspectionRows)

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

  const datasetNameById = showDatasetColumn
    ? await fetchDatasetNameMap(supabase, [
        ...(recentInspections ?? []).map((r) => r.dataset_id),
        ...(currentMonthByDataset ?? []).map((r) => r.dataset_id),
        ...accessibleDatasets.map((d) => d.id),
      ])
    : new Map<string, string>()

  const recentInspectionsWithFacilityName = (recentInspections ?? []).map(
    (inspection) => ({
      ...inspection,
      facility_name: facilityNameByNo.get(inspection.facility_no) ?? null,
      dataset_name: inspection.dataset_id
        ? (datasetNameById.get(inspection.dataset_id) ?? null)
        : null,
    })
  )

  const datasetBreakdownRows = showDatasetColumn
    ? groupInspectionsByDataset(
        currentMonthByDataset ?? [],
        datasetNameById,
        membershipRows,
        monthlyInspectionRows,
      )
    : []

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
    {
      name: "미완료",
      value: incompleteFacilityCount,
      color: "var(--chart-3)",
    },
  ]

  return (
    <>
      <KpiCards
        facilityCount={facilityCount ?? 0}
        draftCount={draftCount ?? 0}
        completedCount={completedCount ?? 0}
        completeFacilityCount={completeFacilityCount}
        incompleteFacilityCount={incompleteFacilityCount}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyInspectionTrendChart data={monthlyData} />
        <StatusDonutChart data={statusData} />
      </div>

      <DatasetInspectionBreakdown monthLabel={month} rows={datasetBreakdownRows} />

      <MonthlyResultRealtimeChart
        inspectionMonth={month}
        datasetIds={
          accessibleDatasets.length > 0
            ? accessibleDatasets.map((d) => d.id)
            : undefined
        }
      />

      <RecentInspections
        inspections={recentInspectionsWithFacilityName}
        showDatasetColumn={showDatasetColumn}
      />
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
      <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
    </>
  )
}
