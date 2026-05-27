import {
  Building2,
  CheckCircle2,
  FileEdit,
  TrendingUp,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  title: string
  value: number | string
  description: string
  icon: typeof Building2
  accentClass?: string
}

function KpiCard({ title, value, description, icon: Icon, accentClass }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-y-0 left-0 w-1 rounded-l-lg", accentClass ?? "bg-primary")} />
      <CardContent className="flex items-center gap-4 py-5 pl-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted")}>
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

type KpiCardsProps = {
  facilityCount: number
  draftCount: number
  completedCount: number
  completeFacilityCount: number
  incompleteFacilityCount: number
}

export function KpiCards({
  facilityCount,
  draftCount,
  completedCount,
  completeFacilityCount,
  incompleteFacilityCount,
}: KpiCardsProps) {
  const facilityTotal = completeFacilityCount + incompleteFacilityCount
  const rate =
    facilityTotal > 0
      ? Math.round((completeFacilityCount / facilityTotal) * 100)
      : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="등록 시설"
        value={facilityCount.toLocaleString()}
        description="전체 등록된 시설 수"
        icon={Building2}
        accentClass="bg-primary"
      />
      <KpiCard
        title="이번 달 작성중"
        value={draftCount}
        description="임시저장된 점검"
        icon={FileEdit}
        accentClass="bg-warning"
      />
      <KpiCard
        title="이번 달 완료"
        value={completedCount}
        description="완료된 점검"
        icon={CheckCircle2}
        accentClass="bg-success"
      />
      <KpiCard
        title="완료율"
        value={`${rate}%`}
        description={`${completeFacilityCount} / ${facilityTotal} 시설`}
        icon={TrendingUp}
        accentClass="bg-chart-5"
      />
    </div>
  )
}
