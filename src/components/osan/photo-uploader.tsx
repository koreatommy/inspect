"use client"

import { useRef, useState } from "react"
import { Camera, Loader2, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { MAX_PHOTOS } from "@/lib/osan/constants"
import type { OsanPhotoWithUrl } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import {
  createPhotoUploadUrl,
  deletePhoto,
  savePhoto,
} from "@/app/osan/actions"
import { compressImage } from "./osan-utils"

type Props = {
  facilityId: string
  photos: OsanPhotoWithUrl[]
  onChange: (photos: OsanPhotoWithUrl[]) => void
}

export function PhotoUploader({ facilityId, photos, onChange }: Props) {
  const [busySlot, setBusySlot] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingSlotRef = useRef<number>(1)

  const bySlot = new Map(photos.map((p) => [p.slot, p]))

  function openPicker(slot: number) {
    pendingSlotRef.current = slot
    fileInputRef.current?.click()
  }

  async function handleFile(file: File) {
    const slot = pendingSlotRef.current
    setBusySlot(slot)
    try {
      const blob = await compressImage(file)
      const urlRes = await createPhotoUploadUrl(facilityId, slot)
      if (!urlRes.ok) throw new Error(urlRes.error)

      const form = new FormData()
      form.append("cacheControl", "3600")
      form.append("", blob, `slot-${slot}.jpg`)
      const uploadRes = await fetch(urlRes.data.signedUrl, {
        method: "PUT",
        body: form,
      })
      if (!uploadRes.ok) {
        throw new Error(`사진 업로드 실패 (${uploadRes.status})`)
      }

      const saveRes = await savePhoto(facilityId, slot, urlRes.data.path)
      if (!saveRes.ok) throw new Error(saveRes.error)

      const next = [...photos.filter((p) => p.slot !== slot), saveRes.data].sort(
        (a, b) => a.slot - b.slot,
      )
      onChange(next)
      toast.success(`사진 ${slot}번 저장 완료`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "사진 업로드 실패")
    } finally {
      setBusySlot(null)
    }
  }

  async function handleDelete(photo: OsanPhotoWithUrl) {
    setBusySlot(photo.slot)
    try {
      const res = await deletePhoto(photo.id)
      if (!res.ok) throw new Error(res.error)
      onChange(photos.filter((p) => p.id !== photo.id))
      toast.success("사진 삭제됨")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "삭제 실패")
    } finally {
      setBusySlot(null)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }}
      />
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
                    src={photo.url}
                    alt={`사진 ${slot}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    disabled={busy}
                    className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-md bg-black/55 text-white active:scale-95"
                    aria-label="사진 삭제"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openPicker(slot)}
                  disabled={busy}
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
