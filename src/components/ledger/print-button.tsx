"use client"

import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"

type PrintButtonProps = {
  documentTitleForPdf: string
}

const A4_PRINT_HEIGHT_MM = 277
const MM_TO_PX = 96 / 25.4

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PDF_MARGIN_MM = 10

function applyPrintRowHeights() {
  const root = document.querySelector(".ledger-print-root") as HTMLElement
  const headerArea = root?.querySelector(
    ".ledger-header-area"
  ) as HTMLElement
  const table = root?.querySelector(
    ".ledger-annual-table"
  ) as HTMLTableElement
  if (!root || !headerArea || !table) return []

  const pageHeightPx = A4_PRINT_HEIGHT_MM * MM_TO_PX
  const headerH = headerArea.offsetHeight
  const theadH = table.tHead?.offsetHeight ?? 0

  let activeH = 0
  table
    .querySelectorAll<HTMLTableRowElement>("tr.ledger-row-active")
    .forEach((r) => {
      activeH += r.offsetHeight
    })

  const emptyRows = table.querySelectorAll<HTMLTableRowElement>(
    "tr.ledger-row-empty"
  )
  const remaining = pageHeightPx - headerH - theadH - activeH
  const perRow = Math.max(
    Math.floor(remaining / Math.max(emptyRows.length, 1)),
    20
  )
  emptyRows.forEach((r) => {
    r.style.height = `${perRow}px`
  })

  return Array.from(emptyRows)
}

export function PrintButton({ documentTitleForPdf }: PrintButtonProps) {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  const onPrint = useCallback(() => {
    const prevTitle = document.title
    const title =
      documentTitleForPdf.replace(/\.pdf$/i, "").trim() || prevTitle

    const styledRows = applyPrintRowHeights()

    const restore = () => {
      document.title = prevTitle
      styledRows.forEach((r) => {
        r.style.height = ""
      })
      window.removeEventListener("afterprint", restore)
    }

    window.addEventListener("afterprint", restore)
    document.title = title
    window.print()

    window.setTimeout(() => {
      if (document.title === title) {
        restore()
      }
    }, 2_000)
  }, [documentTitleForPdf])

  const onDownloadPdf = useCallback(async () => {
    const element = document.querySelector(
      ".ledger-print-root"
    ) as HTMLElement | null
    if (!element) return

    setIsPdfGenerating(true)

    const styledRows = applyPrintRowHeights()

    const filename = documentTitleForPdf.endsWith(".pdf")
      ? documentTitleForPdf
      : `${documentTitleForPdf}.pdf`

    try {
      const domtoimage = await import("dom-to-image-more")
      const { jsPDF } = await import("jspdf")

      const contentWidthMm = A4_WIDTH_MM - PDF_MARGIN_MM * 2
      const contentHeightMm = A4_HEIGHT_MM - PDF_MARGIN_MM * 2

      const scale = 2
      const dataUrl = await domtoimage.toPng(element, {
        bgcolor: "#ffffff",
        scale,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      })

      const img = new Image()
      img.src = dataUrl

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
      })

      const imgWidthPx = img.width
      const imgHeightPx = img.height

      const imgAspect = imgWidthPx / imgHeightPx
      const contentAspect = contentWidthMm / contentHeightMm

      let finalWidth: number
      let finalHeight: number

      if (imgAspect > contentAspect) {
        finalWidth = contentWidthMm
        finalHeight = contentWidthMm / imgAspect
      } else {
        finalHeight = contentHeightMm
        finalWidth = contentHeightMm * imgAspect
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const xOffset = PDF_MARGIN_MM + (contentWidthMm - finalWidth) / 2
      const yOffset = PDF_MARGIN_MM

      pdf.addImage(dataUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight)
      pdf.save(filename)
    } finally {
      styledRows.forEach((r) => {
        r.style.height = ""
      })
      setIsPdfGenerating(false)
    }
  }, [documentTitleForPdf])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onDownloadPdf}
        disabled={isPdfGenerating}
      >
        {isPdfGenerating ? "PDF 생성 중..." : "PDF 저장"}
      </Button>
      <Button type="button" variant="outline" onClick={onPrint}>
        인쇄
      </Button>
    </>
  )
}
