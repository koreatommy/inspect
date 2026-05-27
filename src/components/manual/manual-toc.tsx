"use client"

import { List } from "lucide-react"
import { useCallback } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { ManualTocItem } from "@/lib/manual-data"
import { cn } from "@/lib/utils"

type ManualTocProps = {
  items: ManualTocItem[]
  activeId: string
  onNavigate: (id: string) => void
  visibleIds?: Set<string>
  className?: string
}

function TocList({
  items,
  activeId,
  onNavigate,
  visibleIds,
}: Omit<ManualTocProps, "className">) {
  const filteredItems = visibleIds
    ? items.filter((item) => visibleIds.has(item.id))
    : items

  if (filteredItems.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        검색 결과가 없습니다.
      </p>
    )
  }

  return (
    <nav aria-label="매뉴얼 목차">
      <ul className="space-y-0.5">
        {filteredItems.map((item) => {
          const isActive = activeId === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full rounded-md border-l-2 py-2 pr-2 pl-3 text-left text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                {item.title}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function ManualToc({
  items,
  activeId,
  onNavigate,
  visibleIds,
  className,
}: ManualTocProps) {
  const handleNavigate = useCallback(
    (id: string) => {
      onNavigate(id)
    },
    [onNavigate],
  )

  return (
    <>
      {/* Desktop sticky TOC */}
      <aside
        className={cn(
          "hidden w-56 shrink-0 print:hidden lg:block",
          className,
        )}
      >
        <div className="sticky top-20">
          <p className="mb-2 px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            목차
          </p>
          <ScrollArea className="h-[calc(100dvh-8rem)] pr-3">
            <TocList
              items={items}
              activeId={activeId}
              onNavigate={handleNavigate}
              visibleIds={visibleIds}
            />
          </ScrollArea>
        </div>
      </aside>

      {/* Mobile sheet TOC */}
      <div className="mb-4 lg:hidden print:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm" className="w-full" />
            }
          >
            <List className="size-4" />
            목차 보기
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle>매뉴얼 목차</SheetTitle>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100dvh-6rem)]">
              <TocList
                items={items}
                activeId={activeId}
                onNavigate={handleNavigate}
                visibleIds={visibleIds}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
