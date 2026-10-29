"use client"

import { ChevronDown } from "lucide-react"

import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { RouteNavLinks } from "./route-nav-links"
import { formatDistance } from "./osan-utils"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ordered: OsanFacilityWithRelations[]
  totalMeters: number
  selectedId: string | null
  onSelect: (id: string) => void
  /** facility id → 현재 위치 기준 거리 라벨 */
  distanceById?: Map<string, string>
}

export function RouteSheet({
  open,
  onOpenChange,
  ordered,
  totalMeters,
  selectedId,
  onSelect,
  distanceById,
}: Props) {
  return (
    <section
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex max-h-[min(48vh,100%)] flex-col",
        "rounded-t-2xl border bg-background/95 shadow-lg backdrop-blur",
      )}
    >
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="pointer-events-auto flex w-full shrink-0 items-center justify-between px-4 py-3"
      >
        <div>
          <p className="text-sm font-semibold">방문 동선 {ordered.length}곳</p>
          <p className="text-xs text-muted-foreground">
            직선 거리 합 {formatDistance(totalMeters)} · 차량 길찾기는 각 시설에서
          </p>
        </div>
        <ChevronDown
          className={cn("size-5 transition-transform", !open && "rotate-180")}
        />
      </button>
      {open ? (
        <ol className="pointer-events-auto min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          {ordered.map((facility, index) => {
            const hasCoords = facility.lat != null && facility.lng != null
            const distanceLabel = distanceById?.get(facility.id)
            return (
              <li key={facility.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-2",
                    selectedId === facility.id ? "bg-primary/10" : "bg-muted/50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(facility.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {facility.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {[facility.region, distanceLabel, facility.address]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </button>
                  {hasCoords ? (
                    <RouteNavLinks
                      name={facility.name}
                      lat={facility.lat!}
                      lng={facility.lng!}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}
