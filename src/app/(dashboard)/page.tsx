import { Suspense } from "react"

import { DailySafetyQuiz } from "@/components/dashboard/daily-safety-quiz"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { getCurrentUser } from "@/lib/auth/helpers"
import { getDailySafetyQuiz } from "@/lib/quiz/get-daily-quiz"

import { DashboardContent, DashboardContentSkeleton } from "./dashboard-content"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "좋은 아침입니다"
  if (hour < 18) return "좋은 오후입니다"
  return "좋은 저녁입니다"
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

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

      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent />
      </Suspense>

      <QuickActions />
    </div>
  )
}
