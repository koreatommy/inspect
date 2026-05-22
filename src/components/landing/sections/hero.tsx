"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Play, ShieldCheck, FileText, Bell } from "lucide-react"

import { Reveal } from "../motion/reveal"
import { HeroPhoneMock } from "./hero-phone-mock"

interface HeroProps {
  onPrimaryClick: () => void
  onSecondaryClick: () => void
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const py1 = scrollY * 0.18
  const py2 = scrollY * 0.1
  const py3 = scrollY * 0.28
  const fade = Math.max(0, 1 - scrollY / 600)

  return (
    <section
      id="top"
      data-bg="#FBFCFE"
      className="relative min-h-dvh overflow-hidden pb-20 pt-[120px]"
    >
      {/* Animated background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -left-40 -top-[120px] size-[540px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,102,255,.16) 0%, rgba(0,102,255,0) 65%)",
            transform: `translate3d(${py1 * 0.3}px, ${py1}px, 0)`,
          }}
        />
        <div
          className="absolute -right-[120px] top-20 size-[620px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,191,64,.10) 0%, rgba(0,191,64,0) 65%)",
            transform: `translate3d(${-py2 * 0.3}px, ${-py2}px, 0)`,
          }}
        />
        <div
          className="absolute -bottom-[180px] left-[30%] size-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,146,0,.07) 0%, rgba(255,146,0,0) 65%)",
            transform: `translate3d(${py2 * 0.2}px, ${py3 * 0.6}px, 0)`,
          }}
        />
        {/* Grid pattern */}
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
        {/* Left: copy */}
        <div style={{ opacity: fade }} className="transition-opacity">
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
              <span className="text-brand">한 번의 점검</span>으로
              <br />
              완성됩니다
            </h1>
          </Reveal>

          <Reveal y={20} delay={180} eager>
            <p className="mt-6 max-w-[520px] text-[18.5px] leading-[1.55] tracking-[-0.005em] text-label-neutral">
              월 1회 안전점검부터 법적 의무사항 확인, 전자서명, PDF 보고서까지.
              복잡한 어린이놀이시설 안전관리를 하나의 플랫폼에서 처리하세요.
            </p>
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
        </div>

        {/* Right: floating cards */}
        <div className="landing-hero-visual relative hidden min-h-[600px] items-center justify-center min-[981px]:flex">
          <FloatingCard
            className="left-[-20px] top-[40px]"
            style={{
              transform: `translate3d(${-py2 * 0.3}px, ${py2 * 0.2}px, 0)`,
            }}
            delay={400}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(0,191,64,.12)] text-[#009632]">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-label-alternative">
                  안전점검 상태
                </div>
                <div className="text-sm font-bold text-label-normal">
                  양호 · 5건 완료
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="right-[-30px] top-[160px]"
            style={{
              transform: `translate3d(${py2 * 0.3}px, ${-py2 * 0.2}px, 0)`,
            }}
            delay={550}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(0,102,255,.10)] text-brand">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-label-alternative">
                  점검대장
                </div>
                <div className="text-sm font-bold text-label-normal">
                  PDF 자동 생성
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="bottom-[60px] right-[-10px]"
            style={{
              transform: `translate3d(${py3 * 0.2}px, ${py3 * 0.15}px, 0)`,
            }}
            delay={700}
          >
            <div className="flex items-center gap-3">
              <Sparkline />
              <div>
                <div className="text-[11px] font-medium text-label-alternative">
                  점검 완료율
                </div>
                <div className="text-lg font-bold tracking-[-0.02em] text-label-normal">
                  98.4%{" "}
                  <span className="ml-1 text-[11px] text-[#009632]">
                    ▲ 12.3%p
                  </span>
                </div>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="bottom-[110px] left-[-10px]"
            style={{
              transform: `translate3d(${-py3 * 0.2}px, ${-py3 * 0.12}px, 0)`,
            }}
            delay={850}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-[10px] bg-[rgba(255,146,0,.12)] text-[#D17600]">
                <Bell className="size-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium text-label-alternative">
                  정기검사 만료
                </div>
                <div className="text-sm font-bold text-label-normal">
                  D-37 · 자동 알림
                </div>
              </div>
            </div>
          </FloatingCard>

          <div className="relative z-[2]">
            <HeroPhoneMock />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-label-alternative"
        style={{ opacity: fade }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
          Scroll
        </span>
        <motion.div
          className="h-7 w-px bg-gradient-to-b from-transparent to-label-alternative"
          animate={{ y: ["-4px", "4px", "-4px"], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  )
}

function FloatingCard({
  children,
  className,
  style,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  delay?: number
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <motion.div
      className={`landing-float absolute z-[3] rounded-[14px] border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(0,28,80,.12),0_4px_12px_rgba(0,28,80,.06)] backdrop-blur-xl ${className}`}
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 600ms ease",
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

function Sparkline() {
  return (
    <svg width="56" height="36" viewBox="0 0 56 36" className="text-brand">
      <defs>
        <linearGradient id="spark-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".25" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M2 28 L 10 22 L 18 24 L 26 16 L 34 18 L 42 10 L 54 6 L 54 34 L 2 34 Z"
        fill="url(#spark-g)"
      />
      <path
        d="M2 28 L 10 22 L 18 24 L 26 16 L 34 18 L 42 10 L 54 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="54"
        cy="6"
        r="3"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}
