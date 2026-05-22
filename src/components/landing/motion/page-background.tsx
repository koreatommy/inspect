"use client"

import { useEffect, useCallback } from "react"

/**
 * 핸드오프 useBackgroundTransition + Problem 진입 시 다크 전환 보정
 */
export function usePageBackgroundTransition() {
  const updateBackground = useCallback(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-bg]"),
    )
    if (!sections.length) return

    const applySection = (section: HTMLElement) => {
      const bgColor = section.dataset.bg
      if (bgColor) {
        document.documentElement.style.setProperty("--page-bg", bgColor)
      }
      const fgMode = section.dataset.fg
      document.documentElement.style.setProperty(
        "--page-fg",
        fgMode ?? "dark",
      )
    }

    const viewportCenter = window.innerHeight / 2
    const problem = document.getElementById("problem")

    // TrustStrip(짧음)이 중앙을 선점해 Problem 진입 시 밝은 배경이 남는 것 방지
    // 단, Problem이 뷰포트 안에 있을 때만 적용 (완전히 지나간 후에는 다음 섹션 우선)
    if (problem) {
      const problemRect = problem.getBoundingClientRect()
      if (
        problemRect.top < window.innerHeight * 0.38 &&
        problemRect.bottom > 0
      ) {
        applySection(problem)
        return
      }
    }

    let activeSection = sections[0]
    let closestDistance = Infinity

    for (const section of sections) {
      const rect = section.getBoundingClientRect()
      const sectionMid = rect.top + rect.height / 2
      const distance = Math.abs(sectionMid - viewportCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        activeSection = section
      }
    }

    applySection(activeSection)
  }, [])

  useEffect(() => {
    let rafId: number

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateBackground)
    }

    updateBackground()

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [updateBackground])
}

export function PageBackgroundProvider({
  children,
}: {
  children: React.ReactNode
}) {
  usePageBackgroundTransition()
  return <>{children}</>
}
