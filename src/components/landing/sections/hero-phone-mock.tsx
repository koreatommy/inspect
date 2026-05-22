"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Building2,
  BarChart3,
  ClipboardList,
  Users,
  Camera,
  Check,
} from "lucide-react"

const PHOTO_CELLS = [
  {
    src: "/landing/hero/repair-before.webp",
    alt: "그네 수리 전 현장 사진",
    tag: "수리 전",
    tagColor: "#E52222",
  },
  {
    src: "/landing/hero/repair-after.webp",
    alt: "그네 수리 후 현장 사진",
    tag: "수리 후",
    tagColor: "#009632",
  },
  {
    src: "/landing/hero/hazard-1.webp",
    alt: "그네 위해요소 현장 사진",
  },
  {
    src: "/landing/hero/hazard-2.webp",
    alt: "그네 주변 안전영역 현장 사진",
  },
] as const

const CHECKLIST_ITEMS = [
  { label: "그네줄 고정 상태", status: "repair" as const },
  { label: "좌판·손잡이 견고성", status: "good" as const },
  { label: "바닥재 충격흡수", status: "repair" as const },
  { label: "지주·연결부 고정", status: "good" as const },
  { label: "주변 안전영역", status: "good" as const },
]

const STATUS_BADGE = {
  good: {
    label: "양호",
    className: "bg-[#E2F8EA] text-[#009632]",
  },
  repair: {
    label: "요수리",
    className: "bg-[#FFF0E5] text-[#FF5E00]",
  },
} as const

export function HeroPhoneMock() {
  const [stage, setStage] = useState(0)
  const [checks, setChecks] = useState([false, false, false, false, false])
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    )
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setChecks([true, true, true, true, false])
      setStage(0)
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []

    function loop() {
      setStage(0)
      setChecks([false, false, false, false, false])
      CHECKLIST_ITEMS.forEach((_, i) => {
        timers.push(
          setTimeout(() => {
            setChecks((prev) => prev.map((v, idx) => (idx === i ? true : v)))
          }, 600 + i * 700),
        )
      })
      timers.push(setTimeout(() => setStage(1), 4400))
      timers.push(setTimeout(() => setStage(2), 6800))
      timers.push(setTimeout(() => setStage(3), 9000))
      timers.push(setTimeout(loop, 11800))
    }

    loop()
    return () => timers.forEach(clearTimeout)
  }, [reduceMotion])

  return (
    <div
      className="relative h-[580px] w-[280px]"
      style={{
        filter:
          "drop-shadow(0 30px 60px rgba(0, 36, 102, .18)) drop-shadow(0 10px 20px rgba(0, 36, 102, .08))",
      }}
    >
      <div className="absolute inset-0 rounded-[44px] bg-[#0F0F10] p-[9px]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-[#F7F7F8]">
          {/* Status bar */}
          <div className="flex h-11 items-center justify-between px-6 text-[13px] font-semibold text-label-normal">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden>
                <path
                  d="M0 7h2v3H0zm4-2h2v5H4zm4-2h2v7H8zm4-3h2v10h-2z"
                  fill="#171719"
                />
              </svg>
              <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden>
                <rect
                  x=".5"
                  y="1"
                  width="18"
                  height="8"
                  rx="2"
                  fill="none"
                  stroke="#171719"
                />
                <rect x="2" y="2.5" width="13" height="5" fill="#171719" />
                <rect x="19.5" y="3.5" width="1.5" height="3" fill="#171719" />
              </svg>
            </div>
          </div>

          <div className="absolute left-1/2 top-3 h-[30px] w-[110px] -translate-x-1/2 rounded-[18px] bg-[#0F0F10]" />

          <div className="px-[18px] pb-3 pt-1">
            <div className="text-[11.5px] font-semibold tracking-[0.04em] text-brand">
              월점검 대장 · 2026.05
            </div>
            <div className="mt-1 text-lg font-bold tracking-[-0.02em] text-label-normal">
              햇살어린이공원 · 그네
            </div>
            <div className="mt-0.5 text-xs text-label-alternative">
              시설번호 S-2024-0571
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {/* Stage 0: checklist */}
            <div
              className="absolute inset-0 px-[18px] transition-all duration-[360ms] ease-out"
              style={{
                opacity: stage === 0 ? 1 : 0,
                transform: stage === 0 ? "translateY(0)" : "translateY(-16px)",
                pointerEvents: stage === 0 ? "auto" : "none",
              }}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-label-alternative">
                체크리스트
              </div>
              {CHECKLIST_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="mb-1.5 flex items-center gap-2.5 rounded-[10px] border border-line-alternative bg-white px-3 py-2.5"
                >
                  <div
                    className="flex size-5 items-center justify-center rounded-md transition-colors duration-200"
                    style={{
                      background: checks[i]
                        ? "var(--semantic-primary-normal)"
                        : "#fff",
                      border: checks[i]
                        ? "1.5px solid var(--semantic-primary-normal)"
                        : "1.5px solid var(--semantic-line-normal-normal)",
                    }}
                  >
                    {checks[i] ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                        <path
                          d="M2.5 6.5l2.5 2.5L9.5 3.5"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </div>
                  <div className="flex-1 text-[13.5px] font-medium text-label-normal">
                    {item.label}
                  </div>
                  {checks[i] ? (
                    <div
                      className={`rounded-full px-[7px] py-[3px] text-[10.5px] font-bold ${STATUS_BADGE[item.status].className}`}
                    >
                      {STATUS_BADGE[item.status].label}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Stage 1: photos */}
            <div
              className="absolute inset-0 px-[18px] transition-all duration-[360ms] ease-out"
              style={{
                opacity: stage === 1 ? 1 : 0,
                transform: stage === 1 ? "translateY(0)" : "translateY(20px)",
                pointerEvents: stage === 1 ? "auto" : "none",
              }}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-label-alternative">
                현장 사진 · 위해요소
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PHOTO_CELLS.map((cell, i) => (
                  <div
                    key={"src" in cell ? cell.src : i}
                    className="relative aspect-square overflow-hidden rounded-[10px] transition-all duration-[420ms] ease-out"
                    style={{
                      opacity: stage === 1 ? 1 : 0,
                      transform: stage === 1 ? "scale(1)" : "scale(.94)",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  >
                    {"src" in cell ? (
                      <Image
                        src={cell.src}
                        alt={cell.alt}
                        fill
                        sizes="120px"
                        className="object-cover"
                        priority={cell.src === "/landing/hero/repair-before.webp"}
                      />
                    ) : null}
                    {"tag" in cell ? (
                      <div
                        className="absolute right-1.5 top-1.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold"
                        style={{
                          background: "rgba(255,255,255,.95)",
                          color: cell.tagColor,
                        }}
                      >
                        {cell.tag}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[10px] border border-dashed border-line-normal bg-white p-3 text-center text-xs text-label-neutral">
                <Camera className="mx-auto mb-1 size-5 text-brand" />
                사진 추가
              </div>
            </div>

            {/* Stage 2: signature */}
            <div
              className="absolute inset-0 px-[18px] transition-all duration-[360ms] ease-out"
              style={{
                opacity: stage === 2 ? 1 : 0,
                transform: stage === 2 ? "translateY(0)" : "translateY(20px)",
                pointerEvents: stage === 2 ? "auto" : "none",
              }}
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-label-alternative">
                안전관리자 서명
              </div>
              <div className="relative mb-2.5 h-[130px] rounded-[10px] border border-line-alternative bg-white p-4">
                <svg
                  className="absolute left-4 top-4 h-full w-[calc(100%-32px)] text-brand"
                  viewBox="0 0 240 100"
                  aria-hidden
                >
                  <path
                    d="M5 70 C 15 30, 30 80, 45 50 C 60 20, 80 70, 100 45 S 140 75, 160 40 S 200 55, 230 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="500"
                    style={{
                      strokeDashoffset: stage === 2 ? 0 : 500,
                      transition:
                        "stroke-dashoffset 1400ms cubic-bezier(.5, .1, .3, 1)",
                    }}
                  />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-label-neutral">
                <span>이영일 안전관리자</span>
                <span>2026.05.21 14:32</span>
              </div>
              <button
                type="button"
                className="mt-3.5 w-full rounded-[10px] bg-brand py-3 text-sm font-semibold tracking-[-0.01em] text-white"
              >
                점검 완료 · PDF 생성
              </button>
            </div>

            {/* Stage 3: PDF */}
            <div
              className="absolute inset-0 px-[18px] transition-all duration-[360ms] ease-out"
              style={{
                opacity: stage === 3 ? 1 : 0,
                transform: stage === 3 ? "translateY(0)" : "translateY(20px)",
                pointerEvents: stage === 3 ? "auto" : "none",
              }}
            >
              <div
                className="rounded-xl bg-white p-3.5 shadow-[0_12px_30px_rgba(0,30,80,.12),0_2px_6px_rgba(0,30,80,.05)] transition-transform duration-[520ms] ease-out"
                style={{
                  transform:
                    stage === 3 ? "scale(1) rotate(-1.5deg)" : "scale(.92) rotate(0)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[9px] font-bold tracking-[0.06em] text-brand">
                      월점검 대장
                    </div>
                    <div className="mt-0.5 text-[11px] font-bold text-label-normal">
                      햇살어린이공원
                    </div>
                  </div>
                  <div className="text-[8px] text-label-alternative">2026.05</div>
                </div>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="mb-1 flex gap-1">
                    <div className="h-[7px] w-7 rounded-sm bg-fill-strong" />
                    <div className="h-[7px] flex-1 rounded-sm bg-fill-normal" />
                    <div
                      className="h-[7px] w-[18px] rounded-sm"
                      style={{
                        background:
                          row === 3 ? "#E2F8EA" : "var(--semantic-fill-normal)",
                      }}
                    />
                  </div>
                ))}
                <div className="mt-2 border-t border-dashed border-line-normal pt-2 text-brand">
                  <svg width="100%" height="20" viewBox="0 0 160 20" aria-hidden>
                    <path
                      d="M2 14 C 12 4, 22 18, 36 10 S 56 15, 76 6 S 110 18, 158 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#E2F8EA] px-3.5 py-3">
                <div className="flex size-[30px] items-center justify-center rounded-full bg-[#00BF40] text-white">
                  <Check className="size-[18px]" strokeWidth={2.5} />
                </div>
                <div className="text-[12.5px] font-semibold leading-snug text-[#005A1F]">
                  PDF 보고서가 생성되었습니다
                  <br />
                  <span className="text-[11px] font-medium text-[#009632]">
                    2026-05-21_햇살어린이공원.pdf
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[52px] items-center justify-around border-t border-line-alternative bg-white px-3">
            {[
              { Icon: Building2, label: "시설", active: false },
              { Icon: ClipboardList, label: "점검", active: true },
              { Icon: BarChart3, label: "통계", active: false },
              { Icon: Users, label: "관리", active: false },
            ].map(({ Icon, label, active }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-0.5 ${active ? "text-brand" : "text-label-alternative"}`}
              >
                <Icon className="size-5" strokeWidth={1.5} />
                <span className="text-[10px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
