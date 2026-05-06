import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"

import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight">로그인</h2>
        <p className="text-sm text-muted-foreground">
          관리자 계정으로 로그인하면 시설정보 업로드와
          <br className="hidden sm:block" />
          월간 안전점검을 진행할 수 있습니다.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[260px] w-full rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
