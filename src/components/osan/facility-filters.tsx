"use client"

import { PLACE_TYPES } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { placeTypeColor, placeTypeMarkerColor } from "./osan-utils"

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
  { id: "all", label: "전체" },
  { id: "done", label: "완료" },
  { id: "pending", label: "미완료" },
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
    <div className="space-y-3.5">
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="시설명·시설번호·주소·관리자 검색"
        inputMode="search"
        enterKeyHint="search"
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          설치장소
        </p>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const selected = placeType === type
            const count = counts[type] ?? 0
            const isAll = type === "전체"
            return (
              <button
                key={type}
                type="button"
                onClick={() => onPlaceType(type)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-shadow",
                  isAll
                    ? selected
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                    : cn(
                        placeTypeColor(type),
                        selected
                          ? "shadow-sm ring-2 ring-current/35"
                          : "opacity-90",
                      ),
                )}
              >
                {!isAll ? (
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: placeTypeMarkerColor(type) }}
                    aria-hidden
                  />
                ) : null}
                {type}
                <span className="tabular-nums opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2 border-t border-border/70 pt-3">
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
                "h-8 flex-1 rounded-lg text-xs font-medium transition-colors",
                visited === opt.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
