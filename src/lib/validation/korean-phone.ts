/** 휴대전화 번호 저장 형식: 숫자만 (예: 01012345678) */
const KOREAN_MOBILE_DIGITS_REGEX = /^01[016789]\d{7,8}$/

export function normalizeKoreanMobilePhone(value: string): string {
  return value.replace(/\D/g, "")
}

export function isValidKoreanMobilePhone(value: string): boolean {
  const digits = normalizeKoreanMobilePhone(value)
  if (!digits) return false
  return KOREAN_MOBILE_DIGITS_REGEX.test(digits)
}

export function getKoreanMobilePhoneValidationError(
  value: string,
  fieldLabel = "핸드폰 번호"
): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return `${fieldLabel}을(를) 입력해 주세요.`
  }

  const digits = normalizeKoreanMobilePhone(trimmed)
  if (!KOREAN_MOBILE_DIGITS_REGEX.test(digits)) {
    return `${fieldLabel} 형식이 올바르지 않습니다. (예: 010-1234-5678)`
  }

  return null
}

/** 목록·표시용 (010-1234-5678) */
export function formatKoreanMobilePhone(digits: string): string {
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return digits
}
