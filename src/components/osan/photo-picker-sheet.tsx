"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import { Camera, ImageIcon, X } from "lucide-react"

import type { FacilityEquipment } from "@/lib/osan/facility-equipment"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { EquipmentTypeChips } from "./equipment-type-chips"
import { toast } from "./toast"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: FacilityEquipment | null
  selectedType: string | null
  onSelectType: (type: string) => void
  caption: string
  onCaptionChange: (value: string) => void
  onSave: (file: File) => void | Promise<void>
  saving?: boolean
}

export function PhotoPickerSheet({
  open,
  onOpenChange,
  equipment,
  selectedType,
  onSelectType,
  caption,
  onCaptionChange,
  onSave,
  saving = false,
}: Props) {
  const types = equipment?.types ?? []
  const requiresType = types.length > 0
  const canCapture = !requiresType || Boolean(selectedType)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (open) return
    setPendingFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [open])

  function clearPending() {
    setPendingFile(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setPendingFile(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  async function handleSave() {
    if (saving) return
    if (!pendingFile) {
      toast.error("촬영하거나 앨범에서 사진을 선택해 주세요.")
      return
    }
    if (requiresType && !selectedType) {
      toast.error("유형을 먼저 선택해 주세요.")
      return
    }
    await onSave(pendingFile)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (saving) return
        onOpenChange(next)
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85dvh] gap-0 overflow-y-auto pb-6"
      >
        <SheetHeader className="pb-2">
          <SheetTitle>사진 추가</SheetTitle>
          <SheetDescription>
            {requiresType
              ? "기구유형 또는 공통 항목을 고른 뒤 촬영하거나 앨범에서 선택하세요."
              : "촬영하거나 앨범에서 선택할 수 있습니다."}
          </SheetDescription>
        </SheetHeader>

        <section className="px-4">
          <EquipmentTypeChips
            types={types}
            selected={selectedType}
            onSelect={onSelectType}
            showSectionHeaders
            totalCount={equipment?.totalCount}
            emptyMessage="이 시설에 등록된 기구유형이 없습니다."
            disabled={saving}
          />
        </section>

        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <CaptureOption
            label="촬영"
            icon={<Camera className="size-6 text-muted-foreground" />}
            capture="environment"
            disabled={!canCapture || saving}
            disabledReason={
              !canCapture ? "유형을 먼저 선택해 주세요." : undefined
            }
            onFileChange={onFileChange}
          />
          <CaptureOption
            label="앨범"
            icon={<ImageIcon className="size-6 text-muted-foreground" />}
            disabled={!canCapture || saving}
            disabledReason={
              !canCapture ? "유형을 먼저 선택해 주세요." : undefined
            }
            onFileChange={onFileChange}
          />
        </div>
        {requiresType && !selectedType ? (
          <p className="px-4 pt-2 text-xs text-amber-700 dark:text-amber-300">
            위에서 유형을 선택하면 촬영·앨범을 사용할 수 있습니다.
          </p>
        ) : null}

        <section className="space-y-2 px-4 pt-4">
          <h3 className="text-sm font-medium">사진 점검내용</h3>
          <textarea
            value={caption}
            disabled={saving}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="이 사진에 대한 점검내용을 입력해 주세요 (선택)"
            rows={3}
            className="min-h-16 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </section>

        {previewUrl ? (
          <section className="space-y-2 px-4 pt-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">선택한 사진</h3>
              <button
                type="button"
                disabled={saving}
                onClick={clearPending}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground disabled:opacity-50"
              >
                <X className="size-3.5" />
                다시 선택
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="선택한 사진 미리보기"
                className="mx-auto max-h-56 w-full object-contain"
              />
            </div>
          </section>
        ) : null}

        <div className="px-4 pt-4">
          <button
            type="button"
            disabled={saving || !pendingFile}
            onClick={() => void handleSave()}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CaptureOption({
  label,
  icon,
  capture,
  disabled,
  disabledReason,
  onFileChange,
}: {
  label: string
  icon: ReactNode
  capture?: "environment"
  disabled: boolean
  disabledReason?: string
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border bg-muted/40 px-3 py-4 text-sm font-medium",
        disabled ? "opacity-50" : "active:scale-[0.98]",
      )}
      onClick={
        disabled
          ? (e) => {
              e.preventDefault()
              if (disabledReason) toast.error(disabledReason)
            }
          : undefined
      }
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
