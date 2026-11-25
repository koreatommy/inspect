/**
 * PDF 지도점검 결과 → osan 23곳 사진·메모·점검완료 일괄 입력
 *
 * 실행: npx tsx scripts/osan-import-pdf-inspections.ts
 * 사전: /tmp/osan-pdf-jpgs/photo-00.jpg … photo-28.jpg 존재
 * 스킵: 31437, 582282 (기존 점검 유지)
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

const BUCKET = "osan-photos"
const INSPECTOR = "이영일"
const INSPECTED_AT = "2026-09-01T09:00:00+09:00"
const SKIP = new Set(["31437", "582282"])
const PHOTO_DIR = "/tmp/osan-pdf-jpgs"

type PhotoSpec = {
  file: string
  equipmentType: string
  caption: string
}

type FacilitySpec = {
  facilityCode: string
  photos: PhotoSpec[]
  note: string
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
    /* ignore */
  }
}

/** 운암2단지 요주의(합격증) 공통 사진 패턴 */
function cautionPhotos(
  signFile: string,
  certFile: string,
  equipmentCaption: string,
): PhotoSpec[] {
  return [
    {
      file: signFile,
      equipmentType: "안전수칙판",
      caption: equipmentCaption,
    },
    {
      file: certFile,
      equipmentType: "기타(부대시설)",
      caption: "안전검사 합격의 표시 부착 필요 (즉시조치)",
    },
  ]
}

function overviewPhoto(file: string, caption: string): PhotoSpec[] {
  return [{ file, equipmentType: "전경", caption }]
}

function noteWithPassCaution(equipmentLines: string): string {
  return `${equipmentLines}\n합격증 게시 보통 — 안전검사 합격의 표시 부착 필요, 즉시조치`
}

const FACILITIES: FacilitySpec[] = [
  {
    facilityCode: "1898",
    photos: cautionPhotos(
      "photo-00.jpg",
      "photo-01.jpg",
      "흔들놀이기구 4기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: noteWithPassCaution(
      [
        "흔들놀이기구1~4: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
        "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
        "충격흡수용표면재: 고무바닥재 경화·탄성도·패임 정도 — 양호",
      ].join("\n"),
    ),
  },
  {
    facilityCode: "1899",
    photos: cautionPhotos(
      "photo-02.jpg",
      "photo-03.jpg",
      "그네·흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: noteWithPassCaution(
      [
        "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
        "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
        "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
        "충격흡수용표면재: 고무바닥재 경화·탄성도·패임 정도 — 양호",
      ].join("\n"),
    ),
  },
  {
    facilityCode: "1900",
    photos: cautionPhotos(
      "photo-04.jpg",
      "photo-05.jpg",
      "그네·흔들놀이기구 3기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: noteWithPassCaution(
      [
        "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
        "흔들놀이기구1~3: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
        "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
        "충격흡수용표면재: 고무바닥재 경화·탄성도·패임 정도 — 양호",
      ].join("\n"),
    ),
  },
  {
    facilityCode: "24411",
    photos: cautionPhotos(
      "photo-06.jpg",
      "photo-07.jpg",
      "흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: noteWithPassCaution(
      [
        "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
        "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
        "충격흡수용표면재: 고무바닥재 경화·탄성도·패임 정도 — 양호",
      ].join("\n"),
    ),
  },
  {
    facilityCode: "2004",
    photos: overviewPhoto(
      "photo-08.jpg",
      "그네·흔들놀이기구 5기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
      "흔들놀이기구1~5: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 포설바닥재 경화·탄성도·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "2006",
    photos: overviewPhoto(
      "photo-09.jpg",
      "그네·흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
      "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 포설바닥재 경화·탄성도·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "2007",
    photos: overviewPhoto(
      "photo-10.jpg",
      "그네·흔들놀이기구 4기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
      "흔들놀이기구1~4: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "2008",
    photos: overviewPhoto(
      "photo-11.jpg",
      "흔들놀이기구 3기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~3: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "2005",
    photos: overviewPhoto(
      "photo-12.jpg",
      "그네·흔들놀이기구 4기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
      "흔들놀이기구1~4: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "41371",
    photos: overviewPhoto(
      "photo-13.jpg",
      "흔들놀이기구·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대1: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "41994",
    photos: overviewPhoto(
      "photo-14.jpg",
      "흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "41372",
    photos: overviewPhoto(
      "photo-15.jpg",
      "흔들놀이기구·오르는기구·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "오르는기구: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "41370",
    photos: overviewPhoto(
      "photo-16.jpg",
      "흔들놀이기구·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "41369",
    photos: overviewPhoto(
      "photo-17.jpg",
      "조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  // 31437 skipped (photo-18)
  {
    facilityCode: "582099",
    photos: overviewPhoto(
      "photo-19.jpg",
      "흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  // 582282 skipped (photo-20)
  {
    facilityCode: "26819",
    photos: overviewPhoto(
      "photo-21.jpg",
      "흔들놀이기구·기타·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "기타: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "26818",
    photos: overviewPhoto(
      "photo-22.jpg",
      "그네·흔들놀이기구 4기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "그네: 회동부, 안장판 고정상태 및 부식여부 등 — 양호",
      "흔들놀이기구1~4: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대1: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "26816",
    photos: overviewPhoto(
      "photo-23.jpg",
      "흔들놀이기구 3기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~3: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "27018",
    photos: overviewPhoto(
      "photo-24.jpg",
      "흔들놀이기구 4기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~4: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "36019",
    photos: overviewPhoto(
      "photo-25.jpg",
      "조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "36020",
    photos: overviewPhoto(
      "photo-26.jpg",
      "조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "37240",
    photos: overviewPhoto(
      "photo-27.jpg",
      "흔들놀이기구 2기·조합놀이대·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
  {
    facilityCode: "33608",
    photos: overviewPhoto(
      "photo-28.jpg",
      "흔들놀이기구 2기·조합놀이대·기타·충격흡수용표면재 양호",
    ),
    note: [
      "흔들놀이기구1~2: 기초부, 짓눌림, 손잡이 고정상태 등 — 양호",
      "조합놀이대: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "기타: 표면부식, 얽매임, 파손, 하강공간 기초부 등 — 양호",
      "충격흡수용표면재: 바닥재 경화·탄성도·갈라짐·패임 정도 — 양호",
    ].join("\n"),
  },
]

async function main() {
  loadEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.SUPABASE_SECRET_KEY?.trim()
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요")
  }
  if (!url.includes("hliykvfxldohkxnizxpy")) {
    throw new Error(`잘못된 Supabase 프로젝트 URL: ${url}`)
  }

  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "osan" },
  })

  const targets = FACILITIES.filter((f) => !SKIP.has(f.facilityCode))
  console.log(`대상 ${targets.length}곳 (스킵 ${[...SKIP].join(", ")})`)

  for (const spec of targets) {
    for (const photo of spec.photos) {
      const path = `${PHOTO_DIR}/${photo.file}`
      if (!existsSync(path)) {
        throw new Error(`사진 없음: ${path}`)
      }
    }
  }

  const { data: rows, error: fetchError } = await client
    .from("facilities")
    .select("id, facility_code, name, visited")
    .in(
      "facility_code",
      targets.map((t) => t.facilityCode),
    )

  if (fetchError) throw new Error(fetchError.message)
  const byCode = new Map(
    (rows ?? []).map((r) => [r.facility_code as string, r]),
  )

  let ok = 0
  for (const spec of targets) {
    const facility = byCode.get(spec.facilityCode)
    if (!facility) {
      console.error(`DB에 없음: ${spec.facilityCode}`)
      continue
    }
    if (facility.visited) {
      console.warn(`이미 완료(건너뜀): ${spec.facilityCode} ${facility.name}`)
      continue
    }

    // photos
    for (let i = 0; i < spec.photos.length; i++) {
      const photo = spec.photos[i]
      const slot = i + 1
      const localPath = `${PHOTO_DIR}/${photo.file}`
      const bytes = readFileSync(localPath)
      const storagePath = `${facility.id}/${slot}-${Date.now()}.jpg`

      const { error: upErr } = await client.storage
        .from(BUCKET)
        .upload(storagePath, bytes, {
          contentType: "image/jpeg",
          upsert: true,
        })
      if (upErr) {
        throw new Error(
          `${spec.facilityCode} slot ${slot} 업로드 실패: ${upErr.message}`,
        )
      }

      const { error: saveErr } = await client.from("facility_photos").upsert(
        {
          facility_id: facility.id,
          slot,
          storage_path: storagePath,
          equipment_type: photo.equipmentType,
          caption: photo.caption,
        },
        { onConflict: "facility_id,slot" },
      )
      if (saveErr) {
        throw new Error(
          `${spec.facilityCode} slot ${slot} DB 저장 실패: ${saveErr.message}`,
        )
      }
    }

    const { error: noteErr } = await client.from("facility_notes").insert({
      facility_id: facility.id,
      content: spec.note,
    })
    if (noteErr) {
      throw new Error(`${spec.facilityCode} 메모 실패: ${noteErr.message}`)
    }

    const { error: visitErr } = await client
      .from("facilities")
      .update({
        visited: true,
        inspector_name: INSPECTOR,
        inspected_at: INSPECTED_AT,
      })
      .eq("id", facility.id)
    if (visitErr) {
      throw new Error(`${spec.facilityCode} 완료 실패: ${visitErr.message}`)
    }

    ok += 1
    console.log(
      `✓ ${spec.facilityCode} ${facility.name} · 사진 ${spec.photos.length}장`,
    )
  }

  console.log(`완료: ${ok}/${targets.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
