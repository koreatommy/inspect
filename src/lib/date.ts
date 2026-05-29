const MONTH_VALUE_RE = /^(\d{4})-(\d{2})$/
const DATE_VALUE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseMonthValue(value: string) {
  const match = MONTH_VALUE_RE.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) return null
  return { year, month }
}

export function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

export function formatMonthLabel(value: string) {
  const parsed = parseMonthValue(value)
  if (!parsed) return ""
  return `${parsed.year}년 ${parsed.month}월`
}

export function parseDateValue(value: string) {
  const match = DATE_VALUE_RE.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function toDateValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatDateLabel(value: string) {
  const parsed = parseDateValue(value)
  if (!parsed) return ""
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, "0")
  const d = String(parsed.getDate()).padStart(2, "0")
  return `${y}. ${m}. ${d}.`
}

/** 한국 시간 기준 0–23시 */
export function getKoreaHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "numeric",
      hour12: false,
    }).format(date)
  )
}

export function getKoreaGreeting(date = new Date()) {
  const hour = getKoreaHour(date)
  if (hour < 12) return "좋은 아침입니다"
  if (hour < 18) return "좋은 오후입니다"
  return "좋은 저녁입니다"
}

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
