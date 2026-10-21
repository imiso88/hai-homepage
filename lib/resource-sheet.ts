import { createHmac } from "node:crypto";
import { RESOURCES, type ResourceRequest } from "./resources";

// Server-to-server only. Never expose the webhook URL or signing secret in browser code.
export async function saveVerifiedResource(data: ResourceRequest): Promise<boolean> {
  const url = process.env.RESOURCE_SHEET_WEBHOOK_URL?.trim();
  const secret = process.env.RESOURCE_SHEET_SECRET;
  if (!url && !secret) return false; // Existing mail-only flow until setup is complete.
  if (!url || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret || secret.length < 32)
    throw new Error("Resource sheet configuration incomplete");
  const payload = JSON.stringify({
    version: 1, id: data.id, requestedAt: new Date(data.issuedAt).toISOString(),
    organization: data.organization, name: data.name, email: data.email,
    resource: data.resource, resourceLabel: RESOURCES[data.resource].label,
    consent: data.consent, proposal: data.proposal, marketing: data.marketing,
    consentVersion: data.consentVersion || "2026-10-21", source: "홈페이지 자료 신청",
  });
  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", secret).update(timestamp + "." + payload).digest("hex");
  const response = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, payload, signature }),
    redirect: "follow", signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Resource sheet unavailable");
  const result = await response.json();
  if (result?.ok !== true || result?.id !== data.id) throw new Error("Resource sheet did not acknowledge save");
  return true;
}
