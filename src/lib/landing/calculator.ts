import { COPY } from "./copy"

export type PlanId = "starter" | "growth" | "pro" | "custom"

export interface CalculationResult {
  plan: PlanId
  planLabel: string
  baseFee: number
  unitFee: number
  total: number
  hint: string
  blocked?: boolean
}

type PricingPlan = (typeof COPY.pricing.plans)[number]
type PricingTier = PricingPlan["tiers"][number]

const proPlan = COPY.pricing.plans[COPY.pricing.plans.length - 1]

const PLAN_HINTS: Record<Exclude<PlanId, "custom">, string> = {
  starter: "소규모 시설에 적합합니다",
  growth: "시설 수가 늘어날수록 단가가 낮아집니다",
  pro: `대규모 시설 관리에 가장 적합합니다 (${proPlan.maxFacilities}개소 이상시 문의바람)`,
}

export function calcUnitFee(
  facilityCount: number,
  tiers: readonly PricingTier[]
): number {
  let total = 0
  let remaining = facilityCount

  for (const tier of tiers) {
    if (remaining <= 0) break
    const tierSize = tier.to - tier.from + 1
    const units = Math.min(remaining, tierSize)
    total += units * tier.unitPrice
    remaining -= units
  }

  return total
}

function findPlanForCount(facilityCount: number): PricingPlan | null {
  return (
    COPY.pricing.plans.find((plan) => facilityCount <= plan.maxFacilities) ??
    null
  )
}

export function calculatePrice(facilityCount: number): CalculationResult {
  const starter = COPY.pricing.plans[0]

  if (facilityCount <= 0) {
    return {
      plan: "starter",
      planLabel: starter.name,
      baseFee: starter.baseFee,
      unitFee: 0,
      total: starter.baseFee,
      hint: "최소 1개소부터 시작할 수 있습니다",
    }
  }

  const plan = findPlanForCount(facilityCount)
  if (!plan) {
    const pro = COPY.pricing.plans[2]
    return {
      plan: "custom",
      planLabel: `${pro.name} · 별도 문의`,
      baseFee: pro.baseFee,
      unitFee: 0,
      total: 0,
      hint: `${pro.maxFacilities}개소 초과 시 전담 매니저가 별도 견적을 안내드립니다`,
      blocked: true,
    }
  }

  const unitFee = calcUnitFee(facilityCount, plan.tiers)
  const planId = plan.id as Exclude<PlanId, "custom">

  return {
    plan: planId,
    planLabel: plan.name,
    baseFee: plan.baseFee,
    unitFee,
    total: plan.baseFee + unitFee,
    hint: PLAN_HINTS[planId],
  }
}

export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount)
}

/** 요금 계산기 슬라이더 범위·눈금 (100개소 간격, max는 proPlan과 동기화) */
export const CALCULATOR_SLIDER = {
  min: 1,
  max: proPlan.maxFacilities,
  ticks: [
    { value: 1, label: "1개소" },
    ...Array.from(
      { length: (proPlan.maxFacilities - 100) / 100 },
      (_, i) => {
        const value = (i + 1) * 100
        return { value, label: String(value) }
      }
    ),
    { value: proPlan.maxFacilities, label: `${proPlan.maxFacilities}+` },
  ],
} as const

/** 슬라이더 thumb 위치(%) — 선형 range의 실제 값 위치와 눈금을 맞춤 */
export function sliderTickPosition(
  value: number,
  min = CALCULATOR_SLIDER.min,
  max = CALCULATOR_SLIDER.max
): number {
  if (max <= min) return 0
  return ((value - min) / (max - min)) * 100
}

export function sliderTickAlign(
  value: number,
  min = CALCULATOR_SLIDER.min,
  max = CALCULATOR_SLIDER.max
): "start" | "center" | "end" {
  if (value <= min) return "start"
  if (value >= max) return "end"
  return "center"
}
