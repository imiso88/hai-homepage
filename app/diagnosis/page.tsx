import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AX 준비도 자가진단 | 휴먼AI융합교육원",
  description: "조직의 AI 활용 현황과 우선 교육과제를 살펴보는 선택형 자가진단입니다. 교육 문의는 진단 없이 바로 가능합니다.",
  alternates: { canonical: "/diagnosis" },
  openGraph: { title: "AX 준비도 자가진단 | 휴먼AI융합교육원", url: "https://www.humanai-edu.kr/diagnosis" },
};

import Link from "next/link";

export default function DiagnosisPage() {
  return (
    <div style={{ width: "100%", height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 돌아가기 바: 진단 화면 위에 겹치지 않도록 별도 줄로 배치 */}
      <div style={{ flex: "none", backgroundColor: "#1b2340", padding: "6px 12px" }}>
        <Link
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            minHeight: "40px",
            padding: "0 6px",
          }}
          href="/"
        >
          ← 홈페이지로 돌아가기
        </Link>
      </div>

      {/* 동일 도메인 내의 정적 HTML 파일을 로드하여 보안 정책(CSP) 우회 */}
      <iframe
        src="/ax-readiness-check.html"
        style={{ flex: 1, width: "100%", border: "none" }}
        title="AX 준비도 진단"
      />
    </div>
  );
}
