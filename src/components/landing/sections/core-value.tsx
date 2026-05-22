"use client"

import { useRef, useState } from "react"
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion"

import { CoreValuePreviewCard } from "./core-value-previews"

const steps = [
  {
    kicker: "01 · 표준화",
    title: "월 1회 안전점검 업무 표준화",
    desc: "시설별 점검 항목을 디지털화하여 누락 없는 점검을 지원합니다. 행정안전부 안전관리 항목이 그대로 반영되어 있어, 점검자가 바뀌어도 동일한 기준으로 진행됩니다.",
    tone: { fg: "#005EEB", bg: "rgba(0,102,255,.10)", label: "체크리스트" },
  },
  {
    kicker: "02 · 의무사항",
    title: "법적 의무사항 한눈에 확인",
    desc: "설치검사, 정기시설검사, 안전교육, 보험가입 등 시설별 의무사항과 만료일을 통합 관리합니다. D-30 시점부터 자동으로 알림을 보내드립니다.",
    tone: { fg: "#D17600", bg: "rgba(255,146,0,.10)", label: "의무사항" },
  },
  {
    kicker: "03 · 자동화",
    title: "점검대장 PDF 자동 생성",
    desc: "현장에서 입력한 점검 결과와 사진, 디지털 서명이 곧바로 월점검 대장으로 변환됩니다. 별도 문서 편집 없이 제출 가능한 형태로 미리보기·다운로드할 수 있습니다.",
    tone: { fg: "#009632", bg: "rgba(0,191,64,.10)", label: "PDF 생성" },
  },
  {
    kicker: "04 · 추적성",
    title: "시설 단위 사진·수리 이력",
    desc: "기구별 위해요소와 수리 전·후 사진, 조치 이력을 시설 단위로 묶어서 관리합니다. 어떤 시설의, 어떤 기구의 사진인지 한 번에 추적할 수 있습니다.",
    tone: { fg: "#5B37ED", bg: "rgba(101,65,242,.10)", label: "이력 관리" },
  },
  {
    kicker: "05 · 인사이트",
    title: "통계로 보는 시설 관리 우선순위",
    desc: "양호·요주의·요수리·이용금지 상태를 월별로 분석합니다. 가장 위험한 시설, 미조치 시설을 한눈에 파악하여 관리 우선순위를 결정할 수 있습니다.",
    tone: { fg: "#E846CD", bg: "rgba(232,70,205,.10)", label: "통계 분석" },
  },
]

export function CoreValue() {
  const wrapRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  })

  const activeIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, steps.length - 0.01]
  )

  useMotionValueEvent(activeIndex, "change", (latest) => {
    setActiveStep(Math.min(Math.floor(latest), steps.length - 1))
  })

  return (
    <section
      id="features-intro"
      ref={wrapRef}
      data-bg="#FBFCFE"
      className="relative"
      style={{ height: `${steps.length * 80}vh` }}
    >
      <div className="sticky top-0 flex h-dvh items-center overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: useTransform(activeIndex, (i) => {
              const step = steps[Math.floor(i)]
              return `radial-gradient(circle at ${20 + Math.floor(i) * 16}% ${30 + Math.floor(i) * 10}%, ${step.tone.bg}, transparent 55%)`
            }),
          }}
        />

        <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-20 px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden justify-center lg:flex">
            <CoreValuePreviewCard
              step={activeStep}
              tone={steps[activeStep].tone}
            />
          </div>

          <div>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
              핵심 가치
            </div>
            <h2 className="mb-14 max-w-[540px] text-[clamp(32px,3.6vw,48px)] font-bold leading-[1.1] tracking-[-0.03em] text-label-strong [text-wrap:balance]">
              점검은 모바일로,
              <br />
              관리는 대시보드로,
              <br />
              보고서는 PDF로.
            </h2>

            <ol className="m-0 grid list-none gap-1 p-0">
              {steps.map((s, i) => (
                <CoreValueItem
                  key={i}
                  step={s}
                  index={i}
                  activeIndex={activeIndex}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

function CoreValueItem({
  step,
  index,
  activeIndex,
}: {
  step: (typeof steps)[0]
  index: number
  activeIndex: ReturnType<typeof useTransform<number, number>>
}) {
  const isActive = useTransform(activeIndex, (i) => Math.floor(i) === index)

  return (
    <motion.li
      className="relative py-3.5 pl-6"
      style={{
        borderLeft: useTransform(isActive, (active) =>
          active
            ? `2px solid ${step.tone.fg}`
            : "2px solid var(--semantic-line-normal-alternative)"
        ),
      }}
    >
      <motion.div
        className="absolute -left-[7px] top-5 size-3 rounded-full"
        style={{
          background: useTransform(isActive, (active) =>
            active ? step.tone.fg : "#fff"
          ),
          border: useTransform(isActive, (active) =>
            active
              ? `2px solid ${step.tone.fg}`
              : "2px solid var(--semantic-line-normal-normal)"
          ),
        }}
      />
      <motion.div
        className="text-xs font-semibold uppercase tracking-[0.04em]"
        style={{
          color: useTransform(isActive, (active) =>
            active ? step.tone.fg : "var(--semantic-label-alternative)"
          ),
        }}
      >
        {step.kicker}
      </motion.div>
      <motion.div
        className="mt-1 font-bold leading-tight tracking-[-0.022em]"
        style={{
          fontSize: useTransform(isActive, (active) =>
            active ? "24px" : "19px"
          ),
          color: useTransform(isActive, (active) =>
            active
              ? "var(--semantic-label-strong)"
              : "var(--semantic-label-alternative)"
          ),
        }}
      >
        {step.title}
      </motion.div>
      <motion.div
        className="overflow-hidden"
        style={{
          maxHeight: useTransform(isActive, (active) =>
            active ? "200px" : "0px"
          ),
          opacity: useTransform(isActive, (active) => (active ? 1 : 0)),
        }}
      >
        <p className="m-0 mt-2.5 max-w-[540px] text-[15.5px] leading-relaxed text-label-neutral">
          {step.desc}
        </p>
      </motion.div>
    </motion.li>
  )
}

