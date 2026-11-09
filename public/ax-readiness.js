(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const dimensions = ["AI 이해·목표", "도구 접근·학습", "업무 적용·성과", "데이터 관리", "검증·안전 운영", "AI 자동 실행 안전"];
  const rollout = ["아직 하지 않음", "개인·소수만 시험", "일부 팀에서 적용", "필요한 팀에 적용", "적용 후 주기적으로 점검"];
  const policy = ["기준 없음", "논의 또는 초안 단계", "일부 업무에서 적용", "대상 업무에 공식 적용", "공식 적용 후 주기적으로 점검"];
  const measure = ["기록하지 않음", "체감이나 의견만 있음", "한 업무에서 전후 비교", "주요 적용 업무에서 전후 비교", "정기 비교 결과로 개선"];
  const question = (dim, text, scale = rollout, critical = false) => ({ dim, text, scale, critical });
  const base = [
    question(0, "직원이 AI를 쓸 때, 예를 들어 회의록 초안은 AI에 맡기고 날짜와 결정 사항은 직접 확인하나요?"),
    question(0, "AI로 개선할 우선 업무를 정했나요?", policy),
    question(0, "예를 들어 회의록 정리에 AI를 써 보기로 했다면, 시험을 맡을 담당자가 정해져 있나요?", policy),
    question(1, "AI가 필요한 직원은 조직에서 허용한 AI 도구에 로그인해 업무에 쓸 수 있나요?"),
    question(1, "직원이 보고서 작성이나 자료 요약처럼 자기 업무와 비슷한 과제로 AI를 직접 써 봤나요?"),
    question(1, "보고서 작성에 도움이 된 AI 질문 예시나 양식을 다른 직원도 꺼내 쓸 수 있게 공유하나요?"),
    question(2, "AI로 만든 초안을 담당자가 검토한 뒤 보고서·공문 등 실제 업무에 사용하나요?"),
    question(2, "반복 업무에서 ‘AI는 설문을 집계하고, 담당자는 숫자가 맞는지 확인한다’처럼 역할을 나눠 쓰나요?"),
    question(2, "AI 적용 전후의 처리 시간이나 수정 횟수를 기록해 비교하나요?", measure),
    question(3, "AI에 입력할 수 있는 자료와 개인정보·기밀 등 입력할 수 없는 자료를 문서로 구분했나요?", policy, true),
    question(3, "내부 문서나 설문 자료를 AI에 넣기 전에, 그 자료를 사용해도 되는지 확인하는 기준이 있나요?", policy),
    question(3, "AI에 참고 자료를 줄 때 문서가 어디서 왔는지, 최신 문서인지 확인하나요?", policy),
    question(4, "업무에 쓸 수 있는 AI 서비스와 계정이 정해져 있나요? 예: 승인된 회사 계정만 사용", policy, true),
    question(4, "공문·보고서·대외 안내에 AI 결과를 쓰기 전에 담당자가 원자료와 대조하나요?", policy),
    question(4, "AI가 작성한 보고서나 공문을 제출하기 전에 최종 확인할 사람이 정해져 있나요?", policy, true),
  ];
  const agent = [
    question(5, "자동 실행 AI가 접근할 수 있는 자료와 시스템 권한을 업무에 필요한 범위로 제한했나요?", policy, true),
    question(5, "외부 발송이나 시스템 변경처럼 영향이 큰 실행 전에 사람이 승인하나요?", policy, true),
    question(5, "AI가 예상과 다르게 실행되면 담당자가 즉시 중단할 수 있나요?", policy, true),
  ];
  let questions = [], answers = [], current = 0, scope = "", agentUsage = "";
  const assessed = (value) => typeof value === "number";
  function summarize(items) {
    const scores = items.map(item => item.value).filter(assessed);
    return { score: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      count: scores.length, unknown: items.filter(i => i.value === "unknown").length,
      na: items.filter(i => i.value === "na").length };
  }
  const scoreLabel = s => s.score === null ? "판정 보류" : s.score.toFixed(1) + "/5.0";
  const coverage = s => "채점 " + s.count + " · 모름 " + s.unknown + " · 해당 없음 " + s.na;
  function show(screen) {
    ["intro", "quiz", "results"].forEach(key => { $("screen-" + key).style.display = key === screen ? "block" : "none"; });
    window.scrollTo(0, 0);
  }
  function renderQuestion() {
    const q = questions[current];
    $("progress-step").textContent = "문항 " + (current + 1) + " / " + questions.length;
    $("progress-dim").textContent = dimensions[q.dim];
    $("q-eyebrow").textContent = (q.dim === 5 ? "추가 점검 · " : "영역 " + (q.dim + 1) + " · ") + dimensions[q.dim];
    $("q-text").textContent = q.text;
    $("progress-fill").style.width = (current / questions.length * 100) + "%";
    const scale = $("q-scale");
    scale.replaceChildren();
    [...q.scale.map((label, idx) => [idx + 1, label]), ["unknown", "모름 · 확인이 필요함"], ["na", "해당 없음"]].forEach(([value, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scale-btn" + (answers[current] === value ? " selected" : "");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.textContent = assessed(value) ? String(value) : "–";
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.textContent = label;
      button.append(dot, text);
      button.addEventListener("click", () => {
        answers[current] = value;
        if (++current < questions.length) renderQuestion();
        else renderResults();
      });
      scale.append(button);
    });
    $("btn-prev").disabled = current === 0;
    $("q-text").focus({ preventScroll: true });
  }
  const actionByArea = [
    "개선할 업무 한 가지를 정하고 실행 담당자와 목표를 합의하세요.",
    "승인된 도구를 확인하고, 직무별 예시 과제로 기초 실습을 시작하세요.",
    "반복 업무 하나를 골라 작게 시험하고 처리 시간이나 수정 횟수를 전후 비교하세요.",
    "AI에 입력 가능한 자료와 금지 자료를 나누고 사용 권한을 확인하세요.",
    "승인 도구 목록과 결과 검토 기준을 정하고, 최종 검토자를 지정하세요.",
    "자동 실행의 접근 권한을 줄이고 사람 승인과 중단 절차를 확인하세요.",
  ];
  function renderResults() {
    const items = questions.map((q, i) => ({ ...q, value: answers[i] }));
    const use = summarize(items.filter(i => i.dim < 3));
    const safety = summarize(items.filter(i => i.dim === 3 || i.dim === 4));
    const criticalLow = items.filter(i => i.critical && assessed(i.value) && i.value < 4);
    const criticalUnclear = items.filter(i => i.critical && !assessed(i.value));
    const incomplete = use.count < 6 || safety.count < 4;
    const blocked = criticalLow.length > 0 || (safety.score !== null && safety.score < 3);
    const uncertain = criticalUnclear.length > 0 || incomplete || agentUsage === "unknown";
    const regions = dimensions.slice(0, agentUsage === "yes" ? 6 : 5).map((label, dim) => ({ label, dim, ...summarize(items.filter(i => i.dim === dim)) }));
    const scoredRegions = regions.filter(r => r.score !== null);
    const lowest = scoredRegions.length ? Math.min(...scoredRegions.map(r => r.score)) : null;
    const highest = scoredRegions.length ? Math.max(...scoredRegions.map(r => r.score)) : null;
    const weak = lowest !== highest ? scoredRegions.filter(r => r.score === lowest) : [];
    const strong = lowest !== highest ? scoredRegions.filter(r => r.score === highest && r.score >= 4) : [];
    $("res-stage-pill").textContent = blocked ? "안전 운영 우선" : uncertain ? "확인 후 판단" : "응답 범위 기준 자가점검";
    $("res-stage-title").textContent = blocked ? "AI 확대 전에 안전 기준을 먼저 정비하세요" : uncertain ? "확인되지 않은 항목부터 점검하세요" : use.score < 3 ? "작은 업무부터 AI 적용을 시작하세요" : "기준을 유지하며 업무 적용을 점검하세요";
    $("res-stage-desc").textContent = "응답 범위: " + scope + " · 두 점수는 분리해 해석합니다. 이 결과는 공식 등급이나 인증이 아닙니다.";
    $("res-score").textContent = scoreLabel(use);
    $("res-use-coverage").textContent = coverage(use);
    $("res-safety-score").textContent = scoreLabel(safety);
    $("res-safety-coverage").textContent = coverage(safety);
    const bars = $("res-dim-bars");
    bars.replaceChildren();
    regions.forEach(r => {
      const row = document.createElement("p");
      row.className = "fineprint";
      row.textContent = r.label + ": " + scoreLabel(r) + " (" + coverage(r) + ")";
      bars.append(row);
    });
    const callouts = $("res-callouts");
    callouts.replaceChildren();
    const note = (label, value) => {
      const p = document.createElement("p");
      p.className = "callout";
      p.textContent = label + ": " + value;
      callouts.append(p);
    };
    if (strong.length) note("현재 강점", strong.map(r => r.label).join(" · "));
    if (weak.length) note("상대적으로 보완할 영역", weak.map(r => r.label).join(" · "));
    if (criticalLow.length) note("우선 보완할 핵심 기준", criticalLow.map(i => i.text).join(" / "));
    if (criticalUnclear.length) note("확인이 필요한 핵심 기준", criticalUnclear.map(i => i.text).join(" / "));
    if (agentUsage === "unknown") note("추가 확인", "조직에서 AI가 자동으로 메일을 보내거나 시스템을 변경하는 업무가 있는지 먼저 확인하세요.");
    if (incomplete) note("응답 범위", "채점 가능한 응답이 부족합니다. 확인하지 못한 항목을 담당자와 점검한 뒤 다시 진단하세요.");
    $("res-next").textContent = blocked ? "승인된 도구 목록 확인 → 입력 금지 자료 정리 → 최종 검토자 지정 순으로 진행하세요." : uncertain ? "정책 문서와 담당자를 확인해 모르는 항목을 줄인 뒤 다시 점검하세요." : (weak.length === 1 ? actionByArea[weak[0].dim] : actionByArea[2]);
    if (blocked && criticalLow.some(i => i.dim === 5)) $("res-next").textContent += " 자동 실행 범위를 확대하기 전에 권한·승인·중단 절차도 확인하세요.";
    $("res-reco-title").textContent = blocked ? "생성형 AI 안전 활용·결과 검증 교육" : uncertain ? "담당자 사전 점검 및 과정 상담" : use.score < 3 ? "직무별 생성형 AI 기초 실습" : "업무 과제 중심 AI 적용 워크숍";
    $("res-reco-text").textContent = blocked ? "자료 보안, 결과 검증과 사람의 검토 기준을 먼저 다루는 과정을 권장합니다." : uncertain ? "도구, 자료, 책임 범위를 확인한 뒤 교육 목표를 정하세요." : "담당 업무와 참여자의 수준을 기준으로 실습 범위를 조정하세요.";
    $("btn-cta-mail").onclick = () => {
      try {
        sessionStorage.setItem("hai-ax-proposal", JSON.stringify({
          diagnosis: {version:"ax-v3", scope, agent:agentUsage, answers},
          preview: {
            headline: $("res-stage-title").textContent,
            scores: ["AI 활용 수준: " + scoreLabel(use), "안전 운영 준비: " + scoreLabel(safety), ...regions.map(r => r.label + ": " + scoreLabel(r))],
            items: items.map(i => i.text + " — " + (i.value === "unknown" ? "모름" : i.value === "na" ? "해당 없음" : i.scale[i.value - 1] + " (" + i.value + "/5)")),
          },
        }));
      } catch { /* The proposal form remains available if browser storage is blocked. */ }
    };
    show("results");
    $("res-stage-title").focus({ preventScroll: true });
  }
  $("btn-start").addEventListener("click", () => {
    scope = $("diagnosis-scope").value;
    agentUsage = $("diagnosis-agent").value;
    questions = agentUsage === "yes" ? base.concat(agent) : base;
    answers = new Array(questions.length);
    current = 0;
    show("quiz");
    renderQuestion();
  });
  $("btn-prev").addEventListener("click", () => { if (current > 0) { current--; renderQuestion(); } });
  const restart = () => { answers = []; current = 0; show("intro"); $("diagnosis-scope").focus(); };
  $("btn-restart-mid").addEventListener("click", restart);
  $("btn-restart-end").addEventListener("click", restart);
})();
