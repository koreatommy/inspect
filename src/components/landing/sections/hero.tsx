"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
import { ArrowRight, Play } from "lucide-react"

import { Reveal } from "../motion/reveal"
import { HeroFloatingVisual } from "./hero-floating-visual"
import { HeroHighlighter } from "./hero-highlight"
import { HeroRotatingSubtitle } from "./hero-rotating-subtitle"

interface HeroProps {
  onPrimaryClick: () => void
  onSecondaryClick: () => void
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const blob1Y = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * 0.18,
  )
  const blob1X = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * 0.054,
  )
  const blob2Y = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * -0.1,
  )
  const blob2X = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * -0.03,
  )
  const blob3Y = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * 0.168,
  )
  const blob3X = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * 0.02,
  )
  const copyOpacity = useTransform(() =>
    reduceMotion ? 1 : Math.max(0, 1 - scrollY.get() / 600),
  )

  return (
    <section
      id="top"
      data-bg="#FBFCFE"
      className="relative min-h-dvh overflow-hidden pb-20 pt-[120px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute -left-40 -top-[120px] size-[540px] rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle, rgba(0,102,255,.16) 0%, rgba(0,102,255,0) 65%)",
            x: blob1X,
            y: blob1Y,
          }}
        />
        <motion.div
          className="absolute -right-[120px] top-20 size-[620px] rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle, rgba(0,191,64,.10) 0%, rgba(0,191,64,0) 65%)",
            x: blob2X,
            y: blob2Y,
          }}
        />
        <motion.div
          className="absolute -bottom-[180px] left-[30%] size-[700px] rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle, rgba(255,146,0,.07) 0%, rgba(255,146,0,0) 65%)",
            x: blob3X,
            y: blob3Y,
          }}
        />
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 opacity-35"
        >
          <defs>
            <pattern
              id="hero-grid"
              width="44"
              height="44"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="rgba(112,115,124,.18)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="landing-hero-grid relative mx-auto grid max-w-[1240px] items-center gap-14 px-8 max-[980px]:grid-cols-1 min-[981px]:grid-cols-[1.05fr_0.95fr]">
        <motion.div style={{ opacity: copyOpacity }} className="min-w-0">
          <Reveal y={16} eager>
            <div className="inline-flex items-center gap-2 rounded-full border border-line-normal bg-white px-3 py-1.5 text-[13px] font-medium text-label-neutral shadow-sm">
              <span className="flex size-[18px] items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                N
              </span>
              <span className="text-label-strong">행정안전부 기준</span>
              <span>·</span>
              <span>안전관리 항목 전체 반영</span>
            </div>
          </Reveal>

          <Reveal y={24} delay={80} eager>
            <h1 className="mt-5 text-[clamp(40px,5.6vw,76px)] font-bold leading-[1.05] tracking-[-0.035em] text-label-strong [text-wrap:balance]">
              안전한 놀이터,
              <br />
              <HeroHighlighter animateDelay={0.42}>한 번의 점검</HeroHighlighter>으로
              <br />
              완성됩니다
            </h1>
          </Reveal>

          <Reveal y={20} delay={180} eager>
            <HeroRotatingSubtitle className="mt-6 max-w-[520px] text-[18.5px] leading-[1.55] tracking-[-0.005em] text-label-neutral" />
          </Reveal>

          <Reveal y={16} delay={260} eager>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <button
                onClick={onPrimaryClick}
                className="inline-flex h-[54px] items-center gap-2 rounded-xl bg-label-strong px-7 text-base font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-black"
              >
                무료 상담 신청
                <ArrowRight className="size-[18px]" />
              </button>
              <button
                onClick={onSecondaryClick}
                className="inline-flex h-[54px] items-center gap-2 rounded-xl border border-line-normal bg-white px-6 text-base font-semibold tracking-[-0.01em] text-label-strong transition-colors hover:bg-fill-normal"
              >
                <Play className="size-3.5" />
                3분 데모 보기
              </button>
            </div>
          </Reveal>

          <Reveal y={12} delay={360} eager>
            <div className="mt-10 flex flex-wrap gap-5 border-t border-line-alternative pt-7">
              {[
                { k: "2,400+", v: "관리 시설" },
                { k: "128", v: "도입 기관" },
                { k: "99.2%", v: "점검 누락률 0%" },
              ].map((stat) => (
                <div key={stat.v} className="min-w-[100px]">
                  <div className="text-[28px] font-bold tracking-[-0.025em] text-label-strong">
                    {stat.k}
                  </div>
                  <div className="mt-0.5 text-[13px] text-label-alternative">
                    {stat.v}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </motion.div>

        <HeroFloatingVisual />
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-label-alternative"
        style={{ opacity: copyOpacity }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
          Scroll
        </span>
        <motion.div
          className="h-7 w-px bg-gradient-to-b from-transparent to-label-alternative"
          animate={
            reduceMotion
              ? undefined
              : { y: ["-4px", "4px", "-4px"], opacity: [0.25, 1, 0.25] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }
        />
      </motion.div>
    </section>
  )
}
