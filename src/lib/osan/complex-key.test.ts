import assert from "node:assert/strict"
import { complexKeyFromName } from "./complex-key"
import { optimizeRoute, type RoutePoint } from "./route"

function assertKey(name: string, expected: string) {
  assert.equal(complexKeyFromName(name), expected, name)
}

/** 시설명 → 단지 키 (seed 패턴) */
assertKey("오산 운암현대아파트 101동 놀이터", "운암현대아파트")
assertKey("오산 운암현대아파트 관리소옆 놀이터", "운암현대아파트")
assertKey("오산 운암현대아파트 104동 놀이터", "운암현대아파트")
assertKey("운암주공3단지아파트 놀이터4(309동앞)", "운암주공3단지아파트")
assertKey("한라그린타운아파트 101동앞 놀이터", "한라그린타운아파트")
assertKey("한라그린타운아파트 관리동앞 놀이터", "한라그린타운아파트")
assertKey("우방힐타운아파트(101동)", "우방힐타운아파트")
assertKey("KCC 스위첸 놀이터1(102동)", "KCC 스위첸")
assertKey("오산역e-편한세상 2단지(207동)", "오산역e-편한세상 2단지")
assertKey("힐스테이트아파트 어린이놀이터1", "힐스테이트아파트")
assertKey(
  "힐스테이트 오산 더퍼스트 어린이놀이터2 (101동 앞)",
  "힐스테이트 오산 더퍼스트",
)
assertKey("오산 누읍 휴먼시아아파트 113동앞 놀이터", "누읍 휴먼시아아파트")
assertKey("세교 한양수자인 어린이놀이터3(어린이집 옆)", "세교 한양수자인")
assertKey("동부아파트 놀이터(관리소옆)102동", "동부아파트")
assertKey("아케이드X 오산", "아케이드X 오산")
assertKey("자람터어린이집놀이터", "자람터어린이집")

/** 운암현대 3곳 + 주공: 단지 중간에 다른 단지 삽입 금지 */
const hyundai: RoutePoint[] = [
  {
    id: "h101",
    name: "오산 운암현대아파트 101동 놀이터",
    lat: 37.1531576934858,
    lng: 127.075158025623,
  },
  {
    id: "h104",
    name: "오산 운암현대아파트 104동 놀이터",
    lat: 37.1519237049716,
    lng: 127.075846853204,
  },
  {
    id: "h관리",
    name: "오산 운암현대아파트 관리소옆 놀이터",
    lat: 37.1519501238344,
    lng: 127.075818962432,
  },
]
const jugong: RoutePoint = {
  id: "j4",
  name: "운암주공3단지아파트 놀이터4(309동앞)",
  lat: 37.1539519858537,
  lng: 127.079963391338,
}

function complexRunsContiguous(order: RoutePoint[]) {
  const keys = order.map((p) => complexKeyFromName(p.name))
  const seen = new Set<string>()
  let prev: string | null = null
  for (const key of keys) {
    if (key !== prev) {
      assert.equal(seen.has(key), false, `단지 ${key}가 중간에 끊김: ${keys}`)
      seen.add(key)
      prev = key
    }
  }
}

for (const start of [
  undefined,
  { lat: 37.1535, lng: 127.0752 },
  { lat: 37.154, lng: 127.08 },
  { lat: 37.15, lng: 127.07 },
] as const) {
  const { order } = optimizeRoute([...hyundai, jugong], start)
  complexRunsContiguous(order)
  const hyundaiIds = new Set(hyundai.map((h) => h.id))
  const hyundaiPositions = order
    .map((p, i) => (hyundaiIds.has(p.id) ? i : -1))
    .filter((i) => i >= 0)
  assert.equal(
    hyundaiPositions[hyundaiPositions.length - 1]! - hyundaiPositions[0]! + 1,
    hyundai.length,
    `운암현대가 연속이어야 함 (start=${JSON.stringify(start)}): ${order.map((p) => p.id)}`,
  )
}

/** 비주택 singleton도 단지 연속성 규칙을 만족 */
const kids: RoutePoint[] = [
  {
    id: "a",
    name: "아케이드X 오산",
    lat: 37.14,
    lng: 127.07,
  },
  {
    id: "b",
    name: "자람터어린이집놀이터",
    lat: 37.141,
    lng: 127.071,
  },
]
complexRunsContiguous(optimizeRoute(kids).order)

console.log("complex-key + route hierarchical: ok")
