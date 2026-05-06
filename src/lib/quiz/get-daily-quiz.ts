import { getKoreaDateParts } from "@/lib/date"

import {
  PLAYGROUND_SAFETY_QUESTIONS,
  type PlaygroundSafetyQuestion,
} from "@/lib/quiz/playground-safety-questions"

/** KST 달력 `YYYY-MM-DD`를 일 단위 정수로 변환 (타임존 무관, 달력 숫자만 사용). */
function kstCalendarDateToDayNumber(dateYmd: string): number {
  const [yStr, mStr, dStr] = dateYmd.split("-")
  const year = Number(yStr)
  const month = Number(mStr)
  const day = Number(dStr)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return 0
  }
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

/**
 * 한국 시간 기준 오늘 날짜로 20문항 중 1문을 결정론적으로 선택합니다.
 * 같은 KST 날짜에는 항상 동일한 문항이 반환됩니다.
 */
export function getDailySafetyQuiz(
  now = new Date()
): PlaygroundSafetyQuestion {
  const { date } = getKoreaDateParts(now)
  const dayNumber = kstCalendarDateToDayNumber(date)
  const index =
    ((dayNumber % PLAYGROUND_SAFETY_QUESTIONS.length) +
      PLAYGROUND_SAFETY_QUESTIONS.length) %
    PLAYGROUND_SAFETY_QUESTIONS.length
  const question = PLAYGROUND_SAFETY_QUESTIONS[index]
  if (!question) {
    return PLAYGROUND_SAFETY_QUESTIONS[0]!
  }
  return question
}
