"use client"

import { Phone, X } from "lucide-react"

import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { RouteNavLinks } from "./route-nav-links"
import { placeTypeColor } from "./osan-utils"

type Props = {
  facility: OsanFacilityWithRelations
  distanceLabel?: string | null
  onClose: () => void
  onInspect: () => void
}

export function FacilityPeekCard({
  facility,
  distanceLabel,
  onClose,
  onInspect,
}: Props) {
  const hasCoords = facility.lat != null && facility.lng != null

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[4.5rem] z-[12] rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium",
                placeTypeColor(facility.place_type),
              )}
            >
              {facility.place_type}
            </span>
            {facility.visited ? (
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-700">
                완료
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm font-semibold leading-snug">
            {facility.name}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {[facility.region, distanceLabel].filter(Boolean).join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
          aria-label="미리보기 닫기"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {facility.phone ? (
          <a
            href={`tel:${facility.phone}`}
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"
          >
            <Phone className="size-4" />
            전화
          </a>
        ) : null}
        {hasCoords ? (
          <RouteNavLinks
            name={facility.name}
            lat={facility.lat!}
            lng={facility.lng!}
            variant="text"
            className={facility.phone ? "flex-[2]" : "flex-1"}
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={onInspect}
        className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background"
      >
        점검하기
      </button>
    </div>
  )
}
