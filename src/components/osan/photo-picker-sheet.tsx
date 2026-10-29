"use client"

import type { ChangeEvent, ReactNode } from "react"
import { Camera, ImageIcon } from "lucide-react"

import type { FacilityEquipment } from "@/lib/osan/facility-equipment"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: FacilityEquipment | null
  selectedType: string | null
  onSelectType: (type: string) => void
  caption: string
  onCaptionChange: (value: string) => void
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function PhotoPickerSheet({
  open,
  onOpenChange,
  equipment,
  selectedType,
  onSelectType,
  caption,
  onCaptionChange,
  onFileChange,
}: Props) {
  const types = equipment?.types ?? []
  const requiresType = types.length > 0
  const canCapture = !requiresType || Boolean(selectedType)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85dvh] gap-0 overflow-y-auto pb-6"
      >
        <SheetHeader className="pb-2">
          <SheetTitle>사진 추가</SheetTitle>
          <SheetDescription>
            촬영하거나 앨범에서 선택할 수 있습니다.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-2 px-4">
          <CaptureOption
            label="촬영"
            icon={<Camera className="size-6 text-muted-foreground" />}
            capture="environment"
            disabled={!canCapture}
            onFileChange={onFileChange}
          />
          <CaptureOption
            label="앨범"
            icon={<ImageIcon className="size-6 text-muted-foreground" />}
            disabled={!canCapture}
            onFileChange={onFileChange}
          />
        </div>
        {requiresType && !selectedType ? (
          <p className="px-4 pt-2 text-xs text-amber-700 dark:text-amber-300">
            기구유형을 선택한 뒤 촬영하거나 앨범에서 고를 수 있습니다.
          </p>
        ) : null}

        <section className="space-y-2 px-4 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-medium">기구유형</h3>
            {equipment ? (
              <span className="text-[11px] text-muted-foreground">
                총 {equipment.totalCount}개 기구
              </span>
            ) : null}
          </div>
          {types.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {types.map((type) => {
                const selected = selectedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onSelectType(type)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-full border px-2.5 py-1.5 text-xs font-medium",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-input bg-muted/40 text-foreground",
                    )}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              이 시설에 등록된 기구유형이 없습니다.
            </p>
          )}
        </section>

        <section className="space-y-2 px-4 pt-4">
          <h3 className="text-sm font-medium">사진 점검내용</h3>
          <textarea
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="이 사진에 대한 점검내용을 입력해 주세요 (선택)"
            rows={3}
            className="min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </section>
      </SheetContent>
    </Sheet>
  )
}

function CaptureOption({
  label,
  icon,
  capture,
  disabled,
  onFileChange,
}: {
  label: string
  icon: ReactNode
  capture?: "environment"
  disabled: boolean
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border bg-muted/40 px-3 py-4 text-sm font-medium",
        disabled ? "opacity-50" : "active:scale-[0.98]",
      )}
    >
      {disabled ? null : (
        <input
          type="file"
          accept="image/*"
          capture={capture}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={onFileChange}
        />
      )}
      {icon}
      {label}
    </label>
  )
}
