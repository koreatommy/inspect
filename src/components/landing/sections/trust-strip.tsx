"use client"

import "./trust-strip.css"

import { motion, useReducedMotion } from "framer-motion"
import { useMemo } from "react"

import { cn } from "@/lib/utils"

import { Reveal } from "../motion/reveal"
import { TRUST_ORGS } from "./trust-strip-orgs"

const orgMarkVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] as const },
  },
}

function TrustOrgMark({
  org,
  index,
  reducedMotion,
  entrance = "view",
}: {
  org: (typeof TRUST_ORGS)[number]
  index: number
  reducedMotion: boolean
  entrance?: "view" | "mount"
}) {
  const classNames = cn(
    "trust-strip-org shrink-0 whitespace-nowrap text-label-strong transition-colors duration-300",
    org.fontClass,
    org.className,
  )

  const hoverProps = reducedMotion
    ? undefined
    : {
        scale: 1.06,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 400, damping: 22 },
      }

  if (reducedMotion) {
    return (
      <span className={classNames} style={org.style}>
        {org.name}
      </span>
    )
  }

  if (entrance === "mount") {
    return (
      <motion.span
        variants={orgMarkVariants}
        whileHover={hoverProps}
        className={classNames}
        style={org.style}
      >
        {org.name}
      </motion.span>
    )
  }

  return (
    <motion.span
      className={classNames}
      style={org.style}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.5 } }}
      viewport={{ once: true, amount: 0.5 }}
      whileHover={hoverProps}
    >
      {org.name}
    </motion.span>
  )
}

function MarqueeTrack({ reducedMotion }: { reducedMotion: boolean }) {
  const items = useMemo(
    () => (reducedMotion ? TRUST_ORGS : [...TRUST_ORGS, ...TRUST_ORGS]),
    [reducedMotion],
  )

  return (
    <motion.div
      className={cn(
        "trust-strip-marquee-track flex w-max items-center gap-14 md:gap-20",
        !reducedMotion && "trust-strip-marquee-animate",
      )}
      aria-hidden={!reducedMotion ? true : undefined}
      initial={reducedMotion ? false : "hidden"}
      animate={reducedMotion ? undefined : "visible"}
      variants={
        reducedMotion
          ? undefined
          : {
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.04, delayChildren: 0.1 },
              },
            }
      }
    >
      {items.map((org, i) => (
        <TrustOrgMark
          key={`${org.id}-${i}`}
          org={org}
          index={i % TRUST_ORGS.length}
          reducedMotion={reducedMotion}
          entrance="mount"
        />
      ))}
    </motion.div>
  )
}

export function TrustStrip() {
  const reducedMotion = useReducedMotion()

  return (
    <section
      data-bg="#F4F6FA"
      className="relative overflow-hidden px-8 py-14 md:py-16"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-normal/60 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1240px]">
        <Reveal>
          <p className="mb-8 text-center text-[14px] font-semibold tracking-[-0.01em] text-label-alternative md:mb-10 md:text-[15px]">
            <motion.span
              className="inline-block max-w-[36em]"
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              whileInView={
                reducedMotion
                  ? undefined
                  : {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] },
                    }
              }
              viewport={{ once: true }}
            >
              지자체, 교육청, 학교, 공원녹지과, 안전관리지원기관에 적극 추천합니다.
            </motion.span>
          </p>
        </Reveal>

        {reducedMotion ? (
          <div
            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 px-2"
            role="list"
            aria-label="도입 기관"
          >
            {TRUST_ORGS.map((org, i) => (
              <span key={org.id} role="listitem">
                <TrustOrgMark org={org} index={i} reducedMotion entrance="view" />
              </span>
            ))}
          </div>
        ) : (
          <div
            className="trust-strip-marquee relative -mx-4 md:-mx-8"
            role="region"
            aria-label="도입 기관"
          >
            <div className="trust-strip-marquee-fade-left pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-24" />
            <div className="trust-strip-marquee-fade-right pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-24" />
            <div className="flex overflow-hidden py-1">
              <MarqueeTrack reducedMotion={false} />
            </div>
            <div className="sr-only">
              {TRUST_ORGS.map((org) => (
                <span key={org.id}>{org.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
