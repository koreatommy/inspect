export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type FacilityRow = {
  id: string
  facility_no: string
  facility_name: string
  zip_code: string | null
  lot_address: string | null
  road_address: string | null
  installed_date: string | null
  accepted_date: string | null
  closed_date: string | null
  facility_area: number | null
  install_place_code: string | null
  install_place_name: string | null
  duty_code: string | null
  duty_type_name: string | null
  public_private_code: string | null
  public_private_name: string | null
  operation_status_code: string | null
  operation_status_name: string | null
  indoor_outdoor_code: string | null
  indoor_outdoor_name: string | null
  region_code: string | null
  region_name: string | null
  latitude: number | null
  longitude: number | null
  raw_json: Json | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EquipmentRow = {
  id: string
  facility_no: string
  equipment_no: string
  facility_name: string | null
  equipment_name: string
  equipment_manage_no: string | null
  equipment_location: string | null
  equipment_installed_date: string | null
  installer_name: string | null
  manufacturer_name: string | null
  certification_no: string | null
  equipment_type_code: string | null
  equipment_type_name: string | null
  equipment_subtype_code: string | null
  equipment_subtype_name: string | null
  raw_json: Json | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MonthlyInspectionRow = {
  id: string
  facility_no: string
  inspection_month: string
  inspection_date: string
  status: "draft" | "completed" | "needs_revision" | "locked"
  safety_manager_name: string | null
  consigned_inspector_name: string | null
  safety_manager_signature_url: string | null
  consigned_inspector_signature_url: string | null
  special_note_summary: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type MonthlyInspectionItemRow = {
  id: string
  inspection_id: string
  facility_no: string
  equipment_no: string
  equipment_name: string
  equipment_type_name: string | null
  equipment_subtype_name: string | null
  equipment_location: string | null
  certification_no: string | null
  result_status: "GOOD" | "CAUTION" | "REPAIR" | "STOP_USE"
  note: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type LedgerRow = {
  id: string
  inspection_id: string
  facility_no: string
  facility_name_snapshot: string | null
  road_address_snapshot: string | null
  inspection_date: string
  good_items: string | null
  caution_items: string | null
  repair_items: string | null
  stop_use_items: string | null
  special_notes: string | null
  safety_manager_name_snapshot: string | null
  consigned_inspector_name_snapshot: string | null
  safety_manager_signature_url: string | null
  consigned_inspector_signature_url: string | null
  rendered_at: string
}

export type FacilityLegalInspectionRow = {
  id: string
  facility_no: string
  inspection_type_code: string | null
  inspection_type_name: string | null
  installed_date: string | null
  valid_until: string | null
  pass_yn: string | null
  inspection_date: string | null
  judgment_date: string | null
  inspection_no: string | null
  inspection_pic: string | null
  raw_json: Json | null
  created_at: string
  updated_at: string
}

export type SafetyEducationRow = {
  id: string
  facility_no: string
  safety_education_no: string | null
  certificate_no: string | null
  education_date: string | null
  valid_until: string | null
  institution_name: string | null
  raw_json: Json | null
  created_at: string
  updated_at: string
}

export type LiabilityInsuranceRow = {
  id: string
  facility_no: string
  insurance_manage_no: string | null
  insurance_product_name: string | null
  join_date: string | null
  maturity_date: string | null
  insurance_policy_no: string | null
  insurer: string | null
  insurance_content: string | null
  raw_json: Json | null
  created_at: string
  updated_at: string
}

export type FacilityManagerRow = {
  id: string
  facility_no: string
  manager_no: string | null
  business_no: string | null
  company_name: string | null
  representative_name: string | null
  tel_no: string | null
  fax_no: string | null
  email: string | null
  road_address: string | null
  facility_representative_code: string | null
  facility_representative_name: string | null
  manager_type_code: string | null
  manager_type_name: string | null
  raw_json: Json | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      facilities: TableDefinition<FacilityRow>
      equipment: TableDefinition<EquipmentRow>
      facility_legal_inspections: TableDefinition<FacilityLegalInspectionRow>
      safety_educations: TableDefinition<SafetyEducationRow>
      liability_insurances: TableDefinition<LiabilityInsuranceRow>
      facility_managers: TableDefinition<FacilityManagerRow>
      monthly_inspections: TableDefinition<MonthlyInspectionRow>
      monthly_inspection_items: TableDefinition<MonthlyInspectionItemRow>
      inspection_ledger_rows: TableDefinition<LedgerRow>
      inspection_user_roles: TableDefinition<{
        user_id: string
        role: "ADMIN" | "MANAGER" | "INSPECTOR" | "VIEWER"
        display_name: string | null
        phone: string | null
        created_at: string
        updated_at: string
      }>
      profiles: TableDefinition<Record<string, unknown>>
      admin_memos: TableDefinition<Record<string, unknown>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
