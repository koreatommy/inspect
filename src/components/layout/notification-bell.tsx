"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

type NotificationBellProps = {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const router = useRouter()
  const { recent, unreadCount, isLoading, markOneAsRead, markAllRead } =
    useNotifications({ userId })

  async function handleItemClick(id: string, link: string | null) {
    await markOneAsRead(id)
    if (link) router.push(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground",
          "hover:bg-muted hover:text-foreground",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label={
          unreadCount > 0
            ? `알림 ${unreadCount}개 읽지 않음`
            : "알림"
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground font-bold leading-none",
              unreadCount > 9
                ? "h-4 min-w-4 px-1 text-[9px]"
                : "h-4 w-4 text-[10px]",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">알림</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              모두 읽음
            </button>
          )}
        </div>

        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            불러오는 중…
          </div>
        ) : recent.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            알림이 없습니다
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            {recent.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer",
                  !notification.read_at && "bg-muted/50",
                )}
                onClick={() =>
                  handleItemClick(notification.id, notification.link)
                }
              >
                <div className="flex w-full items-start gap-2">
                  {!notification.read_at && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                  )}
                  <div
                    className={cn(
                      "flex flex-col gap-0.5",
                      !notification.read_at ? "ml-0" : "ml-3.5",
                    )}
                  >
                    <span className="text-sm font-medium leading-snug">
                      {notification.title}
                    </span>
                    {notification.body && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />

        <div className="p-1">
          <Link
            href="/settings/notifications"
            className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            전체 알림 보기
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}일 전`
  return new Date(isoString).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
