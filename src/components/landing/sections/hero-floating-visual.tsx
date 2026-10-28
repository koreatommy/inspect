"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { Bell, FileText, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"

import { HeroPhoneMock } from "./hero-phone-mock"

const CARD_EASE = [0.22, 1, 0.36, 1] as const

type FloatingCardSpec = {
  id: string
  className: string
  delay: number
  floatDuration: number
  xFactor: number
  yFactor: number
  content: ReactNode
}

const FLOATING_CARDS: FloatingCardSpec[] = [
  {
    id: "status",
    className: "left-[-20px] top-[40px]",
    delay: 0.35,
    floatDuration: 5.2,
    xFactor: -0.03,
    yFactor: 0.02,
    content: (
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
    ),
  },
  {
    id: "ledger",
    className: "right-[-30px] top-[160px]",
    delay: 0.48,
    floatDuration: 5.8,
    xFactor: 0.03,
    yFactor: -0.02,
    content: (
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
    ),
  },
  {
    id: "completion",
    className: "bottom-[60px] right-[-10px]",
    delay: 0.62,
    floatDuration: 6.4,
    xFactor: 0.056,
    yFactor: 0.042,
    content: (
      <div className="flex items-center gap-3">
        <Sparkline />
        <div>
          <div className="text-[11px] font-medium text-label-alternative">
            점검 완료율
          </div>
          <div className="text-lg font-bold tracking-[-0.02em] text-label-normal">
            98.4%{" "}
            <span className="ml-1 text-[11px] text-[#009632]">▲ 12.3%p</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "expiry",
    className: "bottom-[110px] left-[-10px]",
    delay: 0.74,
    floatDuration: 5.5,
    xFactor: -0.056,
    yFactor: -0.034,
    content: (
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
    ),
  },
]

export function HeroFloatingVisual() {
  const reduceMotion = useReducedMotion()
  const { scrollY } = useScroll()

  return (
    <div className="landing-hero-visual relative hidden min-h-[600px] items-center justify-center min-[981px]:flex">
      {FLOATING_CARDS.map((card) => (
        <FloatingCard
          key={card.id}
          card={card}
          scrollY={scrollY}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}

      <motion.div
        className="relative z-[2] will-change-transform"
        initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 120, damping: 20, delay: 0.2 }
        }
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -8, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 6.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.1,
                }
          }
        >
          <HeroPhoneMock />
        </motion.div>
      </motion.div>
    </div>
  )
}

function FloatingCard({
  card,
  scrollY,
  reduceMotion,
}: {
  card: FloatingCardSpec
  scrollY: MotionValue<number>
  reduceMotion: boolean
}) {
  const x = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * card.xFactor,
  )
  const y = useTransform(() =>
    reduceMotion ? 0 : scrollY.get() * card.yFactor,
  )

  return (
    <motion.div
      className={`landing-float absolute z-[3] will-change-transform ${card.className}`}
      style={reduceMotion ? undefined : { x, y }}
    >
      <motion.div
        className="rounded-[14px] border border-white/80 bg-white/92 p-3 shadow-[0_18px_40px_rgba(0,28,80,.12),0_4px_12px_rgba(0,28,80,.06)] backdrop-blur-xl"
        initial={
          reduceMotion ? false : { opacity: 0, y: 18, scale: 0.94 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 140,
                damping: 18,
                delay: card.delay,
              }
        }
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -5, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: card.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: card.delay + 0.9,
                }
          }
        >
          {card.content}
        </motion.div>
      </motion.div>
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
      <motion.path
        d="M2 28 L 10 22 L 18 24 L 26 16 L 34 18 L 42 10 L 54 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.35 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.9, ease: CARD_EASE }}
      />
      <motion.circle
        cx="54"
        cy="6"
        r="3"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 16,
          delay: 1.55,
        }}
      />
    </svg>
  )
}
