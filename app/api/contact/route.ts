import { createHmac, randomUUID } from "node:crypto";

export const runtime = "nodejs";

type Field = { key: string; label: string; required: boolean; max: number };

const FIELDS: Field[] = [
  { key: "organization", label: "기관·기업명", required: true, max: 100 },
  { key: "name", label: "담당자명", required: true, max: 50 },
  { key: "phone", label: "연락처", required: true, max: 30 },
  { key: "email", label: "이메일", required: true, max: 120 },
  { key: "audience", label: "교육 대상", required: false, max: 200 },
  { key: "budget", label: "교육 예산", required: false, max: 100 },
  { key: "headcount", label: "예상 인원", required: false, max: 50 },
  { key: "schedule", label: "희망 일정·시간", required: false, max: 200 },
  { key: "message", label: "현재 고민·궁금한 점", required: true, max: 3000 },
];

const SHEET_LINK = "https://docs.google.com/spreadsheets/d/1siESTwaM76R_qbzHYAJ33aPawol8EKW7K6i8c59Lo6g/edit#gid=19999218";
const SAVE_ERROR = "문의 접수를 완료하지 못했습니다. 잠시 후 다시 시도하거나 전화 010-6398-5354로 문의해 주세요.";

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
    data = body;
  } catch {
    return Response.json({ ok: false, error: "요청 내용을 읽지 못했습니다. 다시 시도해 주세요." }, { status: 400 });
  }

  if (typeof data.website === "string" && data.website.trim()) return Response.json({ ok: true });
  if (data.consent !== true)
    return Response.json({ ok: false, error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });

  const values: Record<string, string> = {};
  for (const { key, label, max, required } of FIELDS) {
    const raw = data[key];
    const value = typeof raw === "string" ? raw.trim() : "";
    if ((required && !value) || value.length > max) {
      const error = value ? `${label} 항목은 ${max}자 이내로 입력해 주세요.` : `${label} 항목을 입력해 주세요.`;
      return Response.json({ ok: false, error }, { status: 400 });
    }
    values[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    return Response.json({ ok: false, error: "이메일 주소 형식을 확인해 주세요." }, { status: 400 });

  const url = process.env.RESOURCE_SHEET_WEBHOOK_URL?.trim();
  const secret = process.env.RESOURCE_SHEET_SECRET;
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret || secret.length < 32) {
    console.error("[contact] Sheet configuration incomplete");
    return Response.json({ ok: false, error: SAVE_ERROR }, { status: 503 });
  }
  const id = typeof data.requestId === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(data.requestId)
    ? data.requestId : randomUUID();
  const extra = (key: string, max: number) => {
    const value = data[key];
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const now = new Date();
  const timestamp = String(now.getTime());
  const payload = JSON.stringify({
    version: 3, id, requestedAt: now.toISOString(), consent: true, ...values,
    tracks: extra("tracks", 200), source: extra("source", 50) || "홈페이지",
  });
  const signature = createHmac("sha256", secret).update(timestamp + "." + payload).digest("hex");

  try {
    const response = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, payload, signature }),
      redirect: "follow", signal: AbortSignal.timeout(15000),
    });
    const saved = await response.json();
    if (!response.ok || saved?.ok !== true || saved.id !== id || saved.version !== 3)
      throw new Error("Missing save confirmation");
  } catch {
    console.error("[contact] Sheet save did not complete");
    return Response.json({ ok: false, error: SAVE_ERROR }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const notification = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "contact/" + id,
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "휴먼AI융합교육원 교육 문의 <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO_EMAIL || "orthia66@gmail.com"],
          subject: "[AI 교육 문의] 새 문의가 접수되었습니다",
          text: `접수 ID: ${id}\n교육 문의 관리 시트에서 확인하세요.\n${SHEET_LINK}`,
        }),
        signal: AbortSignal.timeout(4000),
      });
      if (!notification.ok) console.error("[contact] Notification failed", notification.status);
    } catch {
      console.error("[contact] Notification could not be sent");
    }
  }
  return Response.json({ ok: true, id });
}
