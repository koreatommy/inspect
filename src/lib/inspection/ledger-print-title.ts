/** Chrome 등 인쇄→PDF 기본 파일명에 쓰일 document.title 값 */
export function ledgerPrintDocumentTitle(
  facilityNo: string,
  inspectionMonth: string
): string {
  let monthNum = 1
  const ym = /^(\d{4})-(\d{2})$/.exec(inspectionMonth.trim())
  if (ym) {
    const n = Number(ym[2])
    if (!Number.isNaN(n) && n >= 1 && n <= 12) {
      monthNum = n
    }
  }
  const safe = facilityNo
    .trim()
    .replace(/[/\\?%*:|"<>.\s]+/g, "_")
    .replace(/_+/g, "_")
  return `${safe}_${monthNum}월_안전점검대장`
}
