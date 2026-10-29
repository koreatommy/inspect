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
}

type PersistResult =
  | { ok: true; photos: OsanPhotoWithUrl[]; note: OsanNote | null }
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
}: PersistInput): Promise<PersistResult> {
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

    const visitRes = await toggleVisited(facilityId, true)
    if (!visitRes.ok) throw new Error(visitRes.error)

    return { ok: true, photos: savedPhotos, note: savedNote }
  } catch (e) {
    await rollbackDraft(savedPhotos, savedNote)
    return { ok: false, error: e instanceof Error ? e.message : "저장 실패" }
  }
}
