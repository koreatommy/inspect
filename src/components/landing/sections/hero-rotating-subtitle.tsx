"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

const SUBTITLE_LINES = [
  "eNoria는 어린이놀이시설의 안전점검, 기록, 보고, 조치 관리를 하나로 연결하는 AI 기반 SaaS 플랫폼입니다.",
  "소파(小波) 방정환의 작은 물결 정신처럼, 작은 점검이 더 큰 안전을 만든다고 믿습니다.",
  "월 1회 안전점검부터 법적 의무사항 확인, 전자서명, PDF 보고서까지. 복잡한 어린이놀이시설 안전관리를 하나의 플랫폼에서 처리하세요.",
] as const

const ROTATE_MS = 5200

const transition = {
  duration: 0.5,
  ease: [0.2, 0.7, 0.2, 1] as const,
}

export function HeroRotatingSubtitle({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SUBTITLE_LINES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  if (reducedMotion) {
    return (
      <p className={className}>
        {SUBTITLE_LINES.map((line, i) => (
          <span key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>
    )
  }

  return (
    <p className={className} aria-live="polite">
      <span className="grid">
        {SUBTITLE_LINES.map((line) => (
          <span
            key={`sizer-${line}`}
            className="pointer-events-none invisible col-start-1 row-start-1 block"
            aria-hidden
          >
            {line}
          </span>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={index}
            className="col-start-1 row-start-1 block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            {SUBTITLE_LINES[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </p>
  )
}
