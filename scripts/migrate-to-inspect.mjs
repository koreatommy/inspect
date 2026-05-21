/**
 * ystart -> inspect 데이터 이전 스크립트
 * MCP agent-tools 파일에서 JSON 추출 후 SQL INSERT 생성
 */
import { readFileSync, writeFileSync } from "fs"
import path from "path"

const TOOLS_DIR =
  "/Users/eugene/.cursor/projects/Users-eugene-Documents-inspect/agent-tools"

// MCP output 파일에서 JSON 배열 추출
// agent-tools 파일은 {"result":"... <untrusted-data>...[{...}]...</untrusted-data> ..."} 형태
function extractJson(filePath) {
  const content = readFileSync(filePath, "utf8")
  let innerText

  // 방법 1: 외부 JSON 객체 파싱 후 result 문자열 추출
  try {
    const outer = JSON.parse(content)
    if (outer.result) {
      innerText = outer.result
    }
  } catch {
    // JSON이 아닌 경우 raw 텍스트 사용
    innerText = content
  }

  if (!innerText) throw new Error(`No result text in ${filePath}`)

  // <untrusted-data-...> ... </untrusted-data-...> 에서 JSON 배열 추출 (가장 안쪽)
  // innerText 안에서 "[{" 로 시작하는 JSON 배열 찾기
  const start = innerText.indexOf("[{")
  if (start === -1) throw new Error(`JSON array not found in ${filePath}`)

  let raw = innerText.slice(start)
  raw = raw.replace(/<\/untrusted-data-[^>]+>[\s\S]*$/, "").trimEnd()

  const parsed = JSON.parse(raw)
  if (Array.isArray(parsed) && parsed[0]?.json_agg) {
    return parsed[0].json_agg
  }
  return parsed
}

// 값을 SQL 리터럴로 변환
function toSqlLiteral(val) {
  if (val === null || val === undefined) return "NULL"
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE"
  if (typeof val === "number") return String(val)
  if (typeof val === "object") {
    // jsonb
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
  }
  // string (날짜 포함)
  return `'${String(val).replace(/'/g, "''")}'`
}

// 행 배열 -> INSERT SQL
function buildInsert(table, rows, columns) {
  if (!rows || rows.length === 0) return `-- ${table}: 0 rows, skipped\n`
  const lines = rows.map((row) => {
    const vals = columns.map((col) => toSqlLiteral(row[col]))
    return `  (${vals.join(", ")})`
  })
  return (
    `INSERT INTO public.${table} (${columns.map((c) => `"${c}"`).join(", ")})\nVALUES\n${lines.join(",\n")}\nON CONFLICT DO NOTHING;\n\n`
  )
}

// --- 파일 ID 매핑 ---
const FILES = {
  facilities: "7c14ba7e-e451-4160-b570-0e73aeefdbf6",
  equipment: "dd5db27c-697e-48ab-9701-8032881979b3",
  facility_legal_inspections: "0adbd560-7fd7-4e1a-a7d5-c6c68deb96ef",
  safety_educations: "dd834735-dad2-4a4d-b01a-be387f04d375",
  liability_insurances: "a27b20bd-d56f-461c-9dbb-2b628bc77c8e",
  facility_managers: "93f99ea2-3968-4929-a6b8-b47355ebcfb5",
}

// --- monthly_inspections (인라인) ---
const MONTHLY_INSPECTIONS = [
  {
    id: "923a642d-e9c9-4eab-be04-6b1779aee74c",
    facility_no: "27835",
    inspection_month: "2026-04",
    inspection_date: "2026-04-30",
    status: "draft",
    safety_manager_name: null,
    consigned_inspector_name: null,
    safety_manager_signature_url: null,
    consigned_inspector_signature_url: null,
    special_note_summary: null,
    completed_at: null,
    created_at: "2026-04-30T12:45:17.408498+00:00",
    updated_at: "2026-04-30T12:45:17.408498+00:00",
  },
  {
    id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1",
    facility_no: "35631",
    inspection_month: "2026-05",
    inspection_date: "2026-05-02",
    status: "draft",
    safety_manager_name: null,
    consigned_inspector_name: null,
    safety_manager_signature_url: null,
    consigned_inspector_signature_url: null,
    special_note_summary: null,
    completed_at: null,
    created_at: "2026-05-01T23:47:07.082844+00:00",
    updated_at: "2026-05-01T23:47:07.082844+00:00",
  },
]

// --- monthly_inspection_items (인라인) ---
const MONTHLY_INSPECTION_ITEMS = [
  { id: "b3858654-e59c-4518-af62-e00f080b5822", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "2008110", equipment_name: "그네", equipment_type_name: "그네", equipment_subtype_name: "1형", equipment_location: "", certification_no: "KCR14-22-00099", result_status: "GOOD", note: null, sort_order: 1, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "2b653636-b60c-44bd-a234-e23543f4bdd0", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "2008111", equipment_name: "미끄럼틀", equipment_type_name: "미끄럼틀", equipment_subtype_name: "독립", equipment_location: "", certification_no: "KCR14-22-00099", result_status: "GOOD", note: null, sort_order: 2, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "75496765-4f0e-42c5-a4d9-8fdf9adf558f", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "2008113", equipment_name: "오르는기구", equipment_type_name: "오르는기구", equipment_subtype_name: "", equipment_location: "", certification_no: "KCR14-22-00099", result_status: "GOOD", note: null, sort_order: 3, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "68103d3b-4463-42ca-9789-626a9e9c3b0b", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "1614773", equipment_name: "조합놀이대", equipment_type_name: "조합놀이대", equipment_subtype_name: "", equipment_location: null, certification_no: "A123H060-3018B", result_status: "GOOD", note: null, sort_order: 4, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "c4cec671-835d-43a6-bb5f-7eb057fb4c7f", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "1614770", equipment_name: "충격흡수용표면재(모래)", equipment_type_name: "충격흡수용표면재(모래)", equipment_subtype_name: "", equipment_location: null, certification_no: null, result_status: "GOOD", note: null, sort_order: 5, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "92d8b851-929a-4dc9-b97f-be14bd65ced9", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "2024742", equipment_name: "충격흡수용표면재(포설도포바닥재)", equipment_type_name: "충격흡수용표면재(포설도포바닥재)", equipment_subtype_name: "", equipment_location: "", certification_no: null, result_status: "GOOD", note: null, sort_order: 6, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "f11402da-9bb3-4171-a680-90356cf0455c", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "2008112", equipment_name: "흔들놀이기구", equipment_type_name: "흔들놀이기구", equipment_subtype_name: "1형", equipment_location: "", certification_no: "KCR14-22-00099", result_status: "GOOD", note: null, sort_order: 7, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "c3af1bd6-5284-46c5-9faa-a4a0a0229ce5", inspection_id: "4b10a8c7-4670-41cc-9276-c20dd21cfef1", facility_no: "35631", equipment_no: "1614776", equipment_name: "흔들놀이기구", equipment_type_name: "흔들놀이기구", equipment_subtype_name: "", equipment_location: null, certification_no: "A123H060-4014A", result_status: "GOOD", note: null, sort_order: 8, created_at: "2026-05-01T23:47:07.168657+00:00", updated_at: "2026-05-01T23:47:07.168657+00:00" },
  { id: "6136128a-c69c-4935-a03f-33fea52465be", inspection_id: "923a642d-e9c9-4eab-be04-6b1779aee74c", facility_no: "27835", equipment_no: "1594906", equipment_name: "조합놀이대", equipment_type_name: "조합놀이대", equipment_subtype_name: "", equipment_location: null, certification_no: "CA021H034-8004A", result_status: "GOOD", note: null, sort_order: 1, created_at: "2026-04-30T12:45:17.451554+00:00", updated_at: "2026-04-30T12:45:17.451554+00:00" },
  { id: "35696063-4638-4f6d-abac-6adbbc74cea3", inspection_id: "923a642d-e9c9-4eab-be04-6b1779aee74c", facility_no: "27835", equipment_no: "1594907", equipment_name: "충격흡수용표면재(모래)", equipment_type_name: "충격흡수용표면재(모래)", equipment_subtype_name: "", equipment_location: null, certification_no: null, result_status: "GOOD", note: null, sort_order: 2, created_at: "2026-04-30T12:45:17.451554+00:00", updated_at: "2026-04-30T12:45:17.451554+00:00" },
]

// --- SQL 생성 ---
let sql = `-- ystart -> inspect 데이터 이전\n-- 생성일: ${new Date().toISOString()}\n\nSET session_replication_role = 'replica'; -- FK 체크 일시 비활성화\n\n`

// 1. facilities
console.log("Loading facilities...")
const facilities = extractJson(path.join(TOOLS_DIR, `${FILES.facilities}.txt`))
sql += buildInsert("facilities", facilities, [
  "id","facility_no","facility_name","zip_code","lot_address","road_address",
  "installed_date","accepted_date","closed_date","facility_area",
  "install_place_code","install_place_name","duty_code","duty_type_name",
  "public_private_code","public_private_name","operation_status_code",
  "operation_status_name","indoor_outdoor_code","indoor_outdoor_name",
  "region_code","region_name","latitude","longitude","raw_json",
  "is_active","created_at","updated_at",
])
console.log(`  facilities: ${facilities.length} rows`)

// 2. equipment
console.log("Loading equipment...")
const equipment = extractJson(path.join(TOOLS_DIR, `${FILES.equipment}.txt`))
sql += buildInsert("equipment", equipment, [
  "id","facility_no","equipment_no","facility_name","equipment_name",
  "equipment_manage_no","equipment_location","equipment_installed_date",
  "installer_name","manufacturer_name","certification_no",
  "equipment_type_code","equipment_type_name","equipment_subtype_code",
  "equipment_subtype_name","raw_json","is_active","created_at","updated_at",
])
console.log(`  equipment: ${equipment.length} rows`)

// 3. facility_legal_inspections
console.log("Loading facility_legal_inspections...")
const fli = extractJson(path.join(TOOLS_DIR, `${FILES.facility_legal_inspections}.txt`))
sql += buildInsert("facility_legal_inspections", fli, [
  "id","facility_no","inspection_type_code","inspection_type_name",
  "installed_date","valid_until","pass_yn","inspection_date","judgment_date",
  "inspection_no","inspection_pic","raw_json","created_at","updated_at",
])
console.log(`  facility_legal_inspections: ${fli.length} rows`)

// 4. safety_educations
console.log("Loading safety_educations...")
const se = extractJson(path.join(TOOLS_DIR, `${FILES.safety_educations}.txt`))
sql += buildInsert("safety_educations", se, [
  "id","facility_no","safety_education_no","certificate_no","education_date",
  "valid_until","institution_name","raw_json","created_at","updated_at",
])
console.log(`  safety_educations: ${se.length} rows`)

// 5. liability_insurances
console.log("Loading liability_insurances...")
const li = extractJson(path.join(TOOLS_DIR, `${FILES.liability_insurances}.txt`))
sql += buildInsert("liability_insurances", li, [
  "id","facility_no","insurance_manage_no","insurance_product_name",
  "join_date","maturity_date","insurance_policy_no","insurer",
  "insurance_content","raw_json","created_at","updated_at",
])
console.log(`  liability_insurances: ${li.length} rows`)

// 6. facility_managers
console.log("Loading facility_managers...")
const fm = extractJson(path.join(TOOLS_DIR, `${FILES.facility_managers}.txt`))
sql += buildInsert("facility_managers", fm, [
  "id","facility_no","manager_no","business_no","company_name",
  "representative_name","tel_no","fax_no","email","road_address",
  "facility_representative_code","facility_representative_name",
  "manager_type_code","manager_type_name","raw_json","created_at","updated_at",
])
console.log(`  facility_managers: ${fm.length} rows`)

// 7. monthly_inspections (created_by = NULL 로 이전)
sql += buildInsert("monthly_inspections", MONTHLY_INSPECTIONS, [
  "id","facility_no","inspection_month","inspection_date","status",
  "safety_manager_name","consigned_inspector_name",
  "safety_manager_signature_url","consigned_inspector_signature_url",
  "special_note_summary","completed_at","created_at","updated_at",
])
console.log(`  monthly_inspections: ${MONTHLY_INSPECTIONS.length} rows`)

// 8. monthly_inspection_items
sql += buildInsert("monthly_inspection_items", MONTHLY_INSPECTION_ITEMS, [
  "id","inspection_id","facility_no","equipment_no","equipment_name",
  "equipment_type_name","equipment_subtype_name","equipment_location",
  "certification_no","result_status","note","sort_order","created_at","updated_at",
])
console.log(`  monthly_inspection_items: ${MONTHLY_INSPECTION_ITEMS.length} rows`)

sql += `SET session_replication_role = 'origin'; -- FK 체크 복원\n`

const outFile = "/tmp/inspect-data-migration.sql"
writeFileSync(outFile, sql, "utf8")
console.log(`\nSQL 파일 생성: ${outFile} (${(sql.length / 1024).toFixed(1)} KB)`)
