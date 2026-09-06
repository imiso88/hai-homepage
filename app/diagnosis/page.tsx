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
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      {/* 돌아가기 네비게이션 바 */}
      <Link 
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          backgroundColor: "#1b2340",
          color: "#ffffff",
          padding: "10px 18px",
          borderRadius: "20px",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "inline-flex",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
        href="/"
      >
        ← 홈페이지로 돌아가기
      </Link>
      
      {/* 동일 도메인 내의 정적 HTML 파일을 로드하여 보안 정책(CSP) 우회 */}
      <iframe
        src="/ax-readiness-check.html"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="AX 준비도 진단"
      />
    </div>
  );
}
