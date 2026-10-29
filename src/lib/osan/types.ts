/** 오산 지도점검 임시 페이지 도메인 타입 (osan 스키마) */

export type OsanFacility = {
  id: string
  no: number | null
  facility_code: string | null
  name: string
  place_type: string | null
  region: string | null
  indoor_outdoor: string | null
  representative: string | null
  phone: string | null
  email: string | null
  safety_manager: string | null
  inspection_status: string | null
  address: string | null
  lat: number | null
  lng: number | null
  visited: boolean
  created_at: string
  updated_at: string
}

export type OsanPhoto = {
  id: string
  facility_id: string
  slot: number
  storage_path: string
  equipment_type: string | null
  caption: string | null
  created_at: string
}

export type OsanPhotoWithUrl = OsanPhoto & { url: string }

export type OsanNote = {
  id: string
  facility_id: string
  content: string
  created_at: string
  updated_at: string
}

export type OsanFacilityWithRelations = OsanFacility & {
  photos: OsanPhotoWithUrl[]
  notes: OsanNote[]
}

export const PLACE_TYPES = [
  "주택단지",
  "어린이집",
  "놀이제공영업소",
  "대규모점포",
  "주상복합",
] as const
