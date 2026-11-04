"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Hourglass, Mail, X } from "lucide-react"

import { sendInspectionEmail } from "@/app/osan/send-inspection-email"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  createDraftFromFacility,
  type InspectionEmailDraft,
} from "@/lib/osan/inspection-email-draft"
import type { OsanFacilityWithRelations } from "@/lib/osan/types"
import { cn } from "@/lib/utils"
import {
  SendInspectionConfirmDialog,
  SendInspectionSuccessDialog,
} from "./send-inspection-dialogs"
import { toast } from "./toast"

type DialogPhase = "confirm" | "success" | null

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  facility: OsanFacilityWithRelations
}

const fieldClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"

const textareaClassName = `${fieldClassName} min-h-20`

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function resolveRecipient(draft: InspectionEmailDraft) {
  return draft.to.trim() || draft.contactEmail.trim()
}

export function SendInspectionSheet({ open, onOpenChange, facility }: Props) {
  const [draft, setDraft] = useState<InspectionEmailDraft>(() =>
    createDraftFromFacility(facility),
  )
  const [sending, setSending] = useState(false)
  const [dialogPhase, setDialogPhase] = useState<DialogPhase>(null)
  const [sentTo, setSentTo] = useState("")

  // 시트 오픈 시·시설 전환 시에만 초안을 다시 채운다.
  // facility 객체 참조가 바뀌어도(좌표 보정 등) 입력 중인 수신 이메일을 지우지 않는다.
  const facilityId = facility.id
  useEffect(() => {
    if (!open) return
    setDraft(createDraftFromFacility(facility))
    setDialogPhase(null)
    setSentTo("")
    // facility는 open/facilityId 변경 시점의 스냅샷만 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facilityId])

  function patchEmailFields(value: string) {
    // 수신 이메일·관리주체 이메일을 같이 맞춰, 어느 칸에 넣어도 송부 가능
    setDraft((prev) => ({
      ...prev,
      to: value,
      contactEmail: value,
    }))
  }

  function patch<K extends keyof InspectionEmailDraft>(
    key: K,
    value: InspectionEmailDraft[K],
  ) {
    if (key === "to" || key === "contactEmail") {
      patchEmailFields(String(value))
      return
    }
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function patchPhoto(
    photoId: string,
    next: Partial<InspectionEmailDraft["photos"][number]>,
  ) {
    setDraft((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) =>
        photo.photoId === photoId ? { ...photo, ...next } : photo,
      ),
    }))
  }

  const recipient = resolveRecipient(draft)

  function requestSend() {
    if (sending) return
    if (!recipient) {
      toast.error("수신 이메일을 입력해 주세요.")
      return
    }
    setDialogPhase("confirm")
  }

  async function confirmSend() {
    if (sending) return
    const to = recipient
    if (!to) {
      toast.error("수신 이메일을 입력해 주세요.")
      setDialogPhase(null)
      return
    }
    setSending(true)
    try {
      const result = await sendInspectionEmail({
        ...draft,
        to,
        contactEmail: draft.contactEmail.trim() || to,
      })
      if (!result.ok) {
        toast.error(result.error)
        setDialogPhase(null)
        return
      }
      setSentTo(to)
      setDialogPhase("success")
    } finally {
      setSending(false)
    }
  }

  function finishSuccess() {
    setDialogPhase(null)
    onOpenChange(false)
  }

  const busy = sending || dialogPhase === "success"
  const canSend = Boolean(recipient) && !busy

  return (
    <>
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (busy) return
        if (!next) setDialogPhase(null)
        onOpenChange(next)
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex shrink-0 justify-center pt-2.5 pb-1" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
        </div>

        <SheetHeader className="shrink-0 space-y-0 border-b border-border/60 px-4 pb-3 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <SheetTitle className="text-lg font-semibold">
                점검내용 송부
              </SheetTitle>
              <SheetDescription className="text-[13px] leading-snug">
                관리주체·사진·점검내용을 확인한 뒤 이메일로 보냅니다.
              </SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <section className="space-y-3">
            <Field label="수신 이메일">
              <input
                type="email"
                value={draft.to}
                onChange={(e) => patch("to", e.target.value)}
                disabled={busy}
                placeholder="manager@example.com"
                className={fieldClassName}
                autoComplete="off"
                inputMode="email"
              />
              <span className="block text-[11px] leading-snug text-muted-foreground">
                등록된 이메일이 없어도 원하는 주소로 보낼 수 있습니다.
              </span>
            </Field>
            <Field label="제목">
              <input
                type="text"
                value={draft.subject}
                onChange={(e) => patch("subject", e.target.value)}
                disabled={busy}
                className={fieldClassName}
              />
            </Field>
          </section>

          <section className="space-y-3">
            <SectionTitle>관리주체 기본정보</SectionTitle>
            <dl className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "시설명"],
                  ["facilityCode", "시설번호"],
                  ["placeType", "설치장소"],
                  ["region", "지역"],
                  ["indoorOutdoor", "실내외"],
                  ["address", "주소"],
                  ["representative", "대표자"],
                  ["phone", "전화"],
                  ["contactEmail", "이메일"],
                  ["safetyManager", "안전관리자"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="break-words text-sm">
                    {draft[key].trim() || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="space-y-3">
            <SectionTitle>점검사진</SectionTitle>
            {draft.photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                저장된 점검사진이 없습니다.
              </p>
            ) : (
              <ul className="space-y-3">
                {draft.photos.map((photo) => (
                  <li
                    key={photo.photoId}
                    className={cn(
                      "rounded-xl border p-3",
                      !photo.included && "opacity-60",
                    )}
                  >
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt=""
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={photo.included}
                            onChange={(e) =>
                              patchPhoto(photo.photoId, {
                                included: e.target.checked,
                              })
                            }
                            disabled={busy}
                            className="size-4 rounded border"
                          />
                          메일에 포함
                        </label>
                        <input
                          type="text"
                          value={photo.equipmentType}
                          onChange={(e) =>
                            patchPhoto(photo.photoId, {
                              equipmentType: e.target.value,
                            })
                          }
                          disabled={busy || !photo.included}
                          placeholder="기구유형"
                          className={fieldClassName}
                        />
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) =>
                            patchPhoto(photo.photoId, {
                              caption: e.target.value,
                            })
                          }
                          disabled={busy || !photo.included}
                          placeholder="캡션"
                          className={fieldClassName}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <SectionTitle>점검내용</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="점검자">
                <input
                  type="text"
                  value={draft.inspectorName}
                  onChange={(e) => patch("inspectorName", e.target.value)}
                  disabled={busy}
                  className={fieldClassName}
                />
              </Field>
              <Field label="점검일시">
                <input
                  type="text"
                  value={
                    draft.inspectedAtLabel === "-"
                      ? ""
                      : draft.inspectedAtLabel
                  }
                  onChange={(e) => patch("inspectedAtLabel", e.target.value)}
                  disabled={busy}
                  className={fieldClassName}
                />
              </Field>
            </div>
            <Field label="기타 점검 의견">
              <textarea
                value={draft.notesText}
                onChange={(e) => patch("notesText", e.target.value)}
                disabled={busy}
                rows={4}
                className={textareaClassName}
              />
            </Field>
            <Field label="맺음말">
              <textarea
                value={draft.closing}
                onChange={(e) => patch("closing", e.target.value)}
                disabled={busy}
                rows={3}
                className={textareaClassName}
              />
            </Field>
          </section>
        </div>

        <div className="shrink-0 border-t px-4 py-3">
          <button
            type="button"
            onClick={requestSend}
            disabled={!canSend}
            aria-busy={sending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50"
          >
            {sending ? (
              <>
                <Hourglass className="size-4 animate-hourglass" aria-hidden />
                보내는 중…
              </>
            ) : (
              <>
                <Mail className="size-4" aria-hidden />
                보내기
              </>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>

    <SendInspectionConfirmDialog
      open={dialogPhase === "confirm"}
      recipient={recipient}
      facilityName={draft.name.trim() || facility.name}
      subject={draft.subject.trim()}
      sending={sending}
      onCancel={() => setDialogPhase(null)}
      onConfirm={() => void confirmSend()}
    />
    <SendInspectionSuccessDialog
      open={dialogPhase === "success"}
      recipient={sentTo}
      onClose={finishSuccess}
    />
    </>
  )
}
