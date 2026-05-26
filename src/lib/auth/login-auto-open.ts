/**
 * 로그인 Dialog 자동 오픈 여부.
 * 랜딩 탐색(/, /login)에서는 수동 클릭만, 보호 라우트 리다이렉트·명시적 트리거만 자동 오픈.
 */
export function shouldAutoOpenLoginDialog(
  searchParams: Pick<URLSearchParams, "get">,
  hash = "",
): boolean {
  if (searchParams.get("login") === "open") return true
  if (searchParams.get("suspended") === "1") return true
  if (hash === "#login") return true

  const redirectedFrom = searchParams.get("redirectedFrom")
  if (!redirectedFrom) return false
  if (redirectedFrom === "/" || redirectedFrom === "/login") return false

  return redirectedFrom.startsWith("/") && !redirectedFrom.startsWith("//")
}
