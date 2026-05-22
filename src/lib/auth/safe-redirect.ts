/**
 * 로그인·OAuth 콜백 후 리다이렉트 경로 검증.
 * 외부 URL·프로토콜 우회(//evil.com) 방지.
 */
export function getSafeRedirectPath(path?: string | null): string {
  if (!path) return "/"
  if (!path.startsWith("/")) return "/"
  if (path.startsWith("//")) return "/"
  return path
}
