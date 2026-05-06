import { requirePermission } from "@/lib/auth/helpers"

import { UploadForm } from "./upload-form"

export default async function JsonUploadPage() {
  await requirePermission("facility:upload")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          시설정보 JSON 업로드
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          `basic.pfctSn`과 `equipment[].rideSn` 기준으로 시설과 기구 데이터를
          등록하거나 갱신합니다.
        </p>
      </div>
      <UploadForm />
    </div>
  )
}
