"use client"

import {
  School,
  Building,
  Home,
  TreePine,
  ShieldCheck,
  ClipboardList,
} from "lucide-react"

import { COPY } from "@/lib/landing/copy"
import { Reveal } from "../motion/reveal"

const iconMap: Record<string, React.ElementType> = {
  school: School,
  building: Building,
  home: Home,
  tree: TreePine,
  shieldCheck: ShieldCheck,
  clipboard: ClipboardList,
}

const customers = [
  {
    icon: "school",
    label: "어린이집 · 유치원",
    desc: "월점검 대장, 보험, 안전교육 이력 관리",
  },
  {
    icon: "building",
    label: "학교 · 교육청",
    desc: "다수 시설의 점검 현황 통합 관리",
  },
  {
    icon: "home",
    label: "아파트 관리사무소",
    desc: "단지 내 놀이시설 안전점검 기록 보관",
  },
  {
    icon: "tree",
    label: "도시공원 · 공공시설",
    desc: "시설별 점검·보수 이력 관리",
  },
  {
    icon: "shieldCheck",
    label: "지자체",
    desc: "관내 어린이놀이시설 관리 현황 파악",
  },
  {
    icon: "clipboard",
    label: "위탁점검기관",
    desc: "다수 고객 시설 점검·서명·보고서 발행",
  },
]

export function Customers() {
  return (
    <section
      id="customers"
      data-bg="#F4F6FA"
      className="relative px-8 py-[120px]"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-16 text-center">
          <Reveal>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
              도입 대상
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-0 text-[clamp(32px,3.8vw,48px)] font-bold leading-[1.1] tracking-[-0.03em] text-label-strong">
              {COPY.customers.headline}
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c, i) => {
            const Icon = iconMap[c.icon] || Building
            return (
              <Reveal key={c.label} delay={i * 50} y={20}>
                <div className="flex h-full items-center gap-4 rounded-[14px] bg-white px-[22px] py-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,36,102,.08)]">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,102,255,.08)] text-brand">
                    <Icon className="size-[22px]" />
                  </div>
                  <div>
                    <div className="text-base font-bold tracking-[-0.015em] text-label-strong">
                      {c.label}
                    </div>
                    <div className="mt-0.5 text-[13.5px] leading-snug text-label-neutral">
                      {c.desc}
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
