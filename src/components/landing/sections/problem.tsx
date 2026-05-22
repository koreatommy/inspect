"use client"

import {
  FileText,
  BarChart3,
  Camera,
  PenTool,
  Shield,
  ClipboardList,
  Bell,
} from "lucide-react"

import { Reveal } from "../motion/reveal"

const iconMap: Record<string, React.ElementType> = {
  doc: FileText,
  chart: BarChart3,
  camera: Camera,
  signature: PenTool,
  shield: Shield,
  clipboard: ClipboardList,
}

const rows = [
  { old: "종이 점검대장 작성", issue: "분실, 누락, 보관 불편", icon: "doc" },
  {
    old: "엑셀 수기 관리",
    issue: "시설 수가 늘어나면 이력 추적 어려움",
    icon: "chart",
  },
  {
    old: "사진 별도 저장",
    issue: "어떤 시설·기구의 사진인지 확인 어려움",
    icon: "camera",
  },
  {
    old: "안전관리자 서명 수기",
    issue: "위탁점검자·관리자 확인 절차 비효율",
    icon: "signature",
  },
  {
    old: "법적 의무사항 별도 확인",
    issue: "설치검사·교육·보험 만료일 누락 위험",
    icon: "shield",
  },
  {
    old: "보고서 수작업 작성",
    issue: "PDF 변환, 제출용 문서 정리에 시간 소요",
    icon: "clipboard",
  },
]

export function Problem() {
  return (
    <section
      id="problem"
      data-bg="#1B1C1E"
      data-fg="light"
      className="relative px-8 py-[140px] text-[#F7F7F8]"
    >
      <div className="mx-auto max-w-[1100px]">
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-[#9EC5FF]">
            <span className="inline-block size-1.5 rounded-full bg-[#FF6363]" />
            현장 이슈
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2 className="m-0 max-w-[800px] text-[clamp(34px,4.4vw,56px)] font-bold leading-[1.1] tracking-[-0.032em] text-white [text-wrap:balance]">
            아직도 엑셀, 종이대장, 수기 서명으로
            <br />
            <span className="text-[#9EC5FF]">관리하고 계신가요?</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
            <p className="mt-6 max-w-[720px] text-lg leading-[1.6] tracking-[-0.005em] text-[rgba(247,247,248,0.7)]">
            어린이놀이시설 안전점검은 단순한 기록이 아닙니다.
            법적 의무사항을 놓치지 않아야 하고, 점검 결과를 보관해야 하며,
            지도점검·민원 대응 자료로 즉시 제출할 수 있어야 합니다.
          </p>
        </Reveal>

        <div className="mt-[72px] grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => {
            const Icon = iconMap[r.icon] || FileText
            return (
              <Reveal key={r.old} delay={i * 60} y={32}>
                <div className="group relative h-full rounded-2xl border border-white/8 bg-white/4 p-6 transition-all hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/7">
                  <div className="mb-[18px] inline-flex size-10 items-center justify-center rounded-[10px] bg-[rgba(255,99,99,.14)] text-[#FF9090]">
                    <Icon className="size-[22px]" />
                  </div>
                  <div className="mb-1.5 text-[17px] font-bold tracking-[-0.015em] text-white">
                    {r.old}
                  </div>
                  <div className="text-[14.5px] leading-relaxed text-[rgba(247,247,248,.62)]">
                    {r.issue}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom callout */}
        <Reveal delay={120}>
          <div className="mt-14 flex items-center gap-4 rounded-[14px] border border-[rgba(255,146,0,.24)] bg-[rgba(255,146,0,.08)] px-6 py-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(255,146,0,.18)] text-[#FFC06E]">
              <Bell className="size-[22px]" />
            </div>
            <div className="text-[15px] leading-relaxed text-[rgba(247,247,248,.85)]">
              <strong className="font-semibold text-white">
                안전점검 미실시·결과 미보관·안전교육 미이수
              </strong>
              는 행정안전부 어린이놀이시설 안전관리시스템 기준{" "}
              <strong className="text-[#FFC06E]">과태료 부과 대상</strong>
              입니다.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
