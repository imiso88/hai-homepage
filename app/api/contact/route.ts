// 교육 문의 접수 → Resend로 교육원 메일(orthia66@gmail.com)에 전달
// 필요한 환경변수: RESEND_API_KEY (Vercel 프로젝트 설정 > Environment Variables)
// 선택 환경변수: CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (도메인 인증 후 발신 주소 변경 시)
// 선택 환경변수: SHEET_WEBHOOK_URL (구글 시트 Apps Script 웹 앱 주소 — 설정하면 문의가 시트에도 한 줄씩 기록됨)

export const runtime = "nodejs";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "휴먼AI융합교육원 교육 문의 <onboarding@resend.dev>";

type Field = { key: string; label: string; required: boolean; max: number };

const FIELDS: Field[] = [
  { key: "organization", label: "기관·기업명", required: true, max: 100 },
  { key: "name", label: "담당자명", required: true, max: 50 },
  { key: "phone", label: "연락처", required: true, max: 30 },
  { key: "email", label: "이메일", required: true, max: 120 },
  { key: "audience", label: "교육 대상", required: false, max: 200 },
  { key: "headcount", label: "예상 인원", required: false, max: 50 },
  { key: "schedule", label: "희망 일정·시간", required: false, max: 200 },
  { key: "message", label: "현재 고민·궁금한 점", required: true, max: 3000 },
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
    return json({ ok: false, error: "요청 내용을 읽지 못했습니다. 다시 시도해 주세요." }, 400);
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
  const sheetUrl = process.env.SHEET_WEBHOOK_URL;
  if (!apiKey && !sheetUrl) {
    console.error("[contact] RESEND_API_KEY and SHEET_WEBHOOK_URL are not set");
    return json({ ok: false, error: "지금은 온라인 접수가 어렵습니다. 전화 010-6398-5354 또는 이메일 orthia66@gmail.com으로 문의해 주세요." }, 503);
  }

  // 선택 항목(시트 기록용): 관심 트랙, 유입 경로
  const extra = (key: string, max: number) => (typeof data[key] === "string" ? (data[key] as string).trim().slice(0, max) : "");
  const tracks = extra("tracks", 200);
  const source = extra("source", 50) || "홈페이지";

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
    `<h2 style="color:#102a43;margin:0 0 6px">새 AI 교육 문의가 도착했습니다</h2>` +
    `<p style="color:#5d6b76;margin:0 0 18px">접수 시각 ${receivedAt} · humanai-edu.kr 교육 문의</p>` +
    `<table style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>` +
    `<p style="color:#5d6b76;font-size:13px;margin-top:18px">이 메일에 바로 회신하면 문의자(${escapeHtml(values.email)})에게 답장이 갑니다.</p></div>`;

  const text =
    `새 AI 교육 문의 (${receivedAt})\n\n` + FIELDS.map((f) => `${f.label}: ${values[f.key] || "-"}`).join("\n");

  const sendMail = async () => {
    if (!apiKey) return false;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: values.email,
        subject: `[AI 교육 문의] ${values.organization} · ${values.name}`,
        html,
        text,
      }),
    });
    if (!response.ok) console.error("[contact] Resend error", response.status, await response.text());
    return response.ok;
  };

  // 진단용 상태 코드(비밀값 없음): off | bad-url | ok | http-<code>-<형식> | script:<오류> | exception:<이름>
  let sheetState = "off";
  const saveToSheet = async () => {
    if (!sheetUrl) return false;
    const url = sheetUrl.trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) sheetState = "bad-url";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tracks, source }),
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      const raw = await response.text();
      let result: { ok?: boolean; error?: string } = {};
      try { result = JSON.parse(raw); } catch { /* HTML 응답 */ }
      if (result.ok === true) { sheetState = "ok"; return true; }
      const kind = raw.trim().startsWith("<") ? "html" : "json";
      sheetState = result.error ? `script:${String(result.error).slice(0, 120)}` : `${sheetState === "bad-url" ? "bad-url/" : ""}http-${response.status}-${kind}`;
      console.error("[contact] Sheet webhook error", response.status, raw.slice(0, 300));
      return false;
    } catch (err) {
      sheetState = `exception:${(err as Error)?.name || "unknown"}`;
      throw err;
    }
  };

  const [mail, sheet] = await Promise.allSettled([sendMail(), saveToSheet()]);
  const mailOk = mail.status === "fulfilled" && mail.value;
  const sheetOk = sheet.status === "fulfilled" && sheet.value;
  if (mail.status === "rejected") console.error("[contact] mail failed", mail.reason);
  if (sheet.status === "rejected") console.error("[contact] sheet failed", sheet.reason);

  if (!mailOk && !sheetOk) {
    return json({ ok: false, error: "전송 중 문제가 생겼습니다. 전화 010-6398-5354 또는 이메일 orthia66@gmail.com으로 문의해 주세요.", sheet: sheetState }, 502);
  }

  return json({ ok: true, mail: mailOk ? "ok" : "fail", sheet: sheetState });
}
