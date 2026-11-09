const areas = ["AI 이해·목표", "도구 접근·학습", "업무 적용·성과", "데이터 관리", "검증·안전 운영", "AI 자동 실행 안전"];
const topics = [
  "AI에 맡길 일과 사람이 확인할 일 구분", "개선할 우선 업무 선정", "AI 적용 담당자 지정",
  "승인된 AI 도구에 접근", "직무와 비슷한 과제 실습", "질문 예시·양식 공유",
  "AI 초안 검토 후 실무 사용", "반복 업무의 AI·사람 역할 분담", "처리 시간·수정 횟수 전후 비교",
  "AI에 입력할 수 있는 자료와 금지 자료 구분", "자료 사용 권한 확인", "참고 자료 출처와 최신 버전 확인",
  "업무용 AI 서비스·계정 지정", "대외 활용 전 원자료 대조", "최종 검토 책임자 지정",
  "자동 실행 권한 제한", "영향이 큰 실행 전 사람 승인", "오류 발생 시 즉시 중단",
];
const rollout = ["아직 하지 않음", "개인·소수만 시험", "일부 팀에서 적용", "필요한 팀에 적용", "적용 후 주기적으로 점검"];
const policy = ["기준 없음", "논의 또는 초안 단계", "일부 업무에서 적용", "대상 업무에 공식 적용", "공식 적용 후 주기적으로 점검"];
const measure = ["기록하지 않음", "체감이나 의견만 있음", "한 업무에서 전후 비교", "주요 적용 업무에서 전후 비교", "정기 비교 결과로 개선"];
const scales = topics.map((_, index) => index === 8 ? measure : index === 1 || index === 2 || index >= 9 ? policy : rollout);
type Answer = number | "unknown" | "na";
export type AxProposalDiagnosis = { version: "ax-v3"; scope: "조직 전체" | "내가 아는 부서"; agent: "yes" | "no" | "unknown"; answers: Answer[] };

export function readAxProposalDiagnosis(input: unknown): AxProposalDiagnosis | null {
  if (!input || typeof input !== "object") return null;
  const d = input as Record<string, unknown>;
  if (d.version !== "ax-v3" || (d.scope !== "조직 전체" && d.scope !== "내가 아는 부서") ||
    (d.agent !== "yes" && d.agent !== "no" && d.agent !== "unknown") || !Array.isArray(d.answers) ||
    d.answers.length !== (d.agent === "yes" ? 18 : 15) ||
    !d.answers.every(a => a === "unknown" || a === "na" || (typeof a === "number" && Number.isInteger(a) && a >= 1 && a <= 5))) return null;
  return { version: "ax-v3", scope: d.scope, agent: d.agent, answers: d.answers as Answer[] };
}
const score = (answers: Answer[]) => {
  const values = answers.filter((a): a is number => typeof a === "number");
  return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) + "/5.0" : "판정 보류";
};
export function formatAxProposalDiagnosis(d: AxProposalDiagnosis) {
  const lines = [
    "AX 자가진단 (" + d.version + ") · 응답 범위: " + d.scope,
    "AI 자동 실행: " + ({ yes: "사용 중", no: "사용하지 않음", unknown: "모름" })[d.agent],
    "AI 활용 수준: " + score(d.answers.slice(0, 9)) + " · 안전 운영 준비: " + score(d.answers.slice(9, 15)),
    ...areas.slice(0, d.agent === "yes" ? 6 : 5).map((label, index) => label + ": " + score(d.answers.slice(index * 3, index * 3 + 3))),
    "",
    ...d.answers.map((a, i) => (i + 1) + ". " + topics[i] + " — " + (a === "unknown" ? "모름" : a === "na" ? "해당 없음" : scales[i][a - 1] + " (" + a + "/5)")),
  ];
  return lines.join("\n");
}
