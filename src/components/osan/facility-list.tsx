"use client"

import { MapPinned } from "lucide-react"

import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { FacilityCard } from "./facility-card"

type Props = {
  facilities: OsanFacilityWithRelations[]
  orderById: Map<string, number>
  selectedId: string | null
  onChange: (next: OsanFacilityWithRelations) => void
  distanceById?: Map<string, string>
  /** 현재 위치가 있으면 true — 다음 방문 라벨에 반영 */
  hasStart?: boolean
}

export function FacilityList({
  facilities,
  orderById,
  selectedId,
  onChange,
  distanceById,
  hasStart = false,
}: Props) {
  if (facilities.length === 0) {
    return (
      <p className="px-1 py-10 text-center text-sm text-muted-foreground">
        조건에 맞는 시설이 없습니다.
      </p>
    )
  }

  const next = facilities[0]
  const nextDistance = distanceById?.get(next.id)

  function scrollToFacility(id: string) {
    document
      .getElementById(`osan-card-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-3 pb-8">
      <button
        type="button"
        onClick={() => scrollToFacility(next.id)}
        className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MapPinned className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium text-primary">
            {hasStart ? "현재 위치 기준 다음 방문" : "동선 다음 방문"}
          </span>
          <span className="mt-0.5 block truncate text-sm font-semibold">
            {next.name}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            {[next.region, nextDistance].filter(Boolean).join(" · ")}
          </span>
        </span>
      </button>

      {facilities.map((facility) => (
        <div key={facility.id} id={`osan-card-${facility.id}`}>
          <FacilityCard
            facility={facility}
            order={orderById.get(facility.id)}
            defaultOpen={selectedId === facility.id}
            onChange={onChange}
            distanceLabel={distanceById?.get(facility.id)}
          />
        </div>
      ))}
    </div>
  )
}
