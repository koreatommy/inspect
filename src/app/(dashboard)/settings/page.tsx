import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentRole, requireUser } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"

export default async function SettingsPage() {
  await requireUser()
  const role = await getCurrentRole()
  const canSignaturePolicy = hasPermission(role, "settings:view")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">설정</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          서명 정책 등을 관리합니다. 이메일·비밀번호는{" "}
          <Link
            href="/settings/account"
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
          >
            자기 정보
          </Link>
          에서 변경할 수 있습니다.
        </p>
      </div>

      {canSignaturePolicy ? (
        <Card>
          <CardHeader>
            <CardTitle>서명 정책</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            위탁점검자 서명 필수 여부는 후속 설정값으로 확장합니다.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>접근 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              이 화면의 서명 정책 설정은 안전관리자·시스템 관리자만 사용할 수
              있습니다.
            </p>
            <p>
              <Link
                href="/settings/account"
                className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
              >
                자기 정보
              </Link>
              에서 이메일과 비밀번호를 변경할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
