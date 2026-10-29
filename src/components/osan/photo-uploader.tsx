"use client"

import { useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import { Camera, ImageIcon, Loader2, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { MAX_PHOTOS } from "@/lib/osan/constants"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { DraftPhoto } from "./draft-photo"
import { compressImage } from "./osan-utils"

type Props = {
  photos: DraftPhoto[]
  onChange?: Dispatch<SetStateAction<DraftPhoto[]>>
  readOnly?: boolean
}

export function revokeDraftPhoto(photo: DraftPhoto) {
  if (photo.blob) URL.revokeObjectURL(photo.previewUrl)
}

export function PhotoUploader({ photos, onChange, readOnly = false }: Props) {
  const [busySlot, setBusySlot] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pendingSlotRef = useRef<number>(1)
  const picking = busySlot != null

  const bySlot = new Map(photos.map((p) => [p.slot, p]))

  function openPicker(slot: number) {
    if (readOnly || !onChange || picking) return
    pendingSlotRef.current = slot
    setPickerOpen(true)
  }

  async function handleFile(file: File) {
    if (!onChange) return
    const slot = pendingSlotRef.current
    setBusySlot(slot)
    try {
      const blob = await compressImage(file)
      const previewUrl = URL.createObjectURL(blob)
      onChange((prev) => {
        const previous = prev.find((p) => p.slot === slot)
        if (previous) revokeDraftPhoto(previous)
        return [
          ...prev.filter((p) => p.slot !== slot),
          { slot, previewUrl, blob },
        ].sort((a, b) => a.slot - b.slot)
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "사진 준비 실패")
    } finally {
      setBusySlot(null)
    }
  }

  function handleDelete(photo: DraftPhoto) {
    if (readOnly || !onChange || picking) return
    onChange((prev) => {
      const current = prev.find((p) => p.slot === photo.slot)
      if (current) revokeDraftPhoto(current)
      return prev.filter((p) => p.slot !== photo.slot)
    })
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPickerOpen(false)
    if (file) void handleFile(file)
    e.target.value = ""
  }

  return (
    <div>
      {readOnly ? null : (
        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="gap-0 pb-6"
          >
            <SheetHeader className="pb-2">
              <SheetTitle>사진 추가</SheetTitle>
              <SheetDescription>
                촬영하거나 앨범에서 선택할 수 있습니다.
              </SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 px-4">
              <label className="relative flex flex-col items-center gap-2 rounded-xl border bg-muted/40 px-3 py-4 text-sm font-medium active:scale-[0.98]">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={onFileChange}
                />
                <Camera className="size-6 text-muted-foreground" />
                촬영
              </label>
              <label className="relative flex flex-col items-center gap-2 rounded-xl border bg-muted/40 px-3 py-4 text-sm font-medium active:scale-[0.98]">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={onFileChange}
                />
                <ImageIcon className="size-6 text-muted-foreground" />
                앨범
              </label>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {Array.from({ length: MAX_PHOTOS }, (_, i) => i + 1).map((slot) => {
          const photo = bySlot.get(slot)
          const busy = busySlot === slot
          return (
            <div
              key={slot}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border border-dashed",
                photo ? "border-transparent" : "border-input bg-muted/40",
              )}
            >
              {photo ? (
                <>
                  {/* 사용자 업로드 이미지: 원격 호스트 설정 불필요하도록 일반 img 사용 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`사진 ${slot}`}
                    className="size-full object-cover"
                  />
                  {readOnly ? null : (
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      disabled={picking}
                      className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-md bg-black/55 text-white active:scale-95"
                      aria-label="사진 삭제"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  )}
                </>
              ) : readOnly ? null : (
                <button
                  type="button"
                  onClick={() => openPicker(slot)}
                  disabled={picking}
                  className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground active:scale-95"
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Camera className="size-5" />
                  )}
                  <span className="text-[11px]">{slot}번</span>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
