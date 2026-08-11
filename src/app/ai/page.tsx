import type { Metadata } from "next"

import { AiInspectorPage } from "@/components/ai/ai-inspector-page"

export const metadata: Metadata = {
  title: "AI 위해요소 분석",
  description: "어린이놀이시설 사진을 AI로 분석하여 위해요소를 자동으로 추출합니다.",
}

export default function AiPage() {
  return (
    <main className="min-h-dvh bg-background px-4">
      <AiInspectorPage />
    </main>
  )
}
