import type { Metadata } from "next";
import ClassicHome from "../page";

// 원복 대비용: 기존 메인 화면을 그대로 보여주는 확인용 주소 (검색엔진 노출 제외)
export const metadata: Metadata = {
  title: "기존 메인 (보관용) | 휴먼AI융합교육원",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default ClassicHome;
