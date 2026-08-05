import { z } from "zod"

export const inspectionResultSchema = z.object({
  facility: z.string().describe("시설 종류"),
  part: z.string().describe("시설 부품"),
  hazards: z.array(z.string()).describe("위해요소 목록"),
  inspection: z.array(z.string()).describe("점검자가 확인할 사항"),
  opinion: z.string().describe("점검 의견"),
  confidence: z.number().min(0).max(100).describe("AI 신뢰도 (0-100)"),
})

export type InspectionResult = z.infer<typeof inspectionResultSchema>

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20MB
