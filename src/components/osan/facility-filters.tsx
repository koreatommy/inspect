"use client"

import { PLACE_TYPES } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { placeTypeColor } from "./osan-utils"

export type VisitedFilter = "pending" | "done" | "all"

type Props = {
  placeType: string
  onPlaceType: (value: string) => void
  visited: VisitedFilter
  onVisited: (value: VisitedFilter) => void
  query: string
  onQuery: (value: string) => void
  counts: Record<string, number>
}

const VISITED_OPTIONS: { id: VisitedFilter; label: string }[] = [
  { id: "pending", label: "미방문" },
  { id: "done", label: "완료" },
  { id: "all", label: "전체" },
]

export function FacilityFilters({
  placeType,
  onPlaceType,
  visited,
  onVisited,
  query,
  onQuery,
  counts,
}: Props) {
  const types = ["전체", ...PLACE_TYPES]

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="시설명·시설번호·주소·관리자 검색"
        inputMode="search"
        enterKeyHint="search"
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex flex-wrap gap-1.5">
        {types.map((type) => {
          const selected = placeType === type
          const count = counts[type] ?? 0
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPlaceType(type)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium",
                selected
                  ? type === "전체"
                    ? "bg-foreground text-background"
                    : placeTypeColor(type)
                  : "bg-muted text-muted-foreground",
              )}
            >
              {type}
              <span className="tabular-nums opacity-70">{count}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-1.5">
        {VISITED_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onVisited(opt.id)}
            className={cn(
              "h-8 flex-1 rounded-lg text-xs font-medium",
              visited === opt.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
