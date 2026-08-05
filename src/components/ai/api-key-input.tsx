"use client"

import { Eye, EyeOff, Key } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
}

export function ApiKeyInput({ value, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor="api-key" className="flex items-center gap-1.5">
        <Key className="size-4" />
        OpenAI API Key
      </Label>
      <div className="relative">
        <Input
          id="api-key"
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-..."
          className="pr-10 font-mono"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          <span className="sr-only">{visible ? "숨기기" : "표시"}</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        API 키는 서버에 저장되지 않으며, 분석 요청에만 사용됩니다.
      </p>
    </div>
  )
}
