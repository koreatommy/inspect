"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AiError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("AI 페이지 오류:", error)
  }, [error])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            페이지를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.
          </p>
          <Button onClick={reset} className="w-full">
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
