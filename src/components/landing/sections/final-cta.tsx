"use client"

import { ArrowRight, Check } from "lucide-react"

import { BrandLogoDark } from "@/components/landing/brand-logo"
import { COPY } from "@/lib/landing/copy"
import { Reveal } from "../motion/reveal"

export function FinalCta() {
  return (
    <>
      <section
        id="cta"
        data-bg="#0F0F10"
        data-fg="light"
        className="relative overflow-hidden px-8 py-[140px] text-white"
      >
        {/* Decorative gradient orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,102,255,.28), rgba(0,102,255,0) 55%)",
          }}
        />

        <div className="relative mx-auto max-w-[880px] text-center">
          <Reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/18 px-3.5 py-1.5 text-[13px] font-medium text-white/85">
              <span className="inline-block size-1.5 rounded-full bg-[#00BF40]" />
              14일 무료 체험 가능
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="m-0 text-[clamp(40px,5vw,64px)] font-bold leading-[1.05] tracking-[-0.035em] text-white [text-wrap:balance]">
              {COPY.finalCta.headline.split(",")[0]},
              <br />
              이제{" "}
              <span
                className="bg-clip-text"
                style={{
                  background:
                    "linear-gradient(115deg, #69A5FF, #C0B0FF, #FF8EBD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                시스템으로
              </span>{" "}
              전환하세요
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-[620px] text-lg leading-[1.6] text-white/70">
              월점검 대장 작성부터 PDF 보고서, 사진 기록, 수리이력, 통계 분석까지.
              기관 환경에 맞춰 적합한 요금제를 제안드립니다.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap justify-center gap-2.5">
              <button className="inline-flex h-14 items-center gap-2 rounded-xl bg-white px-[30px] text-base font-semibold tracking-[-0.01em] text-[#0F0F10] transition-opacity hover:opacity-90">
                {COPY.finalCta.cta.primary}
                <ArrowRight className="size-[18px]" />
              </button>
              <button className="inline-flex h-14 items-center gap-2 rounded-xl border border-white/22 bg-transparent px-[26px] text-base font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-white/8">
                {COPY.finalCta.cta.tertiary}
              </button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-14 flex flex-wrap justify-center gap-8 text-[13.5px] text-white/55">
              {[
                "신용카드 등록 불필요",
                "14일 무료 체험",
                "도입 컨설팅 제공",
                "데이터 마이그레이션 지원",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#7DF5A5]" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}

function Footer() {
  return (
    <footer
      data-bg="#0F0F10"
      className="border-t border-white/6 bg-[#0F0F10] px-8 pb-10 pt-16 text-[rgba(247,247,248,.6)]"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 gap-8 border-b border-white/6 pb-10 md:grid-cols-4">
          <div>
            <BrandLogoDark size={22} />
            <p className="mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-[rgba(247,247,248,.5)]">
              어린이놀이시설 안전관리 SaaS · 행정안전부 안전관리 항목 기준
            </p>
            <p className="mt-4 text-[12.5px] leading-relaxed text-[rgba(247,247,248,.4)]">
              (주)놀이지킴 · 대표 김민지
              <br />
              사업자등록번호 123-45-67890
              <br />
              서울특별시 강남구 테헤란로 152, 12층
            </p>
          </div>

          <FooterCol
            title="제품"
            links={["기능", "요금제", "요금 계산기", "API 문서", "업데이트"]}
          />
          <FooterCol
            title="회사"
            links={["서비스 소개", "도입 사례", "공지사항", "채용", "문의"]}
          />
          <FooterCol
            title="지원"
            links={[
              "도움말 센터",
              "도입 가이드",
              "약관·정책",
              "개인정보처리방침",
              "보안 공지",
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[12.5px]">
          <div>© 2026 놀이지킴 Inc. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="text-[rgba(247,247,248,.6)] no-underline">
              이용약관
            </a>
            <a href="#" className="text-[rgba(247,247,248,.6)] no-underline">
              개인정보처리방침
            </a>
            <a href="#" className="text-[rgba(247,247,248,.6)] no-underline">
              위치정보 이용약관
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="mb-4 text-xs font-bold uppercase tracking-[0.06em] text-white">
        {title}
      </div>
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[13.5px] text-[rgba(247,247,248,.6)] no-underline transition-colors hover:text-white"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
