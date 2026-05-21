/** 점검자·안전관리자 등 인명 입력용 (한글·영문, 공백·하이픈·가운뎃점) */
export const PERSON_NAME_MIN_LENGTH = 2
export const PERSON_NAME_MAX_LENGTH = 30

const PERSON_NAME_REGEX = new RegExp(
  `^[가-힣a-zA-Z·\\-\\s]{${PERSON_NAME_MIN_LENGTH},${PERSON_NAME_MAX_LENGTH}}$`
)

/** HTML `pattern` 속성용 (전체 문자열 일치) */
export const PERSON_NAME_HTML_PATTERN = PERSON_NAME_REGEX.source.slice(1, -1)

export function isValidPersonName(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  return PERSON_NAME_REGEX.test(trimmed)
}

export function getPersonNameValidationError(
  value: string,
  fieldLabel: string
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.length < PERSON_NAME_MIN_LENGTH) {
    return `${fieldLabel}은(는) ${PERSON_NAME_MIN_LENGTH}자 이상 입력해 주세요.`
  }

  if (trimmed.length > PERSON_NAME_MAX_LENGTH) {
    return `${fieldLabel}은(는) ${PERSON_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`
  }

  if (!PERSON_NAME_REGEX.test(trimmed)) {
    return `${fieldLabel}은(는) 한글 또는 영문 이름만 입력할 수 있습니다.`
  }

  return null
}
