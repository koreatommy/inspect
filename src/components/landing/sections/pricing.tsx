"use client"

import { ArrowRight, Check } from "lucide-react"

import { COPY } from "@/lib/landing/copy"
import { formatKRW } from "@/lib/landing/calculator"
import { Reveal } from "../motion/reveal"

export function Pricing() {
  return (
    <section
      id="pricing"
      data-bg="#ffffff"
      className="relative px-8 py-[140px]"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-16 text-center">
          <Reveal>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
              요금제
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-0 mb-4 text-[clamp(34px,4vw,52px)] font-bold leading-[1.1] tracking-[-0.032em] text-label-strong [text-wrap:balance]">
              {COPY.pricing.headline}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto max-w-[560px] whitespace-pre-line text-[17px] leading-relaxed text-label-neutral">
              {COPY.pricing.subheadline}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {COPY.pricing.plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 80} y={28}>
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlanCard({ plan }: { plan: (typeof COPY.pricing.plans)[number] }) {
  const isHighlighted = "highlighted" in plan && plan.highlighted
  const bg = isHighlighted ? "#0F0F10" : "#fff"
  const fg = isHighlighted ? "#fff" : "var(--semantic-label-strong)"
  const muted = isHighlighted
    ? "rgba(247,247,248,.65)"
    : "var(--semantic-label-neutral)"
  const border = isHighlighted
    ? "transparent"
    : "var(--semantic-line-normal-alternative)"

  const unitTierText =
    plan.tiers.length === 1
      ? `1~${plan.tiers[0].to}개소 · 개소당 ${formatKRW(plan.tiers[0].unitPrice)}원`
      : plan.tiers
          .map(
            (t) => `${t.from}~${t.to}개소 ${formatKRW(t.unitPrice)}원`
          )
          .join(" · ")

  return (
    <div
      className="relative flex h-full flex-col rounded-[20px] p-7"
      style={{
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        boxShadow: isHighlighted
          ? "0 30px 60px rgba(0, 36, 102, .25), 0 8px 20px rgba(0, 36, 102, .15)"
          : "0 1px 2px rgba(23,23,23,.02)",
      }}
    >
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1.5 text-xs font-bold tracking-[0.02em] text-white">
          가장 인기 있는 요금제
        </div>
      )}

      <div className="text-[22px] font-bold tracking-[-0.022em]">{plan.name}</div>
      <div className="mt-1 text-[13px]" style={{ color: muted }}>
        {plan.tagline}
      </div>

      <div className="mb-2 mt-6 flex items-baseline gap-1.5">
        <span className="text-sm font-medium" style={{ color: muted }}>
          월
        </span>
        <span className="text-[40px] font-bold leading-none tracking-[-0.03em]">
          {formatKRW(plan.baseFee)}
        </span>
        <span className="text-sm font-medium" style={{ color: muted }}>
          원~
        </span>
      </div>
      <div className="mb-[18px] text-[12.5px]" style={{ color: muted }}>
        {unitTierText}
      </div>

      <div
        className="mb-6 rounded-lg px-3 py-2 text-[12.5px]"
        style={{
          background: isHighlighted
            ? "rgba(255,255,255,.07)"
            : "var(--semantic-background-normal-alternative)",
          color: isHighlighted ? "rgba(247,247,248,.8)" : muted,
        }}
      >
        관리 한도 ·{" "}
        <strong style={{ color: fg, fontWeight: 600 }}>
          최대 {plan.maxFacilities}개소
          {plan.id === "pro" && ", 초과 시 별도 문의"}
        </strong>
      </div>

      <button
        className="mb-7 flex h-12 w-full items-center justify-center gap-1.5 rounded-[10px] text-[15px] font-semibold tracking-[-0.01em] transition-opacity hover:opacity-90"
        style={{
          background: isHighlighted ? "#fff" : "var(--semantic-label-strong)",
          color: isHighlighted ? "#0F0F10" : "#fff",
        }}
      >
        {plan.id === "pro" ? "도입 상담 신청" : "시작하기"}
        <ArrowRight className="size-4" />
      </button>

      <ul className="m-0 grid list-none gap-2.5 p-0">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2.5 text-sm leading-snug">
            <span
              className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full"
              style={{
                background: isHighlighted
                  ? "rgba(0,191,64,.18)"
                  : "rgba(0,191,64,.12)",
                color: isHighlighted ? "#7DF5A5" : "#009632",
              }}
            >
              <Check className="size-[11px]" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {"addons" in plan && plan.addons && (
        <div
          className="mt-5 border-t pt-[18px]"
          style={{
            borderColor: isHighlighted
              ? "rgba(255,255,255,.12)"
              : "var(--semantic-line-normal-alternative)",
          }}
        >
          <div
            className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.04em]"
            style={{ color: muted }}
          >
            선택 부가기능
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.addons.map((a) => (
              <span
                key={a}
                className="rounded-full px-2.5 py-1 text-[11.5px] font-medium"
                style={{
                  background: isHighlighted
                    ? "rgba(255,255,255,.08)"
                    : "var(--semantic-background-normal-alternative)",
                  color: isHighlighted ? "rgba(247,247,248,.85)" : muted,
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-5">
        <div
          className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.04em]"
          style={{ color: muted }}
        >
          추천 대상
        </div>
        <div className="text-[13px] leading-relaxed" style={{ color: muted }}>
          {plan.recommended.join(" · ")}
        </div>
      </div>
    </div>
  )
}
