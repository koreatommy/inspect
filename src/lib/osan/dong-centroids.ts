/** 오산시 법정동 대략 중심점. 정밀 지오코딩 전 동선 계산용 폴백(DB에 저장하지 않음). */

export const OSAN_DONG_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  가수동: { lat: 37.1497, lng: 127.0615 },
  갈곶동: { lat: 37.1348, lng: 127.0725 },
  고현동: { lat: 37.1295, lng: 127.085 },
  궐동: { lat: 37.1588, lng: 127.064 },
  금암동: { lat: 37.1825, lng: 127.046 },
  내삼미동: { lat: 37.176, lng: 127.058 },
  누읍동: { lat: 37.1515, lng: 127.054 },
  부산동: { lat: 37.149, lng: 127.0705 },
  서동: { lat: 37.155, lng: 127.048 },
  수청동: { lat: 37.174, lng: 127.049 },
  양산동: { lat: 37.196, lng: 127.038 },
  오산동: { lat: 37.1485, lng: 127.077 },
  외삼미동: { lat: 37.188, lng: 127.062 },
  원동: { lat: 37.1435, lng: 127.07 },
  은계동: { lat: 37.163, lng: 127.072 },
  청학동: { lat: 37.1645, lng: 127.058 },
}

export function fallbackCoord(
  region: string | null,
  salt = 0,
): { lat: number; lng: number } | null {
  const key = region?.replace(/\s+/g, "") ?? ""
  const center = OSAN_DONG_CENTROIDS[key]
  if (!center) return null
  const step = (salt % 9) * 0.00032
  return { lat: center.lat + step, lng: center.lng + step * 0.55 }
}
