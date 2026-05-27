import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requirePermission } from "@/lib/auth/helpers"
import { loadAdminUserDirectory } from "@/lib/settings/load-admin-users"
import { getServiceRoleClient } from "@/lib/supabase/admin"
import {
  elevatedKeySetupHint,
  resolveElevatedSupabaseKey,
} from "@/lib/supabase/service-key"
import { createClient } from "@/lib/supabase/server"

import { CreateUserForm } from "../create-user-form"
import { UserManagementTable } from "../user-management-table"
import type { DatasetOption } from "../user-dataset-assignment-cell"

export default async function SettingsUsersPage() {
  await requirePermission("user:manage", "/settings")

  let users: Array<{
    user_id: string
    role: string
    email: string | null
    display_name: string | null
    phone: string | null
    organization: string
    status: "active" | "suspended"
    suspended_at: string | null
    suspended_until: string | null
    suspend_reason: string | null
  }> = []

  let missingServiceRole = false
  let directoryError: string | null = null
  const elevatedKey = resolveElevatedSupabaseKey()
  const publishableKeyMistake = elevatedKeySetupHint(elevatedKey)

  if (publishableKeyMistake) {
    directoryError = publishableKeyMistake
  } else {
    const adminClient = getServiceRoleClient()
    if (!adminClient) {
      missingServiceRole = true
    } else {
      const result = await loadAdminUserDirectory(adminClient)
      if (result.listUsersError) {
        directoryError = result.listUsersError
      }
      users = result.users
    }
  }

  // 데이터셋 + 할당 정보 (RLS는 ADMIN 호출자 권한으로 자동 통과)
  const supabase = await createClient()
  const [datasetsRes, assignmentsRes] = await Promise.all([
    supabase
      .from("facility_datasets")
      .select("id,name")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase.from("user_dataset_assignments").select("user_id,dataset_id"),
  ])

  const datasets: DatasetOption[] = datasetsRes.data ?? []
  const assignmentsByUserId: Record<string, string[]> = {}
  for (const row of assignmentsRes.data ?? []) {
    const list = assignmentsByUserId[row.user_id] ?? []
    list.push(row.dataset_id)
    assignmentsByUserId[row.user_id] = list
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          사용자 관리
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          계정 생성·역할 변경·일시 정지·해제를 수행합니다. 역할별 기능 비교는{" "}
          <Link
            href="/manual#user-permissions-matrix"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            사용자 매뉴얼
          </Link>
          을 참고하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 계정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {missingServiceRole ? (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
              사용자 목록·생성을 하려면 서버 환경 변수{" "}
              <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code>
              (또는{" "}
              <code className="rounded bg-muted px-1">SUPABASE_SECRET_KEY</code>)에
              Dashboard의 Secret 키 또는 Legacy{" "}
              <code className="rounded bg-muted px-1">service_role</code> JWT를
              설정해 주세요.
            </p>
          ) : null}
          {directoryError ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              사용자 목록을 불러오지 못했습니다: {directoryError}
            </p>
          ) : null}
          {!missingServiceRole && !publishableKeyMistake ? (
            <CreateUserForm />
          ) : null}
          <UserManagementTable
            users={users}
            datasets={datasets}
            assignmentsByUserId={assignmentsByUserId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
