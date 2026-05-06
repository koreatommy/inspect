export function getKoreaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const [year, month, day] = formatter.format(date).split("-")

  return {
    date: `${year}-${month}-${day}`,
    month: `${year}-${month}`,
  }
}

/** 한국 달력 기준 최근 `count`개의 `YYYY-MM` (오름차순: 과거 → 현재 월) */
export function getKoreaRecentMonths(count: number, date = new Date()): string[] {
  const { month: ym } = getKoreaDateParts(date)
  const [yStr, mStr] = ym.split("-")
  const year = Number(yStr)
  const month = Number(mStr)
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    let m = month - i
    let y = year
    while (m < 1) {
      m += 12
      y -= 1
    }
    keys.push(`${y}-${String(m).padStart(2, "0")}`)
  }
  return keys
}

/** 점검 완료일시 — 한국 시간 기준 `YYYY-MM-DD HH:mm` */
export function formatInspectionCompletedAt(
  isoString: string | null | undefined
): string {
  if (!isoString) return "-"
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return "-"

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d)
}
