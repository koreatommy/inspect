import type { Metadata } from "next"

import { ManualPage } from "@/components/manual/manual-page"
import { requireUser } from "@/lib/auth/helpers"

export const metadata: Metadata = {
  title: "사용자 매뉴얼",
  description:
    "어린이놀이시설 안전점검 SaaS 온라인 사용자 매뉴얼 — 기능 안내 및 사용 방법",
}

export default async function ManualRoutePage() {
  await requireUser()

  return <ManualPage />
}
