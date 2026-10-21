import { ACCESS_COOKIE, ACCESS_SECONDS, cookie, json, readBody, RESOURCES, ResourceRequest, resourceKey, sameOrigin, seal, sendMail, unseal, verifiedMail } from "@/lib/resources";
import { saveVerifiedResource } from "@/lib/resource-sheet";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "확인 페이지에서 다시 시도해 주세요." }, 403);
  const body = await readBody(request);
  const data = unseal<ResourceRequest>(body?.token, "verify");
  if (!data || !resourceKey(data.resource) || data.consent !== true || typeof data.email !== "string" || typeof data.id !== "string")
    return json({ ok: false, error: "확인 링크가 만료되었거나 올바르지 않습니다. 홈페이지에서 자료를 다시 신청해 주세요." }, 400);
  try {
    // The receiver locks and deduplicates by request ID, including retries after a timeout.
    // Send owner notification even if Sheets fails; never silently claim the configured save succeeded.
    const [sheet, mail] = await Promise.allSettled([
      saveVerifiedResource(data), sendMail(verifiedMail(data), "resource-verified/" + data.id),
    ]);
    if (sheet.status === "rejected") {
      console.error("[resources] Verified lead sheet save failed");
      return json({ ok: false, error: "신청 정보 저장이 지연되고 있습니다. 잠시 후 아래 버튼을 다시 눌러 주세요." }, 502);
    }
    if (mail.status === "rejected") {
      console.error("[resources] Verified lead notification failed");
      if (!sheet.value) throw new Error("No lead delivery succeeded");
    }
    return json({ ok: true, label: RESOURCES[data.resource].label, downloadUrl: "/api/resource-download?resource=" + data.resource }, 200, {
      "Set-Cookie": cookie(ACCESS_COOKIE, seal("access", { resource: data.resource }, ACCESS_SECONDS), ACCESS_SECONDS),
    });
  } catch {
    return json({ ok: false, error: "확인을 완료하지 못했습니다. 잠시 후 아래 버튼을 다시 눌러 주세요." }, 502);
  }
}
