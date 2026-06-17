"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/app/(dashboard)/notifications/actions"
import { createClient } from "@/lib/supabase/client"
import type { NotificationRow } from "@/types/database"

type UseNotificationsOptions = {
  userId: string
  /** 드롭다운에 보여줄 최근 알림 수 (기본 5) */
  recentLimit?: number
}

type UseNotificationsReturn = {
  recent: NotificationRow[]
  unreadCount: number
  isLoading: boolean
  markOneAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useNotifications({
  userId,
  recentLimit = 5,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [recent, setRecent] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null)

  const refresh = useCallback(async () => {
    const [notifications, count] = await Promise.all([
      getRecentNotifications(recentLimit),
      getUnreadCount(),
    ])
    setRecent(notifications)
    setUnreadCount(count)
  }, [recentLimit])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setIsLoading(true)
      await refresh()
      if (!cancelled) setIsLoading(false)
    }

    void init()

    const supabase = createClient()
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh()
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  const markOneAsRead = useCallback(
    async (id: string) => {
      await markAsRead(id)
      setRecent((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    },
    [],
  )

  const markAllRead = useCallback(async () => {
    await markAllAsRead()
    setRecent((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
    )
    setUnreadCount(0)
  }, [])

  return { recent, unreadCount, isLoading, markOneAsRead, markAllRead, refresh }
}
