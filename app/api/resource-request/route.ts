// 자료 다운로드 신청(정보 입력 후 다운로드, 맞춤 제안서 요청 선택) → Resend로 교육원 메일(orthia66@gmail.com)에 전달
// 필요한 환경변수: RESEND_API_KEY (교육 문의와 같은 키 사용)

export const runtime = "nodejs";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "휴먼AI융합교육원 자료 신청 <onboarding@resend.dev>";

const RESOURCES = ["교육 소개서", "개인정보보호교육 커리큘럼", "교육 방법론", "전체 자료"];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

const text = (data: Record<string, unknown>, key: string, max: number) =>
  typeof data[key] === "string" ? (data[key] as string).trim().slice(0, max) : "";

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "요청 내용을 읽지 못했습니다. 다시 시도해 주세요." }, 400);
  }

  // 스팸 방지용 숨은 칸
  if (text(data, "website", 200)) return json({ ok: true });

  if (data.consent !== true) {
    return json({ ok: false, error: "개인정보 수집·이용(필수)에 동의해 주세요." }, 400);
  }

  const organization = text(data, "organization", 100);
  const name = text(data, "name", 50);
  const email = text(data, "email", 120);
  const resourceRaw = text(data, "resource", 50);
  const resource = RESOURCES.includes(resourceRaw) ? resourceRaw : "전체 자료";
  const marketing = data.marketing === true;
  const proposal = data.proposal === true;

  if (!organization) return json({ ok: false, error: "기관·기업명을 입력해 주세요." }, 400);
  if (!name) return json({ ok: false, error: "이름을 입력해 주세요." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "이메일 주소 형식을 확인해 주세요." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[resource-request] RESEND_API_KEY is not set");
    return json({ ok: false, error: "지금은 신청을 받을 수 없습니다. orthia66@gmail.com으로 연락해 주세요." }, 503);
  }

  const receivedAt = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date());
  const rows: [string, string][] = [
    ["기관·기업명", organization],
    ["이름", name],
    ["이메일", email],
    ["다운로드 자료", resource],
    ["맞춤 제안서", proposal ? "요청함 (이메일로 제안서 회신 필요)" : "요청 안 함"],
    ["교육 안내 메일 수신", marketing ? "동의 (교육 안내·소식 발송 가능)" : "미동의 (요청 건 회신만 가능)"],
  ];
  const html =
    `<div style="font-family:Pretendard,Apple SD Gothic Neo,Malgun Gothic,sans-serif;color:#1c2b36;max-width:640px">` +
    `<h2 style="color:#102a43;margin:0 0 6px">자료 다운로드 신청이 도착했습니다</h2>` +
    `<p style="color:#5d6b76;margin:0 0 18px">접수 시각 ${receivedAt} · humanai-edu.kr 자료 다운로드 영역</p>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px">` +
    rows
      .map(
        ([k, v]) =>
          `<tr><th style="text-align:left;padding:10px 14px;background:#f4f7f8;border:1px solid #dce5e8;width:160px;color:#102a43">${k}</th>` +
          `<td style="padding:10px 14px;border:1px solid #dce5e8">${escapeHtml(v)}</td></tr>`,
      )
      .join("") +
    `</table><p style="color:#5d6b76;font-size:13px;margin-top:18px">이 메일에 바로 회신하면 신청자(${escapeHtml(email)})에게 답장이 갑니다.</p></div>`;
  const plain = `자료 다운로드 신청 (${receivedAt})\n\n` + rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[자료 신청] ${organization} · ${resource}${proposal ? " · 제안서 요청" : ""}`,
        html,
        text: plain,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("[resource-request] Resend error", response.status, await response.text());
      return json({ ok: false, error: "전송 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }, 502);
    }
  } catch (err) {
    console.error("[resource-request] send failed", err);
    return json({ ok: false, error: "전송 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }, 502);
  }

  return json({ ok: true });
}
