import { haversine, type LatLng } from "@/lib/osan/route"
import { isWithinOsanBounds, type GeoResult } from "@/lib/osan/geocode"

/** 시설명에서 `101동`, `(309동앞)` 형태 동 번호를 뽑는다. */
export function parseBuildingDong(name: string): string | null {
  const match = name.match(/(\d+)\s*동/u)
  return match?.[1] ?? null
}

/**
 * 카카오 키워드 검색용 질의.
 * 놀이터·앞/옆 등 잡음을 줄이고 `오산 … N동` 형태로 만든다.
 */
export function buildApartmentDongQuery(name: string, dong: string): string {
  let base = name
    .replace(/유아놀이터|어린이놀이터\d*|놀이터\d*/gu, " ")
    .replace(/[（(]\s*\d+\s*동\s*[^）)]*[）)]/gu, ` ${dong}동 `)
    .replace(/(\d+)\s*동\s*(앞|옆)?/gu, ` ${dong}동 `)
    .replace(/(앞|옆|내부|필로티|관리소옆)/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!new RegExp(`${dong}\\s*동`, "u").test(base)) {
    base = `${base} ${dong}동`
  }
  // 단지명 뒤에 붙은 '유아' 등 잔여 토큰 제거
  base = base.replace(/\s+(유아|어린이)\s+/gu, " ").replace(/\s+/g, " ").trim()
  if (!base.includes("오산")) base = `오산 ${base}`
  return base.replace(/\s+/g, " ").trim()
}

type KakaoKeywordDoc = {
  place_name: string
  category_name: string
  x: string
  y: string
}

const MAX_DISTANCE_FROM_ANCHOR_M = 900

/**
 * 이름에 동이 있을 때만 카카오 「아파트 동」좌표를 찾는다.
 * anchor(기존 단지 좌표)가 있으면 그 근처 결과만 채택한다.
 */
export async function geocodeApartmentDong(args: {
  name: string
  restKey: string
  anchor?: LatLng | null
}): Promise<GeoResult> {
  const dong = parseBuildingDong(args.name)
  if (!dong) return null

  const query = buildApartmentDongQuery(args.name, dong)
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${args.restKey}` },
  })
  if (!res.ok) return null
  const data = (await res.json()) as { documents?: KakaoKeywordDoc[] }
  const docs = data.documents ?? []

  const candidates = docs
    .filter(
      (d) =>
        d.category_name.includes("아파트") && d.category_name.includes("동"),
    )
    .map((d) => ({
      lat: Number.parseFloat(d.y),
      lng: Number.parseFloat(d.x),
    }))
    .filter(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        isWithinOsanBounds(p.lat, p.lng),
    )
    .map((p) => ({
      ...p,
      dist: args.anchor ? haversine(args.anchor, p) : 0,
    }))
    .filter(
      (p) => !args.anchor || p.dist <= MAX_DISTANCE_FROM_ANCHOR_M,
    )
    .sort((a, b) => a.dist - b.dist)

  const best = candidates[0]
  return best ? { lat: best.lat, lng: best.lng } : null
}
