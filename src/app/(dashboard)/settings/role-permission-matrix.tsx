import { Fragment } from "react"
import { Check, Crown, Minus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getPermissions,
  hasPermission,
  PERMISSION_MATRIX_GROUPS,
  PERMISSION_MATRIX_ROWS,
  ROLE_LABELS,
  ROLE_MATRIX_COLUMNS,
  type Permission,
} from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"
import type { AppRole } from "@/types/inspection"

const RECOMMENDED_ROLE: AppRole = "MANAGER"

const ROLE_SUMMARY: Record<AppRole, string> = {
  ADMIN: "전체 시스템 관리",
  MANAGER: "시설·점검 전 과정",
  INSPECTOR: "현장 점검·위탁 서명",
  VIEWER: "조회·대장·자기 정보",
}

function isDifferentPermission(permission: Permission) {
  const grantedCount = ROLE_MATRIX_COLUMNS.filter((role) =>
    hasPermission(role, permission)
  ).length
  return grantedCount > 0 && grantedCount < ROLE_MATRIX_COLUMNS.length
}

function PermissionCell({
  role,
  permission,
  label,
}: {
  role: AppRole
  permission: Permission
  label: string
}) {
  const granted = hasPermission(role, permission)
  const roleLabel = ROLE_LABELS[role]

  return (
    <TableCell className="text-center">
      <span className="sr-only">
        {roleLabel}: {label} {granted ? "가능" : "불가"}
      </span>
      {granted ? (
        <Check
          className="mx-auto size-4 text-success"
          aria-hidden
        />
      ) : (
        <Minus
          className="mx-auto size-4 text-muted-foreground/50"
          aria-hidden
        />
      )}
    </TableCell>
  )
}

export function RolePermissionMatrix() {
  const totalCount = PERMISSION_MATRIX_ROWS.length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ROLE_MATRIX_COLUMNS.map((role) => {
          const count = getPermissions(role).length
          const isRecommended = role === RECOMMENDED_ROLE

          return (
            <div
              key={role}
              className={cn(
                "rounded-lg border bg-muted/30 px-3 py-2.5 text-center",
                isRecommended && "border-primary ring-1 ring-primary"
              )}
            >
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                {isRecommended ? (
                  <Badge className="h-5 bg-primary px-1.5 text-[10px] text-primary-foreground">
                    <Crown className="mr-0.5 size-2.5" aria-hidden />
                    추천
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ROLE_SUMMARY[role]}
              </p>
              <p className="mt-1 text-xs font-medium tabular-nums">
                {count}/{totalCount} 기능
              </p>
            </div>
          )
        })}
      </div>

      <Table>
        <TableCaption className="sr-only">
          역할별 기능 비교 — 행은 기능, 열은 역할입니다.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 min-w-[10rem] bg-background">
              기능
            </TableHead>
            {ROLE_MATRIX_COLUMNS.map((role) => (
              <TableHead
                key={role}
                className="min-w-[4.5rem] text-center text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{ROLE_LABELS[role]}</span>
                <span className="sm:hidden">
                  {ROLE_LABELS[role].replace(" ", "\u00a0")}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSION_MATRIX_GROUPS.map((group) => {
            const rows = PERMISSION_MATRIX_ROWS.filter((r) => r.group === group)

            return (
              <Fragment key={group}>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell
                    colSpan={ROLE_MATRIX_COLUMNS.length + 1}
                    className="sticky left-0 z-10 bg-muted/50 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {group}
                  </TableCell>
                </TableRow>
                {rows.map(({ permission, label }) => (
                  <TableRow
                    key={permission}
                    className={cn(
                      isDifferentPermission(permission) && "bg-muted/30"
                    )}
                  >
                    <TableCell
                      className={cn(
                        "sticky left-0 z-10 max-w-[14rem] bg-background text-sm whitespace-normal",
                        isDifferentPermission(permission) && "bg-muted/30"
                      )}
                    >
                      {label}
                    </TableCell>
                    {ROLE_MATRIX_COLUMNS.map((role) => (
                      <PermissionCell
                        key={role}
                        role={role}
                        permission={permission}
                        label={label}
                      />
                    ))}
                  </TableRow>
                ))}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>

      <ul className="space-y-1 text-xs text-muted-foreground">
        <li>
          <span className="font-medium text-foreground">안전관리자</span>:
          위탁점검자 서명 불가
        </li>
        <li>
          <span className="font-medium text-foreground">위탁점검자</span>:
          설정(서명 정책) 화면 불가
        </li>
        <li>
          <span className="font-medium text-foreground">일반 조회자</span>:
          점검 작성·서명·삭제 불가
        </li>
        <li>신규 계정에는 시스템 관리자를 제외한 역할만 부여할 수 있습니다.</li>
      </ul>
      <p className="text-xs text-muted-foreground">
        <Check className="mr-1 inline size-3.5 text-success" aria-hidden />
        가능 · 회색 — 불가 · 회색 배경 행은 역할마다 다른 기능입니다.
      </p>
    </div>
  )
}
