"use client"

import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { FacilityCard } from "./facility-card"

type Props = {
  facilities: OsanFacilityWithRelations[]
  orderById: Map<string, number>
  selectedId: string | null
  onChange: (next: OsanFacilityWithRelations) => void
}

export function FacilityList({
  facilities,
  orderById,
  selectedId,
  onChange,
}: Props) {
  if (facilities.length === 0) {
    return (
      <p className="px-1 py-10 text-center text-sm text-muted-foreground">
        조건에 맞는 시설이 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-3 pb-8">
      {facilities.map((facility) => (
        <div key={facility.id} id={`osan-card-${facility.id}`}>
          <FacilityCard
            facility={facility}
            order={orderById.get(facility.id)}
            defaultOpen={selectedId === facility.id}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  )
}
