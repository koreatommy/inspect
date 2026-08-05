"use client"

import { Loader2, Sparkles } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { InspectionResult } from "@/lib/ai/schema"

import { ApiKeyInput } from "./api-key-input"
import { ImageUpload } from "./image-upload"
import { ResultForm } from "./result-form"

const SESSION_STORAGE_KEY = "ai-inspector-api-key"

export function AiInspectorPage() {
  const [apiKey, setApiKey] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<InspectionResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      setApiKey(stored)
    }
  }, [])

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value)
    if (value) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, value)
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error("OpenAI API 키를 입력해 주세요.")
      return
    }

    if (!file) {
      toast.error("분석할 이미지를 선택해 주세요.")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "x-openai-api-key": apiKey,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "분석 중 오류가 발생했습니다.")
      }

      setResult(data)
      toast.success("이미지 분석이 완료되었습니다.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }, [apiKey, file])

  const canAnalyze = apiKey.trim() && file && !loading

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          AI 어린이놀이시설 위해요소 자동 분석
        </h1>
        <p className="mt-2 text-muted-foreground">
          사진을 업로드하면 AI가 위해요소를 자동으로 분석합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">설정</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiKeyInput value={apiKey} onChange={handleApiKeyChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">이미지 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload file={file} onFileChange={setFile} disabled={loading} />

          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                AI 분석하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">분석 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultForm result={result} onChange={setResult} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
