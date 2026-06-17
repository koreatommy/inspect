"use client"

import { Bell, BellOff, Check, CheckCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/app/(dashboard)/notifications/actions"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { NotificationRow } from "@/types/database"

type Filter = "all" | "unread"

type NotificationsClientProps = {
  initialNotifications: NotificationRow[]
  initialUnreadCount: number
  userId: string
}

export function NotificationsClient({
  initialNotifications,
  initialUnreadCount,
  userId,
}: NotificationsClientProps) {
  const router = useRouter()
  const [notifications, setNotifications] =
    useState<NotificationRow[]>(initialNotifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [filter, setFilter] = useState<Filter>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialNotifications.length === 20)

  const refresh = useCallback(async (currentPage = 0) => {
    setIsLoading(true)
    const result = await getNotifications(currentPage)
    if (currentPage === 0) {
      setNotifications(result.notifications)
    } else {
      setNotifications((prev) => [...prev, ...result.notifications])
    }
    setUnreadCount(result.unreadCount)
    setHasMore(result.hasMore)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-settings-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh(0)
          setPage(0)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  async function handleMarkAsRead(id: string, link: string | null) {
    await markAsRead(id)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    if (link) router.push(link)
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead()
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
    )
    setUnreadCount(0)
  }

  async function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    await refresh(nextPage)
  }

  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">
            알림
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            수신된 알림을 확인하고 관리합니다.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="shrink-0"
          >
            <CheckCheck className="mr-1.5 size-3.5" />
            모두 읽음
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          전체
          <Badge
            variant="secondary"
            className="ml-1.5 text-xs"
          >
            {notifications.length}
          </Badge>
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          읽지 않음
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-1.5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filter === "unread" ? "읽지 않은 알림" : "전체 알림"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && notifications.length === 0 ? (
            <div className="space-y-px px-6 pb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="mt-0.5 h-2 w-2 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <BellOff className="size-8 opacity-40" />
              <p className="text-sm">
                {filter === "unread"
                  ? "읽지 않은 알림이 없습니다"
                  : "알림이 없습니다"}
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((notification) => (
                <li
                  key={notification.id}
                  className={cn(
                    "group relative flex items-start gap-3 px-6 py-4 transition-colors hover:bg-muted/40",
                    !notification.read_at && "bg-muted/20",
                  )}
                >
                  <div className="mt-1.5 shrink-0">
                    {notification.read_at ? (
                      <Bell className="size-4 text-muted-foreground/40" />
                    ) : (
                      <Bell className="size-4 text-destructive" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p
                          className={cn(
                            "text-sm font-medium leading-snug",
                            notification.read_at && "text-muted-foreground",
                          )}
                        >
                          {notification.link ? (
                            <button
                              onClick={() =>
                                handleMarkAsRead(
                                  notification.id,
                                  notification.link,
                                )
                              }
                              className="text-left hover:underline underline-offset-2"
                            >
                              {notification.title}
                            </button>
                          ) : (
                            notification.title
                          )}
                        </p>
                        {notification.body && (
                          <p className="text-xs text-muted-foreground">
                            {notification.body}
                          </p>
                        )}
                      </div>

                      {!notification.read_at && (
                        <button
                          onClick={() =>
                            handleMarkAsRead(notification.id, null)
                          }
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                          title="읽음 처리"
                        >
                          <Check className="size-4" />
                        </button>
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hasMore && filter === "all" && (
            <div className="border-t p-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? "불러오는 중…" : "더 보기"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
