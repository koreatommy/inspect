import { revalidatePath } from "next/cache"

import { getCurrentRole, getCurrentUser, hasRole } from "@/lib/auth/helpers"
import { recordDatasetUpload } from "@/lib/dataset/audit-log"
import {
  uploadFacilityJsonWithProgress,
  type UploadProgress,
  type UploadResult,
} from "@/lib/json-parser/uploader"
import { createClient } from "@/lib/supabase/server"

type SSEData =
  | UploadProgress
  | { phase: "done"; result: UploadResult; datasetName: string }
  | { phase: "error"; error: string }

export async function POST(request: Request) {
  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN"])) {
    return new Response(JSON.stringify({ error: "시설정보 업로드는 관리자만 사용할 수 있습니다." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "세션이 만료되었습니다. 다시 로그인해 주세요." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return new Response(JSON.stringify({ error: "요청 형식이 올바르지 않습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: "업로드할 JSON 파일을 선택해 주세요." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (file.size > 10 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "JSON 파일은 최대 10MB까지 업로드할 수 있습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    return new Response(JSON.stringify({ error: "JSON 파일만 업로드할 수 있습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const mode = formData.get("datasetMode")
  if (mode !== "existing" && mode !== "new") {
    return new Response(JSON.stringify({ error: "데이터셋 선택 방식이 올바르지 않습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabase = await createClient()

  let datasetId: string
  let datasetName: string

  if (mode === "new") {
    const nameRaw = formData.get("newDatasetName")
    const name = typeof nameRaw === "string" ? nameRaw.trim() : ""
    if (!name) {
      return new Response(JSON.stringify({ error: "신규 데이터셋 이름을 입력해 주세요." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    if (name.length > 80) {
      return new Response(JSON.stringify({ error: "데이터셋 이름은 80자 이내로 입력해 주세요." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const descRaw = formData.get("newDatasetDescription")
    const description =
      typeof descRaw === "string" && descRaw.trim().length > 0
        ? descRaw.trim()
        : null

    const { data: created, error: insertError } = await supabase
      .from("facility_datasets")
      .insert({
        name,
        description,
        status: "active",
        uploaded_by: user.id,
        source_file: file.name,
      })
      .select("id,name")
      .single()

    if (insertError || !created) {
      return new Response(
        JSON.stringify({
          error: insertError?.message ?? "데이터셋 생성 중 오류가 발생했습니다.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    datasetId = created.id
    datasetName = created.name
  } else {
    const idRaw = formData.get("datasetId")
    if (typeof idRaw !== "string" || idRaw.length === 0) {
      return new Response(JSON.stringify({ error: "사용할 기존 데이터셋을 선택해 주세요." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { data: dataset, error: fetchError } = await supabase
      .from("facility_datasets")
      .select("id,name,status")
      .eq("id", idRaw)
      .maybeSingle()

    if (fetchError || !dataset) {
      return new Response(JSON.stringify({ error: "선택한 데이터셋을 찾을 수 없습니다." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (dataset.status !== "active") {
      return new Response(
        JSON.stringify({
          error: "보관(archived) 상태의 데이터셋에는 업로드할 수 없습니다.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    datasetId = dataset.id
    datasetName = dataset.name
  }

  let payload: unknown
  try {
    const text = await file.text()
    payload = JSON.parse(text)
  } catch {
    return new Response(JSON.stringify({ error: "JSON 형식이 올바르지 않습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (data: SSEData) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const result = await uploadFacilityJsonWithProgress(supabase, payload, {
          datasetId,
          sourceFile: file.name,
          uploadedBy: user.id,
          onProgress: send,
        })

        await recordDatasetUpload(supabase, {
          datasetId,
          uploadedBy: user.id,
          sourceFile: file.name,
          result,
        })

        revalidatePath("/admin/upload")
        revalidatePath("/admin/datasets")
        revalidatePath("/facilities")
        revalidatePath("/")

        send({ phase: "done", result, datasetName })
      } catch (error) {
        send({
          phase: "error",
          error: error instanceof Error ? error.message : "업로드 중 오류가 발생했습니다.",
        })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
