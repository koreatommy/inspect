import type { AppRole } from "@/types/inspection"

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "시스템 관리자",
  MANAGER: "안전관리자",
  INSPECTOR: "위탁점검자",
  VIEWER: "일반 조회자",
}

export type Permission =
  | "facility:upload"
  | "facility:list"
  | "facility:detail"
  | "inspection:create"
  | "inspection:edit"
  | "inspection:edit-completed"
  | "inspection:complete"
  | "inspection:sign-safety-manager"
  | "inspection:sign-consigned-inspector"
  | "inspection:history"
  | "ledger:print"
  | "user:manage"
  | "settings:inspection-history-manage"
  | "settings:account"
  | "settings:view"

/** 설정 화면 역할 비교표(행 순서·표시명) — ROLE_PERMISSIONS와 동기화합니다. */
export const PERMISSION_MATRIX_ROWS: ReadonlyArray<{
  permission: Permission
  label: string
}> = [
  { permission: "facility:upload", label: "시설 JSON 업로드" },
  { permission: "facility:list", label: "시설 목록 조회" },
  { permission: "facility:detail", label: "시설 상세 조회" },
  { permission: "inspection:create", label: "월간 점검 생성" },
  { permission: "inspection:edit", label: "점검 입력·저장" },
  { permission: "inspection:edit-completed", label: "완료된 점검 수정" },
  { permission: "inspection:complete", label: "점검 완료 처리" },
  { permission: "inspection:sign-safety-manager", label: "안전관리자 서명" },
  {
    permission: "inspection:sign-consigned-inspector",
    label: "위탁점검자 서명",
  },
  { permission: "inspection:history", label: "점검 이력 조회" },
  { permission: "ledger:print", label: "대장 출력" },
  { permission: "user:manage", label: "사용자 관리" },
  {
    permission: "settings:inspection-history-manage",
    label: "점검이력 삭제",
  },
  { permission: "settings:account", label: "자기 정보 관리 (이메일·비밀번호)" },
  { permission: "settings:view", label: "설정 화면" },
]

export const ROLE_MATRIX_COLUMNS: AppRole[] = [
  "ADMIN",
  "MANAGER",
  "INSPECTOR",
  "VIEWER",
]

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  ADMIN: [
    "facility:upload",
    "facility:list",
    "facility:detail",
    "inspection:create",
    "inspection:edit",
    "inspection:edit-completed",
    "inspection:complete",
    "inspection:sign-safety-manager",
    "inspection:sign-consigned-inspector",
    "inspection:history",
    "ledger:print",
    "user:manage",
    "settings:inspection-history-manage",
    "settings:account",
    "settings:view",
  ],
  MANAGER: [
    "facility:list",
    "facility:detail",
    "inspection:create",
    "inspection:edit",
    "inspection:edit-completed",
    "inspection:complete",
    "inspection:sign-safety-manager",
    "inspection:history",
    "ledger:print",
    "settings:inspection-history-manage",
    "settings:account",
    "settings:view",
  ],
  INSPECTOR: [
    "facility:list",
    "facility:detail",
    "inspection:create",
    "inspection:edit",
    "inspection:edit-completed",
    "inspection:complete",
    "inspection:sign-safety-manager",
    "inspection:sign-consigned-inspector",
    "inspection:history",
    "ledger:print",
    "settings:inspection-history-manage",
    "settings:account",
  ],
  VIEWER: [
    "facility:list",
    "facility:detail",
    "inspection:history",
    "ledger:print",
    "settings:account",
  ],
}

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function getPermissions(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}
