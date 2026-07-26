import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.humanai-edu.kr"),
  title: "배미주 박사 | AI 교육·AX 컨설턴트 | 휴먼AI융합교육원",
  description:
    "교육학 박사 배미주. 기업·공공기관의 생성형 AI 교육, 업무혁신, AX 전환을 실제 산출물 중심으로 설계합니다.",
  icons: { icon: "/logo.png", shortcut: "/logo.png" },
  openGraph: {
    type: "profile",
    locale: "ko_KR",
    siteName: "휴먼AI융합교육원",
    title: "배미주 박사 | AI 교육·AX 컨설턴트",
    description: "기술보다 사람과 현장을 먼저 보는 AI 교육·AX 전환 설계자",
  },
  twitter: {
    card: "summary_large_image",
    title: "배미주 박사 | AI 교육·AX 컨설턴트",
    description: "기술보다 사람과 현장을 먼저 보는 AI 교육·AX 전환 설계자",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}


