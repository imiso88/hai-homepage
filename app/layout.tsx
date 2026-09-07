import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.humanai-edu.kr"),
  title: "기업·공공기관 AI 교육 | 배미주 박사 · 휴먼AI융합교육원",
  description:
    "휴먼AI융합교육원 원장 배미주 박사가 기업·공공기관의 생성형 AI 교육과 AX 전환을 실제 업무 산출물 중심으로 설계합니다.",
  alternates: { canonical: "/" },
  icons: { icon: "/logo.png", shortcut: "/logo.png" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.humanai-edu.kr/",
    images: ["/og-image.jpg"],
    siteName: "휴먼AI융합교육원",
    title: "기업·공공기관 AI 교육 | 배미주 박사",
    description: "휴먼AI융합교육원 원장 배미주 박사의 기업·공공기관 생성형 AI·AX 전환 교육",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
    title: "기업·공공기관 AI 교육 | 배미주 박사",
    description: "휴먼AI융합교육원 원장 배미주 박사의 기업·공공기관 생성형 AI·AX 전환 교육",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}


