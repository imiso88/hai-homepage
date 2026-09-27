// 교육 신청서 접수 → Resend로 교육원 메일(orthia66@gmail.com)에 전달
// 필요한 환경변수: RESEND_API_KEY (Vercel 프로젝트 설정 > Environment Variables)
// 선택 환경변수: CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (도메인 인증 후 발신 주소 변경 시)

export const runtime = "nodejs";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "휴먼AI융합교육원 신청서 <onboarding@resend.dev>";

type Field = { key: string; label: string; required: boolean; max: number };

const FIELDS: Field[] = [
  { key: "organization", label: "기관·기업명", required: true, max: 100 },
  { key: "name", label: "담당자명", required: true, max: 50 },
  { key: "phone", label: "연락처", required: true, max: 30 },
  { key: "email", label: "이메일", required: true, max: 120 },
  { key: "audience", label: "교육 대상", required: false, max: 200 },
  { key: "headcount", label: "예상 인원", required: false, max: 50 },
  { key: "schedule", label: "희망 일정·시간", required: false, max: 200 },
  { key: "message", label: "교육 목적·문의 내용", required: true, max: 3000 },
];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "신청 내용을 읽지 못했습니다. 다시 시도해 주세요." }, 400);
  }

  // 스팸 방지: 사람에게는 보이지 않는 칸이 채워져 있으면 조용히 무시
  if (typeof data.website === "string" && data.website.trim() !== "") {
    return json({ ok: true });
  }

  if (data.consent !== true) {
    return json({ ok: false, error: "개인정보 수집·이용에 동의해 주세요." }, 400);
  }

  const values: Record<string, string> = {};
  for (const field of FIELDS) {
    const raw = typeof data[field.key] === "string" ? (data[field.key] as string).trim() : "";
    if (field.required && !raw) {
      return json({ ok: false, error: `${field.label} 항목을 입력해 주세요.` }, 400);
    }
    if (raw.length > field.max) {
      return json({ ok: false, error: `${field.label} 항목은 ${field.max}자 이내로 입력해 주세요.` }, 400);
    }
    values[field.key] = raw;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return json({ ok: false, error: "이메일 주소 형식을 확인해 주세요." }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return json({ ok: false, error: "지금은 온라인 접수가 어렵습니다. 전화 010-6398-5354 또는 이메일 orthia66@gmail.com으로 문의해 주세요." }, 503);
  }

  const receivedAt = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date());

  const rows = FIELDS.map(
    (f) =>
      `<tr><th style="text-align:left;vertical-align:top;padding:10px 14px;background:#f4f7f8;border:1px solid #dce5e8;width:150px;color:#102a43">${f.label}</th>` +
      `<td style="padding:10px 14px;border:1px solid #dce5e8;white-space:pre-wrap">${escapeHtml(values[f.key] || "-")}</td></tr>`,
  ).join("");

  const html =
    `<div style="font-family:Pretendard,Apple SD Gothic Neo,Malgun Gothic,sans-serif;color:#1c2b36;max-width:680px">` +
    `<h2 style="color:#102a43;margin:0 0 6px">새 AI 교육 신청이 접수되었습니다</h2>` +
    `<p style="color:#5d6b76;margin:0 0 18px">접수 시각 ${receivedAt} · humanai-edu.kr 교육 신청서</p>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>` +
    `<p style="color:#5d6b76;font-size:13px;margin-top:18px">이 메일에 바로 회신하면 신청자(${escapeHtml(values.email)})에게 답장이 갑니다.</p></div>`;

  const text =
    `새 AI 교육 신청 (${receivedAt})\n\n` + FIELDS.map((f) => `${f.label}: ${values[f.key] || "-"}`).join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: values.email,
      subject: `[AI 교육 신청] ${values.organization} · ${values.name}`,
      html,
      text,
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend error", response.status, await response.text());
    return json({ ok: false, error: "전송 중 문제가 생겼습니다. 전화 010-6398-5354 또는 이메일 orthia66@gmail.com으로 문의해 주세요." }, 502);
  }

  return json({ ok: true });
}
