"use server"

import { Resend } from "resend"

import {
  buildInspectionEmailHtml,
  photoContentId,
} from "@/lib/osan/build-inspection-email-html"
import type { InspectionEmailDraft } from "@/lib/osan/inspection-email-draft"
import { getOsanClient, osanPublicUrl } from "@/lib/osan/db"

type SendResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string }

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function sendInspectionEmail(
  draft: InspectionEmailDraft,
): Promise<SendResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim()
    const from = process.env.RESEND_FROM_EMAIL?.trim()
    const replyTo = process.env.RESEND_REPLY_TO?.trim()
    if (!apiKey) {
      return { ok: false, error: "RESEND_API_KEY가 설정되지 않았습니다." }
    }
    if (!from) {
      return { ok: false, error: "RESEND_FROM_EMAIL이 설정되지 않았습니다." }
    }
    if (replyTo && !isValidEmail(replyTo)) {
      return { ok: false, error: "RESEND_REPLY_TO 이메일 형식이 올바르지 않습니다." }
    }

    const to = draft.to.trim()
    if (!to || !isValidEmail(to)) {
      return { ok: false, error: "수신 이메일을 확인해 주세요." }
    }
    if (!draft.subject.trim()) {
      return { ok: false, error: "메일 제목을 입력해 주세요." }
    }
    if (!draft.name.trim()) {
      return { ok: false, error: "시설명을 입력해 주세요." }
    }
    if (!draft.facilityId) {
      return { ok: false, error: "시설 정보가 올바르지 않습니다." }
    }

    const client = getOsanClient()
    if (!client) {
      return { ok: false, error: "서버 Supabase 키가 설정되지 않았습니다." }
    }

    const included = draft.photos.filter((photo) => photo.included)
    const includedIds = included.map((photo) => photo.photoId)

    let attachments: {
      path: string
      filename: string
      contentId: string
    }[] = []

    if (includedIds.length > 0) {
      const { data: rows, error } = await client
        .from("facility_photos")
        .select("id, slot, storage_path")
        .eq("facility_id", draft.facilityId)
        .in("id", includedIds)

      if (error) {
        return { ok: false, error: error.message }
      }

      const byId = new Map((rows ?? []).map((row) => [row.id as string, row]))
      for (const photo of included) {
        const row = byId.get(photo.photoId)
        if (!row?.storage_path) {
          return {
            ok: false,
            error: "선택한 점검사진을 확인할 수 없습니다. 새로고침 후 다시 시도해 주세요.",
          }
        }
        attachments.push({
          path: osanPublicUrl(row.storage_path as string),
          filename: `photo-${row.slot}.jpg`,
          contentId: photoContentId(photo.slot),
        })
      }
    }

    const html = buildInspectionEmailHtml(draft)
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      ...(replyTo ? { replyTo } : {}),
      subject: draft.subject.trim(),
      html,
      attachments,
    })

    if (error || !data?.id) {
      const message = error?.message ?? "이메일 발송에 실패했습니다."
      if (/domain|verified|from/i.test(message)) {
        return {
          ok: false,
          error: `${message} (발신 도메인 인증·RESEND_FROM_EMAIL을 확인해 주세요.)`,
        }
      }
      if (/size|large|40/i.test(message)) {
        return {
          ok: false,
          error: `${message} (첨부 포함 40MB 제한입니다. 사진 수를 줄여 보세요.)`,
        }
      }
      return { ok: false, error: message }
    }

    return { ok: true, data: { id: data.id } }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "이메일 발송 중 오류가 발생했습니다.",
    }
  }
}
