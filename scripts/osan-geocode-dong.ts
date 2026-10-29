/**
 * 시설명에 N동이 있는 시설만 카카오 「아파트 동」좌표로 갱신한다.
 * 실행: npx tsx scripts/osan-geocode-dong.ts
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import {
  buildApartmentDongQuery,
  geocodeApartmentDong,
  parseBuildingDong,
} from "../src/lib/osan/geocode-dong"
import { haversine } from "../src/lib/osan/route"

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
    // ignore
  }
}

async function main() {
  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SECRET_KEY?.trim()
  const restKey = process.env.KAKAO_REST_API_KEY?.trim()
  if (!url || !key) throw new Error("Supabase env 필요")
  if (!restKey) throw new Error("KAKAO_REST_API_KEY 필요")

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "osan" },
  })

  const { data, error } = await supabase
    .from("facilities")
    .select("id, no, name, lat, lng")
    .order("no")
  if (error) throw error

  const targets = (data ?? []).filter((f) => parseBuildingDong(f.name))
  console.log(`동 번호 시설: ${targets.length}건`)

  let updated = 0
  let skipped = 0
  const failures: string[] = []

  for (const facility of targets) {
    const dong = parseBuildingDong(facility.name)!
    const query = buildApartmentDongQuery(facility.name, dong)
    const anchor =
      facility.lat != null && facility.lng != null
        ? { lat: facility.lat, lng: facility.lng }
        : null
    const geo = await geocodeApartmentDong({
      name: facility.name,
      restKey,
      anchor,
    })
    if (!geo) {
      failures.push(`${facility.no} ${facility.name} :: ${query}`)
      await new Promise((r) => setTimeout(r, 80))
      continue
    }
    if (anchor && haversine(anchor, geo) < 8) {
      skipped += 1
      await new Promise((r) => setTimeout(r, 50))
      continue
    }
    const { error: updateError } = await supabase
      .from("facilities")
      .update({ lat: geo.lat, lng: geo.lng })
      .eq("id", facility.id)
    if (updateError) {
      failures.push(`${facility.no} update: ${updateError.message}`)
    } else {
      updated += 1
      console.log(`✓ ${facility.no} ${facility.name}`)
    }
    await new Promise((r) => setTimeout(r, 100))
  }

  console.log(`\n갱신 ${updated} / 근접스킵 ${skipped} / 실패 ${failures.length}`)
  for (const f of failures) console.log(" -", f)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
