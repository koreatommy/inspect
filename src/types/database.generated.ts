export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dataset_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          dataset_id: string | null
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          dataset_id?: string | null
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          dataset_id?: string | null
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_audit_log_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "facility_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          certification_no: string | null
          created_at: string
          equipment_installed_date: string | null
          equipment_location: string | null
          equipment_manage_no: string | null
          equipment_name: string
          equipment_no: string
          equipment_subtype_code: string | null
          equipment_subtype_name: string | null
          equipment_type_code: string | null
          equipment_type_name: string | null
          facility_name: string | null
          facility_no: string
          id: string
          installer_name: string | null
          is_active: boolean
          manufacturer_name: string | null
          raw_json: Json | null
          updated_at: string
        }
        Insert: {
          certification_no?: string | null
          created_at?: string
          equipment_installed_date?: string | null
          equipment_location?: string | null
          equipment_manage_no?: string | null
          equipment_name: string
          equipment_no: string
          equipment_subtype_code?: string | null
          equipment_subtype_name?: string | null
          equipment_type_code?: string | null
          equipment_type_name?: string | null
          facility_name?: string | null
          facility_no: string
          id?: string
          installer_name?: string | null
          is_active?: boolean
          manufacturer_name?: string | null
          raw_json?: Json | null
          updated_at?: string
        }
        Update: {
          certification_no?: string | null
          created_at?: string
          equipment_installed_date?: string | null
          equipment_location?: string | null
          equipment_manage_no?: string | null
          equipment_name?: string
          equipment_no?: string
          equipment_subtype_code?: string | null
          equipment_subtype_name?: string | null
          equipment_type_code?: string | null
          equipment_type_name?: string | null
          facility_name?: string | null
          facility_no?: string
          id?: string
          installer_name?: string | null
          is_active?: boolean
          manufacturer_name?: string | null
          raw_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      facilities: {
        Row: {
          accepted_date: string | null
          closed_date: string | null
          created_at: string
          duty_code: string | null
          duty_type_name: string | null
          facility_area: number | null
          facility_name: string
          facility_no: string
          id: string
          indoor_outdoor_code: string | null
          indoor_outdoor_name: string | null
          install_place_code: string | null
          install_place_name: string | null
          installed_date: string | null
          is_active: boolean
          latitude: number | null
          longitude: number | null
          lot_address: string | null
          operation_status_code: string | null
          operation_status_name: string | null
          public_private_code: string | null
          public_private_name: string | null
          raw_json: Json | null
          region_code: string | null
          region_name: string | null
          road_address: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          accepted_date?: string | null
          closed_date?: string | null
          created_at?: string
          duty_code?: string | null
          duty_type_name?: string | null
          facility_area?: number | null
          facility_name: string
          facility_no: string
          id?: string
          indoor_outdoor_code?: string | null
          indoor_outdoor_name?: string | null
          install_place_code?: string | null
          install_place_name?: string | null
          installed_date?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          lot_address?: string | null
          operation_status_code?: string | null
          operation_status_name?: string | null
          public_private_code?: string | null
          public_private_name?: string | null
          raw_json?: Json | null
          region_code?: string | null
          region_name?: string | null
          road_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          accepted_date?: string | null
          closed_date?: string | null
          created_at?: string
          duty_code?: string | null
          duty_type_name?: string | null
          facility_area?: number | null
          facility_name?: string
          facility_no?: string
          id?: string
          indoor_outdoor_code?: string | null
          indoor_outdoor_name?: string | null
          install_place_code?: string | null
          install_place_name?: string | null
          installed_date?: string | null
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          lot_address?: string | null
          operation_status_code?: string | null
          operation_status_name?: string | null
          public_private_code?: string | null
          public_private_name?: string | null
          raw_json?: Json | null
          region_code?: string | null
          region_name?: string | null
          road_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      facility_dataset_memberships: {
        Row: {
          created_at: string
          dataset_id: string
          facility_no: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          dataset_id: string
          facility_no: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          dataset_id?: string
          facility_no?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_dataset_memberships_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "facility_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_dataset_memberships_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      facility_dataset_uploads: {
        Row: {
          created_at: string
          dataset_id: string
          failed_count: number
          id: string
          result_summary: Json
          source_file: string | null
          success_count: number
          total_count: number
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          dataset_id: string
          failed_count?: number
          id?: string
          result_summary?: Json
          source_file?: string | null
          success_count?: number
          total_count?: number
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          dataset_id?: string
          failed_count?: number
          id?: string
          result_summary?: Json
          source_file?: string | null
          success_count?: number
          total_count?: number
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_dataset_uploads_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "facility_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_datasets: {
        Row: {
          created_at: string
          description: string | null
          facility_count: number
          id: string
          name: string
          source_file: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          facility_count?: number
          id?: string
          name: string
          source_file?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          facility_count?: number
          id?: string
          name?: string
          source_file?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      facility_legal_inspections: {
        Row: {
          created_at: string
          facility_no: string
          id: string
          inspection_date: string | null
          inspection_no: string | null
          inspection_pic: string | null
          inspection_type_code: string | null
          inspection_type_name: string | null
          installed_date: string | null
          judgment_date: string | null
          pass_yn: string | null
          raw_json: Json | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          facility_no: string
          id?: string
          inspection_date?: string | null
          inspection_no?: string | null
          inspection_pic?: string | null
          inspection_type_code?: string | null
          inspection_type_name?: string | null
          installed_date?: string | null
          judgment_date?: string | null
          pass_yn?: string | null
          raw_json?: Json | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          facility_no?: string
          id?: string
          inspection_date?: string | null
          inspection_no?: string | null
          inspection_pic?: string | null
          inspection_type_code?: string | null
          inspection_type_name?: string | null
          installed_date?: string | null
          judgment_date?: string | null
          pass_yn?: string | null
          raw_json?: Json | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_legal_inspections_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      facility_managers: {
        Row: {
          business_no: string | null
          company_name: string | null
          created_at: string
          email: string | null
          facility_no: string
          facility_representative_code: string | null
          facility_representative_name: string | null
          fax_no: string | null
          id: string
          manager_no: string | null
          manager_type_code: string | null
          manager_type_name: string | null
          raw_json: Json | null
          representative_name: string | null
          road_address: string | null
          tel_no: string | null
          updated_at: string
        }
        Insert: {
          business_no?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          facility_no: string
          facility_representative_code?: string | null
          facility_representative_name?: string | null
          fax_no?: string | null
          id?: string
          manager_no?: string | null
          manager_type_code?: string | null
          manager_type_name?: string | null
          raw_json?: Json | null
          representative_name?: string | null
          road_address?: string | null
          tel_no?: string | null
          updated_at?: string
        }
        Update: {
          business_no?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          facility_no?: string
          facility_representative_code?: string | null
          facility_representative_name?: string | null
          fax_no?: string | null
          id?: string
          manager_no?: string | null
          manager_type_code?: string | null
          manager_type_name?: string | null
          raw_json?: Json | null
          representative_name?: string | null
          road_address?: string | null
          tel_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_managers_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      inspection_ledger_rows: {
        Row: {
          caution_items: string | null
          consigned_inspector_name_snapshot: string | null
          consigned_inspector_signature_url: string | null
          facility_name_snapshot: string | null
          facility_no: string
          good_items: string | null
          id: string
          inspection_date: string
          inspection_id: string
          rendered_at: string
          repair_items: string | null
          road_address_snapshot: string | null
          safety_manager_name_snapshot: string | null
          safety_manager_signature_url: string | null
          special_notes: string | null
          stop_use_items: string | null
        }
        Insert: {
          caution_items?: string | null
          consigned_inspector_name_snapshot?: string | null
          consigned_inspector_signature_url?: string | null
          facility_name_snapshot?: string | null
          facility_no: string
          good_items?: string | null
          id?: string
          inspection_date: string
          inspection_id: string
          rendered_at?: string
          repair_items?: string | null
          road_address_snapshot?: string | null
          safety_manager_name_snapshot?: string | null
          safety_manager_signature_url?: string | null
          special_notes?: string | null
          stop_use_items?: string | null
        }
        Update: {
          caution_items?: string | null
          consigned_inspector_name_snapshot?: string | null
          consigned_inspector_signature_url?: string | null
          facility_name_snapshot?: string | null
          facility_no?: string
          good_items?: string | null
          id?: string
          inspection_date?: string
          inspection_id?: string
          rendered_at?: string
          repair_items?: string | null
          road_address_snapshot?: string | null
          safety_manager_name_snapshot?: string | null
          safety_manager_signature_url?: string | null
          special_notes?: string | null
          stop_use_items?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_ledger_rows_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "monthly_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_user_roles: {
        Row: {
          created_at: string
          display_name: string | null
          organization: string
          phone: string | null
          role: string
          status: string
          suspend_reason: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspended_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          organization: string
          phone?: string | null
          role?: string
          status?: string
          suspend_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          organization?: string
          phone?: string | null
          role?: string
          status?: string
          suspend_reason?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      liability_insurances: {
        Row: {
          created_at: string
          facility_no: string
          id: string
          insurance_content: string | null
          insurance_manage_no: string | null
          insurance_policy_no: string | null
          insurance_product_name: string | null
          insurer: string | null
          join_date: string | null
          maturity_date: string | null
          raw_json: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          facility_no: string
          id?: string
          insurance_content?: string | null
          insurance_manage_no?: string | null
          insurance_policy_no?: string | null
          insurance_product_name?: string | null
          insurer?: string | null
          join_date?: string | null
          maturity_date?: string | null
          raw_json?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          facility_no?: string
          id?: string
          insurance_content?: string | null
          insurance_manage_no?: string | null
          insurance_policy_no?: string | null
          insurance_product_name?: string | null
          insurer?: string | null
          join_date?: string | null
          maturity_date?: string | null
          raw_json?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "liability_insurances_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      monthly_inspection_items: {
        Row: {
          certification_no: string | null
          created_at: string
          equipment_location: string | null
          equipment_name: string
          equipment_no: string
          equipment_subtype_name: string | null
          equipment_type_name: string | null
          facility_no: string
          id: string
          inspection_id: string
          note: string | null
          result_status: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          certification_no?: string | null
          created_at?: string
          equipment_location?: string | null
          equipment_name: string
          equipment_no: string
          equipment_subtype_name?: string | null
          equipment_type_name?: string | null
          facility_no: string
          id?: string
          inspection_id: string
          note?: string | null
          result_status?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          certification_no?: string | null
          created_at?: string
          equipment_location?: string | null
          equipment_name?: string
          equipment_no?: string
          equipment_subtype_name?: string | null
          equipment_type_name?: string | null
          facility_no?: string
          id?: string
          inspection_id?: string
          note?: string | null
          result_status?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "monthly_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_inspections: {
        Row: {
          completed_at: string | null
          consigned_inspector_name: string | null
          consigned_inspector_signature_url: string | null
          created_at: string
          created_by: string | null
          dataset_id: string
          facility_no: string
          id: string
          inspection_date: string
          inspection_month: string
          safety_manager_name: string | null
          safety_manager_signature_url: string | null
          special_note_summary: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          consigned_inspector_name?: string | null
          consigned_inspector_signature_url?: string | null
          created_at?: string
          created_by?: string | null
          dataset_id: string
          facility_no: string
          id?: string
          inspection_date: string
          inspection_month: string
          safety_manager_name?: string | null
          safety_manager_signature_url?: string | null
          special_note_summary?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          consigned_inspector_name?: string | null
          consigned_inspector_signature_url?: string | null
          created_at?: string
          created_by?: string | null
          dataset_id?: string
          facility_no?: string
          id?: string
          inspection_date?: string
          inspection_month?: string
          safety_manager_name?: string | null
          safety_manager_signature_url?: string | null
          special_note_summary?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_inspections_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "facility_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_inspections_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      safety_educations: {
        Row: {
          certificate_no: string | null
          created_at: string
          education_date: string | null
          facility_no: string
          id: string
          institution_name: string | null
          raw_json: Json | null
          safety_education_no: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          certificate_no?: string | null
          created_at?: string
          education_date?: string | null
          facility_no: string
          id?: string
          institution_name?: string | null
          raw_json?: Json | null
          safety_education_no?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          certificate_no?: string | null
          created_at?: string
          education_date?: string | null
          facility_no?: string
          id?: string
          institution_name?: string | null
          raw_json?: Json | null
          safety_education_no?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_educations_facility_no_fkey"
            columns: ["facility_no"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_no"]
          },
        ]
      }
      user_dataset_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          dataset_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          dataset_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          dataset_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dataset_assignments_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "facility_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sync_my_account_status: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
