import type { LatLng } from "@/lib/osan/route"

type Point = { id: string; lat: number; lng: number }

/** 동일(또는 거의 동일) 좌표로 묶을 때 쓰는 반올림 — 약 1m 단위 */
const COORD_KEY_DIGITS = 5

/** 겹친 마커를 벌릴 반경(미터). 핀이 서로 가리지 않을 정도 */
const DEFAULT_RADIUS_M = 32

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(COORD_KEY_DIGITS)},${lng.toFixed(COORD_KEY_DIGITS)}`
}

function offsetMeters(
  origin: LatLng,
  distanceM: number,
  bearingRad: number,
): LatLng {
  const dLat = (distanceM * Math.cos(bearingRad)) / 111_320
  const cosLat = Math.cos((origin.lat * Math.PI) / 180)
  const metersPerLng = 111_320 * Math.max(cosLat, 0.2)
  const dLng = (distanceM * Math.sin(bearingRad)) / metersPerLng
  return { lat: origin.lat + dLat, lng: origin.lng + dLng }
}

/**
 * 같은 좌표에 여러 시설이 있을 때 지도 표시용으로 원형으로 살짝 벌린다.
 * 실제 DB/동선 계산 좌표는 바꾸지 않고, 화면 위치만 반환한다.
 */
export function spiderfyPositions(
  points: Point[],
  radiusM = DEFAULT_RADIUS_M,
): Map<string, LatLng> {
  const groups = new Map<string, Point[]>()
  for (const point of points) {
    const key = coordKey(point.lat, point.lng)
    const list = groups.get(key)
    if (list) list.push(point)
    else groups.set(key, [point])
  }

  const result = new Map<string, LatLng>()
  for (const group of groups.values()) {
    if (group.length === 1) {
      const only = group[0]
      result.set(only.id, { lat: only.lat, lng: only.lng })
      continue
    }

    // 입력 배열 순서를 유지(호출측에서 동선 순으로 넣으면 번호 순으로 배치)
    const origin = { lat: group[0].lat, lng: group[0].lng }
    const n = group.length
    for (let i = 0; i < n; i += 1) {
      const bearing = (2 * Math.PI * i) / n - Math.PI / 2
      result.set(group[i].id, offsetMeters(origin, radiusM, bearing))
    }
  }
  return result
}
