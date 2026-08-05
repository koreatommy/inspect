import OpenAI from "openai"

import { inspectionResultSchema, type InspectionResult } from "./schema"
import { JSON_SCHEMA, SYSTEM_PROMPT } from "./prompt"

export async function analyzeImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<InspectionResult> {
  const client = new OpenAI({ apiKey })

  const dataUri = `data:${mimeType};base64,${imageBase64}`

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: SYSTEM_PROMPT },
          {
            type: "input_image",
            image_url: dataUri,
          },
        ],
      },
    ],
    text: {
      format: JSON_SCHEMA,
    },
  })

  const outputText = response.output_text
  if (!outputText) {
    throw new Error("OpenAI 응답이 비어 있습니다.")
  }

  const parsed = JSON.parse(outputText)
  const validated = inspectionResultSchema.parse(parsed)

  return validated
}
