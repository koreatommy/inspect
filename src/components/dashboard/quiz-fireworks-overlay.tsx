"use client"

import { useEffect } from "react"
import { Fireworks } from "@fireworks-js/react"
import type { FireworksOptions } from "@fireworks-js/react"
import { useReducedMotion } from "framer-motion"

/** 정답 축하 폭죽 재생 시간 (ms) */
export const QUIZ_FIREWORKS_DURATION_MS = 3300

/** https://fireworks.js.org — 퀴즈 정답용 프리셋 */
export const QUIZ_FIREWORKS_OPTIONS: FireworksOptions = {
  autoresize: true,
  opacity: 0.5,
  acceleration: 1.05,
  friction: 0.97,
  gravity: 1.5,
  particles: 60,
  traceLength: 3,
  traceSpeed: 10,
  explosion: 6,
  intensity: 35,
  flickering: 50,
  lineStyle: "round",
  hue: { min: 0, max: 360 },
  delay: { min: 25, max: 50 },
  rocketsPoint: { min: 12, max: 88 },
  lineWidth: {
    explosion: { min: 1, max: 3 },
    trace: { min: 1, max: 2 },
  },
  brightness: { min: 50, max: 82 },
  decay: { min: 0.015, max: 0.03 },
  mouse: { click: false, move: false, max: 1 },
  sound: { enabled: false },
}

type QuizFireworksOverlayProps = {
  active: boolean
  /** 재생마다 증가 — Fireworks 인스턴스를 새로 마운트 */
  burstKey: number
  onComplete?: () => void
}

export function QuizFireworksOverlay({
  active,
  burstKey,
  onComplete,
}: QuizFireworksOverlayProps) {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!active || reducedMotion) return
    const timeoutId = window.setTimeout(() => {
      onComplete?.()
    }, QUIZ_FIREWORKS_DURATION_MS)
    return () => window.clearTimeout(timeoutId)
  }, [active, reducedMotion, onComplete])

  if (!active || reducedMotion) {
    return null
  }

  return (
    <Fireworks
      key={`quiz-fireworks-${burstKey}`}
      autostart
      options={QUIZ_FIREWORKS_OPTIONS}
      className="pointer-events-none fixed inset-0 z-[120]"
      aria-hidden
    />
  )
}
