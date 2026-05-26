"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { SignaturePad } from "./signature-pad"
import { SignaturePreview } from "./signature-preview"

export function SignatureField({
  name,
  label,
  existingSignatureSrc,
}: {
  name: string
  label: string
  existingSignatureSrc: string | null
}) {
  const [isRedrawing, setIsRedrawing] = useState(false)
  const hasExisting = Boolean(existingSignatureSrc)

  if (hasExisting && !isRedrawing) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium">{label}</label>
          <Badge variant="secondary">저장됨</Badge>
        </div>
        <SignaturePreview
          label={label}
          src={existingSignatureSrc}
          fallbackMessage=""
          showLabel={false}
        />
        <p className="text-xs text-muted-foreground">
          저장된 서명이 있습니다. 점검내용만 수정하면 서명은 그대로 유지됩니다.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsRedrawing(true)}
        >
          서명 다시 하기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {hasExisting ? (
        <div className="space-y-2 rounded-lg border border-dashed bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            새 서명을 저장하면 기존 서명이 교체됩니다.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRedrawing(false)}
          >
            취소
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          서명이 필요합니다. 아래에 서명해 주세요.
        </p>
      )}
      <SignaturePad name={name} label={label} />
    </div>
  )
}
