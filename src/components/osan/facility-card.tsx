"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, MapPinned, Phone, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { clearVisitRecord, toggleVisited } from "@/app/osan/actions"
import type {
  OsanFacilityWithRelations,
  OsanPhotoWithUrl,
} from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import type { DraftPhoto } from "./draft-photo"
import { MemoSection } from "./memo-section"
import { persistInspection } from "./persist-inspection"
import { PhotoUploader, revokeDraftPhoto } from "./photo-uploader"
import { RouteNavLinks } from "./route-nav-links"
import {
  addressWithoutPostal,
  kakaoRouteUrl,
  placeTypeColor,
} from "./osan-utils"

type Props = {
  facility: OsanFacilityWithRelations
  order?: number
  defaultOpen?: boolean
  onChange: (next: OsanFacilityWithRelations) => void
}

function InfoRow({
  label,
  value,
  action,
}: {
  label: string
  value: string | null
  action?: ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words">{value}</span>
      {action}
    </div>
  )
}

function mergePhotosBySlot(
  existing: OsanPhotoWithUrl[],
  saved: OsanPhotoWithUrl[],
) {
  const bySlot = new Map(existing.map((photo) => [photo.slot, photo]))
  for (const photo of saved) bySlot.set(photo.slot, photo)
  return [...bySlot.values()].sort((a, b) => a.slot - b.slot)
}

export function FacilityCard({ facility, order, defaultOpen, onChange }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const [busy, setBusy] = useState(false)
  const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([])
  const [draftNote, setDraftNote] = useState("")
  const draftPhotosRef = useRef(draftPhotos)
  draftPhotosRef.current = draftPhotos
  const hasCoords = facility.lat != null && facility.lng != null

  useEffect(() => {
    return () => {
      draftPhotosRef.current.forEach(revokeDraftPhoto)
    }
  }, [])

  function clearDrafts() {
    draftPhotosRef.current.forEach(revokeDraftPhoto)
    setDraftPhotos([])
    setDraftNote("")
  }

  async function handleVisitedClick() {
    if (busy) return

    if (facility.visited) {
      setBusy(true)
      const res = await toggleVisited(facility.id, false)
      setBusy(false)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      onChange({ ...facility, visited: false })
      toast.success("미완료로 변경")
      return
    }

    if (draftPhotos.length === 0 && !draftNote.trim()) {
      toast.error("사진 또는 점검내용을 입력해 주세요.")
      return
    }

    setBusy(true)
    const res = await persistInspection({
      facilityId: facility.id,
      photos: draftPhotos,
      note: draftNote,
    })
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }

    const savedPhotos = mergePhotosBySlot(facility.photos, res.photos)
    const savedNotes = res.note ? [res.note, ...facility.notes] : facility.notes
    clearDrafts()
    onChange({
      ...facility,
      visited: true,
      photos: savedPhotos,
      notes: savedNotes,
    })
    toast.success("점검 완료")
  }

  async function handleClearVisit() {
    if (busy) return
    const ok = window.confirm(
      "이 시설의 점검완료·사진·점검내용을 모두 삭제할까요?\n시설 정보는 남고 미완료 상태로 돌아갑니다.",
    )
    if (!ok) return
    setBusy(true)
    const res = await clearVisitRecord(facility.id)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    clearDrafts()
    onChange({ ...facility, visited: false, photos: [], notes: [] })
    toast.success("완료 기록을 삭제했습니다")
  }

  async function copyAddress() {
    if (!facility.address) return
    try {
      await navigator.clipboard.writeText(
        addressWithoutPostal(facility.address),
      )
      toast.success("주소 복사됨")
    } catch {
      toast.error("복사에 실패했습니다")
    }
  }

  const savedAsDraft: DraftPhoto[] = facility.photos.map((photo) => ({
    slot: photo.slot,
    previewUrl: photo.url,
  }))

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card text-card-foreground shadow-sm",
        facility.visited && "border-emerald-400/50",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {order != null ? (
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {order}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                placeTypeColor(facility.place_type),
              )}
            >
              {facility.place_type}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {facility.indoor_outdoor}
            </span>
            {facility.visited ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-700">
                완료
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-snug">
            {facility.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {facility.region} · {facility.address}
          </p>
        </div>
      </button>

      <div className="flex gap-2 px-4 pb-3">
        {facility.phone ? (
          <a
            href={`tel:${facility.phone}`}
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"
          >
            <Phone className="size-4" />
            전화
          </a>
        ) : null}
        {hasCoords ? (
          <RouteNavLinks
            name={facility.name}
            lat={facility.lat!}
            lng={facility.lng!}
            variant="text"
          />
        ) : (
          <button
            type="button"
            onClick={() => void copyAddress()}
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-muted text-sm font-medium"
          >
            <Copy className="size-4" />
            주소
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleVisitedClick()}
          disabled={busy}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium",
            facility.visited
              ? "bg-emerald-600 text-white"
              : "bg-foreground text-background",
          )}
        >
          <Check className="size-4" />
          {facility.visited ? "완료됨" : "점검완료"}
        </button>
      </div>

      {open ? (
        <div className="space-y-4 border-t px-4 py-4">
          <section className="space-y-1.5">
            <InfoRow label="시설번호" value={facility.facility_code} />
            <InfoRow label="설치장소" value={facility.place_type} />
            <InfoRow label="지역" value={facility.region} />
            <InfoRow label="실내외" value={facility.indoor_outdoor} />
            <InfoRow label="대표자" value={facility.representative} />
            <InfoRow label="전화" value={facility.phone} />
            <InfoRow label="이메일" value={facility.email} />
            <InfoRow label="관리자" value={facility.safety_manager} />
            <InfoRow
              label="주소"
              value={facility.address}
              action={
                facility.address ? (
                  <button
                    type="button"
                    onClick={() => void copyAddress()}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground active:scale-95"
                    aria-label="주소 복사"
                  >
                    <Copy className="size-3.5" />
                  </button>
                ) : null
              }
            />
          </section>
          {hasCoords ? (
            <a
              href={kakaoRouteUrl(facility.name, facility.lat!, facility.lng!)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <MapPinned className="size-3.5" />
              카카오맵에서 보기
            </a>
          ) : null}
          <section>
            <h4 className="mb-2 text-sm font-medium">현장 사진 (최대 5장)</h4>
            <PhotoUploader
              photos={facility.visited ? savedAsDraft : draftPhotos}
              onChange={facility.visited || busy ? undefined : setDraftPhotos}
              readOnly={facility.visited || busy}
            />
          </section>
          <section>
            <h4 className="mb-2 text-sm font-medium">점검내용</h4>
            <MemoSection
              notes={facility.notes}
              draft={draftNote}
              onDraftChange={setDraftNote}
              readOnly={facility.visited}
              disabled={busy}
            />
          </section>
          {facility.visited ? (
            <button
              type="button"
              onClick={() => void handleClearVisit()}
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-sm font-medium text-destructive active:scale-[0.99] disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              완료 기록 삭제
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
