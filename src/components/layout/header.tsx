"use client"

import { signOut } from "@/app/(dashboard)/actions"
import { MobileSidebarTrigger } from "@/components/layout/sidebar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import type { AppRole } from "@/types/inspection"

type HeaderProps = {
  displayLabel: string
  role: AppRole
}

export function Header({ displayLabel, role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm print:hidden lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebarTrigger role={role} />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold">어린이놀이시설 월간 안전점검</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {ROLE_LABELS[role]}
        </Badge>
        <span className="hidden text-sm text-muted-foreground md:inline">
          {displayLabel || "로그인 필요"}
        </span>
        <ThemeToggle />
        <form action={signOut}>
          <Button variant="outline" size="sm" type="submit">
            로그아웃
          </Button>
        </form>
      </div>
    </header>
  )
}
