import type { InspectionEmailDraft } from "@/lib/osan/inspection-email-draft"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />")
}

function row(label: string, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return `<tr>
  <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;width:120px;vertical-align:top;font-size:13px;color:#4b5563;">${escapeHtml(label)}</td>
  <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:14px;color:#111827;">${nl2br(trimmed)}</td>
</tr>`
}

export function photoContentId(slot: number): string {
  return `photo-${slot}`
}

/** Sheet 초안 → 메일 HTML (인라인 이미지는 cid:photo-{slot}) */
export function buildInspectionEmailHtml(draft: InspectionEmailDraft): string {
  const basicRows = [
    row("시설명", draft.name),
    row("시설번호", draft.facilityCode),
    row("설치장소", draft.placeType),
    row("지역", draft.region),
    row("실내외", draft.indoorOutdoor),
    row("주소", draft.address),
    row("대표자", draft.representative),
    row("전화", draft.phone),
    row("이메일", draft.contactEmail),
    row("안전관리자", draft.safetyManager),
  ]
    .filter(Boolean)
    .join("\n")

  const includedPhotos = draft.photos.filter((photo) => photo.included)
  const photoBlocks = includedPhotos
    .map((photo) => {
      const title = [photo.equipmentType, photo.caption]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" · ")
      const alt = title || `점검사진 ${photo.slot}`
      return `<div style="margin:0 0 20px;">
  ${title ? `<p style="margin:0 0 8px;font-size:13px;color:#374151;">${escapeHtml(title)}</p>` : ""}
  <img src="cid:${photoContentId(photo.slot)}" alt="${escapeHtml(alt)}" width="560" style="display:block;max-width:100%;height:auto;border-radius:8px;border:1px solid #e5e7eb;" />
</div>`
    })
    .join("\n")

  const inspectionRows = [
    row("점검자", draft.inspectorName),
    row("점검일시", draft.inspectedAtLabel === "-" ? "" : draft.inspectedAtLabel),
    row("기타 점검 의견", draft.notesText),
  ]
    .filter(Boolean)
    .join("\n")

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8" /><title>${escapeHtml(draft.subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;">오산 지도점검 결과</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#4b5563;">아래와 같이 현장 점검 내용을 안내드립니다.</p>

    <h2 style="margin:0 0 8px;font-size:15px;font-weight:600;">관리주체 기본정보</h2>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;background:#fff;">${basicRows}</table>

    <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;">점검사진</h2>
    ${
      photoBlocks ||
      `<p style="margin:0 0 24px;font-size:14px;color:#6b7280;">첨부된 점검사진이 없습니다.</p>`
    }

    <h2 style="margin:24px 0 8px;font-size:15px;font-weight:600;">점검내용</h2>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;background:#fff;">${inspectionRows}</table>

    ${
      draft.closing.trim()
        ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">${nl2br(draft.closing.trim())}</p>`
        : ""
    }
  </div>
</body>
</html>`
}
