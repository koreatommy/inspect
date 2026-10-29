"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { PLACE_TYPES } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { placeTypeMarkerColor } from "./osan-utils"

export type VisitedFilter = "pending" | "done" | "all"

type Props = {
  placeType: string
  onPlaceType: (value: string) => void
  visited: VisitedFilter
  onVisited: (value: VisitedFilter) => void
  query: string
  onQuery: (value: string) => void
  /** 설치장소 칩 건수 (검색 + 점검상태 반영) */
  placeTypeCounts: Record<string, number>
  /** 점검상태 버튼 건수 (검색 + 설치장소 반영) */
  visitedCounts: Record<VisitedFilter, number>
  /** 현재 필터 결과 건수 (요약 행) */
  resultCount: number
}

const VISITED_OPTIONS: { id: VisitedFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "done", label: "완료" },
  { id: "pending", label: "미완료" },
]

function visitedLabel(visited: VisitedFilter) {
  return VISITED_OPTIONS.find((opt) => opt.id === visited)?.label ?? "전체"
}

export function FacilityFilters({
  placeType,
  onPlaceType,
  visited,
  onVisited,
  query,
  onQuery,
  placeTypeCounts,
  visitedCounts,
  resultCount,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const types = ["전체", ...PLACE_TYPES]

  return (
    <div className="space-y-2.5">
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="시설명·시설번호·주소·관리자 검색"
        inputMode="search"
        enterKeyHint="search"
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 text-left text-xs font-medium"
      >
        <span className="min-w-0 truncate text-foreground">
          {visitedLabel(visited)} · {placeType}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="tabular-nums text-muted-foreground">{resultCount}곳</span>
          <span className="flex size-7 items-center justify-center rounded-md border border-red-500/40 bg-red-500/10 text-red-600 shadow-sm dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-400">
            <ChevronDown
              strokeWidth={2.75}
              className={cn(
                "size-5 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="space-y-3.5 border-t border-border/70 pt-3">
          <div className="space-y-2">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
              설치장소
            </p>
            <div className="flex flex-wrap gap-1.5">
              {types.map((type) => {
                const selected = placeType === type
                const count = placeTypeCounts[type] ?? 0
                const isAll = type === "전체"
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onPlaceType(type)}
                    aria-pressed={selected}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/80 bg-background text-muted-foreground hover:border-foreground/25 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {!isAll ? (
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          selected && "ring-1 ring-background/40",
                        )}
                        style={{ backgroundColor: placeTypeMarkerColor(type) }}
                        aria-hidden
                      />
                    ) : null}
                    <span>{type}</span>
                    <span
                      className={cn(
                        "tabular-nums",
                        selected
                          ? "text-background/70"
                          : "text-muted-foreground/80",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
              점검상태
            </p>
            <div className="flex gap-2">
              {VISITED_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onVisited(opt.id)}
                  className={cn(
                    "flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors",
                    visited === opt.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      visited === opt.id
                        ? "text-primary-foreground/75"
                        : "opacity-70",
                    )}
                  >
                    {visitedCounts[opt.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
