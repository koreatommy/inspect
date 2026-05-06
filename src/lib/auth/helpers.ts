import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { AppRole } from "@/types/inspection"
import { hasPermission, type Permission } from "./permissions"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

export async function getCurrentRole(): Promise<AppRole> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return "VIEWER"
  }

  const { data } = await supabase
    .from("inspection_user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle()

  return (data?.role as AppRole | undefined) ?? "VIEWER"
}

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
