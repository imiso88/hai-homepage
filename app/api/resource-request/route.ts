import { configuration, confirmationMail, cooldownCookie, json, LINK_SECONDS, parseRequest, readBody, requestLimit, sameOrigin, seal, sendMail, verificationUrl } from "@/lib/resources";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "홈페이지에서 다시 신청해 주세요." }, 403);
  const data = await readBody(request);
  if (!data) return json({ ok: false, error: "요청 내용을 읽지 못했습니다. 다시 시도해 주세요." }, 400);
  if (typeof data.website === "string" && data.website.trim()) return json({ ok: true, retryAfter: 60 });
  const parsed = parseRequest(data);
  if (typeof parsed === "string") return json({ ok: false, error: parsed }, 400);
  try { configuration(); } catch {
    console.error("[resource-request] Verified sender or token secret is not configured");
    return json({ ok: false, error: "자료 발송을 준비 중입니다. orthia66@gmail.com 또는 010-6398-5354로 요청해 주세요." }, 503);
  }
  const retryAfter = requestLimit(request, parsed.email);
  if (retryAfter) return json({ ok: false, error: "잠시 후 다시 신청해 주세요.", retryAfter }, 429, { "Retry-After": String(retryAfter) });
  try {
    const token = seal("verify", parsed, LINK_SECONDS);
    await sendMail(confirmationMail(parsed, verificationUrl(token)), "resource-confirm/" + parsed.id);
    return json({ ok: true, retryAfter: 60 }, 200, { "Set-Cookie": cooldownCookie() });
  } catch {
    return json({ ok: false, error: "확인 메일을 보내지 못했습니다. 이메일 주소를 확인하거나 잠시 후 다시 시도해 주세요." }, 502);
  }
}
