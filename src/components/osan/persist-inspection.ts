import {
  addNote,
  createPhotoUploadUrl,
  deleteNote,
  deletePhoto,
  savePhoto,
  toggleVisited,
} from "@/app/osan/actions"
import type { OsanNote, OsanPhotoWithUrl } from "@/lib/osan/types"
import type { DraftPhoto } from "./draft-photo"

type PersistInput = {
  facilityId: string
  photos: DraftPhoto[]
  note: string
}

type PersistResult =
  | { ok: true; photos: OsanPhotoWithUrl[]; note: OsanNote | null }
  | { ok: false; error: string }

async function uploadDraftPhoto(
  facilityId: string,
  photo: DraftPhoto,
): Promise<OsanPhotoWithUrl> {
  if (!photo.blob) {
    throw new Error("업로드할 사진이 없습니다.")
  }

  const urlRes = await createPhotoUploadUrl(facilityId, photo.slot)
  if (!urlRes.ok) throw new Error(urlRes.error)

  const form = new FormData()
  form.append("cacheControl", "3600")
  form.append("", photo.blob, `slot-${photo.slot}.jpg`)
  const uploadRes = await fetch(urlRes.data.signedUrl, {
    method: "PUT",
    body: form,
  })
  if (!uploadRes.ok) {
    throw new Error(`사진 업로드 실패 (${uploadRes.status})`)
  }

  const saveRes = await savePhoto(facilityId, photo.slot, urlRes.data.path)
  if (!saveRes.ok) throw new Error(saveRes.error)
  return saveRes.data
}

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
