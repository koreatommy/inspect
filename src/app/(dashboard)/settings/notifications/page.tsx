import { getNotifications } from "@/app/(dashboard)/notifications/actions"
import { getTargetUsers } from "@/app/(dashboard)/notifications/actions"
import { getCurrentUserProfile, requireUser } from "@/lib/auth/helpers"

import { NotificationsClient } from "./notifications-client"
import { SendNotificationForm } from "./send-notification-form"

export default async function NotificationsPage() {
  const user = await requireUser()
  const [profile, { notifications, unreadCount }, targetUsers] =
    await Promise.all([
      getCurrentUserProfile(),
      getNotifications(0),
      // ADMIN이 아닌 경우에도 호출되지만 actions 내부에서 권한 체크
      getCurrentUserProfile().then((p) =>
        p.role === "ADMIN" ? getTargetUsers() : Promise.resolve([]),
      ),
    ])

  return (
    <div className="space-y-6">
      {profile.role === "ADMIN" && (
        <SendNotificationForm initialUsers={targetUsers} />
      )}
      <NotificationsClient
        initialNotifications={notifications}
        initialUnreadCount={unreadCount}
        userId={user.id}
      />
    </div>
  )
}
