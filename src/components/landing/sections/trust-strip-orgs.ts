import type { CSSProperties } from "react"

export type TrustOrg = {
  id: string
  name: string
  fontClass: string
  className?: string
  style?: CSSProperties
}

export const TRUST_ORGS: TrustOrg[] = [
  {
    id: "seoul-edu",
    name: "서울특별시 교육청",
    fontClass: "trust-font-seoul",
    className: "text-[21px] md:text-[23px] tracking-[-0.03em]",
    style: { fontWeight: 700 },
  },
  {
    id: "anseong-city",
    name: "안성시청",
    fontClass: "trust-font-gangnam",
    className: "text-[19px] md:text-[21px] uppercase tracking-[0.12em]",
    style: { fontWeight: 600 },
  },
  {
    id: "gyeonggi-province",
    name: "경기도청",
    fontClass: "trust-font-gyeonggi",
    className: "text-[20px] md:text-[22px] tracking-[-0.01em]",
    style: { fontWeight: 700 },
  },
  {
    id: "playground-mgmt",
    name: "한국놀이시설관리원",
    fontClass: "trust-font-playground",
    className: "text-[18px] md:text-[20px] tracking-[-0.02em]",
    style: { fontWeight: 800 },
  },
  {
    id: "sk-daycare",
    name: "SK어린이집",
    fontClass: "trust-font-sk",
    className: "text-[20px] md:text-[22px] tracking-[0.04em]",
    style: { fontWeight: 700 },
  },
  {
    id: "woongjin-playcity",
    name: "부천 웅진플레이도시",
    fontClass: "trust-font-lotte",
    className: "text-[22px] md:text-[24px] tracking-[-0.02em]",
  },
  {
    id: "parks",
    name: "한국공원녹지협회",
    fontClass: "trust-font-parks",
    className: "text-[19px] md:text-[21px] tracking-[-0.01em]",
  },
]
