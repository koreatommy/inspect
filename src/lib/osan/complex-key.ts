/**
 * 시설명에서 단지(아파트) 묶음 키를 뽑는다.
 * 동·놀이터·위치 수식어를 제거하고 단지명만 남긴다.
 */
export function complexKeyFromName(name: string | null | undefined): string {
  const original = (name ?? "").trim()
  if (!original) return original

  let key = original
    .replace(/유아놀이터|어린이놀이터\d*|놀이터\d*/gu, " ")
    .replace(/[（(]\s*\d+\s*동\s*[^）)]*[）)]/gu, " ")
    .replace(/(\d+)\s*동\s*(앞|옆)?/gu, " ")
    .replace(/관리소옆|관리동/gu, " ")
    .replace(/(앞|옆|내부|필로티)/gu, " ")
    // 남은 괄호 주석 (두산동아), (어린이집 옆) 등
    .replace(/[（(][^）)]*[）)]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

  // 선행 시·군 토큰만 제거 (오산역… 은 유지)
  key = key.replace(/^오산\s+/u, "").replace(/\s+/g, " ").trim()

  return key || original
}
