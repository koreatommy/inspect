import { requirePermission } from "@/lib/auth/helpers"

import { listActiveDatasets } from "./actions"
import { UploadForm } from "./upload-form"

export default async function JsonUploadPage() {
  await requirePermission("facility:upload")
  const datasets = await listActiveDatasets()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          시설정보 JSON 업로드
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          `basic.pfctSn`과 `equipment[].rideSn` 기준으로 시설과 기구 데이터를
          등록·갱신합니다. 업로드 대상 데이터셋을 선택하면 해당 데이터셋에
          속한 시설만 갱신되고, JSON에서 누락된 시설은 그 데이터셋에서 비활성
          처리됩니다.
        </p>
      </div>
      <UploadForm datasets={datasets} />
    </div>
  )
}
