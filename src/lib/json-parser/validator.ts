import { z } from "zod"

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => val ?? null)

const requiredString = (fieldName: string) =>
  z.preprocess(
    (val) => (val === null || val === undefined ? "" : val),
    z.string().min(1, `${fieldName}이(가) 없습니다.`)
  )

const basicSchema = z.object({
  pfctSn: requiredString("시설번호"),
  pfctNm: requiredString("시설명"),
  zip: nullableString,
  lotnoAddr: nullableString,
  lotnoDaddr: nullableString,
  ronaAddr: nullableString,
  ronaDaddr: nullableString,
  instlYmd: nullableString,
  clsgYmd: nullableString,
  acptnYmd: nullableString,
  fcar: nullableString,
  instlPlaceCd: nullableString,
  instlPlaceCdNm: nullableString,
  dutyCd: nullableString,
  dutyCdNm: nullableString,
  prvtPblcYnCd: nullableString,
  prvtPblcYnCdNm: nullableString,
  operYnCd: nullableString,
  operYnCdNm: nullableString,
  idrodrCd: nullableString,
  idrodrCdNm: nullableString,
  rgnCd: nullableString,
  rgnCdNm: nullableString,
  latCrtsVl: nullableString,
  lotCrtsVl: nullableString,
})

const equipmentSchema = z.object({
  rideSn: requiredString("기구번호"),
  pfctSn: nullableString,
  pfctNm: nullableString,
  rideNm: nullableString,
  rideNo: nullableString,
  rideLctn: nullableString,
  rideInstlYmd: nullableString,
  instlFrmNm: nullableString,
  mnftrFrmNm: nullableString,
  certNo: nullableString,
  rideStylCd: nullableString,
  rideStylCdNm: nullableString,
  rideStylSbCd: nullableString,
  rideStylSbCdNm: nullableString,
})

export const facilityJsonSchema = z.object({
  basic: basicSchema,
  equipment: z.array(equipmentSchema).default([]),
  inspection: z.record(z.string(), z.unknown()).nullable().optional(),
  education: z.record(z.string(), z.unknown()).nullable().optional(),
  insurance: z.record(z.string(), z.unknown()).nullable().optional(),
  manager: z.record(z.string(), z.unknown()).nullable().optional(),
})

export type FacilityJson = z.infer<typeof facilityJsonSchema>

export type FacilityValidationResult =
  | { ok: true; data: FacilityJson }
  | { ok: false; reason: string }

export function normalizeFacilityPayload(input: unknown) {
  if (Array.isArray(input)) {
    return input
  }

  if (
    input &&
    typeof input === "object" &&
    "details" in input &&
    Array.isArray((input as { details?: unknown }).details)
  ) {
    return (input as { details: unknown[] }).details
  }

  return [input]
}

export function validateFacilityJson(input: unknown): FacilityValidationResult {
  const parsed = facilityJsonSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      reason: parsed.error.issues.map((issue) => issue.message).join(", "),
    }
  }

  return { ok: true, data: parsed.data }
}
