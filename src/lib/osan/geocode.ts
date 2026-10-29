/** 카카오 로컬 REST 기반 주소 → 좌표. REST 키가 없으면 Photon(OSM)으로 폴백. */

export type GeoResult = { lat: number; lng: number } | null

/**
 * 오산시 대략 경계(여유 포함).
 * Photon 등 폴백이 동명·유사 주소를 타 지역(예: 보령)으로 매칭하는 것을 걸러낸다.
 */
export const OSAN_BOUNDS = {
  minLat: 37.08,
  maxLat: 37.25,
  minLng: 126.98,
  maxLng: 127.15,
} as const

export function isWithinOsanBounds(lat: number, lng: number): boolean {
  return (
    lat >= OSAN_BOUNDS.minLat &&
    lat <= OSAN_BOUNDS.maxLat &&
    lng >= OSAN_BOUNDS.minLng &&
    lng <= OSAN_BOUNDS.maxLng
  )
}

/** 우편번호 접두사 및 층/호 등 꼬리 제거로 지오코딩 성공률을 높인다. */
export function normalizeAddress(address: string): string {
  return address
    .replace(/^\d{5}\s*/, "")
    .replace(/,?\s*(지하\s*)?\d+\s*(층|호|동호)\b.*$/u, "")
    .replace(/\s*관리사무소\([^)]*\)\s*$/u, "")
    .trim()
}

type KakaoDoc = { x: string; y: string }

async function kakaoFetch(
  endpoint: string,
  query: string,
  restKey: string,
): Promise<KakaoDoc | null> {
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/${endpoint}?query=${encodeURIComponent(query)}`,
    { headers: { Authorization: `KakaoAK ${restKey}` } },
  )
  if (!res.ok) return null
  const data = (await res.json()) as { documents?: KakaoDoc[] }
  return data.documents?.[0] ?? null
}

async function geocodeWithKakao(
  query: string,
  restKey: string,
): Promise<GeoResult> {
  const byAddress = await kakaoFetch("search/address.json", query, restKey)
  const doc = byAddress ?? (await kakaoFetch("search/keyword.json", query, restKey))
  if (!doc) return null
  const lat = Number.parseFloat(doc.y)
  const lng = Number.parseFloat(doc.x)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (!isWithinOsanBounds(lat, lng)) return null
  return { lat, lng }
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
}

/** Photon(OSM) 폴백 — 카카오 키 없거나 검색 실패 시 */
async function geocodeWithPhoton(query: string): Promise<GeoResult> {
  const url = new URL("https://photon.komoot.io/api/")
  url.searchParams.set("q", query)
  url.searchParams.set("limit", "1")
  url.searchParams.set("lang", "ko")

  const res = await fetch(url, {
    headers: { "User-Agent": "inspect-osan-temp/1.0 (field inspection)" },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { features?: PhotonFeature[] }
  const coords = data.features?.[0]?.geometry?.coordinates
  if (!coords) return null
  const [lng, lat] = coords
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  if (!isWithinOsanBounds(lat, lng)) return null
  return { lat, lng }
}

/** 주소 검색. 카카오 REST 키가 있으면 우선 사용하고, 실패 시 Photon. */
export async function geocodeAddress(
  address: string,
  restKey?: string,
): Promise<GeoResult> {
  const query = normalizeAddress(address)
  if (!query) return null

  if (restKey) {
    const kakao = await geocodeWithKakao(query, restKey)
    if (kakao) return kakao
  }

  return geocodeWithPhoton(query)
}
