"use client"

import { Reveal } from "../motion/reveal"

const orgs = [
  "서울특별시 교육청",
  "강남구청",
  "경기도교육청",
  "한국놀이시설관리원",
  "SK어린이집",
  "롯데월드 키즈",
  "한국공원녹지협회",
]

export function TrustStrip() {
  return (
    <section
      data-bg="#F4F6FA"
      className="relative overflow-hidden px-8 py-16"
    >
      <div className="mx-auto max-w-[1240px] text-center">
        <Reveal>
          <div className="mb-7 text-[13px] font-semibold uppercase tracking-[0.06em] text-label-alternative">
            전국 128개 기관이 신뢰하고 있습니다
          </div>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-14 opacity-[0.55]">
          {orgs.map((org) => (
            <div
              key={org}
              className="text-base font-bold tracking-[-0.015em] text-label-strong"
              style={{ fontVariant: "all-small-caps" }}
            >
              {org}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
