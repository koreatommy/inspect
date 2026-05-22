"use client"

import { motion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.2, 0.7, 0.2, 1],
    },
  },
}

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  /** 첫 화면(히어로 등): 마운트 시 바로 표시 */
  eager?: boolean
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  eager = false,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={eager ? "visible" : undefined}
      whileInView={eager ? undefined : "visible"}
      viewport={
        eager
          ? undefined
          : { once, amount: 0.15, margin: "0px 0px -8% 0px" }
      }
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.7,
            delay: delay / 1000,
            ease: [0.2, 0.7, 0.2, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealStagger({
  children,
  className,
  staggerDelay = 100,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay / 1000,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealChild({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={revealVariants}>
      {children}
    </motion.div>
  )
}
