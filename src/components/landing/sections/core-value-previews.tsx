"use client"

import Image from "next/image"
import { Bell, Check, CheckCircle, ShieldCheck, Wrench } from "lucide-react"

const REPAIR_PHOTOS = [
  {
    src: "/landing/hero/repair-before.webp",
    alt: "그네 수리 전 현장 사진",
    label: "수리 전",
    tagColor: "#E52222",
  },
  {
    src: "/landing/hero/repair-after.webp",
    alt: "그네 수리 후 현장 사진",
    label: "수리 후",
    tagColor: "#009632",
  },
] as const

export type CoreValueTone = {
  fg: string
  bg: string
  label: string
}

export function CoreValuePreviewCard({
  step,
  tone,
}: {
  step: number
  tone: CoreValueTone
}) {
  return (
    <div className="relative h-[480px] w-[380px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_rgba(0,36,102,.12),0_8px_16px_rgba(0,36,102,.06)]">
      <div className="flex items-center justify-between border-b border-line-alternative px-[22px] py-[18px]">
        <div>
          <div
            className="text-[11px] font-semibold tracking-[0.06em]"
            style={{ color: tone.fg }}
          >
            {tone.label}
          </div>
          <div className="mt-0.5 text-base font-bold tracking-[-0.015em] text-label-normal">
            햇살어린이공원
          </div>
        </div>
        <div
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          2026.05
        </div>
      </div>
      <div className="relative h-[calc(100%-70px)]">
        {step === 0 && <PreviewChecklist />}
        {step === 1 && <PreviewObligations />}
        {step === 2 && <PreviewPdf />}
        {step === 3 && <PreviewRepair />}
        {step === 4 && <PreviewStats />}
      </div>
    </div>
  )
}

function PreviewChecklist() {
  const items = [
    { label: "미끄럼판 균열·이탈", state: "양호" },
    { label: "손잡이 견고성", state: "양호" },
    { label: "바닥재 충격흡수", state: "요주의" },
    { label: "연결부 고정 상태", state: "양호" },
    { label: "주변 안전영역", state: "양호" },
    { label: "안전표지판", state: "양호" },
  ]

  const stateColor = (s: string) =>
    s === "양호"
      ? { bg: "#E2F8EA", fg: "#009632" }
      : s === "요주의"
        ? { bg: "rgba(255,146,0,.14)", fg: "#D17600" }
        : { bg: "rgba(255,66,66,.12)", fg: "#E52222" }

  return (
    <div className="px-[18px] py-3.5">
      {items.map((it, i) => {
        const c = stateColor(it.state)
        return (
          <div
            key={it.label}
            className="flex items-center gap-3 border-b border-line-alternative py-[11px] last:border-0 landing-fade-row-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex size-[22px] items-center justify-center rounded-md bg-brand">
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
            </div>
            <div className="flex-1 text-sm font-medium text-label-normal">
              {it.label}
            </div>
            <div
              className="rounded-full px-2 py-[3px] text-[11.5px] font-bold"
              style={{ background: c.bg, color: c.fg }}
            >
              {it.state}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PreviewObligations() {
  const list = [
    { label: "설치검사", date: "2024.03.15 완료", remain: "유효", warn: false },
    { label: "정기시설검사", date: "2024.08.22 완료", remain: "D-318", warn: false },
    { label: "안전교육", date: "2025.09.10 만료", remain: "D-37", warn: true },
    { label: "보험가입", date: "2026.12.31 만료", remain: "D-589", warn: false },
  ]

  return (
    <div className="px-[18px] py-3.5">
      {list.map((it, i) => (
        <div
          key={it.label}
          className="mb-2 flex items-center gap-3 rounded-[10px] border px-3.5 py-3 landing-fade-row-in"
          style={{
            animationDelay: `${i * 80}ms`,
            background: it.warn
              ? "rgba(255,146,0,.06)"
              : "var(--semantic-background-normal-alternative)",
            borderColor: it.warn
              ? "rgba(255,146,0,.30)"
              : "var(--semantic-line-normal-alternative)",
          }}
        >
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{
              background: it.warn
                ? "rgba(255,146,0,.16)"
                : "rgba(0,191,64,.16)",
              color: it.warn ? "#D17600" : "#009632",
            }}
          >
            {it.warn ? (
              <Bell className="size-4" strokeWidth={1.5} />
            ) : (
              <ShieldCheck className="size-4" strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-label-normal">
              {it.label}
            </div>
            <div className="mt-px text-[11.5px] text-label-alternative">
              {it.date}
            </div>
          </div>
          <div
            className="text-xs font-bold"
            style={{ color: it.warn ? "#D17600" : "#009632" }}
          >
            {it.remain}
          </div>
        </div>
      ))}
    </div>
  )
}

function PreviewPdf() {
  return (
    <div className="relative flex h-full items-center justify-center px-6 py-[18px]">
      <div className="landing-pdf-drop relative h-[280px] w-[200px] rotate-[-3deg] rounded-lg bg-white p-4 shadow-[0_18px_38px_rgba(0,36,102,.14),0_4px_8px_rgba(0,36,102,.06)]">
        <div className="text-[8px] font-bold tracking-[0.06em] text-brand">
          월점검 대장
        </div>
        <div className="mt-0.5 text-[11px] font-bold text-label-normal">
          햇살어린이공원
        </div>
        <div className="my-2 h-px bg-line-alternative" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="mb-1 flex gap-1">
            <div className="h-[5px] w-[30px] rounded-sm bg-fill-strong" />
            <div className="h-[5px] flex-1 rounded-sm bg-fill-normal" />
            <div
              className="h-[5px] w-5 rounded-sm"
              style={{
                background:
                  i % 3 === 0 ? "#E2F8EA" : "var(--semantic-fill-normal)",
              }}
            />
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between border-t border-dashed border-line-normal pt-1.5 text-[8px] text-label-alternative">
          <span>이영일 안전관리자</span>
          <span>(서명)</span>
        </div>
      </div>
      <div
        className="absolute bottom-7 right-7 flex items-center gap-2 rounded-xl border border-line-normal bg-white px-3.5 py-2.5 shadow-[0_12px_24px_rgba(0,36,102,.12)] landing-fade-row-in"
        style={{ animationDelay: "400ms" }}
      >
        <div className="flex size-7 items-center justify-center rounded-lg bg-[rgba(0,191,64,.16)] text-[#009632]">
          <Check className="size-4" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[11px] font-bold text-label-normal">
            PDF 생성 완료
          </div>
          <div className="text-[9.5px] text-label-alternative">
            0.8MB · 4페이지
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewRepair() {
  return (
    <div className="px-[18px] py-3.5">
      <div className="mb-3 grid grid-cols-2 gap-2">
        {REPAIR_PHOTOS.map((photo, i) => (
          <div
            key={photo.label}
            className="relative aspect-square overflow-hidden rounded-[10px] landing-fade-row-in"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 170px"
              className="object-cover"
            />
            <div
              className="absolute left-2 top-2 z-10 rounded px-[7px] py-[3px] text-[10px] font-bold"
              style={{ background: "#fff", color: photo.tagColor }}
            >
              {photo.label}
            </div>
          </div>
        ))}
      </div>
      <div
        className="rounded-[10px] border border-line-alternative bg-landing-bg-alt p-3 landing-fade-row-in"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-1.5 flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-[rgba(0,102,255,.10)] text-brand">
            <Wrench className="size-3.5" strokeWidth={1.5} />
          </div>
          <div className="text-[13px] font-bold text-label-normal">
            그네줄 교체 보수
          </div>
        </div>
        <div className="text-xs leading-relaxed text-label-neutral">
          요청 2026.05.03 · 완료 2026.05.18
          <br />
          담당 이영일 · 시공사 (주)안전놀이
        </div>
      </div>
      <div
        className="mt-2.5 flex items-center gap-2 rounded-[10px] border border-[rgba(0,191,64,.20)] bg-[rgba(0,191,64,.06)] px-3 py-2.5 text-xs font-semibold text-[#009632] landing-fade-row-in"
        style={{ animationDelay: "360ms" }}
      >
        <CheckCircle className="size-4" strokeWidth={1.5} />
        조치 완료 · 사진 2장 첨부
      </div>
    </div>
  )
}

function PreviewStats() {
  const segments = [
    { label: "양호", count: 38, color: "#00BF40" },
    { label: "요주의", count: 6, color: "#FF9200" },
    { label: "요수리", count: 3, color: "#FF5E00" },
    { label: "이용금지", count: 1, color: "#E52222" },
  ]
  const total = segments.reduce((a, b) => a + b.count, 0)

  return (
    <div className="px-[22px] py-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.04em] text-label-alternative">
        시설 상태 분포 (48개소)
      </div>
      <div className="mb-4 flex h-3.5 overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="landing-bar-in origin-left"
            style={{
              flexBasis: `${(s.count / total) * 100}%`,
              background: s.color,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-lg bg-landing-bg-alt px-3 py-2.5 landing-fade-row-in"
            style={{ animationDelay: `${i * 80 + 240}ms` }}
          >
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-[12.5px] font-semibold text-label-normal">
                {s.label}
              </span>
            </div>
            <span className="text-sm font-bold tracking-[-0.015em] text-label-normal">
              {s.count}건
            </span>
          </div>
        ))}
      </div>
      <div
        className="mt-3.5 rounded-[10px] bg-landing-bg-alt p-3 landing-fade-row-in"
        style={{ animationDelay: "540ms" }}
      >
        <div className="mb-1.5 text-[11px] text-label-alternative">
          월별 점검 추이
        </div>
        <svg
          width="100%"
          height="48"
          viewBox="0 0 280 48"
          className="text-brand"
          aria-hidden
        >
          <defs>
            <linearGradient id="core-trend-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M5 38 L 40 30 L 75 32 L 110 22 L 145 24 L 180 16 L 215 14 L 250 6 L 275 8 L 275 46 L 5 46 Z"
            fill="url(#core-trend-g)"
          />
          <path
            d="M5 38 L 40 30 L 75 32 L 110 22 L 145 24 L 180 16 L 215 14 L 250 6 L 275 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
