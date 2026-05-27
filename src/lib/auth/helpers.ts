import { cache } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/types/inspection"
import { resolveAccountAccess } from "./account-access"
import { hasPermission, type Permission } from "./permissions"

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()
  const access = await resolveAccountAccess(supabase, user.id)

  if (access.blocked) {
    await supabase.auth.signOut()
    redirect("/login?suspended=1&login=open")
  }

  return user
}

export type CurrentUserProfile = {
  role: AppRole
  displayName: string | null
  email: string | null
}

/** 로그인 사용자의 역할·표시 이름 (React cache — 요청당 1회 조회) */
export const getCurrentUserProfile = cache(async (): Promise<CurrentUserProfile> => {
  const user = await getCurrentUser()

  if (!user) {
    return { role: "VIEWER", displayName: null, email: null }
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("inspection_user_roles")
    .select("role, display_name")
    .eq("user_id", user.id)
    .maybeSingle()

  const displayName = data?.display_name?.trim() || null

  return {
    role: (data?.role as AppRole | undefined) ?? "VIEWER",
    displayName,
    email: user.email ?? null,
  }
})

/** UI에 표시할 이름 (display_name 우선, 없으면 이메일 @ 앞부분) */
export function resolveDisplayLabel(profile: {
  displayName: string | null
  email: string | null
}) {
  if (profile.displayName) {
    return profile.displayName
  }
  if (profile.email) {
    return profile.email.split("@")[0] ?? profile.email
  }
  return "사용자"
}

export const getCurrentRole = cache(async (): Promise<AppRole> => {
  const profile = await getCurrentUserProfile()
  return profile.role
})

export function hasRole(role: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(role)
}

export async function requirePermission(
  permission: Permission,
  redirectTo = "/"
) {
  const role = await getCurrentRole()

  if (!hasPermission(role, permission)) {
    redirect(redirectTo)
  }

  return role
}

export type AccessibleDataset = {
  id: string
  name: string
  facility_count: number
}

/**
 * 사용자가 접근 가능한 active 데이터셋 목록.
 *  - ADMIN: 모든 status='active' 데이터셋
 *  - 그 외: user_dataset_assignments + status='active' 교집합
 */
export async function getAccessibleDatasets(
  userId: string,
  role: AppRole,
): Promise<AccessibleDataset[]> {
  const supabase = await createClient()

  if (role === "ADMIN") {
    const { data } = await supabase
      .from("facility_datasets")
      .select("id,name,facility_count")
      .eq("status", "active")
      .order("created_at", { ascending: false })
    return data ?? []
  }

  const { data: assigned } = await supabase
    .from("user_dataset_assignments")
    .select("dataset_id")
    .eq("user_id", userId)

  const ids = (assigned ?? []).map((row) => row.dataset_id)
  if (ids.length === 0) return []

  const { data: datasets } = await supabase
    .from("facility_datasets")
    .select("id,name,facility_count")
    .in("id", ids)
    .eq("status", "active")
    .order("name", { ascending: true })

  return datasets ?? []
}

/** id만 필요한 경우의 단축 헬퍼 */
export async function getAccessibleDatasetIds(
  userId: string,
  role: AppRole,
): Promise<string[]> {
  const datasets = await getAccessibleDatasets(userId, role)
  return datasets.map((d) => d.id)
}
