/**
 * 오산 지도점검 점검자 목록.
 * 이름을 추가하면 선택 UI에 바로 반영됩니다.
 */
export const OSAN_INSPECTORS = ["이유진", "이영일"] as const

export type OsanInspectorName = (typeof OSAN_INSPECTORS)[number]

export function isOsanInspectorName(value: string): value is OsanInspectorName {
  return (OSAN_INSPECTORS as readonly string[]).includes(value)
}

const LAST_INSPECTOR_KEY = "osan-last-inspector"

/** 직전에 고른 점검자 (현장 연속 입력용) */
export function getLastOsanInspector(): string | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(LAST_INSPECTOR_KEY)?.trim()
    return value && isOsanInspectorName(value) ? value : null
  } catch {
    return null
  }
}

export function setLastOsanInspector(name: string) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(LAST_INSPECTOR_KEY, name)
  } catch {
    /* ignore quota / private mode */
  }
}
