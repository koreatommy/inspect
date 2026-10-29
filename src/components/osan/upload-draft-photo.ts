import { createPhotoUploadUrl, savePhoto } from "@/app/osan/actions"
import type { OsanPhotoWithUrl } from "@/lib/osan/types"
import type { DraftPhoto } from "./draft-photo"

export async function uploadDraftPhoto(
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

  const saveRes = await savePhoto(facilityId, photo.slot, urlRes.data.path, {
    equipmentType: photo.equipmentType,
    caption: photo.caption,
  })
  if (!saveRes.ok) throw new Error(saveRes.error)
  return saveRes.data
}
