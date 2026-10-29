/** 오산 페이지 공용 클라이언트 유틸 */

/** 지도 마커·경로선용 설치장소 단색 (필터 칩과 대응) */
export function placeTypeMarkerColor(placeType: string | null): string {
  switch (placeType) {
    case "주택단지":
      return "#2563eb"
    case "어린이집":
      return "#059669"
    case "놀이제공영업소":
      return "#7c3aed"
    case "대규모점포":
      return "#d97706"
    case "주상복합":
      return "#e11d48"
    default:
      return "#2563eb"
  }
}

export function placeTypeColor(placeType: string | null): string {
  switch (placeType) {
    case "주택단지":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300"
    case "어린이집":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    case "놀이제공영업소":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-300"
    case "대규모점포":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    case "주상복합":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/** 어린이놀이시설 안전관리시스템(cpf.go.kr) 시설 상세 — pfctSn = 시설번호 */
export function cpfFacilityUrl(facilityCode: string): string {
  const sn = facilityCode.trim()
  return `https://www.cpf.go.kr/cpf/ko/nori/0006/index.jsp?qr=y&pfctSn=${encodeURIComponent(sn)}`
}

/** 카카오맵 길찾기(도착지) 딥링크 */
export function kakaoRouteUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
}

/** 카카오맵 장소 보기 딥링크 */
export function kakaoMapUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
}

/**
 * 티맵 길찾기(도착지) 링크.
 * NEXT_PUBLIC_TMAP_APP_KEY 가 있으면 공식 앱 실행 HTTPS를 쓰고,
 * 없으면 모바일 앱 스킴(tmap://)으로 폴백한다.
 */
export function tmapRouteUrl(name: string, lat: number, lng: number): string {
  const appKey = process.env.NEXT_PUBLIC_TMAP_APP_KEY?.trim()
  if (appKey) {
    const params = new URLSearchParams({
      appKey,
      name,
      lon: String(lng),
      lat: String(lat),
    })
    return `https://apis.openapi.sk.com/tmap/app/routes?${params.toString()}`
  }
  return `tmap://route?goalname=${encodeURIComponent(name)}&goalx=${lng}&goaly=${lat}`
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/** 주소 앞 5자리 우편번호만 제거한다. */
export function addressWithoutPostal(address: string): string {
  return address.replace(/^\d{5}\s*/, "").trim()
}

/** 업로드 전 이미지 리사이즈/압축 (최대 변 1600px, JPEG 0.8) */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.8),
  )
  return blob ?? file
}
