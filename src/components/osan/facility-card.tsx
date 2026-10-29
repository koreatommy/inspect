"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, Hourglass, MapPinned, Phone, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { clearVisitRecord, toggleVisited } from "@/app/osan/actions"
import { getFacilityEquipment } from "@/lib/osan/facility-equipment"
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
  cpfFacilityUrl,
  kakaoRouteUrl,
  placeTypeColor,
} from "./osan-utils"

type BusyKind = "complete" | "undo" | "clear"

const BUSY_COPY: Record<BusyKind, { button: string; status: string }> = {
  complete: {
    button: "저장 중…",
    status: "사진·점검내용을 저장하고 있습니다",
  },
  undo: {
    button: "변경 중…",
    status: "미완료로 되돌리는 중입니다",
  },
  clear: {
    button: "삭제 중…",
    status: "완료 기록을 삭제하고 있습니다",
  },
}

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
  href,
}: {
  label: string
  value: string | null
  action?: ReactNode
  /** 있으면 값에 새 창 링크를 건다 */
  href?: string
}) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 break-words text-primary underline-offset-2 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="min-w-0 flex-1 break-words">{value}</span>
      )}
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
  const [busyKind, setBusyKind] = useState<BusyKind | null>(null)
  const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([])
  const [draftNote, setDraftNote] = useState("")
  const draftPhotosRef = useRef(draftPhotos)
  draftPhotosRef.current = draftPhotos
  const busy = busyKind != null
  const busyCopy = busyKind ? BUSY_COPY[busyKind] : null
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
      setBusyKind("undo")
      const res = await toggleVisited(facility.id, false)
      setBusyKind(null)
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
    const requiresEquipment = Boolean(
      getFacilityEquipment(facility.facility_code)?.types.length,
    )
    if (requiresEquipment && draftPhotos.some((photo) => !photo.equipmentType)) {
      toast.error("각 사진의 기구유형을 선택해 주세요.")
      return
    }

    setBusyKind("complete")
    const res = await persistInspection({
      facilityId: facility.id,
      photos: draftPhotos,
      note: draftNote,
    })
    setBusyKind(null)
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
    setBusyKind("clear")
    const res = await clearVisitRecord(facility.id)
    setBusyKind(null)
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
    equipmentType: photo.equipment_type ?? undefined,
    caption: photo.caption ?? undefined,
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
          aria-busy={busy}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium disabled:opacity-80",
            busyKind === "complete" || busyKind === "undo"
              ? "bg-amber-600 text-white"
              : facility.visited
                ? "bg-emerald-600 text-white"
                : "bg-foreground text-background",
          )}
        >
          {busyKind === "complete" || busyKind === "undo" ? (
            <>
              <Hourglass className="size-4 animate-hourglass" aria-hidden />
              {busyCopy?.button}
            </>
          ) : (
            <>
              <Check className="size-4" />
              {facility.visited ? "완료됨" : "점검완료"}
            </>
          )}
        </button>
      </div>

      {busyCopy ? (
        <div
          role="status"
          aria-live="polite"
          className="mx-4 mb-3 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
        >
          <Hourglass className="size-3.5 shrink-0 animate-hourglass" aria-hidden />
          <span>{busyCopy.status}</span>
        </div>
      ) : null}

      {open ? (
        <div className="space-y-4 border-t px-4 py-4">
          <section className="space-y-1.5">
            <InfoRow
              label="시설번호"
              value={facility.facility_code}
              href={
                facility.facility_code
                  ? cpfFacilityUrl(facility.facility_code)
                  : undefined
              }
            />
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
              facilityCode={facility.facility_code}
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
              aria-busy={busyKind === "clear"}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-sm font-medium text-destructive active:scale-[0.99] disabled:opacity-50"
            >
              {busyKind === "clear" ? (
                <>
                  <Hourglass className="size-4 animate-hourglass" aria-hidden />
                  삭제 중…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  완료 기록 삭제
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
