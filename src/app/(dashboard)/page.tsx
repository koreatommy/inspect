import {
  MonthlyInspectionTrendChart,
  StatusDonutChart,
} from "@/components/dashboard/dashboard-charts"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { DailySafetyQuiz } from "@/components/dashboard/daily-safety-quiz"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { getCurrentUser } from "@/lib/auth/helpers"
import { getKoreaDateParts } from "@/lib/date"
import { getDailySafetyQuiz } from "@/lib/quiz/get-daily-quiz"
import { createClient } from "@/lib/supabase/server"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "좋은 아침입니다"
  if (hour < 18) return "좋은 오후입니다"
  return "좋은 저녁입니다"
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()
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

  const today = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date())

  const dailyQuiz = getDailySafetyQuiz()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {getGreeting()}{user?.email ? `, ${user.email.split("@")[0]}님` : ""}
        </h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <WeatherWidget className="mt-0 w-full" />
          <DailySafetyQuiz question={dailyQuiz} className="w-full" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{today}</p>
      </div>

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

      <QuickActions />
    </div>
  )
}
