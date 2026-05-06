import { Building2, ClipboardCheck, History } from "lucide-react"
import Link from "next/link"

import { Card, CardContent } from "@/components/ui/card"

const actions = [
  {
    href: "/inspections/new",
    icon: ClipboardCheck,
    title: "새 점검 시작",
    description: "월간 안전점검을 시작합니다.",
  },
  {
    href: "/facilities",
    icon: Building2,
    title: "시설 검색",
    description: "등록된 시설을 검색합니다.",
  },
  {
    href: "/inspections/history",
    icon: History,
    title: "점검 이력",
    description: "과거 점검 이력을 조회합니다.",
  },
]

export function QuickActions() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <Card className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
