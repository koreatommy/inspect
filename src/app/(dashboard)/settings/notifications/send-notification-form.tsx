"use client"

import { Send } from "lucide-react"
import { useState, useTransition } from "react"

import {
  getTargetUsers,
  sendNotification,
  type SendTarget,
  type TargetUser,
} from "@/app/(dashboard)/notifications/actions"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AppRole } from "@/types/inspection"

type TargetType = "all" | "role" | "user"

const ROLES: AppRole[] = ["ADMIN", "MANAGER", "INSPECTOR", "VIEWER"]

type SendNotificationFormProps = {
  initialUsers: TargetUser[]
}

export function SendNotificationForm({ initialUsers }: SendNotificationFormProps) {
  const [isPending, startTransition] = useTransition()
  const [users] = useState<TargetUser[]>(initialUsers)

  const [targetType, setTargetType] = useState<TargetType>("all")
  const [targetRole, setTargetRole] = useState<AppRole>("MANAGER")
  const [targetUserId, setTargetUserId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [link, setLink] = useState("")
  const [result, setResult] = useState<{
    success: boolean
    sentCount?: number
    error?: string
  } | null>(null)

  function buildTarget(): SendTarget {
    if (targetType === "role") return { type: "role", role: targetRole }
    if (targetType === "user") return { type: "user", userId: targetUserId }
    return { type: "all" }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (targetType === "user" && !targetUserId) return

    setResult(null)
    startTransition(async () => {
      const res = await sendNotification({
        target: buildTarget(),
        notificationType: "admin_broadcast",
        title: title.trim(),
        body: body.trim() || undefined,
        link: link.trim() || undefined,
      })
      setResult(res)
      if (res.success) {
        setTitle("")
        setBody("")
        setLink("")
      }
    })
  }

  const targetLabel = (() => {
    if (targetType === "all") return "전체 사용자"
    if (targetType === "role") return `${ROLE_LABELS[targetRole]} 역할`
    const user = users.find((u) => u.user_id === targetUserId)
    return user?.display_name ?? "특정 사용자"
  })()

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Send className="size-4" />
          알림 발송
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 수신 대상 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">수신 대상</label>
            <div className="flex flex-wrap gap-2">
              <Select
                value={targetType}
                onValueChange={(v) => setTargetType(v as TargetType)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 사용자</SelectItem>
                  <SelectItem value="role">역할별</SelectItem>
                  <SelectItem value="user">특정 사용자</SelectItem>
                </SelectContent>
              </Select>

              {targetType === "role" && (
                <Select
                  value={targetRole}
                  onValueChange={(v) => setTargetRole(v as AppRole)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {targetType === "user" && (
                <Select
                  value={targetUserId}
                  onValueChange={(v) => setTargetUserId(v ?? "")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="사용자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.display_name ?? u.user_id.slice(0, 8)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({ROLE_LABELS[u.role]})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label htmlFor="notif-title" className="text-sm font-medium">
              제목 <span className="text-destructive">*</span>
            </label>
            <Input
              id="notif-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목을 입력하세요"
              maxLength={100}
              required
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label htmlFor="notif-body" className="text-sm font-medium">
              내용 <span className="text-xs text-muted-foreground">(선택)</span>
            </label>
            <textarea
              id="notif-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="알림 내용을 입력하세요"
              maxLength={500}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* 링크 */}
          <div className="space-y-2">
            <label htmlFor="notif-link" className="text-sm font-medium">
              링크 <span className="text-xs text-muted-foreground">(선택)</span>
            </label>
            <Input
              id="notif-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/dashboard, /inspections/history 등"
              maxLength={200}
            />
          </div>

          {/* 결과 메시지 */}
          {result && (
            <p
              className={
                result.success
                  ? "rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300"
                  : "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              }
            >
              {result.success
                ? `${result.sentCount}명에게 알림을 발송했습니다.`
                : `발송 실패: ${result.error}`}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              수신 대상: <span className="font-medium">{targetLabel}</span>
            </p>
            <Button
              type="submit"
              size="sm"
              disabled={
                isPending ||
                !title.trim() ||
                (targetType === "user" && !targetUserId)
              }
            >
              <Send className="mr-1.5 size-3.5" />
              {isPending ? "발송 중…" : "발송"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
