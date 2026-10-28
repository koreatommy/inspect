/**
 * 오산 시설 적재 + 좌표 백필 (1회성, 재실행 가능)
 *
 * 1) 엑셀(있으면) 또는 scripts/osan-facilities.json 을 읽어 osan.facilities upsert
 * 2) lat/lng가 비어 있는 행을 카카오 REST(없으면 Nominatim)로 지오코딩
 *
 * 실행: npx tsx scripts/osan-import.ts
 * 필요 env(.env.local): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 선택 env: KAKAO_REST_API_KEY, OSAN_XLSX_PATH
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import { geocodeAddress } from "../src/lib/osan/geocode"

const DEFAULT_XLSX =
  "/Volumes/eugene_docu/2026년/놀이시설 지도점검/지자체/오산시/자료/오산시_지도점검_150개소_주소추가_데이터.xlsx"

type SeedRow = {
  no: number
  facility_code: string
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
}

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // .env.local 없으면 환경변수에 의존
  }
}

function loadFromExcel(xlsxPath: string): SeedRow[] | null {
  if (!existsSync(xlsxPath)) return null
  const py = `
import json, sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
ws = wb.worksheets[0]
rows = list(ws.iter_rows(values_only=True))
out = []
for r in rows[2:]:
    if r[0] is None: continue
    out.append({
        "no": int(r[0]),
        "facility_code": str(r[1]).strip() if r[1] is not None else "",
        "name": str(r[2]).strip() if r[2] else "",
        "place_type": str(r[3]).strip() if r[3] else None,
        "region": str(r[4]).strip() if r[4] else None,
        "indoor_outdoor": str(r[5]).strip() if r[5] else None,
        "representative": str(r[6]).strip() if r[6] else None,
        "phone": str(r[7]).strip() if r[7] else None,
        "email": str(r[8]).strip() if r[8] else None,
        "safety_manager": str(r[9]).strip() if r[9] else None,
        "inspection_status": str(r[10]).strip() if r[10] else None,
        "address": str(r[11]).strip() if r[11] else None,
    })
print(json.dumps(out, ensure_ascii=False))
`
  const result = spawnSync("python3", ["-c", py, xlsxPath], { encoding: "utf8" })
  if (result.status !== 0) {
    console.warn("엑셀 파싱 실패, JSON 시드로 폴백:", result.stderr.trim())
    return null
  }
  return JSON.parse(result.stdout) as SeedRow[]
}

function loadRows(): SeedRow[] {
  const xlsxPath = process.env.OSAN_XLSX_PATH?.trim() || DEFAULT_XLSX
  const fromExcel = loadFromExcel(xlsxPath)
  if (fromExcel && fromExcel.length > 0) {
    console.log(`엑셀에서 ${fromExcel.length}건 로드: ${xlsxPath}`)
    return fromExcel
  }
  const jsonPath = resolve(process.cwd(), "scripts/osan-facilities.json")
  const rows = JSON.parse(readFileSync(jsonPath, "utf8")) as SeedRow[]
  console.log(`JSON 시드에서 ${rows.length}건 로드`)
  return rows
}

async function main() {
  loadEnvLocal()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SECRET_KEY?.trim()
  const restKey = process.env.KAKAO_REST_API_KEY?.trim()

  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.")
  }
  if (!restKey) {
    console.warn("KAKAO_REST_API_KEY 없음 → Photon 폴백으로 지오코딩합니다.")
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "osan" },
  })

  const rows = loadRows()
  const { error: upsertError } = await supabase.from("facilities").upsert(
    rows.map((row) => ({
      ...row,
      facility_code: row.facility_code || String(row.no),
    })),
    { onConflict: "facility_code" },
  )
  if (upsertError) throw upsertError
  console.log(`upsert 완료: ${rows.length}건`)

  const { data, error } = await supabase
    .from("facilities")
    .select("id, name, address, lat, lng")
    .is("lat", null)

  if (error) throw error
  const missing = data ?? []
  console.log(`지오코딩 대상: ${missing.length}건`)

  let ok = 0
  const failures: string[] = []

  for (const row of missing) {
    if (!row.address) {
      failures.push(`${row.name} (주소 없음)`)
      continue
    }
    const geo = await geocodeAddress(row.address, restKey)
    if (!geo) {
      failures.push(`${row.name} :: ${row.address}`)
      continue
    }
    const { error: updateError } = await supabase
      .from("facilities")
      .update({ lat: geo.lat, lng: geo.lng })
      .eq("id", row.id)
    if (updateError) {
      failures.push(`${row.name} (업데이트 실패: ${updateError.message})`)
      continue
    }
    ok += 1
    await new Promise((r) => setTimeout(r, restKey ? 120 : 250))
  }

  console.log(`\n완료: 성공 ${ok}건 / 실패 ${failures.length}건`)
  if (failures.length > 0) {
    console.log("실패 목록(수동 확인 필요):")
    failures.forEach((f) => console.log(" -", f))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
