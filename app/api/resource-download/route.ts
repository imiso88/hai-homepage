import { readFile } from "node:fs/promises";
import path from "node:path";
import { ACCESS_COOKIE, cookieValue, json, RESOURCES, ResourceKey, resourceKey, unseal } from "@/lib/resources";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const key = resourceKey(new URL(request.url).searchParams.get("resource"));
  const access = unseal<{ resource: ResourceKey }>(cookieValue(request, ACCESS_COOKIE), "access");
  if (!key || !access || access.resource !== key) return json({ ok: false, error: "이메일의 확인 링크에서 자료 받기를 눌러 주세요." }, 401);
  try {
    const file = await readFile(path.join(process.cwd(), "resources", RESOURCES[key].file));
    return new Response(new Uint8Array(file), { headers: {
      "Content-Type": "application/pdf", "Content-Length": String(file.length),
      "Content-Disposition": 'attachment; filename="humanai-' + key + '.pdf"; filename*=UTF-8\'\'' + encodeURIComponent(RESOURCES[key].name),
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow",
    } });
  } catch {
    console.error("[resource-download] Resource file unavailable", key);
    return json({ ok: false, error: "자료를 불러오지 못했습니다. 교육원으로 연락해 주세요." }, 503);
  }
}
