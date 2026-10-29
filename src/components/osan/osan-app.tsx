"use client"

import { useMemo, useState } from "react"
import { List, MapPinned } from "lucide-react"

import { fallbackCoord } from "@/lib/osan/dong-centroids"
import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { PLACE_TYPES } from "@/lib/osan/types"
import { optimizeRoute, type LatLng } from "@/lib/osan/route"
import { cn } from "@/lib/utils"
import { FacilityFilters, type VisitedFilter } from "./facility-filters"
import { FacilityList } from "./facility-list"
import { RouteMap } from "./route-map"
import { RouteSheet } from "./route-sheet"
import { useKakaoGeocode } from "./use-kakao-geocode"
import { useKakaoLoader } from "./use-kakao-loader"

type Tab = "map" | "list"

type Props = {
  initialFacilities: OsanFacilityWithRelations[]
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase()
}

function isFacilityCodeQuery(query: string) {
  return /^\d{4,}$/.test(query.trim())
}

function matchesQuery(facility: OsanFacilityWithRelations, query: string) {
  const q = normalizeQuery(query)
  if (!q) return true

  if (isFacilityCodeQuery(query)) {
    const code = facility.facility_code?.trim() ?? ""
    const no = facility.no != null ? String(facility.no) : ""
    return code.includes(q) || no.includes(q)
  }

  const hay = [
    facility.name,
    facility.address,
    facility.safety_manager,
    facility.representative,
    facility.facility_code,
    facility.region,
    facility.no != null ? String(facility.no) : null,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return hay.includes(q)
}

export function OsanApp({ initialFacilities }: Props) {
  const [facilities, setFacilities] = useState(initialFacilities)
  const [tab, setTab] = useState<Tab>("map")
  const [placeType, setPlaceType] = useState("전체")
  const [visited, setVisited] = useState<VisitedFilter>("pending")
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [start, setStart] = useState<LatLng | undefined>(undefined)
  const [locating, setLocating] = useState(false)
  const { loaded } = useKakaoLoader()

  useKakaoGeocode({
    loaded,
    facilities,
    onResolved: (id, lat, lng) => {
      setFacilities((prev) =>
        prev.map((f) => (f.id === id ? { ...f, lat, lng } : f)),
      )
    },
  })

  const displayFacilities = useMemo(
    () =>
      facilities.map((facility) => {
        if (facility.lat != null && facility.lng != null) return facility
        const fallback = fallbackCoord(facility.region, facility.no ?? 0)
        if (!fallback) return facility
        return { ...facility, lat: fallback.lat, lng: fallback.lng }
      }),
    [facilities],
  )

  const counts = useMemo(() => {
    const next: Record<string, number> = { 전체: facilities.length }
    for (const type of PLACE_TYPES) {
      next[type] = facilities.filter((f) => f.place_type === type).length
    }
    return next
  }, [facilities])

  const filtered = useMemo(() => {
    const codeLookup = isFacilityCodeQuery(query)
    return displayFacilities.filter((facility) => {
      if (!matchesQuery(facility, query)) return false
      // 시설번호(숫자) 조회 시에는 설치장소·방문 필터를 무시해 바로 찾는다.
      if (codeLookup) return true
      if (placeType !== "전체" && facility.place_type !== placeType) return false
      if (visited === "pending" && facility.visited) return false
      if (visited === "done" && !facility.visited) return false
      return true
    })
  }, [displayFacilities, placeType, query, visited])

  const routed = useMemo(() => {
    const points = filtered
      .filter((f) => f.lat != null && f.lng != null)
      .map((f) => ({ id: f.id, lat: f.lat!, lng: f.lng! }))
    return optimizeRoute(points, start)
  }, [filtered, start])

  const orderById = useMemo(() => {
    const map = new Map<string, number>()
    routed.order.forEach((p, i) => map.set(p.id, i + 1))
    return map
  }, [routed])

  const orderedFacilities = useMemo(() => {
    const byId = new Map(filtered.map((f) => [f.id, f]))
    const seen = new Set<string>()
    const ordered: OsanFacilityWithRelations[] = []
    for (const point of routed.order) {
      const facility = byId.get(point.id)
      if (facility) {
        ordered.push(facility)
        seen.add(facility.id)
      }
    }
    for (const facility of filtered) {
      if (!seen.has(facility.id)) ordered.push(facility)
    }
    return ordered
  }, [filtered, routed.order])

  const doneCount = facilities.filter((f) => f.visited).length

  function patchFacility(next: OsanFacilityWithRelations) {
    setFacilities((prev) => prev.map((f) => (f.id === next.id ? next : f)))
  }

  function locate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  function selectFromMap(id: string) {
    setSelectedId(id)
    setSheetOpen(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">오산시 지도점검</p>
            <h1 className="text-lg font-semibold">현장 방문</h1>
          </div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {doneCount}/{facilities.length} 완료
          </p>
        </div>
        <div className="mt-3">
          <FacilityFilters
            placeType={placeType}
            onPlaceType={setPlaceType}
            visited={visited}
            onVisited={setVisited}
            query={query}
            onQuery={setQuery}
            counts={counts}
          />
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {tab === "map" ? (
          <div className="absolute inset-0">
            <RouteMap
              facilities={filtered}
              start={start}
              selectedId={selectedId}
              onSelect={selectFromMap}
              onLocate={locate}
              locating={locating}
              sheetOpen={sheetOpen}
            />
            <RouteSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              ordered={orderedFacilities}
              totalMeters={routed.totalMeters}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id)
                setTab("list")
                requestAnimationFrame(() => {
                  document
                    .getElementById(`osan-card-${id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                })
              }}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-3 pt-3 pb-24">
            <FacilityList
              facilities={orderedFacilities}
              orderById={orderById}
              selectedId={selectedId}
              onChange={patchFacility}
            />
          </div>
        )}
      </div>

      <nav className="sticky bottom-0 z-20 grid grid-cols-2 border-t bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {(
          [
            { id: "map", label: "동선", icon: MapPinned },
            { id: "list", label: "목록", icon: List },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-0.5 text-xs",
              tab === item.id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
