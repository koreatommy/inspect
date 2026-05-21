import type { SupabaseClient, User } from "@supabase/supabase-js"

import type { Database } from "@/types/database"
import type { AppRole } from "@/types/inspection"
import { authAdminKeyErrorHint } from "@/lib/supabase/service-key"

export type AdminUserRow = {
  user_id: string
  role: AppRole
  email: string | null
  display_name: string | null
  phone: string | null
}

/**
 * Auth 전체 사용자와 inspection_user_roles를 병합합니다. 역할 행이 없으면 VIEWER.
 */
export async function loadAdminUserDirectory(
  adminClient: SupabaseClient<Database>
): Promise<{ users: AdminUserRow[]; listUsersError?: string }> {
  const authUsers: User[] = []
  let page = 1
  const perPage = 200

  for (;;) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      return {
        users: [],
        listUsersError: authAdminKeyErrorHint(error.message),
      }
    }

    authUsers.push(...data.users)

    if (data.users.length < perPage) {
      break
    }
    page += 1
  }

  const { data: roleRows, error: rolesError } = await adminClient
    .from("inspection_user_roles")
    .select("user_id, role, display_name, phone")

  if (rolesError) {
    return {
      users: [],
      listUsersError: rolesError.message,
    }
  }

  const profileMap = new Map(
    (roleRows ?? []).map((r) => [
      r.user_id,
      {
        role: r.role as AppRole,
        display_name: r.display_name ?? null,
        phone: r.phone ?? null,
      },
    ])
  )

  const users: AdminUserRow[] = authUsers.map((u) => {
    const profile = profileMap.get(u.id)
    return {
      user_id: u.id,
      email: u.email ?? null,
      role: profile?.role ?? "VIEWER",
      display_name: profile?.display_name ?? null,
      phone: profile?.phone ?? null,
    }
  })

  users.sort((a, b) =>
    (a.email ?? a.user_id).localeCompare(b.email ?? b.user_id, "ko")
  )

  return { users }
}
