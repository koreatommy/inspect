"use client"

import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

export function HeroHighlighter({
  children,
  className,
  animateDelay = 0.35,
}: {
  children: React.ReactNode
  className?: string
  /** seconds — Reveal 등과 맞출 때 사용 */
  animateDelay?: number
}) {
  const reducedMotion = useReducedMotion()

  return (
    <span className={cn("relative inline text-brand", className)}>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-[0.06em] left-[-0.1em] z-0 h-[0.42em] w-[calc(100%+0.14em)] origin-left rounded-[3px_2px_4px_2px] bg-[linear-gradient(102deg,rgba(255,236,118,.78)_0%,rgba(255,210,50,.9)_48%,rgba(255,248,155,.72)_100%)]"
        style={{ transform: "rotate(-1.8deg) skewX(-2.5deg)" }}
        initial={reducedMotion ? false : { scaleX: 0, opacity: 0.6 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 0.55,
          delay: reducedMotion ? 0 : animateDelay,
          ease: [0.2, 0.7, 0.2, 1],
        }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute bottom-[0.12em] left-[0.04em] z-0 h-[0.32em] w-[calc(100%+0.06em)] origin-left rounded-[2px] bg-[rgba(255,245,160,.45)]"
        style={{ transform: "rotate(0.6deg) skewX(-4deg)" }}
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 0.45,
          delay: reducedMotion ? 0 : animateDelay + 0.08,
          ease: [0.2, 0.7, 0.2, 1],
        }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  )
}
