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
import type { AccountStatus } from "@/lib/auth/account-status"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import { formatKoreanMobilePhone } from "@/lib/validation/korean-phone"
import type { AppRole } from "@/types/inspection"

import {
  AccountStatusBadge,
  UserAccountControls,
} from "./user-account-controls"
import {
  updateUserEmailByAdminAction,
  updateUserRoleAction,
  type UpdateEmailState,
  type UpdateRoleState,
} from "./user-actions"
import {
  UserDatasetAssignmentCell,
  type DatasetOption,
} from "./user-dataset-assignment-cell"
import { UserPasswordResetCell } from "./user-password-reset-cell"

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
  organization: string
  status: AccountStatus
  suspended_at: string | null
  suspended_until: string | null
  suspend_reason: string | null
}

type RowProps = {
  user: UserRow
  datasets: DatasetOption[]
  assignedDatasetIds: string[]
}

function RoleChangeRow({ user, datasets, assignedDatasetIds }: RowProps) {
  const initialState: UpdateRoleState = {}
  const [state, formAction, isPending] = useActionState(
    updateUserRoleAction,
    initialState
  )
  const initialEmailState: UpdateEmailState = {}
  const [emailState, emailFormAction, isEmailPending] = useActionState(
    updateUserEmailByAdminAction,
    initialEmailState
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
      <TableCell>{user.organization}</TableCell>
      <TableCell>
        <AccountStatusBadge
          status={user.status}
          suspendedUntil={user.suspended_until}
        />
      </TableCell>
      <TableCell>
        <Badge
          variant={ROLE_BADGE_VARIANT[user.role as AppRole] ?? "outline"}
        >
          {ROLE_LABELS[user.role as AppRole] ?? user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <form action={emailFormAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="userId" value={user.user_id} />
          <input
            name="email"
            type="email"
            defaultValue={user.email ?? ""}
            className="h-8 w-full min-w-56 rounded-lg border border-input bg-background px-2 text-sm"
            placeholder="user@example.com"
            required
          />
          <Button type="submit" size="sm" variant="outline" disabled={isEmailPending}>
            {isEmailPending ? "변경 중..." : "이메일 변경"}
          </Button>
          {emailState.error ? (
            <span className="text-xs text-destructive">{emailState.error}</span>
          ) : null}
          {emailState.success ? (
            <span className="text-xs text-emerald-600">변경됨</span>
          ) : null}
        </form>
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
      <TableCell>
        <UserDatasetAssignmentCell
          userId={user.user_id}
          datasets={datasets}
          assignedDatasetIds={assignedDatasetIds}
          isAdminTarget={user.role === "ADMIN"}
        />
      </TableCell>
      <TableCell>
        <UserPasswordResetCell userId={user.user_id} />
      </TableCell>
      <TableCell>
        <UserAccountControls
          user={{
            user_id: user.user_id,
            role: user.role,
            status: user.status,
            suspended_until: user.suspended_until,
            suspend_reason: user.suspend_reason,
          }}
        />
      </TableCell>
    </TableRow>
  )
}

type UserManagementTableProps = {
  users: UserRow[]
  datasets: DatasetOption[]
  /** user_id -> [dataset_id, ...] */
  assignmentsByUserId: Record<string, string[]>
}

export function UserManagementTable({
  users,
  datasets,
  assignmentsByUserId,
}: UserManagementTableProps) {
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
          <TableHead>소속</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>현재 역할</TableHead>
          <TableHead>이메일 변경</TableHead>
          <TableHead>역할 변경</TableHead>
          <TableHead>데이터셋 할당</TableHead>
          <TableHead>비밀번호 재설정</TableHead>
          <TableHead>계정 관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <RoleChangeRow
            key={user.user_id}
            user={user}
            datasets={datasets}
            assignedDatasetIds={assignmentsByUserId[user.user_id] ?? []}
          />
        ))}
      </TableBody>
    </Table>
  )
}
