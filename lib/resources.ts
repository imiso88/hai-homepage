import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";

export const RESOURCES = {
  brochure: { label: "교육 소개서", file: "humanai-edu-brochure.pdf", name: "휴먼AI융합교육원_교육소개서.pdf" },
  privacy: { label: "개인정보보호교육 커리큘럼", file: "humanai-edu-privacy-curriculum.pdf", name: "휴먼AI융합교육원_개인정보보호교육_커리큘럼.pdf" },
  method: { label: "교육 방법론", file: "humanai-edu-method.pdf", name: "휴먼AI융합교육원_교육방법론.pdf" },
} as const;
export type ResourceKey = keyof typeof RESOURCES;
export type ResourceRequest = {
  organization: string; name: string; email: string; resource: ResourceKey;
  consent: true; proposal: boolean; marketing: boolean; id: string; issuedAt: number;
};
export const LINK_SECONDS = 1800, ACCESS_SECONDS = 900;
export const ACCESS_COOKIE = "hai_resource_access";
const COOLDOWN_COOKIE = "hai_resource_cooldown";
export function resourceKey(value: unknown): ResourceKey | null {
  if (typeof value !== "string") return null;
  if (Object.hasOwn(RESOURCES, value)) return value as ResourceKey;
  return (Object.keys(RESOURCES) as ResourceKey[]).find(key => RESOURCES[key].label === value) ?? null;
}
export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", ...extra } });
}
export function configuration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = (process.env.RESOURCE_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL)?.trim();
  const secret = process.env.RESOURCE_TOKEN_SECRET;
  if (!apiKey || !from || /@resend\.dev\b/i.test(from) || !secret || secret.length < 32)
    throw new Error("Resource mail requires a verified sender and a 32+ character token secret");
  return { apiKey, from };
}
function encryptionKey() {
  const secret = process.env.RESOURCE_TOKEN_SECRET;
  if (!secret || secret.length < 32) throw new Error("RESOURCE_TOKEN_SECRET is not configured");
  return createHash("sha256").update(secret).digest();
}
// Authenticated encryption hides addresses, names and consent fields from the URL.
export function seal(purpose: string, data: unknown, seconds: number, now = Date.now()) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from("humanai-resources-v1"));
  const bytes = Buffer.concat([cipher.update(JSON.stringify({ purpose, exp: now + seconds * 1000, data })), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString("base64url");
}
export function unseal<T>(value: unknown, purpose: string, now = Date.now()): T | null {
  if (typeof value !== "string" || value.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const bytes = Buffer.from(value, "base64url");
    if (bytes.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from("humanai-resources-v1")); decipher.setAuthTag(bytes.subarray(12, 28));
    const token = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString());
    if (token.purpose !== purpose || !Number.isFinite(token.exp) || token.exp <= now) return null;
    return token.data as T;
  } catch { return null; }
}
export function cookieValue(request: Request, name: string) {
  return request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(name + "="))?.slice(name.length + 1);
}
export function cookie(name: string, value: string, seconds: number) {
  return name + "=" + value + "; Path=/api; HttpOnly; SameSite=Strict; Max-Age=" + seconds + (process.env.NODE_ENV === "production" ? "; Secure" : "");
}
export function verificationUrl(token: string) {
  const base = new URL(process.env.RESOURCE_BASE_URL || "https://www.humanai-edu.kr");
  if (base.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && base.hostname === "localhost")) throw new Error("Invalid RESOURCE_BASE_URL");
  // Fragments are not sent to HTTP servers, mail scanners, or referrers.
  return base.origin + "/resource-verify.html#token=" + token;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("content-length")) > 8192) return null;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch { return null; }
}
export function parseRequest(data: Record<string, unknown>): ResourceRequest | string {
  if (data.consent !== true) return "개인정보 수집·이용(필수)에 동의해 주세요.";
  const values: Record<string, string> = {};
  for (const [key, label, max] of [["organization", "기관·기업명", 100], ["name", "이름", 50], ["email", "이메일", 120]] as const) {
    const value = typeof data[key] === "string" ? data[key].trim() : "";
    if (!value || value.length > max) return label + " 항목을 " + max + "자 이내로 입력해 주세요.";
    values[key] = value;
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email)) return "이메일 주소 형식을 확인해 주세요.";
  const resource = resourceKey(data.resource);
  if (!resource) return "신청 자료를 다시 선택해 주세요.";
  return { organization: values.organization, name: values.name, email: values.email, resource, consent: true, proposal: data.proposal === true, marketing: data.marketing === true, id: randomUUID(), issuedAt: Date.now() };
}
// Bounded warm-instance abuse guard + signed browser cooldown. Not a globally shared IP limiter.
// Configure a Vercel WAF rate limit before public activation (see setup document).
const attempts = new Map<string, { count: number; until: number; last: number }>();
export function requestLimit(request: Request, email: string, now = Date.now()): number {
  const cooldown = unseal<{ until: number }>(cookieValue(request, COOLDOWN_COOKIE), "cooldown", now);
  if (cooldown?.until && cooldown.until > now) return Math.ceil((cooldown.until - now) / 1000);
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const keys = ["ip:" + ip, "email:" + email.toLowerCase()].map(key => createHash("sha256").update(key).digest("hex"));
  for (const [i, key] of keys.entries()) {
    const item = attempts.get(key), limit = i === 0 ? 15 : 4;
    if (item && (item.count >= limit || (i === 1 && now - item.last < 60000)))
      return Math.max(1, Math.ceil(((item.count >= limit ? item.until : item.last + 60000) - now) / 1000));
  }
  if (attempts.size > 10000) return 60;
  for (const key of keys) {
    const item = attempts.get(key);
    attempts.set(key, { count: (item?.count || 0) + 1, until: item?.until || now + 900000, last: now });
  }
  return 0;
}
export function cooldownCookie() { return cookie(COOLDOWN_COOKIE, seal("cooldown", { until: Date.now() + 60000 }, 60), 60); }
type Mail = { to: string[]; subject: string; html: string; text: string; reply_to?: string };
export async function sendMail(mail: Mail, idempotencyKey: string) {
  const { apiKey, from } = configuration();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from, ...mail }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    // Never log addresses, message bodies, verification links or provider credentials.
    console.error("[resources] Mail provider rejected request", response.status);
    throw new Error("Mail delivery failed");
  }
}
export function confirmationMail(data: ResourceRequest, url: string): Mail {
  const label = RESOURCES[data.resource].label;
  return {
    to: [data.email], subject: "[휴먼AI융합교육원] " + label + " 자료 받기", reply_to: process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com",
    text: data.name + "님, 요청하신 " + label + "를 받으려면 아래 링크를 열고 ‘이메일 확인하고 자료 받기’를 눌러 주세요.\n\n" + url + "\n\n링크는 30분 동안 유효합니다. 신청하지 않으셨다면 이 메일을 무시해 주세요.",
    html: '<div style="font-family:Arial,Malgun Gothic,sans-serif;max-width:600px;color:#102a43;line-height:1.8"><h2>요청하신 교육 자료를 확인해 주세요</h2><p>' + escapeHtml(data.name) + '님, <b>' + escapeHtml(label) + '</b>를 신청해 주셔서 감사합니다.</p><p>아래 버튼을 누른 뒤 이메일 확인을 완료하면 자료를 내려받을 수 있습니다.</p><p><a href="' + escapeHtml(url) + '" style="display:inline-block;background:#17658d;color:white;text-decoration:none;border-radius:8px;padding:14px 24px">자료 받기</a></p><p>링크는 30분 동안 유효합니다. 신청하지 않으셨다면 이 메일을 무시해 주세요.</p><p style="font-size:13px;color:#526675">버튼이 열리지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요.<br>' + escapeHtml(url) + '</p><p>휴먼AI융합교육원 · 사람의 성장을 설계하고, AI로 일의 변화를 만듭니다.</p></div>',
  };
}
export function verifiedMail(data: ResourceRequest): Mail {
  const rows = [["이메일 확인", "완료 (확인 링크에서 자료 받기 버튼 클릭)"], ["기관·기업명", data.organization], ["이름", data.name], ["이메일", data.email], ["신청 자료", RESOURCES[data.resource].label], ["신청 시각", new Date(data.issuedAt).toISOString()], ["맞춤 제안서", data.proposal ? "요청함 · 이메일 회신 필요" : "요청 안 함"], ["교육 소식 수신", data.marketing ? "동의" : "미동의 · 요청 건 회신만 가능"]];
  return {
    to: [process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com"], reply_to: data.email,
    subject: "[이메일 확인 완료] " + data.organization + " · " + RESOURCES[data.resource].label + (data.proposal ? " · 제안서 요청" : ""),
    text: rows.map(([k, v]) => k + ": " + v).join("\n"),
    html: '<div style="font-family:Arial,Malgun Gothic,sans-serif;color:#102a43"><h2>이메일 확인을 완료한 자료 신청입니다</h2><table>' + rows.map(([k, v]) => '<tr><th style="text-align:left;padding:10px">' + k + '</th><td style="padding:10px">' + escapeHtml(v) + '</td></tr>').join("") + '</table><p>이메일 접근 권한을 확인한 기록이며, 소속·성명의 진위를 보증하지는 않습니다.</p></div>',
  };
}
