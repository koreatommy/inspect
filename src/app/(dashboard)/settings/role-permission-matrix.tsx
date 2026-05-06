import { Check, X, Crown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  hasPermission,
  PERMISSION_MATRIX_ROWS,
  ROLE_LABELS,
  ROLE_MATRIX_COLUMNS,
} from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"
import type { AppRole } from "@/types/inspection"

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  ADMIN: "전체 시스템 관리 권한을 보유합니다.",
  MANAGER: "시설 관리 및 점검 전 과정을 수행합니다.",
  INSPECTOR: "현장 점검 업무를 수행합니다.",
  VIEWER: "조회 및 출력만 가능합니다.",
}

const RECOMMENDED_ROLE: AppRole = "MANAGER"

export function RolePermissionMatrix() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ROLE_MATRIX_COLUMNS.map((role) => {
        const isRecommended = role === RECOMMENDED_ROLE
        const permissions = PERMISSION_MATRIX_ROWS.filter((row) =>
          hasPermission(role, row.permission)
        )
        const denied = PERMISSION_MATRIX_ROWS.filter(
          (row) => !hasPermission(role, row.permission)
        )

        return (
          <Card
            key={role}
            className={cn(
              "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
              isRecommended && "ring-2 ring-primary shadow-md"
            )}
          >
            <CardHeader className="space-y-2 pb-3 pt-5">
              {isRecommended ? (
                <div className="flex justify-center">
                  <Badge className="bg-primary text-primary-foreground shadow-sm">
                    <Crown className="mr-1 size-3" />
                    추천
                  </Badge>
                </div>
              ) : null}
              <CardTitle className="text-center text-lg">
                {ROLE_LABELS[role]}
              </CardTitle>
              <p className="text-center text-xs text-muted-foreground">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </CardHeader>

            <CardContent className="space-y-1.5 pb-5">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                {permissions.length}/{PERMISSION_MATRIX_ROWS.length} 기능 사용 가능
              </p>

              {permissions.map(({ permission, label }) => (
                <div key={permission} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <span>{label}</span>
                </div>
              ))}

              {denied.length > 0 ? (
                <>
                  <div className="my-2 border-t" />
                  {denied.map(({ permission, label }) => (
                    <div
                      key={permission}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <X className="mt-0.5 size-4 shrink-0" />
                      <span className="line-through">{label}</span>
                    </div>
                  ))}
                </>
              ) : null}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
