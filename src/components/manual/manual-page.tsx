"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { ManualHeader } from "@/components/manual/manual-header"
import { ManualSearch } from "@/components/manual/manual-search"
import { ManualSectionsContent } from "@/components/manual/manual-sections-content"
import { ManualToc } from "@/components/manual/manual-toc"
import { ScrollProgressBar } from "@/components/manual/scroll-progress-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { manualTocItems } from "@/lib/manual-data"
import { cn } from "@/lib/utils"

function matchesSearch(
  query: string,
  item: (typeof manualTocItems)[number],
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    item.title,
    item.description,
    ...(item.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(q)
}

export function ManualPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeId, setActiveId] = useState(manualTocItems[0]?.id ?? "")

  const visibleItems = useMemo(
    () => manualTocItems.filter((item) => matchesSearch(searchQuery, item)),
    [searchQuery],
  )

  const visibleIds = useMemo(
    () => new Set(visibleItems.map((item) => item.id)),
    [visibleItems],
  )

  const hiddenSectionIds = useMemo(() => {
    const hidden = new Set<string>()
    for (const item of manualTocItems) {
      if (!visibleIds.has(item.id)) {
        hidden.add(item.id)
      }
    }
    return hidden
  }, [visibleIds])

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
    }
  }, [])

  useEffect(() => {
    const sections = manualTocItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const section of sections) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [searchQuery])

  useEffect(() => {
    if (visibleItems.length > 0 && !visibleIds.has(activeId)) {
      setActiveId(visibleItems[0]!.id)
    }
  }, [visibleItems, visibleIds, activeId])

  return (
    <>
      <ScrollProgressBar />
      <div className="mx-auto max-w-7xl space-y-6 print:max-w-none">
        <ManualHeader
          searchSlot={
            <ManualSearch
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={visibleItems.length}
              totalCount={manualTocItems.length}
            />
          }
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <ManualToc
            items={manualTocItems}
            activeId={activeId}
            onNavigate={scrollToSection}
            visibleIds={visibleIds}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
            <ManualSectionsContent hiddenSectionIds={hiddenSectionIds} />

            <aside className="hidden w-64 shrink-0 xl:block print:hidden">
              <div className="sticky top-20 space-y-4">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">빠른 도움말</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p>점검 작성: 월간 안전점검 메뉴</p>
                    <p>이력 조회: 안전점검 이력 메뉴</p>
                    <p>계정 설정: 설정 &gt; 내정보 관리</p>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">문의 안내</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    기술 지원·권한 요청은 소속 기관 시스템 관리자에게
                    문의하세요.
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>

        {searchQuery.trim() && visibleItems.length === 0 ? (
          <p
            className={cn(
              "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground",
            )}
          >
            「{searchQuery}」에 맞는 섹션이 없습니다. 다른 키워드로
            검색해 보세요.
          </p>
        ) : null}
      </div>
    </>
  )
}
