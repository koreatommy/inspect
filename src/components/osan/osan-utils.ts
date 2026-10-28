/** 오산 페이지 공용 클라이언트 유틸 */

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

/** 카카오맵 길찾기(도착지) 딥링크 */
export function kakaoRouteUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
}

/** 카카오맵 장소 보기 딥링크 */
export function kakaoMapUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
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
