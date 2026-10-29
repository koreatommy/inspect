import { formatInspectionCompletedAt, getKoreaDateParts } from "@/lib/date"

/** 한국 시간 기준 오늘 `YYYY-MM-DD` */
export function todayKoreaDate(date = new Date()): string {
  return getKoreaDateParts(date).date
}

/** ISO → UI용 날짜 `YYYY-MM-DD` (한국 시간) */
export function isoToKoreaDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  const label = formatInspectionCompletedAt(iso)
  if (label === "-") return null
  return label.slice(0, 10)
}

/**
 * UI 날짜 `YYYY-MM-DD` → DB용 ISO.
 * 시각은 저장 시점의 한국 현재 시각을 붙입니다.
 */
export function koreaDateToIsoWithNowTime(
  date: string,
  now = new Date(),
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) return null
  const nowLocal = formatInspectionCompletedAt(now.toISOString())
  if (nowLocal === "-") return null
  const time = nowLocal.slice(11, 16) // HH:mm
  const iso = new Date(`${date.trim()}T${time}:00+09:00`)
  if (Number.isNaN(iso.getTime())) return null
  return iso.toISOString()
}

export function defaultInspectionDate(): string {
  return todayKoreaDate()
}
