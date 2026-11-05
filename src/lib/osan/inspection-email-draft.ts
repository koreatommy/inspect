import { formatInspectionCompletedAt } from "@/lib/date"
import type { OsanFacilityWithRelations } from "@/lib/osan/types"

export type InspectionEmailPhotoDraft = {
  photoId: string
  slot: number
  url: string
  included: boolean
  equipmentType: string
  caption: string
}

export type InspectionEmailDraft = {
  facilityId: string
  to: string
  subject: string
  name: string
  facilityCode: string
  placeType: string
  region: string
  indoorOutdoor: string
  address: string
  representative: string
  phone: string
  contactEmail: string
  safetyManager: string
  inspectorName: string
  inspectedAtLabel: string
  notesText: string
  closing: string
  photos: InspectionEmailPhotoDraft[]
}

const DEFAULT_CLOSING =
  "위에 점검 지적사항은 수리 또는 조치후 사진을 hieugenelee@gmail.com으로 송부 바랍니다.(문의 010-2327-1730)\n보내실때 시설번호와 시설명을 꼭 기재해주세요. 감사합니다."

export function createDraftFromFacility(
  facility: OsanFacilityWithRelations,
): InspectionEmailDraft {
  const notesText = facility.notes
    .map((note) => note.content.trim())
    .filter(Boolean)
    .join("\n\n")

  return {
    facilityId: facility.id,
    to: facility.email?.trim() ?? "",
    subject: `[오산 지도점검] ${facility.name} 점검내용 안내`,
    name: facility.name,
    facilityCode: facility.facility_code?.trim() ?? "",
    placeType: facility.place_type?.trim() ?? "",
    region: facility.region?.trim() ?? "",
    indoorOutdoor: facility.indoor_outdoor?.trim() ?? "",
    address: facility.address?.trim() ?? "",
    representative: facility.representative?.trim() ?? "",
    phone: facility.phone?.trim() ?? "",
    contactEmail: facility.email?.trim() ?? "",
    safetyManager: facility.safety_manager?.trim() ?? "",
    inspectorName: facility.inspector_name?.trim() ?? "",
    inspectedAtLabel: formatInspectionCompletedAt(facility.inspected_at),
    notesText,
    closing: DEFAULT_CLOSING,
    photos: [...facility.photos]
      .sort((a, b) => a.slot - b.slot)
      .map((photo) => ({
        photoId: photo.id,
        slot: photo.slot,
        url: photo.url,
        included: true,
        equipmentType: photo.equipment_type?.trim() ?? "",
        caption: photo.caption?.trim() ?? "",
      })),
  }
}
