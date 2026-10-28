"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "./toast"

import { addNote, deleteNote, updateNote } from "@/app/osan/actions"
import type { OsanNote } from "@/lib/osan/types"

type Props = {
  facilityId: string
  notes: OsanNote[]
  onChange: (notes: OsanNote[]) => void
}

function formatStamp(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MemoSection({ facilityId, notes, onChange }: Props) {
  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleAdd() {
    if (!draft.trim() || busy) return
    setBusy(true)
    const res = await addNote(facilityId, draft)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onChange([res.data, ...notes])
    setDraft("")
    toast.success("메모 저장")
  }

  async function handleUpdate(noteId: string) {
    if (!editDraft.trim() || busy) return
    setBusy(true)
    const res = await updateNote(noteId, editDraft)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onChange(notes.map((n) => (n.id === noteId ? res.data : n)))
    setEditingId(null)
    toast.success("메모 수정")
  }

  async function handleDelete(noteId: string) {
    if (busy) return
    setBusy(true)
    const res = await deleteNote(noteId)
    setBusy(false)
    if (!res.ok) {
      toast.error(res.error)
      return
    }
    onChange(notes.filter((n) => n.id !== noteId))
    toast.success("메모 삭제")
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="현장 메모를 남겨 주세요"
          rows={2}
          className="min-h-14 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          onClick={() => void handleAdd()}
          disabled={busy || !draft.trim()}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
          aria-label="메모 추가"
        >
          <Plus className="size-5" />
        </button>
      </div>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="rounded-lg bg-muted/60 p-3">
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="h-8 px-2 text-xs text-muted-foreground"
                    onClick={() => setEditingId(null)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="h-8 rounded-md bg-primary px-3 text-xs text-primary-foreground"
                    onClick={() => void handleUpdate(note.id)}
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {note.content}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{formatStamp(note.updated_at)}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md"
                      onClick={() => {
                        setEditingId(note.id)
                        setEditDraft(note.content)
                      }}
                      aria-label="메모 수정"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md text-destructive"
                      onClick={() => void handleDelete(note.id)}
                      aria-label="메모 삭제"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
