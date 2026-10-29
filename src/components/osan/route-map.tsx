"use client"

import { useEffect, useMemo, useRef } from "react"
import { LocateFixed } from "lucide-react"

import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { optimizeRoute, type LatLng } from "@/lib/osan/route"
import { spiderfyPositions } from "@/lib/osan/spiderfy"
import { placeTypeMarkerColor } from "./osan-utils"
import { useKakaoLoader } from "./use-kakao-loader"

type Props = {
  facilities: OsanFacilityWithRelations[]
  start?: LatLng
  selectedId: string | null
  onSelect: (id: string) => void
  onLocate: () => void
  locating: boolean
  /** 하단 동선 시트가 펼쳐졌는지 — setBounds 하단 패딩·relayout에 사용 */
  sheetOpen?: boolean
  /** 시설 미리보기 카드가 열려 있는지 — 하단 패딩 추가 */
  peekOpen?: boolean
}

/** 접힌 시트(헤더)에 마커가 가려지지 않도록 */
const SHEET_PEEK_PAD = 72
/** 미리보기 카드 + 여백 */
const PEEK_CARD_PAD = 168

const OSAN_CENTER = { lat: 37.1498, lng: 127.0772 }

const MARKER_W = 40
const MARKER_H = 52

/**
 * CustomOverlay는 카카오 타일/라벨 IMG 아래에 깔려 숫자가 가려진다.
 * MarkerImage(캔버스)는 마커 레이어에 그려져 라벨 위에서도 숫자가 보인다.
 */
/** 완료 = 회색, 선택 = 검정, 미방문 = 설치장소 색 */
function markerFill(
  selected: boolean,
  visited: boolean,
  placeType: string | null,
): string {
  if (visited) return "#6b7280"
  if (selected) return "#111827"
  return placeTypeMarkerColor(placeType)
}

function createMarkerImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kakaoMaps: any,
  index: number,
  selected: boolean,
  visited: boolean,
  placeType: string | null,
) {
  const bg = markerFill(selected, visited, placeType)
  const canvas = document.createElement("canvas")
  canvas.width = MARKER_W
  canvas.height = MARKER_H
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return new kakaoMaps.MarkerImage(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      new kakaoMaps.Size(1, 1),
    )
  }

  const cx = MARKER_W / 2
  const cy = 18
  const r = 15

  ctx.beginPath()
  ctx.moveTo(cx, MARKER_H - 2)
  ctx.lineTo(cx - 9, cy + r - 2)
  ctx.lineTo(cx + 9, cy + r - 2)
  ctx.closePath()
  ctx.fillStyle = bg
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = bg
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = "#fff"
  ctx.stroke()

  ctx.fillStyle = "#fff"
  ctx.font = "800 16px ui-sans-serif, system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(String(index), cx, cy + 0.5)

  return new kakaoMaps.MarkerImage(
    canvas.toDataURL("image/png"),
    new kakaoMaps.Size(MARKER_W, MARKER_H),
    { offset: new kakaoMaps.Point(MARKER_W / 2, MARKER_H - 2) },
  )
}

export function RouteMap({
  facilities,
  start,
  selectedId,
  onSelect,
  onLocate,
  locating,
  sheetOpen = false,
  peekOpen = false,
}: Props) {
  const { loaded, error } = useKakaoLoader()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const overlaysRef = useRef<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const lineRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const sheetOpenRef = useRef(sheetOpen)
  const peekOpenRef = useRef(peekOpen)
  sheetOpenRef.current = sheetOpen
  peekOpenRef.current = peekOpen

  const routed = useMemo(() => {
    const points = facilities
      .filter((f) => f.lat != null && f.lng != null)
      .map((f) => ({ id: f.id, lat: f.lat!, lng: f.lng! }))
    return optimizeRoute(points, start)
  }, [facilities, start])

  const orderIndex = useMemo(() => {
    const map = new Map<string, number>()
    routed.order.forEach((p, i) => map.set(p.id, i + 1))
    return map
  }, [routed])

  /** 동일 좌표 시설은 화면에서만 원형으로 벌려 번호가 겹치지 않게 한다. */
  const displayById = useMemo(() => {
    const withCoords = facilities
      .filter((f) => f.lat != null && f.lng != null)
      .map((f) => ({ id: f.id, lat: f.lat!, lng: f.lng! }))
    // 동선 순으로 넣어 겹친 그룹 안에서도 번호 순으로 배치
    withCoords.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    )
    return spiderfyPositions(withCoords)
  }, [facilities, orderIndex])

  const bottomPad = () => {
    if (sheetOpenRef.current) return Math.round(window.innerHeight * 0.48)
    if (peekOpenRef.current) return SHEET_PEEK_PAD + PEEK_CARD_PAD
    return SHEET_PEEK_PAD
  }

  useEffect(() => {
    if (!loaded || !containerRef.current || !window.kakao?.maps) return
    if (!mapRef.current) {
      mapRef.current = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(OSAN_CENTER.lat, OSAN_CENTER.lng),
        level: 6,
      })
    }

    const map = mapRef.current
    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []
    lineRef.current?.setMap(null)

    // 시트 높이 변화 후 컨테이너 크기를 다시 반영한다.
    map.relayout()

    const path: unknown[] = []
    const bounds = new window.kakao.maps.LatLngBounds()
    if (start) {
      const origin = new window.kakao.maps.LatLng(start.lat, start.lng)
      bounds.extend(origin)
      path.push(origin)
    }

    for (const point of routed.order) {
      const display = displayById.get(point.id) ?? point
      path.push(new window.kakao.maps.LatLng(display.lat, display.lng))
    }

    const routePlaceTypes = [
      ...new Set(facilities.map((f) => f.place_type).filter(Boolean)),
    ]
    const routeStroke =
      routePlaceTypes.length === 1
        ? placeTypeMarkerColor(routePlaceTypes[0] as string)
        : "#2563eb"

    // 경로선은 마커보다 아래(zIndex 낮음)에 그린다.
    if (path.length >= 2) {
      lineRef.current = new window.kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: routeStroke,
        strokeOpacity: 0.55,
        strokeStyle: "solid",
        zIndex: 1,
      })
      lineRef.current.setMap(map)
    }

    for (const facility of facilities) {
      if (facility.lat == null || facility.lng == null) continue
      const display =
        displayById.get(facility.id) ??
        ({ lat: facility.lat, lng: facility.lng } as LatLng)
      const position = new window.kakao.maps.LatLng(display.lat, display.lng)
      bounds.extend(position)
      const index = orderIndex.get(facility.id) ?? 0
      const selected = facility.id === selectedId
      const marker = new window.kakao.maps.Marker({
        position,
        image: createMarkerImage(
          window.kakao.maps,
          index,
          selected,
          facility.visited,
          facility.place_type,
        ),
        zIndex: selected ? 30 : 10 + index,
        clickable: true,
        title: `${index}. ${facility.name}`,
      })
      marker.setMap(map)
      window.kakao.maps.event.addListener(marker, "click", () =>
        onSelect(facility.id),
      )
      overlaysRef.current.push(marker)
    }

    if (!bounds.isEmpty()) {
      // top, right, bottom, left — 하단 시트에 마커가 가리지 않게
      map.setBounds(bounds, 48, 48, bottomPad(), 48)
    }
  }, [
    displayById,
    facilities,
    loaded,
    onSelect,
    orderIndex,
    peekOpen,
    routed.order,
    selectedId,
    sheetOpen,
    start,
  ])

  useEffect(() => {
    if (!loaded || !containerRef.current || !mapRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver(() => {
      mapRef.current?.relayout()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [loaded])

  // 선택 변경 시에만 이동. facilities 갱신마다 panTo 하면 setBounds로 맞춘 2개 마커 뷰가 깨진다.
  const selectedIdRef = useRef(selectedId)
  useEffect(() => {
    const prev = selectedIdRef.current
    selectedIdRef.current = selectedId
    if (!loaded || !mapRef.current || !selectedId || selectedId === prev) return
    const display = displayById.get(selectedId)
    if (!display) return
    mapRef.current.panTo(new window.kakao.maps.LatLng(display.lat, display.lng))
  }, [displayById, loaded, selectedId])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
        {error}
        <br />
        `.env.local`에 NEXT_PUBLIC_KAKAO_MAP_KEY 를 넣고 개발 서버를 재시작해 주세요.
      </div>
    )
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        지도를 불러오는 중…
      </div>
    )
  }

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="absolute top-3 right-3 z-[5] flex size-11 items-center justify-center rounded-full bg-background shadow-md"
        aria-label="내 위치로 최적화"
      >
        <LocateFixed className={locating ? "size-5 animate-pulse" : "size-5"} />
      </button>
    </div>
  )
}
