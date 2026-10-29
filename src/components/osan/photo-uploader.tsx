"use client"

import { useRef, useState, type Dispatch, type SetStateAction } from "react"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { MAX_PHOTOS } from "@/lib/osan/constants"
import { getFacilityEquipment } from "@/lib/osan/facility-equipment"
import { cn } from "@/lib/utils"
import type { DraftPhoto } from "./draft-photo"
import { compressImage } from "./osan-utils"
import { PhotoPickerSheet } from "./photo-picker-sheet"

type Props = {
  photos: DraftPhoto[]
  onChange?: Dispatch<SetStateAction<DraftPhoto[]>>
  readOnly?: boolean
  facilityCode?: string | null
}

export function revokeDraftPhoto(photo: DraftPhoto) {
  if (photo.blob) URL.revokeObjectURL(photo.previewUrl)
}

export function PhotoUploader({
  photos,
  onChange,
  readOnly = false,
  facilityCode,
}: Props) {
  const [busySlot, setBusySlot] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const pendingSlotRef = useRef<number>(1)
  const selectedTypeRef = useRef(selectedType)
  const captionRef = useRef(caption)
  selectedTypeRef.current = selectedType
  captionRef.current = caption
  const picking = busySlot != null
  const equipment = getFacilityEquipment(facilityCode)
  const bySlot = new Map(photos.map((p) => [p.slot, p]))

  function openPicker(slot: number) {
    if (readOnly || !onChange || picking) return
    pendingSlotRef.current = slot
    setSelectedType(null)
    setCaption("")
    setPickerOpen(true)
  }

  async function handleSave(file: File) {
    if (!onChange) return
    const slot = pendingSlotRef.current
    const equipmentType = selectedTypeRef.current ?? undefined
    const photoCaption = captionRef.current.trim() || undefined
    setBusySlot(slot)
    try {
      const blob = await compressImage(file)
      const previewUrl = URL.createObjectURL(blob)
      onChange((prev) => {
        const previous = prev.find((p) => p.slot === slot)
        if (previous) revokeDraftPhoto(previous)
        return [
          ...prev.filter((p) => p.slot !== slot),
          { slot, previewUrl, blob, equipmentType, caption: photoCaption },
        ].sort((a, b) => a.slot - b.slot)
      })
      setPickerOpen(false)
      setSelectedType(null)
      setCaption("")
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

  return (
    <div>
      {readOnly ? null : (
        <PhotoPickerSheet
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          equipment={equipment}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          caption={caption}
          onCaptionChange={setCaption}
          onSave={handleSave}
          saving={picking}
        />
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
                  {photo.equipmentType ? (
                    <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                      {photo.equipmentType}
                    </span>
                  ) : null}
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

      {photos.some((photo) => photo.caption) ? (
        <ul className="mt-2 space-y-1">
          {photos
            .filter((photo) => photo.caption)
            .map((photo) => (
              <li key={photo.slot} className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{photo.slot}번</span>
                {photo.equipmentType ? ` · ${photo.equipmentType}` : ""}
                {` · ${photo.caption}`}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  )
}
