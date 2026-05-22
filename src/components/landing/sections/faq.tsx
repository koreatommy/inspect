"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

import { COPY } from "@/lib/landing/copy"
import { Reveal } from "../motion/reveal"

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      id="faq"
      data-bg="#ffffff"
      className="relative px-8 py-[120px]"
    >
      <div className="mx-auto grid max-w-[1100px] gap-16 lg:grid-cols-[1fr_2fr]">
        <div>
          <Reveal>
            <div className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-brand">
              자주 묻는 질문
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="m-0 text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.15] tracking-[-0.025em] text-label-strong [text-wrap:balance]">
              궁금한 점을
              <br />
              빠르게 풀어드립니다
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-[15px] leading-relaxed text-label-neutral">
              여기에서 답을 찾지 못하셨나요? 도입 상담을 통해 기관 환경에 맞는
              답변을 드립니다.
            </p>
          </Reveal>
        </div>

        <div>
          {COPY.faq.items.map((item, i) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-line-alternative">
      <button
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-1 py-6 text-left font-sans text-label-strong"
      >
        <span className="pr-6 text-lg font-semibold tracking-[-0.018em]">
          {question}
        </span>
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: isOpen
              ? "var(--semantic-label-strong)"
              : "var(--semantic-background-normal-alternative)",
            color: isOpen ? "#fff" : "var(--semantic-label-strong)",
            transform: isOpen ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          <Plus className="size-4" />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? "400px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="m-0 max-w-[720px] px-1 pb-7 text-[15.5px] leading-[1.7] text-label-neutral">
          {answer}
        </p>
      </div>
    </div>
  )
}
