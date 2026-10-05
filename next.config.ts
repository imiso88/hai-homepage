import type { NextConfig } from "next";

// 메인(/)을 랜딩페이지(public/landing.html)로 표시합니다.
// ▶ 원복 방법: 아래 rewrites 블록을 지우면 기존 메인(app/page.tsx)이 다시 표시됩니다.
//   기존 메인은 /home-classic 에서 언제든 확인할 수 있습니다(검색 노출 제외).
const nextConfig: NextConfig = {
  // 이전 문의 페이지(contact.html)는 랜딩의 교육 문의 영역으로 보냅니다. 파일은 원복용으로 그대로 둡니다.
  // ▶ 원복 시 이 redirects 블록도 함께 지우세요.
  async redirects() {
    return [
      { source: "/contact.html", destination: "/#contact", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
