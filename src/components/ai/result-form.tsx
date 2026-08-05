"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { InspectionResult } from "@/lib/ai/schema"

interface ResultFormProps {
  result: InspectionResult
  onChange: (result: InspectionResult) => void
}

export function ResultForm({ result, onChange }: ResultFormProps) {
  const handleChange = <K extends keyof InspectionResult>(
    key: K,
    value: InspectionResult[K]
  ) => {
    onChange({ ...result, [key]: value })
  }

  const handleArrayChange = (
    key: "hazards" | "inspection",
    value: string
  ) => {
    const arr = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    handleChange(key, arr)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="facility">시설 종류</Label>
        <Input
          id="facility"
          value={result.facility}
          onChange={(e) => handleChange("facility", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="part">시설 부품</Label>
        <Input
          id="part"
          value={result.part}
          onChange={(e) => handleChange("part", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hazards">위해요소 (줄바꿈으로 구분)</Label>
        <Textarea
          id="hazards"
          value={result.hazards.join("\n")}
          onChange={(e) => handleArrayChange("hazards", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inspection">점검자가 확인할 사항 (줄바꿈으로 구분)</Label>
        <Textarea
          id="inspection"
          value={result.inspection.join("\n")}
          onChange={(e) => handleArrayChange("inspection", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opinion">점검 의견</Label>
        <Textarea
          id="opinion"
          value={result.opinion}
          onChange={(e) => handleChange("opinion", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confidence">AI 신뢰도</Label>
        <div className="flex items-center gap-2">
          <Input
            id="confidence"
            type="number"
            min={0}
            max={100}
            value={result.confidence}
            onChange={(e) =>
              handleChange("confidence", Math.min(100, Math.max(0, Number(e.target.value))))
            }
            className="w-24"
          />
          <span className="text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  )
}
