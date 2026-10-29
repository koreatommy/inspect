/** 방문 동선 최적화: 시설명 단지 묶음 + Haversine nearest-neighbor (클라이언트/서버 공용) */

import { complexKeyFromName } from "@/lib/osan/complex-key"

export type RoutePoint = {
  id: string
  lat: number
  lng: number
  /** 단지 키 추출용 시설명 */
  name: string
}

export type LatLng = { lat: number; lng: number }

const EARTH_RADIUS_M = 6_371_000

export function haversine(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

function nearestNeighbor(points: RoutePoint[], start: LatLng): RoutePoint[] {
  const remaining = [...points]
  const ordered: RoutePoint[] = []
  let current = start

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i += 1) {
      const d = haversine(current, remaining[i])
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }
    const [next] = remaining.splice(bestIdx, 1)
    ordered.push(next)
    current = next
  }
  return ordered
}

function routeLength(points: RoutePoint[], start: LatLng): number {
  let total = 0
  let prev = start
  for (const p of points) {
    total += haversine(prev, p)
    prev = p
  }
  return total
}

/** 단지 내부 전용 2-opt (단지 경계를 넘지 않음) */
function twoOpt(points: RoutePoint[], start: LatLng): RoutePoint[] {
  if (points.length <= 2) return [...points]
  let best = [...points]
  let improved = true
  while (improved) {
    improved = false
    for (let i = 0; i < best.length - 1; i += 1) {
      for (let k = i + 1; k < best.length; k += 1) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1),
        ]
        if (routeLength(candidate, start) + 1e-6 < routeLength(best, start)) {
          best = candidate
          improved = true
        }
      }
    }
  }
  return best
}

function minDistToGroup(from: LatLng, members: RoutePoint[]): number {
  let best = Infinity
  for (const m of members) {
    const d = haversine(from, m)
    if (d < best) best = d
  }
  return best
}

function centroidOf(points: LatLng[]): LatLng {
  return points.reduce(
    (acc, p, _i, arr) => ({
      lat: acc.lat + p.lat / arr.length,
      lng: acc.lng + p.lng / arr.length,
    }),
    { lat: 0, lng: 0 },
  )
}

export type OptimizedRoute = {
  order: RoutePoint[]
  totalMeters: number
}

/**
 * 시설명 단지 키로 묶은 뒤, 단지 내부를 모두 방문하고 가장 가까운 다음 단지로 이동한다.
 * start가 없으면 지점들의 중심(centroid)을 출발 기준으로 사용.
 */
export function optimizeRoute(
  points: RoutePoint[],
  start?: LatLng,
): OptimizedRoute {
  if (points.length <= 1) {
    return { order: [...points], totalMeters: 0 }
  }

  const origin: LatLng = start ?? centroidOf(points)

  const groups = new Map<string, RoutePoint[]>()
  for (const point of points) {
    const key = complexKeyFromName(point.name) || point.id
    const list = groups.get(key)
    if (list) list.push(point)
    else groups.set(key, [point])
  }

  const remaining = new Map(groups)
  const ordered: RoutePoint[] = []
  let current: LatLng = origin

  while (remaining.size > 0) {
    let bestKey: string | null = null
    let bestDist = Infinity
    for (const [key, members] of remaining) {
      const d = minDistToGroup(current, members)
      if (d < bestDist) {
        bestDist = d
        bestKey = key
      }
    }
    if (bestKey == null) break

    const members = remaining.get(bestKey)!
    remaining.delete(bestKey)

    const withinNn = nearestNeighbor(members, current)
    const within = twoOpt(withinNn, current)
    ordered.push(...within)
    current = within[within.length - 1]!
  }

  return { order: ordered, totalMeters: routeLength(ordered, origin) }
}
