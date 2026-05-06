import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationRangeProps = {
  currentPage: number
  totalCount: number
  pageSize: number
}

export function getPaginationRange({
  currentPage,
  totalCount,
  pageSize,
}: PaginationRangeProps) {
  const from = Math.min((currentPage - 1) * pageSize + 1, totalCount)
  const to = Math.min(currentPage * pageSize, totalCount)
  return { from, to }
}

/** 리스트 상단 등에 표시할 "전체 n건 중 a–b" 문구 */
export function PaginationRangeSummary({
  currentPage,
  totalCount,
  pageSize,
}: PaginationRangeProps) {
  if (totalCount <= 0) return null
  const { from, to } = getPaginationRange({
    currentPage,
    totalCount,
    pageSize,
  })
  return (
    <p className="text-sm text-muted-foreground">
      {totalCount.toLocaleString()}건 중 {from}–{to}
    </p>
  )
}

type PaginationControlsProps = {
  currentPage: number
  totalCount: number
  pageSize: number
  basePath: string
  searchParams?: Record<string, string>
}

export function PaginationControls({
  currentPage,
  totalCount,
  pageSize,
  basePath,
  searchParams = {},
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams)
    if (page > 1) {
      params.set("page", String(page))
    } else {
      params.delete("page")
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const visiblePages = getVisiblePages(currentPage, totalPages)
  const btnBase = buttonVariants({ variant: "outline", size: "icon" })
  const btnActive = buttonVariants({ variant: "default", size: "icon" })

  if (totalCount <= 0) return null

  return (
    <div className="flex w-full justify-center">
      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link href={buildHref(1)} className={cn(btnBase, "size-8")} aria-label="첫 페이지">
            <ChevronsLeft className="size-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "size-8 pointer-events-none opacity-50")}>
            <ChevronsLeft className="size-4" />
          </span>
        )}

        {hasPrev ? (
          <Link href={buildHref(currentPage - 1)} className={cn(btnBase, "size-8")} aria-label="이전 페이지">
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "size-8 pointer-events-none opacity-50")}>
            <ChevronLeft className="size-4" />
          </span>
        )}

        {visiblePages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
              ...
            </span>
          ) : p === currentPage ? (
            <span key={p} className={cn(btnActive, "size-8 text-xs pointer-events-none")}>
              {p}
            </span>
          ) : (
            <Link key={p} href={buildHref(p as number)} className={cn(btnBase, "size-8 text-xs")}>
              {p}
            </Link>
          )
        )}

        {hasNext ? (
          <Link href={buildHref(currentPage + 1)} className={cn(btnBase, "size-8")} aria-label="다음 페이지">
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "size-8 pointer-events-none opacity-50")}>
            <ChevronRight className="size-4" />
          </span>
        )}

        {hasNext ? (
          <Link href={buildHref(totalPages)} className={cn(btnBase, "size-8")} aria-label="마지막 페이지">
            <ChevronsRight className="size-4" />
          </Link>
        ) : (
          <span className={cn(btnBase, "size-8 pointer-events-none opacity-50")}>
            <ChevronsRight className="size-4" />
          </span>
        )}
      </div>
    </div>
  )
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = []

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push("...", total)
  } else if (current >= total - 3) {
    pages.push(1, "...")
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total)
  }

  return pages
}
