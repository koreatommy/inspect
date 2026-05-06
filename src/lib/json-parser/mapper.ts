import type { Json } from "@/types/database"

import type { FacilityJson } from "./validator"

function compactAddress(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ").trim() || null
}

function toDate(value: string | null | undefined) {
  if (!value || !/^\d{8}$/.test(value)) {
    return null
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
}

function toNumber(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeEquipmentName(
  rideNm: string | null | undefined,
  rideStylCdNm: string | null | undefined,
  rideSn: string
) {
  const preferred = rideNm?.trim()
  if (preferred) {
    return preferred
  }

  const fallbackByType = rideStylCdNm?.trim()
  if (fallbackByType) {
    return fallbackByType
  }

  return `기구-${rideSn}`
}

export function mapFacility(json: FacilityJson) {
  const { basic } = json

  return {
    facility_no: basic.pfctSn,
    facility_name: basic.pfctNm,
    zip_code: basic.zip ?? null,
    lot_address: compactAddress(basic.lotnoAddr, basic.lotnoDaddr),
    road_address: compactAddress(basic.ronaAddr, basic.ronaDaddr),
    installed_date: toDate(basic.instlYmd),
    accepted_date: toDate(basic.acptnYmd),
    closed_date: toDate(basic.clsgYmd),
    facility_area: toNumber(basic.fcar),
    install_place_code: basic.instlPlaceCd ?? null,
    install_place_name: basic.instlPlaceCdNm ?? null,
    duty_code: basic.dutyCd ?? null,
    duty_type_name: basic.dutyCdNm ?? null,
    public_private_code: basic.prvtPblcYnCd ?? null,
    public_private_name: basic.prvtPblcYnCdNm ?? null,
    operation_status_code: basic.operYnCd ?? null,
    operation_status_name: basic.operYnCdNm ?? null,
    indoor_outdoor_code: basic.idrodrCd ?? null,
    indoor_outdoor_name: basic.idrodrCdNm ?? null,
    region_code: basic.rgnCd ?? null,
    region_name: basic.rgnCdNm ?? null,
    latitude: toNumber(basic.latCrtsVl),
    longitude: toNumber(basic.lotCrtsVl),
    raw_json: json.basic,
    is_active: true,
  }
}

export function mapEquipment(json: FacilityJson) {
  return json.equipment.map((equipment) => ({
    facility_no: json.basic.pfctSn,
    equipment_no: equipment.rideSn,
    facility_name: equipment.pfctNm ?? json.basic.pfctNm,
    equipment_name: normalizeEquipmentName(
      equipment.rideNm,
      equipment.rideStylCdNm,
      equipment.rideSn
    ),
    equipment_manage_no: equipment.rideNo ?? null,
    equipment_location: equipment.rideLctn ?? null,
    equipment_installed_date: toDate(equipment.rideInstlYmd),
    installer_name: equipment.instlFrmNm ?? null,
    manufacturer_name: equipment.mnftrFrmNm ?? null,
    certification_no: equipment.certNo ?? null,
    equipment_type_code: equipment.rideStylCd ?? null,
    equipment_type_name: equipment.rideStylCdNm ?? null,
    equipment_subtype_code: equipment.rideStylSbCd ?? null,
    equipment_subtype_name: equipment.rideStylSbCdNm ?? null,
    raw_json: equipment,
    is_active: true,
  }))
}

export function mapRelatedFacilitySections(json: FacilityJson) {
  const facility_no = json.basic.pfctSn

  return {
    legalInspection: json.inspection
      ? {
          facility_no,
          inspection_type_code: String(json.inspection.inspKndCd ?? "") || null,
          inspection_type_name:
            String(json.inspection.inspKndCdNm ?? "") || null,
          installed_date: toDate(String(json.inspection.instlYmd ?? "")),
          valid_until: toDate(String(json.inspection.vldYmd ?? "")),
          pass_yn: String(json.inspection.passYn ?? "") || null,
          inspection_date: toDate(String(json.inspection.inspYmd ?? "")),
          judgment_date: toDate(String(json.inspection.jgmtYmd ?? "")),
          inspection_no: String(json.inspection.inspNo ?? "") || null,
          inspection_pic: String(json.inspection.inspPic ?? "") || null,
          raw_json: json.inspection as Json,
        }
      : null,
    safetyEducation: json.education
      ? {
          facility_no,
          safety_education_no: String(json.education.sftyEduSn ?? "") || null,
          certificate_no: String(json.education.cfacNo ?? "") || null,
          education_date: toDate(String(json.education.eduYmd ?? "")),
          valid_until: toDate(String(json.education.vldYmd ?? "")),
          institution_name: String(json.education.instNm ?? "") || null,
          raw_json: json.education as Json,
        }
      : null,
    liabilityInsurance: json.insurance
      ? {
          facility_no,
          insurance_manage_no: String(json.insurance.insrncMngSn ?? "") || null,
          insurance_product_name:
            String(json.insurance.insrncGdsNm ?? "") || null,
          join_date: toDate(String(json.insurance.joinYmd ?? "")),
          maturity_date: toDate(String(json.insurance.mtryYmd ?? "")),
          insurance_policy_no:
            String(json.insurance.insrncEvdoNo ?? "") || null,
          insurer: String(json.insurance.insu ?? "") || null,
          insurance_content: String(json.insurance.insrncCn ?? "") || null,
          raw_json: json.insurance as Json,
        }
      : null,
    facilityManager: json.manager
      ? {
          facility_no,
          manager_no: String(json.manager.mngMabdPicSn ?? "") || null,
          business_no: String(json.manager.bzmnNo ?? "") || null,
          company_name: String(json.manager.conm ?? "") || null,
          representative_name: String(json.manager.rprsvFlnm ?? "") || null,
          tel_no: String(json.manager.telno ?? "") || null,
          fax_no: String(json.manager.fxno ?? "") || null,
          email: String(json.manager.eml ?? "") || null,
          road_address: compactAddress(
            String(json.manager.ronaAddr ?? ""),
            String(json.manager.ronaDaddr ?? "")
          ),
          facility_representative_code:
            String(json.manager.fctyReperSeCd ?? "") || null,
          facility_representative_name:
            String(json.manager.fctyReperSeCdNm ?? "") || null,
          manager_type_code: String(json.manager.mngMabdSeCd ?? "") || null,
          manager_type_name: String(json.manager.mngMabdSeCdNm ?? "") || null,
          raw_json: json.manager as Json,
        }
      : null,
  }
}
