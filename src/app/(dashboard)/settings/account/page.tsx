import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentRole, requireUser } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"

import { EmailChangeForm } from "../email-change-form"
import { PasswordChangeForm } from "../password-change-form"

export default async function SettingsAccountPage() {
  const user = await requireUser()
  const role = await getCurrentRole()
  const canSeeSignaturePolicy = hasPermission(role, "settings:view")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">자기 정보</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          로그인 이메일(아이디)과 비밀번호를 변경할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>이메일(아이디)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              현재 로그인에 사용 중인 주소입니다. 변경 시 Supabase 프로젝트 설정에
              따라 새 주소로 확인 메일이 발송될 수 있습니다.
            </p>
            <EmailChangeForm currentEmail={user.email ?? ""} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>비밀번호</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>

      {!canSeeSignaturePolicy ? (
        <p className="text-sm text-muted-foreground">
          서명 정책 등 기타 설정은{" "}
          <Link
            href="/settings"
            className={cn(buttonVariants({ variant: "link" }), "h-auto p-0")}
          >
            설정
          </Link>
          에서 안전관리자 이상 권한으로 확인할 수 있습니다.
        </p>
      ) : null}
    </div>
  )
}
