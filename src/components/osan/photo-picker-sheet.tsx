"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import { Camera, Check, ImageIcon, X } from "lucide-react"

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
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 px-4 pb-3 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-lg font-semibold">사진 추가</SheetTitle>
              <SheetDescription className="text-[13px] leading-snug">
                {requiresType
                  ? "유형을 고른 뒤 촬영하거나 앨범에서 고르세요."
                  : "촬영하거나 앨범에서 선택할 수 있습니다."}
              </SheetDescription>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground touch-manipulation active:scale-95 disabled:opacity-50"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </div>

          {requiresType ? (
            <ol className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <StepBadge
                n={1}
                label="유형"
                done={Boolean(selectedType)}
                active={!selectedType}
              />
              <span className="h-px flex-1 bg-border" aria-hidden />
              <StepBadge
                n={2}
                label="사진"
                done={Boolean(pendingFile)}
                active={Boolean(selectedType) && !pendingFile}
              />
              <span className="h-px flex-1 bg-border" aria-hidden />
              <StepBadge
                n={3}
                label="저장"
                done={false}
                active={Boolean(selectedType && pendingFile)}
              />
            </ol>
          ) : null}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <section className="px-4 pt-3">
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

          <section className="px-4 pt-4">
            <h3 className="mb-2 text-sm font-semibold">사진</h3>
            {previewUrl ? (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-2xl border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="선택한 사진 미리보기"
                    className="mx-auto max-h-52 w-full object-contain"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    onClick={clearPending}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white touch-manipulation active:scale-95 disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                    다시 선택
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <CaptureOption
                    label="촬영"
                    hint="카메라"
                    icon={<Camera className="size-7" strokeWidth={1.75} />}
                    capture="environment"
                    disabled={!canCapture || saving}
                    disabledReason={
                      !canCapture ? "유형을 먼저 선택해 주세요." : undefined
                    }
                    onFileChange={onFileChange}
                    emphasized
                  />
                  <CaptureOption
                    label="앨범"
                    hint="갤러리"
                    icon={<ImageIcon className="size-7" strokeWidth={1.75} />}
                    disabled={!canCapture || saving}
                    disabledReason={
                      !canCapture ? "유형을 먼저 선택해 주세요." : undefined
                    }
                    onFileChange={onFileChange}
                  />
                </div>
                {requiresType && !selectedType ? (
                  <p className="mt-2.5 rounded-lg bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-amber-800 dark:text-amber-200">
                    위에서 유형을 선택하면 촬영·앨범을 사용할 수 있습니다.
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="space-y-2 px-4 pt-4 pb-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">점검내용</h3>
              <span className="text-[11px] text-muted-foreground">선택</span>
            </div>
            <textarea
              value={caption}
              disabled={saving}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="이 사진에 대한 점검내용 (선택)"
              rows={2}
              className="min-h-14 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:text-sm"
            />
          </section>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-background px-4 pt-3 pb-3">
          <button
            type="button"
            disabled={saving || !pendingFile}
            onClick={() => void handleSave()}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-foreground text-[15px] font-semibold text-background touch-manipulation active:scale-[0.99] disabled:opacity-40"
          >
            {saving ? "저장 중…" : pendingFile ? "사진 저장" : "사진을 선택해 주세요"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function StepBadge({
  n,
  label,
  done,
  active,
}: {
  n: number
  label: string
  done: boolean
  active: boolean
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5",
        done || active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
          done
            ? "bg-foreground text-background"
            : active
              ? "bg-foreground/15 text-foreground ring-1 ring-foreground/30"
              : "bg-muted text-muted-foreground",
        )}
      >
        {done ? <Check className="size-3" strokeWidth={3} /> : n}
      </span>
      {label}
    </li>
  )
}

function CaptureOption({
  label,
  hint,
  icon,
  capture,
  disabled,
  disabledReason,
  onFileChange,
  emphasized = false,
}: {
  label: string
  hint?: string
  icon: ReactNode
  capture?: "environment"
  disabled: boolean
  disabledReason?: string
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  emphasized?: boolean
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-[6.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-5 touch-manipulation",
        emphasized && !disabled
          ? "border-foreground/25 bg-foreground/[0.04]"
          : "border-border bg-muted/40",
        disabled ? "opacity-45" : "active:scale-[0.98]",
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
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          emphasized && !disabled
            ? "bg-foreground text-background"
            : "bg-background text-muted-foreground shadow-sm",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      {hint ? (
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  )
}
