"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { Copy, Hourglass, MapPinned, Pencil, Trash2 } from "lucide-react"

import type {
  OsanFacilityWithRelations,
  OsanPhotoWithUrl,
} from "@/lib/osan/types"
import type { DraftPhoto } from "./draft-photo"
import { MemoSection } from "./memo-section"
import {
  PhotoMetaEditor,
  type PhotoMetaDraft,
} from "./photo-meta-editor"
import { PhotoUploader } from "./photo-uploader"
import { cpfFacilityUrl, kakaoRouteUrl } from "./osan-utils"

type Props = {
  facility: OsanFacilityWithRelations
  hasCoords: boolean
  busy: boolean
  busyKind: "clear" | "saveMeta" | null
  draftPhotos: DraftPhoto[]
  setDraftPhotos: Dispatch<SetStateAction<DraftPhoto[]>>
  draftNote: string
  setDraftNote: (value: string) => void
  savedAsDraft: DraftPhoto[]
  editingMeta: boolean
  metaDrafts: Record<string, PhotoMetaDraft>
  editablePhotos: OsanPhotoWithUrl[]
  editAddedPhotos: DraftPhoto[]
  setEditAddedPhotos: Dispatch<SetStateAction<DraftPhoto[]>>
  canEditPhotoMeta: boolean
  onCopyAddress: () => void
  onStartMetaEdit: () => void
  onCancelMetaEdit: () => void
  onPatchMetaDraft: (photoId: string, next: PhotoMetaDraft) => void
  onDeleteSavedPhoto: (photoId: string) => void
  onSaveMetaEdit: () => void
  onClearVisit: () => void
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

export function FacilityCardPanel({
  facility,
  hasCoords,
  busy,
  busyKind,
  draftPhotos,
  setDraftPhotos,
  draftNote,
  setDraftNote,
  savedAsDraft,
  editingMeta,
  metaDrafts,
  editablePhotos,
  editAddedPhotos,
  setEditAddedPhotos,
  canEditPhotoMeta,
  onCopyAddress,
  onStartMetaEdit,
  onCancelMetaEdit,
  onPatchMetaDraft,
  onDeleteSavedPhoto,
  onSaveMetaEdit,
  onClearVisit,
}: Props) {
  return (
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
                onClick={onCopyAddress}
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
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium">현장 사진 (최대 5장)</h4>
          {canEditPhotoMeta && !editingMeta ? (
            <button
              type="button"
              onClick={onStartMetaEdit}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary disabled:opacity-50"
            >
              <Pencil className="size-3.5" />
              수정
            </button>
          ) : null}
        </div>
        {editingMeta ? (
          <PhotoMetaEditor
            photos={editablePhotos}
            addedPhotos={editAddedPhotos}
            onAddedPhotosChange={setEditAddedPhotos}
            facilityCode={facility.facility_code}
            drafts={metaDrafts}
            onChange={onPatchMetaDraft}
            onDeleteSavedPhoto={onDeleteSavedPhoto}
            disabled={busy}
          />
        ) : (
          <PhotoUploader
            photos={facility.visited ? savedAsDraft : draftPhotos}
            onChange={facility.visited || busy ? undefined : setDraftPhotos}
            readOnly={facility.visited || busy}
            facilityCode={facility.facility_code}
          />
        )}
      </section>
      <section>
        <h4 className="mb-2 text-sm font-medium">기타 점검 의견</h4>
        <MemoSection
          notes={facility.notes}
          draft={draftNote}
          onDraftChange={setDraftNote}
          readOnly={facility.visited}
          disabled={busy}
        />
      </section>
      {editingMeta ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancelMetaEdit}
            disabled={busy}
            className="flex h-11 items-center justify-center rounded-xl border bg-muted/40 text-sm font-medium disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSaveMetaEdit}
            disabled={busy}
            aria-busy={busyKind === "saveMeta"}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50"
          >
            {busyKind === "saveMeta" ? (
              <>
                <Hourglass className="size-4 animate-hourglass" aria-hidden />
                저장 중…
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      ) : null}
      {facility.visited && !editingMeta ? (
        <button
          type="button"
          onClick={onClearVisit}
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
  )
}
