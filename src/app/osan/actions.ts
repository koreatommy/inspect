"use server"

import { getOsanClient, OSAN_BUCKET, osanPublicUrl } from "@/lib/osan/db"
import { isWithinOsanBounds } from "@/lib/osan/geocode"
import type { OsanNote, OsanPhotoWithUrl } from "@/lib/osan/types"

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

function requireClient() {
  const client = getOsanClient()
  if (!client) {
    throw new Error("서버 Supabase 키가 설정되지 않았습니다.")
  }
  return client
}

/** 사진 직접 업로드용 서명 URL 발급 (클라이언트가 Storage로 직접 업로드) */
export async function createPhotoUploadUrl(
  facilityId: string,
  slot: number,
): Promise<ActionResult<{ path: string; signedUrl: string }>> {
  try {
    const client = requireClient()
    const path = `${facilityId}/${slot}-${Date.now()}.jpg`
    const { data, error } = await client.storage
      .from(OSAN_BUCKET)
      .createSignedUploadUrl(path, { upsert: true })
    if (error || !data) {
      return { ok: false, error: error?.message ?? "업로드 URL 발급 실패" }
    }
    return { ok: true, data: { path: data.path, signedUrl: data.signedUrl } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

/** 업로드 완료된 사진을 슬롯에 저장(교체 시 이전 객체 삭제) */
export async function savePhoto(
  facilityId: string,
  slot: number,
  storagePath: string,
  meta?: { equipmentType?: string; caption?: string },
): Promise<ActionResult<OsanPhotoWithUrl>> {
  try {
    const client = requireClient()

    const { data: existing } = await client
      .from("facility_photos")
      .select("storage_path")
      .eq("facility_id", facilityId)
      .eq("slot", slot)
      .maybeSingle()

    if (existing?.storage_path && existing.storage_path !== storagePath) {
      await client.storage.from(OSAN_BUCKET).remove([existing.storage_path])
    }

    const caption = meta?.caption?.trim() || null
    const { data, error } = await client
      .from("facility_photos")
      .upsert(
        {
          facility_id: facilityId,
          slot,
          storage_path: storagePath,
          equipment_type: meta?.equipmentType || null,
          caption,
        },
        { onConflict: "facility_id,slot" },
      )
      .select("*")
      .single()

    if (error || !data) {
      return { ok: false, error: error?.message ?? "사진 저장 실패" }
    }
    return {
      ok: true,
      data: { ...(data as OsanPhotoWithUrl), url: osanPublicUrl(data.storage_path) },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

/** 기존 사진의 기구유형·점검내용만 갱신 (파일 재업로드 없음) */
export async function updatePhotoMeta(
  photoId: string,
  meta: { equipmentType?: string | null; caption?: string | null },
): Promise<ActionResult<OsanPhotoWithUrl>> {
  try {
    const client = requireClient()
    const caption =
      meta.caption == null ? null : meta.caption.trim() || null
    const equipmentType =
      meta.equipmentType == null ? null : meta.equipmentType.trim() || null

    const { data, error } = await client
      .from("facility_photos")
      .update({
        equipment_type: equipmentType,
        caption,
      })
      .eq("id", photoId)
      .select("*")
      .single()

    if (error || !data) {
      return { ok: false, error: error?.message ?? "사진 정보 저장 실패" }
    }
    return {
      ok: true,
      data: {
        ...(data as OsanPhotoWithUrl),
        url: osanPublicUrl(data.storage_path),
      },
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function deletePhoto(
  photoId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const client = requireClient()
    const { data: row } = await client
      .from("facility_photos")
      .select("storage_path")
      .eq("id", photoId)
      .maybeSingle()

    if (row?.storage_path) {
      await client.storage.from(OSAN_BUCKET).remove([row.storage_path])
    }
    const { error } = await client
      .from("facility_photos")
      .delete()
      .eq("id", photoId)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { id: photoId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function addNote(
  facilityId: string,
  content: string,
): Promise<ActionResult<OsanNote>> {
  try {
    const trimmed = content.trim()
    if (!trimmed) return { ok: false, error: "메모 내용을 입력해 주세요." }
    const client = requireClient()
    const { data, error } = await client
      .from("facility_notes")
      .insert({ facility_id: facilityId, content: trimmed })
      .select("*")
      .single()
    if (error || !data) {
      return { ok: false, error: error?.message ?? "메모 저장 실패" }
    }
    return { ok: true, data: data as OsanNote }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function updateNote(
  noteId: string,
  content: string,
): Promise<ActionResult<OsanNote>> {
  try {
    const trimmed = content.trim()
    if (!trimmed) return { ok: false, error: "메모 내용을 입력해 주세요." }
    const client = requireClient()
    const { data, error } = await client
      .from("facility_notes")
      .update({ content: trimmed })
      .eq("id", noteId)
      .select("*")
      .single()
    if (error || !data) {
      return { ok: false, error: error?.message ?? "메모 수정 실패" }
    }
    return { ok: true, data: data as OsanNote }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function deleteNote(
  noteId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const client = requireClient()
    const { error } = await client
      .from("facility_notes")
      .delete()
      .eq("id", noteId)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { id: noteId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function saveFacilityCoords(
  facilityId: string,
  lat: number,
  lng: number,
): Promise<ActionResult<{ id: string; lat: number; lng: number }>> {
  try {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { ok: false, error: "좌표가 올바르지 않습니다." }
    }
    if (!isWithinOsanBounds(lat, lng)) {
      return { ok: false, error: "오산시 관외 좌표는 저장하지 않습니다." }
    }
    const client = requireClient()
    const { error } = await client
      .from("facilities")
      .update({ lat, lng })
      .eq("id", facilityId)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { id: facilityId, lat, lng } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

export async function toggleVisited(
  facilityId: string,
  visited: boolean,
): Promise<ActionResult<{ id: string; visited: boolean }>> {
  try {
    const client = requireClient()
    const { error } = await client
      .from("facilities")
      .update({ visited })
      .eq("id", facilityId)
    if (error) return { ok: false, error: error.message }
    return { ok: true, data: { id: facilityId, visited } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}

/** 점검완료·사진·점검내용을 모두 지우고 미완료 상태로 되돌린다. 시설 마스터는 유지. */
export async function clearVisitRecord(
  facilityId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const client = requireClient()

    const { data: photos, error: photoSelectError } = await client
      .from("facility_photos")
      .select("storage_path")
      .eq("facility_id", facilityId)
    if (photoSelectError) {
      return { ok: false, error: photoSelectError.message }
    }

    const paths = (photos ?? [])
      .map((row) => row.storage_path as string | null)
      .filter((path): path is string => Boolean(path))
    if (paths.length > 0) {
      const { error: storageError } = await client.storage
        .from(OSAN_BUCKET)
        .remove(paths)
      if (storageError) {
        return { ok: false, error: storageError.message }
      }
    }

    const { error: photoDeleteError } = await client
      .from("facility_photos")
      .delete()
      .eq("facility_id", facilityId)
    if (photoDeleteError) return { ok: false, error: photoDeleteError.message }

    const { error: noteDeleteError } = await client
      .from("facility_notes")
      .delete()
      .eq("facility_id", facilityId)
    if (noteDeleteError) return { ok: false, error: noteDeleteError.message }

    const { error: visitError } = await client
      .from("facilities")
      .update({ visited: false })
      .eq("id", facilityId)
    if (visitError) return { ok: false, error: visitError.message }

    return { ok: true, data: { id: facilityId } }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류" }
  }
}
