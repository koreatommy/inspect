import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

/** HTML을 디스크에서 매 요청 읽도록 하여 편집 반영·브라우저 캐시 이슈를 줄입니다. */
export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  const htmlPath = path.join(process.cwd(), "src", "app", "price", "pricing.html");
  const html = await readFile(htmlPath, "utf-8");

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
      expires: "0",
    },
  });
}
