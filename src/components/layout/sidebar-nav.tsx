"use client"

import {
  Building2,
  ClipboardCheck,
  FileUp,
  History,
  Home,
  Settings,
  UserCircle,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { hasPermission, type Permission } from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"
import type { AppRole } from "@/types/inspection"

type NavItem = {
  href: string
  label: string
  icon: typeof Home
  requiredPermission?: Permission
}

const navigationItems: NavItem[] = [
  { href: "/dashboard", label: "대시보드", icon: Home },
  { href: "/facilities", label: "시설 목록", icon: Building2 },
  {
    href: "/inspections/new",
    label: "월간 안전점검",
    icon: ClipboardCheck,
    requiredPermission: "inspection:create",
  },
  { href: "/inspections/history", label: "안전점검 이력", icon: History },
]

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  )
}

type SidebarNavProps = {
  role: AppRole
  onLinkClick?: () => void
}

export function SidebarNav({ role, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname()

  const visibleItems = navigationItems.filter(
    (item) =>
      !item.requiredPermission || hasPermission(role, item.requiredPermission)
  )

  const canSettingsNav =
    hasPermission(role, "settings:view") ||
    hasPermission(role, "settings:account")
  const canUploadJson = hasPermission(role, "facility:upload")
  const canManageUsers = hasPermission(role, "user:manage")
  const settingsActive =
    pathname === "/settings" ||
    (pathname.startsWith("/settings/") &&
      !pathname.startsWith("/settings/account"))
  const uploadActive = pathname.startsWith("/admin/upload")
  const settingsAccountActive = pathname.startsWith("/settings/account")
  const settingsUsersActive = pathname.startsWith("/settings/users")

  return (
    <>
      <div className="mb-6 px-2">
        <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
          월간 안전점검
        </p>
        <h1 className="mt-1 text-base font-bold leading-tight">
          어린이놀이시설 관리
        </h1>
      </div>

      <nav className="flex-1 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={navLinkClass(isActive)}
            >
              <Icon className="size-[18px] shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {canSettingsNav ? (
          <div className="space-y-0.5 pt-2">
            <Link
              href="/settings"
              onClick={onLinkClick}
              className={navLinkClass(settingsActive)}
            >
              <Settings className="size-[18px] shrink-0" />
              설정
            </Link>
            {hasPermission(role, "settings:account") ? (
              <Link
                href="/settings/account"
                onClick={onLinkClick}
                className={cn(navLinkClass(settingsAccountActive), "pl-10")}
              >
                <UserCircle className="size-[18px] shrink-0" />
                내정보 관리
              </Link>
            ) : null}
            {canUploadJson ? (
              <Link
                href="/admin/upload"
                onClick={onLinkClick}
                className={cn(navLinkClass(uploadActive), "pl-10")}
              >
                <FileUp className="size-[18px] shrink-0" />
                JSON 업로드
              </Link>
            ) : null}
            {canManageUsers ? (
              <Link
                href="/settings/users"
                onClick={onLinkClick}
                className={cn(navLinkClass(settingsUsersActive), "pl-10")}
              >
                <Users className="size-[18px] shrink-0" />
                사용자 관리
              </Link>
            ) : null}
          </div>
        ) : null}
      </nav>
    </>
  )
}
