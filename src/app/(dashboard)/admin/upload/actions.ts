"use server"

import { uploadFacilityJson, type UploadResult } from "@/lib/json-parser/uploader"
import { getCurrentRole, hasRole } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"

export type UploadState = {
  result?: UploadResult
  error?: string
}

export async function uploadJsonAction(
  _previousState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return { error: "업로드할 JSON 파일을 선택해 주세요." }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { error: "JSON 파일은 최대 10MB까지 업로드할 수 있습니다." }
  }

  if (!file.name.endsWith(".json") && file.type !== "application/json") {
    return { error: "JSON 파일만 업로드할 수 있습니다." }
  }

  const role = await getCurrentRole()
  if (!hasRole(role, ["ADMIN"])) {
    return { error: "시설정보 업로드는 관리자만 사용할 수 있습니다." }
  }

  try {
    const text = await file.text()
    const payload = JSON.parse(text) as unknown
    const supabase = await createClient()
    const result = await uploadFacilityJson(supabase, payload)

    return { result }
  } catch (error) {
    return {
      error:
        error instanceof SyntaxError
          ? "JSON 형식이 올바르지 않습니다."
          : "시설정보 업로드 중 오류가 발생했습니다.",
    }
  }
}
