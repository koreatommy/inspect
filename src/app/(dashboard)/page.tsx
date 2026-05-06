import { MonthlyBarChart, StatusDonutChart } from "@/components/dashboard/dashboard-charts"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentInspections } from "@/components/dashboard/recent-inspections"
import { getCurrentUser } from "@/lib/auth/helpers"
import { getKoreaDateParts, getKoreaRecentMonths } from "@/lib/date"
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
      .in("inspection_month", getKoreaRecentMonths(6)),
    supabase
      .from("monthly_inspections")
      .select("*", { count: "exact", head: true })
      .eq("inspection_month", month)
      .eq("status", "needs_revision"),
  ])

  const monthlyData = getKoreaRecentMonths(6).map((m) => {
    const rows = (monthlyStats ?? []).filter((r) => r.inspection_month === m)
    return {
      month: m.slice(5),
      completed: rows.filter(
        (r) => r.status === "completed" || r.status === "locked"
      ).length,
      draft: rows.filter((r) => r.status === "draft").length,
      needsRevision: rows.filter((r) => r.status === "needs_revision").length,
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {getGreeting()}{user?.email ? `, ${user.email.split("@")[0]}님` : ""}
        </h2>
        <WeatherWidget />
        <p className="mt-2 text-sm text-muted-foreground">{today}</p>
      </div>

      <KpiCards
        facilityCount={facilityCount ?? 0}
        draftCount={draftCount ?? 0}
        completedCount={completedCount ?? 0}
        needsRevisionCount={needsRevisionCount ?? 0}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyBarChart data={monthlyData} />
        <StatusDonutChart data={statusData} />
      </div>

      <RecentInspections inspections={recentInspections ?? []} />

      <QuickActions />
    </div>
  )
}
