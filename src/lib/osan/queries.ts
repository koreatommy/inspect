import { getOsanClient, osanPublicUrl } from "./db"
import type {
  OsanFacility,
  OsanFacilityWithRelations,
  OsanNote,
  OsanPhoto,
} from "./types"

/** 시설 + 사진 + 메모를 한 번에 로드 (서버 전용) */
export async function getFacilitiesWithRelations(): Promise<
  OsanFacilityWithRelations[]
> {
  const client = getOsanClient()
  if (!client) return []

  const [facilitiesRes, photosRes, notesRes] = await Promise.all([
    client.from("facilities").select("*").order("no", { ascending: true }),
    client.from("facility_photos").select("*"),
    client
      .from("facility_notes")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  const facilities = (facilitiesRes.data ?? []) as OsanFacility[]
  const photos = (photosRes.data ?? []) as OsanPhoto[]
  const notes = (notesRes.data ?? []) as OsanNote[]

  return facilities.map((facility) => ({
    ...facility,
    photos: photos
      .filter((p) => p.facility_id === facility.id)
      .sort((a, b) => a.slot - b.slot)
      .map((p) => ({ ...p, url: osanPublicUrl(p.storage_path) })),
    notes: notes.filter((n) => n.facility_id === facility.id),
  }))
}
