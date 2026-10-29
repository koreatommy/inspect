"use client"

import { useMemo, useState } from "react"
import { List, MapPinned } from "lucide-react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { fallbackCoord } from "@/lib/osan/dong-centroids"
import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { PLACE_TYPES } from "@/lib/osan/types"
import { haversine, optimizeRoute, type LatLng } from "@/lib/osan/route"
import { cn } from "@/lib/utils"
import { FacilityFilters, type VisitedFilter } from "./facility-filters"
import { FacilityList } from "./facility-list"
import { FacilityPeekCard } from "./facility-peek-card"
import { RouteMap } from "./route-map"
import { RouteSheet } from "./route-sheet"
import { formatDistance } from "./osan-utils"
import { toast } from "./toast"
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

function matchesVisited(facility: OsanFacilityWithRelations, visited: VisitedFilter) {
  if (visited === "pending") return !facility.visited
  if (visited === "done") return facility.visited
  return true
}

function scrollToFacilityCard(id: string) {
  const tryScroll = (attempt = 0) => {
    const el = document.getElementById(`osan-card-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    // 모바일 탭 전환 직후 목록이 아직 마운트되지 않은 경우를 대비한다.
    if (attempt < 12) {
      requestAnimationFrame(() => tryScroll(attempt + 1))
    }
  }
  requestAnimationFrame(() => tryScroll())
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
  /** lg 이상: 지도·목록 동시 표시. 모바일은 탭 전환(마운트) 유지 */
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const showMap = isDesktop || tab === "map"
  const showList = isDesktop || tab === "list"

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

  const codeLookup = isFacilityCodeQuery(query)

  const placeTypeCounts = useMemo(() => {
    const base = displayFacilities.filter((facility) => {
      if (!matchesQuery(facility, query)) return false
      if (codeLookup) return true
      return matchesVisited(facility, visited)
    })
    const next: Record<string, number> = { 전체: base.length }
    for (const type of PLACE_TYPES) {
      next[type] = base.filter((f) => f.place_type === type).length
    }
    return next
  }, [codeLookup, displayFacilities, query, visited])

  const visitedCounts = useMemo(() => {
    const base = displayFacilities.filter((facility) => {
      if (!matchesQuery(facility, query)) return false
      if (codeLookup) return true
      if (placeType !== "전체" && facility.place_type !== placeType) return false
      return true
    })
    return {
      all: base.length,
      done: base.filter((f) => f.visited).length,
      pending: base.filter((f) => !f.visited).length,
    } satisfies Record<VisitedFilter, number>
  }, [codeLookup, displayFacilities, placeType, query])

  const filtered = useMemo(() => {
    return displayFacilities.filter((facility) => {
      if (!matchesQuery(facility, query)) return false
      // 시설번호(숫자) 조회 시에는 설치장소·방문 필터를 무시해 바로 찾는다.
      if (codeLookup) return true
      if (placeType !== "전체" && facility.place_type !== placeType) return false
      return matchesVisited(facility, visited)
    })
  }, [codeLookup, displayFacilities, placeType, query, visited])

  const routed = useMemo(() => {
    const points = filtered
      .filter((f) => f.lat != null && f.lng != null)
      .map((f) => ({ id: f.id, lat: f.lat!, lng: f.lng!, name: f.name }))
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

  const distanceById = useMemo(() => {
    const map = new Map<string, string>()
    if (!start) return map
    for (const facility of displayFacilities) {
      if (facility.lat == null || facility.lng == null) continue
      map.set(
        facility.id,
        formatDistance(haversine(start, { lat: facility.lat, lng: facility.lng })),
      )
    }
    return map
  }, [displayFacilities, start])

  const selectedFacility = useMemo(
    () =>
      selectedId
        ? (displayFacilities.find((f) => f.id === selectedId) ?? null)
        : null,
    [displayFacilities, selectedId],
  )

  const doneCount = facilities.filter((f) => f.visited).length
  const today = new Date()
  const todayLabel = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-")

  function patchFacility(next: OsanFacilityWithRelations) {
    setFacilities((prev) =>
      prev.map((f) =>
        f.id === next.id ? { ...next, lat: f.lat, lng: f.lng } : f,
      ),
    )
  }

  function goToFacilityList(id: string) {
    setSelectedId(id)
    setTab("list")
    scrollToFacilityCard(id)
  }

  function locate() {
    if (!navigator.geolocation) {
      toast.error("이 기기에서 위치를 사용할 수 없습니다.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextStart = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        setStart(nextStart)
        setLocating(false)

        const points = filtered
          .filter((f) => f.lat != null && f.lng != null)
          .map((f) => ({ id: f.id, lat: f.lat!, lng: f.lng!, name: f.name }))
        const nextRoute = optimizeRoute(points, nextStart)
        const firstId = nextRoute.order[0]?.id
        if (firstId) {
          setSelectedId(firstId)
          setSheetOpen(false)
        }
        toast.success(
          firstId
            ? "현재 위치 기준으로 동선을 다시 잡았습니다"
            : "현재 위치를 반영했습니다",
        )
      },
      () => {
        setLocating(false)
        toast.error("위치를 가져오지 못했습니다. 권한을 확인해 주세요.")
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  function selectFromMap(id: string) {
    setSelectedId(id)
    setSheetOpen(false)
    // 모바일은 목록 탭으로 전환해 선택 카드를 보이게 한다.
    if (!isDesktop) setTab("list")
    scrollToFacilityCard(id)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col lg:mx-0 lg:h-dvh lg:max-w-none">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur lg:static lg:shrink-0 lg:px-6">
        <div className="space-y-2 lg:flex lg:items-end lg:justify-between lg:gap-8 lg:space-y-0">
          <div className="min-w-0 lg:max-w-md">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-lg font-semibold">지도점검(오산시)</h1>
              <time
                dateTime={todayIso}
                className="shrink-0 text-sm tabular-nums text-muted-foreground"
              >
                {todayLabel}
              </time>
            </div>
          </div>
          <div className="flex items-center gap-2.5 lg:min-w-[14rem] lg:max-w-xs lg:flex-1">
            <div
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={facilities.length}
              aria-valuenow={doneCount}
              aria-label={`점검 완료 ${doneCount}건 / 전체 ${facilities.length}건`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out"
                style={{
                  width:
                    facilities.length === 0
                      ? "0%"
                      : `${(doneCount / facilities.length) * 100}%`,
                }}
              />
            </div>
            <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
              {doneCount}/{facilities.length} 완료
            </p>
          </div>
        </div>
        <div className="mt-3 lg:mt-4">
          <FacilityFilters
            placeType={placeType}
            onPlaceType={setPlaceType}
            visited={visited}
            onVisited={setVisited}
            query={query}
            onQuery={setQuery}
            placeTypeCounts={placeTypeCounts}
            visitedCounts={visitedCounts}
            resultCount={filtered.length}
          />
        </div>
      </header>

      {/*
        모바일: 하단 탭으로 지도/목록 전환 (기존 UX 유지)
        lg+: 왼쪽 목록 + 오른쪽 지도 동시 표시
      */}
      <div className="relative min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)] lg:overflow-hidden">
        {showMap ? (
          <div className="absolute inset-0 lg:relative lg:order-2 lg:min-h-0">
            <RouteMap
              facilities={filtered}
              start={start}
              orderById={orderById}
              routeOrder={routed.order}
              selectedId={selectedId}
              onSelect={selectFromMap}
              onLocate={locate}
              locating={locating}
              sheetOpen={sheetOpen}
              peekOpen={Boolean(selectedFacility) && !sheetOpen}
            />
            {selectedFacility && !sheetOpen ? (
              <FacilityPeekCard
                facility={selectedFacility}
                distanceLabel={distanceById.get(selectedFacility.id)}
                onClose={() => setSelectedId(null)}
                onInspect={() => goToFacilityList(selectedFacility.id)}
              />
            ) : null}
            <RouteSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              ordered={orderedFacilities}
              totalMeters={routed.totalMeters}
              selectedId={selectedId}
              distanceById={distanceById}
              onSelect={goToFacilityList}
            />
          </div>
        ) : null}

        {showList ? (
          <div
            className={cn(
              "h-full overflow-y-auto px-3 pt-3 pb-24",
              "lg:order-1 lg:border-r lg:bg-background lg:px-4 lg:pb-4",
            )}
          >
            <FacilityList
              facilities={orderedFacilities}
              orderById={orderById}
              selectedId={selectedId}
              onChange={patchFacility}
              distanceById={distanceById}
              hasStart={Boolean(start)}
            />
          </div>
        ) : null}
      </div>

      <nav className="sticky bottom-0 z-20 grid grid-cols-2 border-t bg-background pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
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
