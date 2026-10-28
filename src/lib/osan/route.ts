/** 방문 동선 최적화: Haversine 거리 기반 nearest-neighbor + 2-opt (클라이언트/서버 공용 순수 함수) */

export type RoutePoint = {
  id: string
  lat: number
  lng: number
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

/** 2-opt 지역 최적화 (경로가 작으므로 전수 반복) */
function twoOpt(points: RoutePoint[], start: LatLng): RoutePoint[] {
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

export type OptimizedRoute = {
  order: RoutePoint[]
  totalMeters: number
}

/**
 * 좌표가 있는 지점들에 대해 방문 순서를 최적화한다.
 * start가 없으면 지점들의 중심(centroid)에서 가장 가까운 지점을 시작점으로 사용.
 */
export function optimizeRoute(
  points: RoutePoint[],
  start?: LatLng,
): OptimizedRoute {
  if (points.length <= 1) {
    return { order: [...points], totalMeters: 0 }
  }

  const origin: LatLng =
    start ??
    points.reduce(
      (acc, p, _i, arr) => ({
        lat: acc.lat + p.lat / arr.length,
        lng: acc.lng + p.lng / arr.length,
      }),
      { lat: 0, lng: 0 },
    )

  const nnOrder = nearestNeighbor(points, origin)
  const optimized = twoOpt(nnOrder, origin)
  return { order: optimized, totalMeters: routeLength(optimized, origin) }
}
