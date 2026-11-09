(() => {
  const form = document.getElementById("proposal-form");
  const status = document.getElementById("proposal-status");
  const edit = document.getElementById("proposal-edit");
  const submit = form.querySelector("button[type=submit]");
  const fromAx = new URLSearchParams(location.search).get("from") === "ax";
  let snapshot;
  try {
    if (fromAx) snapshot = JSON.parse(sessionStorage.getItem("hai-ax-proposal") || "null");
  } catch { /* Sharing is optional. */ }
  if (snapshot?.diagnosis?.version === "ax-v3" && Number.isFinite(snapshot.createdAt) && Date.now() - snapshot.createdAt < 1800000 && Array.isArray(snapshot.preview?.scores) && Array.isArray(snapshot.preview?.items)) {
    document.getElementById("proposal-diagnosis").hidden = false;
    form.elements.shareDiagnosis.required = true;
    document.getElementById("proposal-diagnosis-summary").textContent = "응답 범위: " + snapshot.diagnosis.scope + " · " + snapshot.preview.headline;
    for (const [id, rows] of [["proposal-diagnosis-scores", snapshot.preview.scores], ["proposal-diagnosis-answers", snapshot.preview.items]]) {
      const list = document.getElementById(id);
      rows.forEach(value => { const li = document.createElement("li"); li.textContent = value; list.append(li); });
    }
  } else {
    snapshot = null;
    if (fromAx) {
      form.hidden = true;
      document.getElementById("proposal-missing-diagnosis").hidden = false;
    }
  }
  edit.addEventListener("click", () => {
    form.hidden = false; edit.hidden = true; status.textContent = "";
    form.elements.email.focus();
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (fromAx && (!snapshot || !form.elements.shareDiagnosis.checked)) {
      status.textContent = "진단 응답과 점수의 전달에 동의하거나, 진단 없이 제안서 작성하기를 선택해 주세요.";
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    if (values.email.trim().toLowerCase() !== values.emailConfirm.trim().toLowerCase()) {
      status.textContent = "이메일 주소 두 칸이 다릅니다. 다시 확인해 주세요.";
      form.elements.emailConfirm.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = "확인 메일을 보내는 중입니다…";
    try {
      const shareDiagnosis = Boolean(snapshot && form.elements.shareDiagnosis.checked);
      const response = await fetch("/api/resource-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, kind: "proposal", consent: form.elements.consent.checked, fromAx, shareDiagnosis, ...(shareDiagnosis ? { diagnosis: snapshot.diagnosis } : {}) }) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw Error(result.error || "확인 메일을 보내지 못했습니다.");
      form.hidden = true;
      edit.hidden = false;
      status.textContent = values.email.trim() + "로 확인 메일을 보냈습니다. 이름과 기관명을 확인한 뒤 30분 이내에 링크를 열어 신청을 완료해 주세요. 메일이 안 보이면 스팸함도 확인해 주세요.";
      edit.focus();
    } catch (e) {
      status.textContent = e.message || "잠시 후 다시 시도해 주세요.";
    } finally { submit.disabled = false; }
  });
})();
