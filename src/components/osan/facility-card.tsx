"use client"

import { useState } from "react"
import { Check, Copy, MapPinned, Navigation, Phone, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { clearVisitRecord, toggleVisited } from "@/app/osan/actions"
import type { OsanFacilityWithRelations, OsanNote, OsanPhotoWithUrl } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import { MemoSection } from "./memo-section"
import { PhotoUploader } from "./photo-uploader"
import { kakaoRouteUrl, placeTypeColor } from "./osan-utils"

type Props = {
  facility: OsanFacilityWithRelations
  order?: number
  defaultOpen?: boolean
  onChange: (next: OsanFacilityWithRelations) => void
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 break-words">{value}</span>
    </div>
  )
}

export function FacilityCard({ facility, order, defaultOpen, onChange }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const [busy, setBusy] = useState(false)
  const hasCoords = facility.lat != null && facility.lng != null

  async function handleVisited() {
    if (busy) return
    setBusy(true)
    const next = !facility.visited
    const res = await toggleVisited(facility.id, next)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onChange({ ...facility, visited: next })
    toast.success(next ? "방문 완료" : "미방문으로 변경")
  }

  async function handleClearVisit() {
    if (busy) return
    const ok = window.confirm(
      "이 시설의 방문완료·사진·메모를 모두 삭제할까요?\n시설 정보는 남고 미방문 상태로 돌아갑니다.",
    )
    if (!ok) return
    setBusy(true)
    const res = await clearVisitRecord(facility.id)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onChange({ ...facility, visited: false, photos: [], notes: [] })
    toast.success("완료 기록을 삭제했습니다")
  }

  async function copyAddress() {
    if (!facility.address) return
    try {
      await navigator.clipboard.writeText(facility.address)
      toast.success("주소 복사됨")
    } catch {
      toast.error("복사에 실패했습니다")
    }
  }

  function patchPhotos(photos: OsanPhotoWithUrl[]) {
    onChange({ ...facility, photos })
  }

  function patchNotes(notes: OsanNote[]) {
    onChange({ ...facility, notes })
  }

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
          <a
            href={kakaoRouteUrl(facility.name, facility.lat!, facility.lng!)}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
          >
            <Navigation className="size-4" />
            길찾기
          </a>
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
          onClick={() => void handleVisited()}
          disabled={busy}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium",
            facility.visited
              ? "bg-emerald-600 text-white"
              : "bg-foreground text-background",
          )}
        >
          <Check className="size-4" />
          {facility.visited ? "완료됨" : "방문완료"}
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
            <InfoRow label="주소" value={facility.address} />
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
              facilityId={facility.id}
              photos={facility.photos}
              onChange={patchPhotos}
            />
          </section>
          <section>
            <h4 className="mb-2 text-sm font-medium">메모</h4>
            <MemoSection
              facilityId={facility.id}
              notes={facility.notes}
              onChange={patchNotes}
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
