"use client"

import { useCallback } from "react"

import { Button } from "@/components/ui/button"

type PrintButtonProps = {
  documentTitleForPdf: string
}

const A4_PRINT_HEIGHT_MM = 277
const MM_TO_PX = 96 / 25.4

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

  return (
    <Button type="button" variant="outline" onClick={onPrint}>
      인쇄
    </Button>
  )
}
