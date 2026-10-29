"use client"

import { useEffect, useState } from "react"
import { Hourglass, Pencil } from "lucide-react"

import {
  updateFacilityContact,
  type FacilityContactField,
} from "@/app/osan/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "./toast"

const FIELDS: {
  field: FacilityContactField
  label: string
  inputType: "tel" | "email" | "text"
  placeholder: string
}[] = [
  {
    field: "phone",
    label: "전화",
    inputType: "tel",
    placeholder: "전화번호를 입력해 주세요",
  },
  {
    field: "email",
    label: "이메일",
    inputType: "email",
    placeholder: "이메일을 입력해 주세요",
  },
  {
    field: "safety_manager",
    label: "관리자",
    inputType: "text",
    placeholder: "관리자 이름을 입력해 주세요",
  },
]

type ContactValues = Record<FacilityContactField, string | null>

type Props = {
  facilityId: string
  values: ContactValues
  disabled?: boolean
  onSaved: (field: FacilityContactField, value: string | null) => void
}

export function FacilityContactSection({
  facilityId,
  values,
  disabled = false,
  onSaved,
}: Props) {
  const [editing, setEditing] = useState<FacilityContactField | null>(null)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)

  const active = FIELDS.find((item) => item.field === editing) ?? null

  useEffect(() => {
    if (!editing) return
    setDraft(values[editing] ?? "")
  }, [editing, values])

  async function handleSave() {
    if (!editing || saving) return
    setSaving(true)
    try {
      const res = await updateFacilityContact(facilityId, editing, draft)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      onSaved(res.data.field, res.data.value)
      toast.success(`${active?.label ?? "정보"}를 저장했습니다.`)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {FIELDS.map(({ field, label }) => {
        const value = values[field]
        return (
          <div key={field} className="flex gap-2 text-sm">
            <span className="w-16 shrink-0 text-muted-foreground">{label}</span>
            <span
              className={
                value
                  ? "min-w-0 flex-1 break-words"
                  : "min-w-0 flex-1 text-muted-foreground"
              }
            >
              {value || "미등록"}
            </span>
            <button
              type="button"
              disabled={disabled || saving}
              onClick={() => setEditing(field)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground active:scale-95 disabled:opacity-50"
              aria-label={`${label} 수정`}
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        )
      })}

      <Dialog
        open={editing != null}
        onOpenChange={(open) => {
          if (!open && !saving) setEditing(null)
        }}
      >
        <DialogContent showCloseButton={!saving}>
          <DialogHeader>
            <DialogTitle>{active?.label ?? "정보"} 수정</DialogTitle>
            <DialogDescription>
              변경 후 저장하면 이 시설 정보에 바로 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          {active ? (
            <label className="block space-y-2">
              <span className="text-xs text-muted-foreground">{active.label}</span>
              <input
                type={active.inputType}
                value={draft}
                disabled={saving}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void handleSave()
                  }
                }}
                placeholder={active.placeholder}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              />
            </label>
          ) : null}
          <DialogFooter className="sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setEditing(null)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Hourglass className="size-4 animate-hourglass" aria-hidden />
                  저장 중…
                </>
              ) : (
                "저장"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
