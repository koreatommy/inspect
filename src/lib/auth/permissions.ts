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

export type PermissionMatrixGroup = "시설" | "점검" | "계정·설정"

/** 설정 화면 역할 비교표(행 순서·표시명) — ROLE_PERMISSIONS와 동기화합니다. */
export const PERMISSION_MATRIX_ROWS: ReadonlyArray<{
  permission: Permission
  label: string
  group: PermissionMatrixGroup
}> = [
  { permission: "facility:upload", label: "시설 JSON 업로드", group: "시설" },
  { permission: "facility:list", label: "시설 목록 조회", group: "시설" },
  { permission: "facility:detail", label: "시설 상세 조회", group: "시설" },
  { permission: "inspection:create", label: "월간 점검 생성", group: "점검" },
  { permission: "inspection:edit", label: "점검 입력·저장", group: "점검" },
  {
    permission: "inspection:edit-completed",
    label: "완료된 점검 수정",
    group: "점검",
  },
  { permission: "inspection:complete", label: "점검 완료 처리", group: "점검" },
  {
    permission: "inspection:sign-safety-manager",
    label: "안전관리자 서명",
    group: "점검",
  },
  {
    permission: "inspection:sign-consigned-inspector",
    label: "위탁점검자 서명",
    group: "점검",
  },
  { permission: "inspection:history", label: "점검 이력 조회", group: "점검" },
  { permission: "ledger:print", label: "대장 출력", group: "점검" },
  {
    permission: "settings:inspection-history-manage",
    label: "점검이력 삭제",
    group: "점검",
  },
  { permission: "user:manage", label: "사용자 관리", group: "계정·설정" },
  {
    permission: "settings:account",
    label: "자기 정보 관리 (이름·소속·전화번호·비밀번호)",
    group: "계정·설정",
  },
  {
    permission: "settings:view",
    label: "설정 화면 (서명 정책 등)",
    group: "계정·설정",
  },
]

export const PERMISSION_MATRIX_GROUPS: PermissionMatrixGroup[] = [
  "시설",
  "점검",
  "계정·설정",
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
