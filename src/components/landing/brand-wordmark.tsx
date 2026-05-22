"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

const ROTATE_MS = 2600

const transition = {
  duration: 0.42,
  ease: [0.2, 0.7, 0.2, 1] as const,
}

interface BrandWordmarkProps {
  className?: string
  style?: React.CSSProperties
  variant?: "light" | "dark"
}

export function BrandWordmark({
  className,
  style,
  variant = "light",
}: BrandWordmarkProps) {
  const [showAi, setShowAi] = useState(false)
  const reducedMotion = useReducedMotion()

  const iaClass = variant === "dark" ? "text-white" : "text-black"
  const aiClass = variant === "dark" ? "text-[#C4B5FD]" : "text-[#7C3AED]"

  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => {
      setShowAi((v) => !v)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  const rootClass = cn(
    "inline-flex items-baseline whitespace-nowrap font-bold tracking-[-0.02em]",
    className,
  )

  if (reducedMotion) {
    return (
      <span className={rootClass} style={style} aria-label="eNoria">
        eNor<span className={iaClass}>ia</span>
      </span>
    )
  }

  return (
    <span
      className={rootClass}
      style={style}
      aria-label="eNoria"
      aria-live="polite"
    >
      eNor
      <span className="relative inline-block align-baseline tracking-[-0.02em]">
        <span className="invisible select-none font-bold" aria-hidden>
          AI
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={showAi ? "ai" : "ia"}
            className={cn(
              "absolute left-0 top-0 inline-block whitespace-nowrap tracking-[-0.02em]",
              showAi ? aiClass : iaClass,
            )}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={transition}
          >
            {showAi ? "AI" : "ia"}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}
