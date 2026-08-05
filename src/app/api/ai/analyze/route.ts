import { analyzeImage } from "@/lib/ai/analyze"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/ai/schema"

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-openai-api-key")
  if (!apiKey) {
    return Response.json(
      { error: "OpenAI API 키가 필요합니다." },
      { status: 400 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 }
    )
  }

  const file = formData.get("image")
  if (!(file instanceof File) || file.size === 0) {
    return Response.json(
      { error: "분석할 이미지를 선택해 주세요." },
      { status: 400 }
    )
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return Response.json(
      { error: "JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다." },
      { status: 400 }
    )
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return Response.json(
      { error: "이미지는 최대 20MB까지 업로드할 수 있습니다." },
      { status: 400 }
    )
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    const result = await analyzeImage(apiKey, base64, file.type)

    return Response.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return Response.json(
          { error: "OpenAI API 키가 올바르지 않습니다." },
          { status: 401 }
        )
      }
      if (error.message.includes("rate limit")) {
        return Response.json(
          { error: "API 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요." },
          { status: 429 }
        )
      }
    }

    console.error("AI 분석 오류:", error instanceof Error ? error.message : error)

    return Response.json(
      { error: "이미지 분석 중 오류가 발생했습니다. 다시 시도해 주세요." },
      { status: 500 }
    )
  }
}
