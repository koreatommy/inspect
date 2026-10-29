import {
  addNote,
  deleteNote,
  deletePhoto,
  toggleVisited,
} from "@/app/osan/actions"
import type { OsanNote, OsanPhotoWithUrl } from "@/lib/osan/types"
import type { DraftPhoto } from "./draft-photo"
import { uploadDraftPhoto } from "./upload-draft-photo"

type PersistInput = {
  facilityId: string
  photos: DraftPhoto[]
  note: string
  inspectorName: string
  inspectedAt: string
}

type PersistResult =
  | {
      ok: true
      photos: OsanPhotoWithUrl[]
      note: OsanNote | null
      inspectorName: string
      inspectedAt: string
    }
  | { ok: false; error: string }

async function rollbackDraft(
  photos: OsanPhotoWithUrl[],
  note: OsanNote | null,
) {
  for (const photo of photos) {
    await deletePhoto(photo.id)
  }
  if (note) await deleteNote(note.id)
}

export async function persistInspection({
  facilityId,
  photos,
  note,
  inspectorName,
  inspectedAt,
}: PersistInput): Promise<PersistResult> {
  const trimmedInspector = inspectorName.trim()
  if (!trimmedInspector) {
    return { ok: false, error: "점검자를 선택해 주세요." }
  }
  const trimmedAt = inspectedAt.trim()
  if (!trimmedAt || Number.isNaN(new Date(trimmedAt).getTime())) {
    return { ok: false, error: "점검일을 선택해 주세요." }
  }

  const savedPhotos: OsanPhotoWithUrl[] = []
  let savedNote: OsanNote | null = null
  try {
    for (const photo of photos) {
      savedPhotos.push(await uploadDraftPhoto(facilityId, photo))
    }

    const trimmed = note.trim()
    if (trimmed) {
      const noteRes = await addNote(facilityId, trimmed)
      if (!noteRes.ok) throw new Error(noteRes.error)
      savedNote = noteRes.data
    }

    const visitRes = await toggleVisited(facilityId, true, {
      inspectorName: trimmedInspector,
      inspectedAt: trimmedAt,
    })
    if (!visitRes.ok) throw new Error(visitRes.error)

    return {
      ok: true,
      photos: savedPhotos,
      note: savedNote,
      inspectorName: trimmedInspector,
      inspectedAt: trimmedAt,
    }
  } catch (e) {
    await rollbackDraft(savedPhotos, savedNote)
    return { ok: false, error: e instanceof Error ? e.message : "저장 실패" }
  }
}
