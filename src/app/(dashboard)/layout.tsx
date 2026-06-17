import type { ReactNode } from "react"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import {
  getCurrentUserProfile,
  requireUser,
  resolveDisplayLabel,
} from "@/lib/auth/helpers"

/** 로그인·Supabase 세션이 필요한 구역이라 빌드 시 정적 프리렌더를 하지 않습니다. */
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireUser()
  const profile = await getCurrentUserProfile()

  return (
    <div className="min-h-dvh bg-muted/30 print:min-h-0 print:bg-white">
      <Sidebar role={profile.role} />
      <div className="flex min-h-dvh flex-col lg:ml-64 print:ml-0 print:min-h-0">
        <Header
          displayLabel={resolveDisplayLabel(profile)}
          role={profile.role}
          userId={user.id}
        />
        <main className="flex-1 p-4 lg:p-6 print:p-0">{children}</main>
      </div>
    </div>
  )
}
