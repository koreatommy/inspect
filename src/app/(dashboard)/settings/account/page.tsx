import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getCurrentRole, requireUser } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { createClient } from "@/lib/supabase/server"
import { formatKoreanMobilePhone } from "@/lib/validation/korean-phone"
import { cn } from "@/lib/utils"

import { PasswordChangeForm } from "../password-change-form"
import { ProfileUpdateForm } from "../profile-update-form"

export default async function SettingsAccountPage() {
  const user = await requireUser()
  const role = await getCurrentRole()
  const canSeeSignaturePolicy = hasPermission(role, "settings:view")
  const supabase = await createClient()
  const { data } = await supabase
    .from("inspection_user_roles")
    .select("display_name, phone")
    .eq("user_id", user.id)
    .maybeSingle()
  const displayName = data?.display_name ?? ""
  const phone = data?.phone ?? ""

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">자기 정보</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          이름·전화번호·비밀번호를 변경할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              이름과 전화번호를 수정할 수 있습니다.
            </p>
            <ProfileUpdateForm displayName={displayName} phone={phone} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>이메일(아이디)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              로그인에 사용되는 이메일(아이디)입니다. 이메일 변경은 시스템
              관리자에게 요청해 주세요.
            </p>
            <div className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm">
              {user.email ?? "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>비밀번호</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm />
            {phone ? (
              <p className="mt-3 text-xs text-muted-foreground">
                현재 등록된 번호: {formatKoreanMobilePhone(phone)}
              </p>
            ) : null}
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
