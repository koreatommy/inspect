import type { ReactNode } from "react"

/** 로그인 경로는 전체 너비 랜딩 페이지이며, 로그인 폼은 시트로 표시합니다. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
