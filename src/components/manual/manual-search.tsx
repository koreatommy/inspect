"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ManualSearchProps = {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  totalCount?: number
  className?: string
}

export function ManualSearch({
  value,
  onChange,
  resultCount,
  totalCount,
  className,
}: ManualSearchProps) {
  const hasQuery = value.trim().length > 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="매뉴얼 검색 (제목, 설명, 키워드)"
          className="h-9 pr-9 pl-9"
          aria-label="매뉴얼 검색"
        />
        {hasQuery ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => onChange("")}
            aria-label="검색어 지우기"
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      {hasQuery && resultCount !== undefined && totalCount !== undefined ? (
        <p className="text-xs text-muted-foreground">
          검색 결과:{" "}
          <span className="font-medium text-foreground">{resultCount}</span> /{" "}
          {totalCount}개 섹션
        </p>
      ) : null}
    </div>
  )
}
