"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

import { COPY } from "@/lib/landing/copy"
import {
  CALCULATOR_SLIDER,
  calculatePrice,
  formatKRW,
  sliderTickAlign,
  sliderTickPosition,
} from "@/lib/landing/calculator"
import { Reveal } from "../motion/reveal"

export function Calculator() {
  const [count, setCount] = useState(80)
  const result = calculatePrice(count)

  const planColor =
    result.plan === "starter"
      ? "#0066FF"
      : result.plan === "growth"
        ? "#5B37ED"
        : "#E846CD"

  return (
    <section
      id="calculator"
      data-bg="var(--semantic-primary-normal)"
      className="relative overflow-hidden px-8 py-[120px] text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--semantic-primary-heavy) 0%, var(--semantic-primary-normal) 50%, var(--semantic-primary-strong) 100%)",
      }}
    >
      {/* Decorative pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
      >
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="calc-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,.35)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calc-grid)" />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="absolute -right-[100px] -top-[100px] size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,.18), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1100px] items-center gap-16 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-white/70">
              요금 계산기
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-0 mb-4 text-[clamp(32px,3.8vw,48px)] font-bold leading-[1.1] tracking-[-0.032em] text-white [text-wrap:balance]">
              우리 기관의 예상 월 이용료를
              <br />
              바로 확인하세요
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="max-w-[440px] text-[16.5px] leading-relaxed text-white/78">
              관리 시설 수에 따라 적합한 요금제와 예상 월 요금을 즉시
              보여드립니다. 누진 단가가 자동으로 반영됩니다.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140} y={20}>
          <div className="rounded-[20px] bg-white p-8 text-label-strong shadow-[0_30px_80px_rgba(0,20,60,.25),0_8px_16px_rgba(0,20,60,.1)]">
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-semibold text-label-strong">
                관리 시설 수
              </label>
              <div
                className="text-[28px] font-bold tracking-[-0.025em]"
                style={{ color: planColor }}
              >
                {count >= CALCULATOR_SLIDER.max
                  ? `${CALCULATOR_SLIDER.max}+`
                  : count}
                <span className="ml-1 text-base font-medium text-label-alternative">
                  개소
                </span>
              </div>
            </div>

            <input
              type="range"
              min={CALCULATOR_SLIDER.min}
              max={CALCULATOR_SLIDER.max}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="mt-2 w-full"
              style={{ accentColor: planColor }}
            />
            <div className="relative mt-1.5 h-4 text-[11px] text-label-alternative">
              {CALCULATOR_SLIDER.ticks.map((tick) => {
                const align = sliderTickAlign(tick.value)
                return (
                  <span
                    key={tick.value}
                    className="absolute whitespace-nowrap"
                    style={{
                      left: `${sliderTickPosition(tick.value)}%`,
                      transform:
                        align === "start"
                          ? "translateX(0)"
                          : align === "end"
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                    }}
                  >
                    {tick.label}
                  </span>
                )
              })}
            </div>

            {/* Result */}
            <div className="mt-6 rounded-[14px] bg-landing-bg-alt p-5">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.02em] text-white"
                  style={{ background: planColor }}
                >
                  추천 · {result.planLabel}
                </span>
                <span className="text-xs text-label-neutral">{result.hint}</span>
              </div>

              {result.blocked ? (
                <div>
                  <div className="text-[32px] font-bold tracking-[-0.025em]">
                    별도 견적
                  </div>
                  <div className="mt-1 text-[13px] text-label-neutral">
                    500개소 초과는 사용 패턴과 요구사항을 반영하여 안내드립니다.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[36px] font-bold tracking-[-0.03em]">
                      {formatKRW(result.total)}
                    </span>
                    <span className="text-base text-label-alternative">
                      원 / 월
                    </span>
                  </div>
                  <div className="mt-3.5 grid gap-1 text-[13px] text-label-neutral">
                    <div className="flex justify-between">
                      <span>월 기본료</span>
                      <span className="font-semibold text-label-strong">
                        {formatKRW(result.baseFee)}원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>개소별 단가 ({count}개소)</span>
                      <span className="font-semibold text-label-strong">
                        {formatKRW(result.unitFee)}원
                      </span>
                    </div>
                  </div>
                </>
              )}

              <button className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-[10px] bg-label-strong text-[15px] font-semibold tracking-[-0.01em] text-white">
                도입 상담 신청
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
