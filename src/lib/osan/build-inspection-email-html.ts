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

/** 이메일·전화번호를 링크로 강조 (메일 클라이언트용 인라인 스타일) */
function linkifyNotice(value: string): string {
  const escaped = escapeHtml(value)
  return escaped
    .replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" style="color:#0f766e;font-weight:700;text-decoration:underline;">$1</a>',
    )
    .replace(
      /(0\d{1,2}-\d{3,4}-\d{4})/g,
      '<a href="tel:$1" style="color:#0f766e;font-weight:700;text-decoration:none;">$1</a>',
    )
    .replaceAll("\n", "<br />")
}

function renderClosing(closing: string): string {
  const trimmed = closing.trim()
  if (!trimmed) return ""

  const [primary, ...rest] = trimmed.split("\n").map((line) => line.trim())
  const secondary = rest.filter(Boolean).join("\n")

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;margin:8px 0 0;background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;overflow:hidden;">
  <tr>
    <td style="width:4px;background:#0d9488;font-size:0;line-height:0;">&nbsp;</td>
    <td style="padding:16px 18px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#0f766e;text-transform:uppercase;">조치 안내</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#134e4a;">${linkifyNotice(primary ?? "")}</p>
      ${
        secondary
          ? `<p style="margin:14px 0 0;padding-top:12px;border-top:1px solid #ccfbf1;font-size:13px;line-height:1.65;color:#115e59;">${linkifyNotice(secondary)}</p>`
          : ""
      }
    </td>
  </tr>
</table>`
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
      const equipment = photo.equipmentType.trim()
      const caption = photo.caption.trim()
      const title = [equipment, caption].filter(Boolean).join(" · ")
      const alt = title || `점검사진 ${photo.slot}`
      const badgeInner = [equipment, caption]
        .filter(Boolean)
        .map((part, index) =>
          index === 0
            ? `<span style="font-weight:700;">${escapeHtml(part)}</span>`
            : `<span style="opacity:0.92;">${escapeHtml(part)}</span>`,
        )
        .join(
          `<span style="margin:0 6px;opacity:0.55;">·</span>`,
        )

      const captionBadge = title
        ? `<div style="position:absolute;right:10px;bottom:10px;max-width:calc(100% - 20px);text-align:right;line-height:1.45;">
  <span style="display:inline-block;max-width:100%;padding:8px 12px;border-radius:999px;background:rgba(15,23,42,0.82);color:#ffffff;font-size:12px;letter-spacing:-0.01em;box-shadow:0 6px 18px rgba(15,23,42,0.35);backdrop-filter:blur(6px);">${badgeInner}</span>
</div>`
        : ""

      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 18px;">
  <tr>
    <td style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;background:#0f172a;">
      <div style="position:relative;display:block;line-height:0;">
        <img src="cid:${photoContentId(photo.slot)}" alt="${escapeHtml(alt)}" width="560" style="display:block;width:100%;max-width:100%;height:auto;border:0;" />
        ${captionBadge}
      </div>
    </td>
  </tr>
</table>`
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
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;">
  <div style="max-width:600px;margin:0 auto;padding:28px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:22px 22px 18px;background:linear-gradient(135deg,#0f766e 0%,#0d9488 55%,#14b8a6 100%);">
          <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;color:rgba(255,255,255,0.82);">오산시 어린이놀이시설</p>
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">지도점검 결과 안내</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:22px;">
          <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#4b5563;">아래와 같이 현장 점검 내용을 안내드립니다.</p>

          <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#111827;">관리주체 기본정보</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 28px;background:#fff;border-radius:8px;overflow:hidden;">${basicRows}</table>

          <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827;">점검사진</h2>
          ${
            photoBlocks ||
            `<p style="margin:0 0 24px;font-size:14px;color:#6b7280;">첨부된 점검사진이 없습니다.</p>`
          }

          <h2 style="margin:28px 0 10px;font-size:15px;font-weight:700;color:#111827;">점검내용</h2>
          <table style="width:100%;border-collapse:collapse;margin:0 0 20px;background:#fff;">${inspectionRows}</table>

          ${renderClosing(draft.closing)}
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}
