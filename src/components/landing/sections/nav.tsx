"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Menu, X } from "lucide-react"

import { BrandLogo } from "@/components/landing/brand-logo"
import { COPY } from "@/lib/landing/copy"
import { scrollToId, scrollToTop } from "@/lib/landing/scroll"

interface NavProps {
  onCtaClick: () => void
  onLoginClick: () => void
}

export function Nav({ onCtaClick, onLoginClick }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [mobileMenuOpen])

  function handleNavLink(id: string) {
    setMobileMenuOpen(false)
    scrollToId(id, 80)
  }

  function handleLoginClick() {
    setMobileMenuOpen(false)
    onLoginClick()
  }

  function handleCtaClick() {
    setMobileMenuOpen(false)
    onCtaClick()
  }

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[100] transition-[background,border-color,backdrop-filter] duration-[280ms] ease-out"
        style={{
          background: scrolled ? "rgba(255,255,255,0.85)" : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--semantic-line-normal-alternative)"
            : "1px solid transparent",
        }}
      >
        <nav className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:gap-8 sm:px-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              setMobileMenuOpen(false)
              scrollToTop()
            }}
            className="inline-flex shrink-0 items-center no-underline"
          >
            <BrandLogo size={20} />
          </a>

          <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {COPY.nav.links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId(link.id, 80)
                  }}
                  className="inline-flex rounded-lg px-3.5 py-2 text-[14.5px] font-medium tracking-[-0.01em] text-label-neutral no-underline transition-colors hover:bg-fill-normal hover:text-label-strong"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onLoginClick}
              className="hidden rounded-lg px-4 py-2.5 text-sm font-medium text-label-neutral no-underline transition-colors hover:text-label-strong sm:inline-flex"
            >
              {COPY.nav.login}
            </button>
            <button
              type="button"
              onClick={onCtaClick}
              className="hidden h-[38px] items-center gap-1.5 rounded-[10px] bg-label-strong px-[18px] text-sm font-semibold text-white transition-colors hover:bg-black sm:inline-flex"
            >
              {COPY.nav.cta}
              <ArrowRight className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex size-10 items-center justify-center rounded-lg text-label-neutral hover:bg-fill-normal lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {mobileMenuOpen ? (
        <div
          id="mobile-nav-menu"
          className="fixed inset-0 z-[99] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="모바일 내비게이션"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-sm"
            aria-label="메뉴 닫기"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 right-0 left-0 border-b border-line-alternative bg-white px-4 py-4 shadow-landing-md">
            <ul className="flex flex-col gap-1">
              {COPY.nav.links.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleNavLink(link.id)}
                    className="w-full rounded-lg px-3 py-3 text-left text-[15px] font-medium text-label-neutral hover:bg-fill-normal hover:text-label-strong"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2 border-t border-line-alternative pt-4">
              <button
                type="button"
                onClick={handleLoginClick}
                className="w-full rounded-lg px-4 py-3 text-center text-sm font-medium text-label-neutral hover:bg-fill-normal"
              >
                {COPY.nav.login}
              </button>
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex h-[42px] w-full items-center justify-center gap-1.5 rounded-[10px] bg-label-strong text-sm font-semibold text-white hover:bg-black"
              >
                {COPY.nav.cta}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
