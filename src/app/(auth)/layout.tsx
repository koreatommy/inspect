import { ClipboardCheck, Shield, BarChart3 } from "lucide-react"
import type { ReactNode } from "react"

const features = [
  {
    icon: ClipboardCheck,
    title: "월간 안전점검",
    description:
      "시설·점검월별로 점검을 만들고 놀이기구 항목별로 기록하며, 작성중·완료·수정요청 등 진행 상태를 관리합니다.",
  },
  {
    icon: Shield,
    title: "대장·전자서명",
    description:
      "안전관리자·위탁점검자 전자서명 후 「안전점검실시대장」을 미리보고 인쇄해 PDF로 보관할 수 있습니다.",
  },
  {
    icon: BarChart3,
    title: "현황·시설 정보",
    description:
      "대시보드와 점검이력으로 월별 현황을 보고, 시설 상세에서 정기검사·배상책임보험·안전교육 등을 함께 확인합니다.",
  },
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="light-auth flex min-h-dvh bg-background text-foreground">
      <div className="hidden w-[55%] flex-col justify-between bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-10 text-primary-foreground lg:flex">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            어린이놀이시설
            <br />
            안전점검 관리
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70">
            시설정보 업로드부터 월간 안전점검 완료까지
          </p>
        </div>

        <div className="space-y-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{feature.title}</p>
                  <p className="text-sm text-primary-foreground/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} 어린이놀이시설 안전점검 관리 시스템
        </p>
      </div>

      <main className="flex flex-1 items-center justify-center bg-background px-4">
        {children}
      </main>
    </div>
  )
}
