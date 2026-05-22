"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { PageBackgroundProvider } from "./motion/page-background"
import { Nav } from "./sections/nav"
import { Hero } from "./sections/hero"
import { TrustStrip } from "./sections/trust-strip"
import { Problem } from "./sections/problem"
import { CoreValue } from "./sections/core-value"
import { Features } from "./sections/features"
import { Customers } from "./sections/customers"
import { Pricing } from "./sections/pricing"
import { Calculator } from "./sections/calculator"
import { Comparison } from "./sections/comparison"
import { Faq } from "./sections/faq"
import { FinalCta } from "./sections/final-cta"
import { LoginDialog } from "./login-dialog"
import { shouldAutoOpenLoginDialog } from "@/lib/auth/login-auto-open"
import { scrollToId } from "@/lib/landing/scroll"

export function LandingPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loginOpen, setLoginOpen] = useState(false)
  const hasAutoOpenedRef = useRef(false)

  const redirectedFrom = searchParams.get("redirectedFrom")

  const handleCtaClick = () => scrollToId("cta", 80)
  const handleDemoClick = () => scrollToId("features-intro", 80)

  useEffect(() => {
    const hash =
      typeof window !== "undefined" ? window.location.hash : ""
    const shouldOpen = shouldAutoOpenLoginDialog(searchParams, hash)

    if (shouldOpen && !hasAutoOpenedRef.current) {
      setLoginOpen(true)
      hasAutoOpenedRef.current = true

      const params = new URLSearchParams(searchParams.toString())
      if (params.get("login") !== "open") {
        params.set("login", "open")
        const qs = params.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      }
    }
  }, [pathname, searchParams, router])

  const handleLoginOpenChange = useCallback(
    (open: boolean) => {
      setLoginOpen(open)

      if (!open) {
        const params = new URLSearchParams(searchParams.toString())
        let changed = false

        if (params.get("login") === "open") {
          params.delete("login")
          changed = true
        }

        const qs = params.toString()
        const nextPath =
          typeof window !== "undefined" && window.location.hash === "#login"
            ? pathname + (qs ? `?${qs}` : "")
            : qs
              ? `${pathname}?${qs}`
              : pathname

        if (changed || (typeof window !== "undefined" && window.location.hash === "#login")) {
          router.replace(nextPath, { scroll: false })
        }
      }
    },
    [pathname, searchParams, router],
  )

  return (
    <PageBackgroundProvider>
      <div className="light-auth landing-page min-h-dvh">
        <Nav onCtaClick={handleCtaClick} onLoginClick={() => setLoginOpen(true)} />
        <main>
          <Hero onPrimaryClick={handleCtaClick} onSecondaryClick={handleDemoClick} />
          <TrustStrip />
          <Problem />
          <CoreValue />
          <Features />
          <Customers />
          <Pricing />
          <Calculator />
          <Comparison />
          <Faq />
          <FinalCta />
        </main>
        <LoginDialog
          open={loginOpen}
          onOpenChange={handleLoginOpenChange}
          redirectedFrom={redirectedFrom}
        />
      </div>
    </PageBackgroundProvider>
  )
}
