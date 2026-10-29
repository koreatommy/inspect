"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Hourglass, Phone } from "lucide-react"
import { toast } from "./toast"

import {
  addNote,
  clearVisitRecord,
  deleteNote,
  deletePhoto,
  toggleVisited,
  updateNote,
  updatePhotoMeta,
  updateVisitDetails,
  type FacilityContactField,
} from "@/app/osan/actions"
import { getFacilityEquipment } from "@/lib/osan/facility-equipment"
import {
  defaultInspectionDate,
  isoToKoreaDate,
  koreaDateToIsoWithNowTime,
} from "@/lib/osan/inspection-at"
import {
  getLastOsanInspector,
  setLastOsanInspector,
} from "@/lib/osan/inspectors"
import type {
  OsanFacilityWithRelations,
  OsanNote,
  OsanPhotoWithUrl,
} from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import type { DraftPhoto } from "./draft-photo"
import { FacilityCardPanel } from "./facility-card-panel"
import {
  photoMetaDraftsFromPhotos,
  type PhotoMetaDraft,
} from "./photo-meta-editor"
import { persistInspection } from "./persist-inspection"
import { revokeDraftPhoto } from "./photo-uploader"
import { RouteNavLinks } from "./route-nav-links"
import { uploadDraftPhoto } from "./upload-draft-photo"
import { addressWithoutPostal, placeTypeColor } from "./osan-utils"

type BusyKind = "complete" | "undo" | "clear" | "saveMeta"

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
  saveMeta: {
    button: "저장 중…",
    status: "사진·기타 점검 의견을 저장하고 있습니다",
  },
}

function noteDraftsFromNotes(notes: OsanNote[]): Record<string, string> {
  return Object.fromEntries(notes.map((note) => [note.id, note.content]))
}

type Props = {
  facility: OsanFacilityWithRelations
  order?: number
  /** 맵/목록에서 선택된 시설 — true가 되면 카드를 펼치고 강조한다 */
  selected?: boolean
  onChange: (next: OsanFacilityWithRelations) => void
  /** 현재 위치 기준 직선 거리 라벨 (예: 240m) */
  distanceLabel?: string | null
}

function mergePhotosBySlot(
  existing: OsanPhotoWithUrl[],
  saved: OsanPhotoWithUrl[],
) {
  const bySlot = new Map(existing.map((photo) => [photo.slot, photo]))
  for (const photo of saved) bySlot.set(photo.slot, photo)
  return [...bySlot.values()].sort((a, b) => a.slot - b.slot)
}

export function FacilityCard({
  facility,
  order,
  selected = false,
  onChange,
  distanceLabel,
}: Props) {
  const [open, setOpen] = useState(selected)
  const [busyKind, setBusyKind] = useState<BusyKind | null>(null)
  const [draftPhotos, setDraftPhotos] = useState<DraftPhoto[]>([])
  const [draftNote, setDraftNote] = useState("")
  const [inspectorDraft, setInspectorDraft] = useState<string | null>(
    () => facility.inspector_name ?? getLastOsanInspector(),
  )
  const [inspectedDateDraft, setInspectedDateDraft] = useState<string | null>(
    () => isoToKoreaDate(facility.inspected_at) ?? defaultInspectionDate(),
  )
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaDrafts, setMetaDrafts] = useState<Record<string, PhotoMetaDraft>>(
    {},
  )
  const [editAddedPhotos, setEditAddedPhotos] = useState<DraftPhoto[]>([])
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [editNoteDraft, setEditNoteDraft] = useState("")
  const draftPhotosRef = useRef(draftPhotos)
  const editAddedPhotosRef = useRef(editAddedPhotos)
  draftPhotosRef.current = draftPhotos
  editAddedPhotosRef.current = editAddedPhotos
  const busy = busyKind != null
  const busyCopy = busyKind ? BUSY_COPY[busyKind] : null
  const hasCoords = facility.lat != null && facility.lng != null
  const canEditPhotoMeta = facility.visited
  const requiresEquipment = Boolean(
    getFacilityEquipment(facility.facility_code)?.types.length,
  )
  const editablePhotos = facility.photos.filter(
    (photo) => !pendingDeleteIds.includes(photo.id),
  )

  useEffect(() => {
    if (selected) setOpen(true)
  }, [selected])

  useEffect(() => {
    setInspectorDraft(facility.inspector_name ?? getLastOsanInspector())
    setInspectedDateDraft(
      isoToKoreaDate(facility.inspected_at) ?? defaultInspectionDate(),
    )
  }, [facility.id, facility.inspector_name, facility.inspected_at])

  useEffect(() => {
    return () => {
      draftPhotosRef.current.forEach(revokeDraftPhoto)
      editAddedPhotosRef.current.forEach(revokeDraftPhoto)
    }
  }, [])

  function clearDrafts() {
    draftPhotosRef.current.forEach(revokeDraftPhoto)
    setDraftPhotos([])
    setDraftNote("")
  }

  function handleInspectorChange(value: string) {
    setInspectorDraft(value)
    setLastOsanInspector(value)
  }

  function handleInspectedDateChange(value: string) {
    setInspectedDateDraft(value)
  }

  function clearEditAddedPhotos() {
    editAddedPhotosRef.current.forEach(revokeDraftPhoto)
    setEditAddedPhotos([])
  }

  function startMetaEdit() {
    if (busy) return
    setMetaDrafts(photoMetaDraftsFromPhotos(facility.photos))
    setNoteDrafts(noteDraftsFromNotes(facility.notes))
    setEditNoteDraft("")
    clearEditAddedPhotos()
    setPendingDeleteIds([])
    setEditingMeta(true)
    setOpen(true)
  }

  function cancelMetaEdit() {
    if (busy) return
    setEditingMeta(false)
    setMetaDrafts({})
    setNoteDrafts({})
    setEditNoteDraft("")
    clearEditAddedPhotos()
    setPendingDeleteIds([])
  }

  function patchMetaDraft(photoId: string, next: PhotoMetaDraft) {
    setMetaDrafts((prev) => ({ ...prev, [photoId]: next }))
  }

  function patchNoteDraft(noteId: string, value: string) {
    setNoteDrafts((prev) => ({ ...prev, [noteId]: value }))
  }

  function handleContactSaved(
    field: FacilityContactField,
    value: string | null,
  ) {
    onChange({ ...facility, [field]: value })
  }

  function markSavedPhotoDeleted(photoId: string) {
    if (busy) return
    setPendingDeleteIds((prev) =>
      prev.includes(photoId) ? prev : [...prev, photoId],
    )
    setMetaDrafts((prev) => {
      const next = { ...prev }
      delete next[photoId]
      return next
    })
  }

  async function saveMetaEdit() {
    if (busy || !editingMeta) return
    const remainingPhotos = facility.photos.filter(
      (photo) => !pendingDeleteIds.includes(photo.id),
    )
    const trimmedInspector = inspectorDraft?.trim() ?? ""
    if (!trimmedInspector) {
      toast.error("점검자를 선택해 주세요.")
      return
    }
    const dateChanged =
      (inspectedDateDraft ?? "") !==
      (isoToKoreaDate(facility.inspected_at) ?? "")
    const inspectedAtIso = dateChanged
      ? inspectedDateDraft
        ? koreaDateToIsoWithNowTime(inspectedDateDraft)
        : null
      : (facility.inspected_at ??
        (inspectedDateDraft
          ? koreaDateToIsoWithNowTime(inspectedDateDraft)
          : null))
    if (!inspectedAtIso) {
      toast.error("점검일을 선택해 주세요.")
      return
    }
    if (
      requiresEquipment &&
      remainingPhotos.some((photo) => !metaDrafts[photo.id]?.equipmentType)
    ) {
      toast.error("각 사진의 기구유형을 선택해 주세요.")
      return
    }
    if (
      requiresEquipment &&
      editAddedPhotos.some((photo) => !photo.equipmentType)
    ) {
      toast.error("추가 사진의 기구유형을 선택해 주세요.")
      return
    }

    setBusyKind("saveMeta")
    const updated: OsanPhotoWithUrl[] = []
    const newlyUploaded: OsanPhotoWithUrl[] = []
    const deletedIds: string[] = []
    let nextInspector = facility.inspector_name
    let nextInspectedAt = facility.inspected_at
    try {
      const inspectorChanged =
        trimmedInspector !== (facility.inspector_name ?? "")
      if (inspectorChanged || dateChanged) {
        const detailsRes = await updateVisitDetails(facility.id, {
          inspectorName: trimmedInspector,
          inspectedAt: inspectedAtIso,
        })
        if (!detailsRes.ok) throw new Error(detailsRes.error)
        nextInspector = detailsRes.data.inspector_name
        nextInspectedAt = detailsRes.data.inspected_at
        setLastOsanInspector(nextInspector)
      }
      for (const photoId of pendingDeleteIds) {
        const res = await deletePhoto(photoId)
        if (!res.ok) throw new Error(res.error)
        deletedIds.push(photoId)
      }

      for (const photo of remainingPhotos) {
        const draft = metaDrafts[photo.id]
        if (!draft) {
          updated.push(photo)
          continue
        }
        const sameType =
          (photo.equipment_type ?? null) === (draft.equipmentType ?? null)
        const sameCaption =
          (photo.caption ?? "") === (draft.caption.trim() || "")
        if (sameType && sameCaption) {
          updated.push(photo)
          continue
        }
        const res = await updatePhotoMeta(photo.id, {
          equipmentType: draft.equipmentType,
          caption: draft.caption,
        })
        if (!res.ok) throw new Error(res.error)
        updated.push(res.data)
      }

      for (const photo of editAddedPhotos) {
        const uploaded = await uploadDraftPhoto(facility.id, photo)
        newlyUploaded.push(uploaded)
        updated.push(uploaded)
      }

      let nextNotes = [...facility.notes]
      let notesChanged = false

      for (const note of facility.notes) {
        const draftContent = noteDrafts[note.id]
        if (draftContent == null) continue
        const trimmed = draftContent.trim()
        if (!trimmed) {
          const res = await deleteNote(note.id)
          if (!res.ok) throw new Error(res.error)
          nextNotes = nextNotes.filter((n) => n.id !== note.id)
          notesChanged = true
          continue
        }
        if (trimmed === note.content) continue
        const res = await updateNote(note.id, trimmed)
        if (!res.ok) throw new Error(res.error)
        nextNotes = nextNotes.map((n) => (n.id === note.id ? res.data : n))
        notesChanged = true
      }

      const newNoteTrimmed = editNoteDraft.trim()
      if (facility.notes.length === 0 && newNoteTrimmed) {
        const res = await addNote(facility.id, newNoteTrimmed)
        if (!res.ok) throw new Error(res.error)
        nextNotes = [res.data, ...nextNotes]
        notesChanged = true
      }

      onChange({
        ...facility,
        photos: updated.sort((a, b) => a.slot - b.slot),
        notes: nextNotes,
        inspector_name: nextInspector,
        inspected_at: nextInspectedAt,
      })
      setEditingMeta(false)
      setMetaDrafts({})
      setNoteDrafts({})
      setEditNoteDraft("")
      clearEditAddedPhotos()
      setPendingDeleteIds([])

      const parts: string[] = []
      if (deletedIds.length > 0) parts.push(`${deletedIds.length}장 삭제`)
      if (newlyUploaded.length > 0) parts.push(`${newlyUploaded.length}장 추가`)
      if (notesChanged) parts.push("기타 의견")
      if (nextInspector !== facility.inspector_name) parts.push("점검자")
      if (dateChanged) parts.push("점검일")
      toast.success(
        parts.length > 0
          ? `저장 완료 · ${parts.join(" · ")}`
          : "저장했습니다",
      )
    } catch (e) {
      await Promise.all(newlyUploaded.map((photo) => deletePhoto(photo.id)))
      toast.error(e instanceof Error ? e.message : "저장 실패")
    } finally {
      setBusyKind(null)
    }
  }

  async function handleVisitedClick() {
    if (busy) return

    if (facility.visited) {
      const ok = window.confirm(
        "미완료로 되돌릴까요?\n사진·점검내용은 그대로 두고 완료 표시만 해제됩니다.",
      )
      if (!ok) return
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

    const trimmedInspector = inspectorDraft?.trim() ?? ""
    if (!trimmedInspector) {
      toast.error("점검자를 선택해 주세요.")
      return
    }
    const inspectedAtIso = inspectedDateDraft
      ? koreaDateToIsoWithNowTime(inspectedDateDraft)
      : null
    if (!inspectedAtIso) {
      toast.error("점검일을 선택해 주세요.")
      return
    }
    if (draftPhotos.length === 0 && !draftNote.trim()) {
      toast.error("사진 또는 점검내용을 입력해 주세요.")
      return
    }
    if (requiresEquipment && draftPhotos.some((photo) => !photo.equipmentType)) {
      toast.error("각 사진의 기구유형을 선택해 주세요.")
      return
    }

    setBusyKind("complete")
    const res = await persistInspection({
      facilityId: facility.id,
      photos: draftPhotos,
      note: draftNote,
      inspectorName: trimmedInspector,
      inspectedAt: inspectedAtIso,
    })
    setBusyKind(null)
    if (!res.ok) {
      toast.error(res.error)
      return
    }

    const savedPhotos = mergePhotosBySlot(facility.photos, res.photos)
    const savedNotes = res.note ? [res.note, ...facility.notes] : facility.notes
    setLastOsanInspector(res.inspectorName)
    clearDrafts()
    onChange({
      ...facility,
      visited: true,
      photos: savedPhotos,
      notes: savedNotes,
      inspector_name: res.inspectorName,
      inspected_at: res.inspectedAt,
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
    setEditingMeta(false)
    setMetaDrafts({})
    setNoteDrafts({})
    setEditNoteDraft("")
    clearEditAddedPhotos()
    setPendingDeleteIds([])
    onChange({
      ...facility,
      visited: false,
      photos: [],
      notes: [],
      inspector_name: null,
      inspected_at: null,
    })
    setInspectorDraft(getLastOsanInspector())
    setInspectedDateDraft(defaultInspectionDate())
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
        selected && "border-primary ring-2 ring-primary/20",
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
            {[facility.region, distanceLabel, facility.address]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </button>

      <div className="px-4 pb-3">
        <div className="flex gap-2">
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
              className={facility.phone ? "flex-[2]" : "flex-1"}
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
        </div>
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
        <FacilityCardPanel
          facility={facility}
          hasCoords={hasCoords}
          busy={busy}
          busyKind={busyKind}
          draftPhotos={draftPhotos}
          setDraftPhotos={setDraftPhotos}
          draftNote={draftNote}
          setDraftNote={setDraftNote}
          inspectorName={inspectorDraft}
          onInspectorChange={handleInspectorChange}
          inspectedDate={inspectedDateDraft}
          onInspectedDateChange={handleInspectedDateChange}
          savedAsDraft={savedAsDraft}
          editingMeta={editingMeta}
          metaDrafts={metaDrafts}
          noteDrafts={noteDrafts}
          editNoteDraft={editNoteDraft}
          setEditNoteDraft={setEditNoteDraft}
          onPatchNoteDraft={patchNoteDraft}
          editablePhotos={editablePhotos}
          editAddedPhotos={editAddedPhotos}
          setEditAddedPhotos={setEditAddedPhotos}
          canEditPhotoMeta={canEditPhotoMeta}
          onCopyAddress={() => void copyAddress()}
          onStartMetaEdit={startMetaEdit}
          onCancelMetaEdit={cancelMetaEdit}
          onPatchMetaDraft={patchMetaDraft}
          onDeleteSavedPhoto={markSavedPhotoDeleted}
          onSaveMetaEdit={() => void saveMetaEdit()}
          onVisitedClick={() => void handleVisitedClick()}
          onClearVisit={() => void handleClearVisit()}
          onContactSaved={handleContactSaved}
        />
      ) : null}
    </article>
  )
}
