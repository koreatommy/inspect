"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react"
import { Camera, Loader2, X } from "lucide-react"
import { toast } from "./toast"

import { MAX_PHOTOS } from "@/lib/osan/constants"
import { getFacilityEquipment } from "@/lib/osan/facility-equipment"
import type { OsanPhotoWithUrl } from "@/lib/osan/types"
import type { DraftPhoto } from "./draft-photo"
import { compressImage } from "./osan-utils"
import { EquipmentTypeChips } from "./equipment-type-chips"
import { PhotoPickerSheet } from "./photo-picker-sheet"
import { revokeDraftPhoto } from "./photo-uploader"

export type PhotoMetaDraft = {
  equipmentType: string | null
  caption: string
}

type Props = {
  photos: OsanPhotoWithUrl[]
  addedPhotos: DraftPhoto[]
  onAddedPhotosChange: Dispatch<SetStateAction<DraftPhoto[]>>
  facilityCode: string | null
  drafts: Record<string, PhotoMetaDraft>
  onChange: (photoId: string, next: PhotoMetaDraft) => void
  onDeleteSavedPhoto: (photoId: string) => void
  disabled?: boolean
}

export function photoMetaDraftsFromPhotos(
  photos: OsanPhotoWithUrl[],
): Record<string, PhotoMetaDraft> {
  return Object.fromEntries(
    photos.map((photo) => [
      photo.id,
      {
        equipmentType: photo.equipment_type,
        caption: photo.caption ?? "",
      },
    ]),
  )
}

export function PhotoMetaEditor({
  photos,
  addedPhotos,
  onAddedPhotosChange,
  facilityCode,
  drafts,
  onChange,
  onDeleteSavedPhoto,
  disabled = false,
}: Props) {
  const equipment = getFacilityEquipment(facilityCode)
  const types = equipment?.types ?? []
  const [busySlot, setBusySlot] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const pendingSlotRef = useRef<number>(1)
  const selectedTypeRef = useRef(selectedType)
  const captionRef = useRef(caption)
  selectedTypeRef.current = selectedType
  captionRef.current = caption

  const occupiedSlots = new Set([
    ...photos.map((photo) => photo.slot),
    ...addedPhotos.map((photo) => photo.slot),
  ])
  const emptySlots = Array.from(
    { length: MAX_PHOTOS },
    (_, i) => i + 1,
  ).filter((slot) => !occupiedSlots.has(slot))

  function openPicker(slot: number) {
    if (disabled || busySlot != null) return
    pendingSlotRef.current = slot
    setSelectedType(null)
    setCaption("")
    setPickerOpen(true)
  }

  async function handleFile(file: File) {
    const slot = pendingSlotRef.current
    const equipmentType = selectedTypeRef.current ?? undefined
    const photoCaption = captionRef.current.trim() || undefined
    setBusySlot(slot)
    try {
      const blob = await compressImage(file)
      const previewUrl = URL.createObjectURL(blob)
      onAddedPhotosChange((prev) => {
        const previous = prev.find((p) => p.slot === slot)
        if (previous) revokeDraftPhoto(previous)
        return [
          ...prev.filter((p) => p.slot !== slot),
          { slot, previewUrl, blob, equipmentType, caption: photoCaption },
        ].sort((a, b) => a.slot - b.slot)
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "사진 준비 실패")
    } finally {
      setBusySlot(null)
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPickerOpen(false)
    if (file) void handleFile(file)
    e.target.value = ""
  }

  function patchAddedPhoto(slot: number, patch: Partial<DraftPhoto>) {
    onAddedPhotosChange((prev) =>
      prev
        .map((photo) => (photo.slot === slot ? { ...photo, ...patch } : photo))
        .sort((a, b) => a.slot - b.slot),
    )
  }

  function removeAddedPhoto(slot: number) {
    if (disabled) return
    onAddedPhotosChange((prev) => {
      const current = prev.find((p) => p.slot === slot)
      if (current) revokeDraftPhoto(current)
      return prev.filter((p) => p.slot !== slot)
    })
  }

  return (
    <div className="space-y-3">
      <PhotoPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        equipment={equipment}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        caption={caption}
        onCaptionChange={setCaption}
        onFileChange={onFileChange}
      />

      {equipment ? (
        <p className="text-[11px] text-muted-foreground">
          총 {equipment.totalCount}개 기구 · 사진마다 기구유형 또는 공통 항목 1개를 선택하세요
        </p>
      ) : null}

      {photos.map((photo) => {
        const draft = drafts[photo.id] ?? {
          equipmentType: photo.equipment_type,
          caption: photo.caption ?? "",
        }
        return (
          <div
            key={photo.id}
            className="overflow-hidden rounded-xl border bg-muted/20"
          >
            <div className="flex gap-3 p-3">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`${photo.slot}번 사진`}
                  className="size-20 rounded-lg object-cover"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onDeleteSavedPhoto(photo.id)}
                  className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white shadow active:scale-95 disabled:opacity-50"
                  aria-label={`${photo.slot}번 사진 삭제`}
                >
                  <X className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {photo.slot}번 사진
                </p>
                <EquipmentTypeChips
                  types={types}
                  selected={draft.equipmentType}
                  disabled={disabled}
                  size="sm"
                  onSelect={(type) =>
                    onChange(photo.id, { ...draft, equipmentType: type })
                  }
                />
              </div>
            </div>
            <div className="border-t px-3 py-2">
              <textarea
                value={draft.caption}
                disabled={disabled}
                onChange={(e) =>
                  onChange(photo.id, {
                    ...draft,
                    caption: e.target.value,
                  })
                }
                placeholder="이 사진에 대한 점검내용을 입력해 주세요 (선택)"
                rows={2}
                className="min-h-14 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              />
            </div>
          </div>
        )
      })}

      {addedPhotos.map((photo) => (
        <div
          key={`draft-${photo.slot}`}
          className="overflow-hidden rounded-xl border border-dashed border-primary/40 bg-muted/20"
        >
          <div className="flex gap-3 p-3">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`${photo.slot}번 추가 사진`}
                className="size-20 rounded-lg object-cover"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeAddedPhoto(photo.slot)}
                className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-black/70 text-white shadow active:scale-95 disabled:opacity-50"
                aria-label={`${photo.slot}번 추가 사진 삭제`}
              >
                <X className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {photo.slot}번 사진 · 추가
              </p>
              <EquipmentTypeChips
                types={types}
                selected={photo.equipmentType}
                disabled={disabled}
                size="sm"
                onSelect={(type) =>
                  patchAddedPhoto(photo.slot, { equipmentType: type })
                }
              />
            </div>
          </div>
          <div className="border-t px-3 py-2">
            <textarea
              value={photo.caption ?? ""}
              disabled={disabled}
              onChange={(e) =>
                patchAddedPhoto(photo.slot, { caption: e.target.value })
              }
              placeholder="이 사진에 대한 점검내용을 입력해 주세요 (선택)"
              rows={2}
              className="min-h-14 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
          </div>
        </div>
      ))}

      {emptySlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {emptySlots.map((slot) => {
            const busy = busySlot === slot
            return (
              <button
                key={slot}
                type="button"
                disabled={disabled || busySlot != null}
                onClick={() => openPicker(slot)}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input bg-muted/40 text-muted-foreground active:scale-95 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Camera className="size-5" />
                )}
                <span className="text-[11px]">{slot}번 추가</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
