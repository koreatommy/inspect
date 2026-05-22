"use client"

import { ArrowRight } from "lucide-react"

import { COPY } from "@/lib/landing/copy"
import { Reveal } from "../motion/reveal"

export function Comparison() {
  return (
    <section
      id="comparison"
      data-bg="#FBFCFE"
      className="relative px-8 py-[140px]"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <Reveal>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
              도입 효과
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-0 text-[clamp(32px,3.8vw,48px)] font-bold leading-[1.1] tracking-[-0.03em] text-label-strong">
              {COPY.comparison.headline}
            </h2>
          </Reveal>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-line-alternative bg-white shadow-[0_2px_4px_rgba(23,23,23,.02)]">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line-alternative bg-landing-bg-alt px-6 py-4 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-label-alternative">
            <span>도입 전</span>
            <span className="w-6" />
            <span className="text-brand">도입 후</span>
          </div>

          {COPY.comparison.items.map((row, i) => (
            <Reveal key={row.before} delay={i * 50} y={12}>
              <div
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5"
                style={{
                  borderBottom:
                    i < COPY.comparison.items.length - 1
                      ? "1px solid var(--semantic-line-normal-alternative)"
                      : "none",
                }}
              >
                <div className="text-[15px] text-label-neutral line-through decoration-label-assistive">
                  {row.before}
                </div>
                <div className="flex size-7 items-center justify-center rounded-full bg-[rgba(0,102,255,.10)] text-brand">
                  <ArrowRight className="size-3.5" />
                </div>
                <div className="text-[15.5px] font-semibold tracking-[-0.01em] text-label-strong">
                  {row.after}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
