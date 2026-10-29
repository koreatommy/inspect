/** 시설번호별 놀이기구 유형 카탈로그 (점검 사진 태그용) */

import catalog from "./facility-equipment-catalog.json"

export type FacilityEquipmentItem = {
  type: string
  equipmentNo: string
}

type FacilityEquipmentCatalogEntry = {
  totalCount: number
  items: FacilityEquipmentItem[]
}

const FACILITY_EQUIPMENT_CATALOG =
  catalog as Record<string, FacilityEquipmentCatalogEntry>

export type FacilityEquipment = {
  totalCount: number
  items: FacilityEquipmentItem[]
  /** 칩·저장용 라벨. 기구는 `유형 (기구번호)`, 공통은 유형명 그대로 */
  types: string[]
}

/** 모든 시설 사진에 공통으로 붙일 수 있는 유형 (놀이기구와 구분) */
export const COMMON_EQUIPMENT_TYPES = [
  "전경",
  "안전수칙판",
  "기타(부대시설)",
] as const

const COMMON_EQUIPMENT_TYPE_SET = new Set<string>(COMMON_EQUIPMENT_TYPES)

export function formatEquipmentChipLabel(item: FacilityEquipmentItem): string {
  return `${item.type} (${item.equipmentNo})`
}

/** 칩 라벨을 표시용 이름·기구번호로 분리 (`유형 (번호)` / 공통은 번호 없음) */
export function parseEquipmentChipLabel(label: string): {
  name: string
  equipmentNo: string | null
} {
  if (isCommonEquipmentType(label)) {
    return { name: label, equipmentNo: null }
  }
  const match = label.match(/^(.*) \(([^)]+)\)$/)
  if (!match) return { name: label, equipmentNo: null }
  return { name: match[1], equipmentNo: match[2] }
}

export function isCommonEquipmentType(type: string): boolean {
  return COMMON_EQUIPMENT_TYPE_SET.has(type)
}

export function splitEquipmentTypes(types: string[]): {
  equipmentTypes: string[]
  commonTypes: string[]
} {
  return {
    equipmentTypes: types.filter((type) => !isCommonEquipmentType(type)),
    commonTypes: COMMON_EQUIPMENT_TYPES.filter((type) => types.includes(type)),
  }
}

export function getFacilityEquipment(
  facilityCode: string | null | undefined,
): FacilityEquipment | null {
  if (!facilityCode) return null
  const equipment = FACILITY_EQUIPMENT_CATALOG[facilityCode]
  if (!equipment) return null

  const types = equipment.items.map(formatEquipmentChipLabel)
  for (const common of COMMON_EQUIPMENT_TYPES) {
    if (!types.includes(common)) types.push(common)
  }

  return {
    totalCount: equipment.totalCount,
    items: equipment.items,
    types,
  }
}
