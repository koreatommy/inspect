"use client"

import type { OsanNote } from "@/lib/osan/types"

type Props = {
  notes: OsanNote[]
  draft?: string
  onDraftChange?: (value: string) => void
  readOnly?: boolean
  disabled?: boolean
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MemoSection({
  notes,
  draft = "",
  onDraftChange,
  readOnly = false,
  disabled = false,
}: Props) {
  if (readOnly) {
    if (notes.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">기록된 점검내용이 없습니다.</p>
      )
    }
    return (
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg bg-muted/60 p-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {note.content}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {formatStamp(note.updated_at)}
            </p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <textarea
      value={draft}
      onChange={(e) => onDraftChange?.(e.target.value)}
      placeholder="점검내용을 입력해 주세요"
      rows={3}
      disabled={disabled}
      className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
    />
  )
}
