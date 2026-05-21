"use client"

import { useActionState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import { formatKoreanMobilePhone } from "@/lib/validation/korean-phone"
import type { AppRole } from "@/types/inspection"

import { updateUserRoleAction, type UpdateRoleState } from "./user-actions"

const ASSIGNABLE_ROLES: AppRole[] = ["MANAGER", "INSPECTOR", "VIEWER"]

const ROLE_BADGE_VARIANT: Record<AppRole, "default" | "secondary" | "outline"> =
  {
    ADMIN: "default",
    MANAGER: "secondary",
    INSPECTOR: "secondary",
    VIEWER: "outline",
  }

type UserRow = {
  user_id: string
  role: string
  email: string | null
  display_name: string | null
  phone: string | null
}

function RoleChangeRow({ user }: { user: UserRow }) {
  const initialState: UpdateRoleState = {}
  const [state, formAction, isPending] = useActionState(
    updateUserRoleAction,
    initialState
  )

  const isAdminRow = user.role === "ADMIN"
  const canEdit = !isAdminRow

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {user.email ?? user.user_id}
      </TableCell>
      <TableCell>{user.display_name ?? "-"}</TableCell>
      <TableCell className="text-sm tabular-nums">
        {user.phone ? formatKoreanMobilePhone(user.phone) : "-"}
      </TableCell>
      <TableCell>
        <Badge
          variant={ROLE_BADGE_VARIANT[user.role as AppRole] ?? "outline"}
        >
          {ROLE_LABELS[user.role as AppRole] ?? user.role}
        </Badge>
      </TableCell>
      <TableCell>
        {canEdit ? (
          <form action={formAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="userId" value={user.user_id} />
            <select
              name="role"
              defaultValue={user.role}
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "변경 중..." : "변경"}
            </Button>
            {state.error && (
              <span className="text-xs text-destructive">{state.error}</span>
            )}
            {state.success && (
              <span className="text-xs text-emerald-600">변경됨</span>
            )}
          </form>
        ) : (
          <span className="text-xs text-muted-foreground">
            시스템 관리자 계정은 여기서 변경할 수 없습니다.
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}

export function UserManagementTable({ users }: { users: UserRow[] }) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">등록된 사용자가 없습니다.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>아이디(이메일)</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>핸드폰</TableHead>
          <TableHead>현재 역할</TableHead>
          <TableHead>역할 변경</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <RoleChangeRow key={user.user_id} user={user} />
        ))}
      </TableBody>
    </Table>
  )
}
