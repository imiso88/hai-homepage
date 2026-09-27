"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const featuredPartners = [
  { name: "문화체육관광부", logo: "/partner-logos/mcst-7.jpg" },
  { name: "중소벤처기업부", logo: "/partner-logos/mss.svg" },
  { name: "행정안전부 지방자치인재개발원", logo: "/partner-logos/logodi.png" },
  { name: "경기도인재개발원", logo: "/partner-logos/gyeonggi.png" },
  { name: "세종시교육청교육원", logo: "/partner-logos/sejong.jpg" },
  { name: "한국여성인권진흥원", logo: "/partner-logos/kwdi.png" },
  { name: "3M", logo: "/partner-logos/3m.svg" },
  { name: "크라운제과", logo: "/partner-logos/crown.png" },
  { name: "KG케미컬", logo: "/partner-logos/kgchem.jpg" },
  { name: "패스트캠퍼스", logo: "/partner-logos/fastcampus.svg" },
  { name: "병무청", logo: "/partner-logos/mma.svg" },
  { name: "한국PR기업협회", logo: "/partner-logos/kprca.png" },
];

const privacyMasks = [
  [46.1, 44.0, 4.4, 8.5],
];

const cases = [
  {
    tag: "공공기관",
    title: "바이브코딩 실무교육",
    problem: "도구 소개에 머문 교육을 실제 업무 적용으로 연결",
    outcome: "개인별 업무자동화 아이디어와 프로토타입 완성",
    image: "/field-ai-workshop-3m-clean.jpg",
  },
  {
    tag: "기업·경영진",
    title: "AI 활용 수준 진단",
    problem: "부서별 활용 격차와 도입 우선순위를 객관적으로 확인",
    outcome: "경영진 의사결정용 진단 리포트와 실행 방향 제안",
    image: null,
  },
  {
    tag: "중앙부처",
    title: "정책소통 AI 교육",
    problem: "정책자료 분석을 홍보 콘텐츠 제작 실무와 연결",
    outcome: "핵심 메시지·보도자료·카드뉴스 결과물 제작",
    image: null,
  },
];

const educationArticles = [
  {
    outlet: "경북일보",
    date: "2025.09.30",
    isoDate: "2025-09-30",
    title: "“팩트 체크는 기자 몫”…경북일보, 배미주 박사 초청 ‘생성형 AI’ 교육",
    href: "https://www.kyongbuk.co.kr/news/articleView.html?idxno=4053334",
  },
  {
    outlet: "파이낸스투데이",
    date: "2025.07.15",
    isoDate: "2025-07-15",
    title: "‘AI가 실무를 바꾸다!’, 충남디스플레이산업기업협의회, 생성형 AI 실무 교육 성료",
    href: "https://www.fntoday.co.kr/news/articleView.html?idxno=357307",
  },
  {
    outlet: "파이낸스투데이",
    date: "2025.04.19",
    isoDate: "2025-04-19",
    title: "“AI는 이제 공무원의 팀원”… 마포구청, 간부 대상 ‘생성형 AI 실무교육’ 진행",
    href: "https://www.fntoday.co.kr/news/articleView.html?idxno=349823",
  },
];

const testimonials = [
  {
    organization: "중앙부처 현직 공무원",
    name: "김0정",
    summary: "정책소통에 AI·빅데이터를 적용하는 방향과 출처 검증법을 익히고, 후속 심화과정까지 요청했습니다.",
    quote: "정책 소통에 AI와 빅데이터를 어떻게 활용할지 궁금했는데, 실무 적용 방향과 출처 검증 방법까지 함께 익힐 수 있었습니다. 다음 과정에서는 NotebookLM·Perplexity를 활용한 정책자료 비교·검증과 인포그래픽 제작을 더 깊이 배우고 싶습니다.",
  },
  {
    organization: "방위사업청 표준지원팀",
    name: "이0현",
    summary: "AI와 빅데이터의 정책소통 활용을 이해하고, 업무와 연결할 인사이트를 얻었습니다.",
    quote: "빅데이터와 AI가 실제 정책 소통에 어떻게 활용되는지 이해하고, 업무에 바로 적용할 수 있는 인사이트를 얻었습니다.",
  },
  {
    organization: "국가기록원 기록관리 담당자",
    name: "박0민",
    summary: "사례·실습 중심 교육으로 기록관리와 정책소통 업무의 연관성을 구체적으로 확인했습니다.",
    quote: "사례와 실습 중심으로 구성되어 실제 기록관리와 정책 소통 업무의 연결성을 구체적으로 체감할 수 있었습니다.",
  },
  {
    organization: "질병관리청 홍보업무 담당자",
    name: "최0서",
    summary: "NotebookLM과 데이터 기반 메시지 설계를 익히며 AI 활용 자신감을 높였습니다.",
    quote: "NotebookLM의 다양한 기능과 데이터 기반 메시지 설계 과정을 익히며 AI를 업무에 적용할 자신감이 생겼습니다.",
  },
  {
    organization: "KG케미칼 임직원",
    name: "정0윤",
    summary: "낯설던 AI 도구를 실생활과 회사 업무에 연결하며 활용 의지가 높아졌습니다.",
    quote: "AI 도구가 낯설었지만 실생활과 회사 업무에 바로 적용할 수 있는 방법을 배우면서 활용 의지가 크게 높아졌습니다.",
  },
  {
    organization: "공공기관 바이브코딩 교육 참가자",
    name: "한0진",
    summary: "코딩 부담을 낮추고 공문·반복업무용 도구를 직접 만들며 후속 자동화 과정도 요청했습니다.",
    quote: "코딩을 몰라도 공문 작성과 반복업무를 줄이는 도구를 직접 만들어 보니 업무혁신이 현실적으로 느껴졌습니다. 후속 과정에서는 팀 공용 자동화 도구를 완성하고 공유·배포하는 단계까지 배우고 싶습니다.",
  },
  {
    organization: "중앙부처 대변인실 참가자",
    name: "오0은",
    summary: "정책자료의 핵심 메시지를 대상별 표현으로 바꾸는 실습의 직무 연관성을 확인했습니다.",
    quote: "정책자료에서 핵심 메시지를 도출하고 대상별 표현으로 바꾸는 실습이 보도자료와 정책홍보 업무에 특히 유용했습니다.",
  },
  {
    organization: "국가데이터처 참가자",
    name: "서0우",
    summary: "근거 검증과 시각화까지 실습한 뒤 공공데이터 심화과정 참여 의사를 밝혔습니다.",
    quote: "데이터를 요약하는 데서 끝나지 않고 근거를 검증하고 시각화해 설명하는 과정까지 연결되어 실무 활용도가 높았습니다. 다음에는 데이터 품질 검증과 시각화 자동화를 실제 공공데이터 과제로 수행하는 심화과정에도 참여하고 싶습니다.",
  },
  {
    organization: "지자체 행정업무 담당자",
    name: "윤0희",
    summary: "막연했던 생성형 AI를 실제 행정업무에 적용하며 활용 기준을 잡고 후속 자동화 학습을 요청했습니다.",
    quote: "막연하게 느껴졌던 생성형 AI를 민원 안내, 보고자료 정리, 회의 결과 요약 등 실제 행정업무에 적용해 보면서 활용 기준을 잡을 수 있었습니다. 부서의 반복업무를 자동화하는 실습 과정도 이어서 배우고 싶습니다.",
  },
];

const learningTracks = [
  {
    stage: "기초",
    title: "AI 리터러시와 안전한 활용",
    time: "2시간 특강",
    points: ["ChatGPT·Gemini·Claude·NotebookLM 특성 비교", "개인정보·보안 기준과 출처 검증", "AI 기본법에 따른 생성물 표시 원칙"],
    output: "기관·부서용 AI 활용 체크리스트",
    href: "/public-ai-training.html",
  },
  {
    stage: "실무",
    title: "직무별 업무 결과물 실습",
    time: "4~6시간 실습",
    points: ["보고서·기획안·공문 초안 작성", "정책자료·데이터 분석과 요약", "보도자료·카드뉴스 등 홍보 콘텐츠"],
    output: "1인 1산출물과 직무별 프롬프트",
    href: "/corporate-ai-training.html",
  },
  {
    stage: "확장",
    title: "AI 에이전트와 업무자동화",
    time: "1~2일 랩 · 프로젝트형",
    points: ["업무를 단계로 쪼개 AI에게 맡기는 법", "지시서·참고자료 설계(컨텍스트 엔지니어링)", "바이브코딩으로 반복업무 도구 제작"],
    output: "업무 위임 지시서와 자동화 시제품",
    href: "/ai-agent-training.html",
  },
  {
    stage: "정착",
    title: "교육 효과 측정과 확산",
    time: "교육 후 1~3개월",
    points: ["사전·사후 AI 활용 역량 진단", "현업 적용도 조사와 우수사례 발굴", "부서별 표준 템플릿·활용지침 정리"],
    output: "교육 효과 분석 리포트",
    href: "/programs.html#impact",
  },
];

function WorkshopPhoto({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "workshop-photo compact" : "workshop-photo"}>
      <Image
        src="/field-ai-workshop-3m-clean.jpg"
        fill
        alt="참여자가 노트북으로 AI 활용을 실습하는 교육 현장"
        sizes={compact ? "(max-width: 640px) calc(100vw - 60px), 340px" : "(max-width: 960px) calc(100vw - 30px), 680px"}
      />
      <div className="privacy-layer" aria-hidden="true">
        {privacyMasks.map(([left, top, width, height], index) => (
          <span
            key={index}
            style={{ left: `${left}%`, top: `${top + 9}%`, width: `${width}%`, height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openTestimonial, setOpenTestimonial] = useState<number | null>(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    if (next) {
      video.volume = 0.6;
      video.play().catch(() => {});
    }
    setSoundOn(next);
  };

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (reduce.matches) {
        video.pause();
        video.currentTime = 2.8;
      } else {
        video.play().catch(() => {});
      }
    };
    apply();
    reduce.addEventListener("change", apply);
    return () => reduce.removeEventListener("change", apply);
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="wrap nav">
          <a className="brand" href="#top" aria-label="휴먼AI융합교육원 홈 맨 위로">
            <Image src="/brand-logo-transparent.png" width={1050} height={600} alt="휴먼AI융합교육원 로고" priority />
            <span>휴먼AI융합교육원</span>
          </a>
          <nav
            id="mobile-navigation"
            className={menuOpen ? "nav-links open" : "nav-links"}
            aria-label="주요 메뉴"
          >
            <a href="/ax-transformation.html" onClick={() => setMenuOpen(false)}>AX 전환</a>
            <a href="/programs.html" onClick={() => setMenuOpen(false)}>교육 프로그램</a>
            <a href="/cases.html" onClick={() => setMenuOpen(false)}>교육 사례</a>
            <a href="/about.html" onClick={() => setMenuOpen(false)}>교육원 소개</a>
            <a href="/expert.html" onClick={() => setMenuOpen(false)}>전문가 소개</a>
            <a href="/faq.html" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="nav-actions">
            <a href="/contact.html" className="btn btn-small btn-primary desktop-cta">
              AI 교육 문의
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-image-shell">
            <div className="hero-motion">
              <video
                ref={heroVideoRef}
                className="hero-motion-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/hero-motion-poster.jpg"
                aria-label="휴먼AI융합교육원 소개 모션그래픽: 배운 그날 바로 쓰는 AI, 반복업무 자동화, ChatGPT·Claude 실습, 주간보고 자동화 실습, 교육 문의 안내"
              >
                <source src="/hero-motion.mp4" type="video/mp4" />
              </video>
              <button
                type="button"
                className="hero-sound-toggle"
                aria-pressed={soundOn}
                aria-label={soundOn ? "영상 소리 끄기" : "영상 소리 켜기"}
                onClick={toggleSound}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
                  {soundOn ? (
                    <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  ) : (
                    <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
                <span>{soundOn ? "소리 끄기" : "소리 켜기"}</span>
              </button>
            </div>
            <div className="hero-copy-band">
              <div className="hero-copy-main">
                <p className="eyebrow">기업·공공기관 직무 맞춤형 생성형 AI 교육</p>
                <h1><span>업무 결과물까지<wbr /> 완성하는</span> <span>기업·공공기관<wbr /> AI 교육</span></h1>
                <p className="hero-screen-lead"><span>구성원의 직무·AI 수준·기관 보안 기준을<wbr /> 사전 분석하고,</span> <span>보고서·자료 분석·공문·콘텐츠 제작을<wbr /> 실제 과제로 실습합니다.</span></p>
              </div>
              <div className="hero-copy-side">
                <div className="hero-actions">
                  <a className="btn btn-primary" href="/contact.html">맞춤형 AI 교육 문의하기</a>
                  <a className="btn btn-outline" href="/programs.html">교육과정·사례 확인하기</a>
                </div>
                <p className="audit-help"><span aria-hidden="true">✓</span> 주제·일정·인원이 미정이어도 됩니다. 기관명과 교육 대상만 알려주시면 추천 과정과 진행안을 안내합니다.</p>
              </div>
              <ul className="hero-benefits" aria-label="맞춤 교육 설계 과정">
                <li><strong>교육 전 요구진단</strong><span>직무·수준·업무과제·보안 기준 확인</span></li>
                <li><strong>실제 업무로 실습</strong><span>보고서·정책자료·데이터·홍보 과제</span></li>
                <li><strong>1인 1산출물</strong><span>업무 템플릿과 활용 결과물 완성</span></li>
              </ul>
            </div>
          </div>
          <div className="stats-bar">
            <div className="wrap stats">
              <div><strong>Ph.D.</strong><span>교육학 박사</span></div>
              <div><strong>12권</strong><span>AI 저서</span></div>
              <div><strong>145+</strong><span>출강 기관</span></div>
              <div><strong>10,000+</strong><span>누적 수강생</span></div>
            </div>
            <p className="wrap stats-note">
              2026년 9월 기준 · 저서 12권 목록과 전체 출강 기관은 <a href="/profile.html">상세 이력</a>에서 확인하실 수 있습니다.
            </p>
          </div>
        </section>

        <section className="hero-video-section" aria-labelledby="hero-video-title">
          <div className="wrap hero-video-wrap">
            <div className="section-heading center">
              <p className="eyebrow">AI EDUCATION VIDEO</p>
              <h2 id="hero-video-title">실제 AI 교육 현장을 영상으로 확인하세요</h2>
              <p>실제 교육 사진으로 구성한 현장 스케치에서 강의와 참여형 실습 모습을 확인하세요.</p>
            </div>
            <div className="hero-video-card">
              <video
                controls
                preload="metadata"
                poster="/education-photo-01.jpg"
                playsInline
                aria-label="배미주 박사의 기업·공공기관 실제 AI 교육 현장 스케치 영상"
              >
                <source src="/actual-ai-training-highlights.mp4" type="video/mp4" />
                영상 재생을 지원하지 않는 브라우저입니다.
              </video>
            </div>
          </div>
        </section>

        <section className="featured-partners" aria-labelledby="featured-partners-title">
          <div className="wrap featured-partners-inner">
            <div className="featured-partners-heading">
              <p className="eyebrow">SELECTED EDUCATION CLIENTS</p>
              <h2 id="featured-partners-title">주요 교육 수행기관</h2>
              <p>정부·공공기관과 국내외 기업의 실제 업무 현장에서 교육을 진행했습니다.</p>
            </div>
            <div className="logo-marquee" role="region" aria-label="주요 교육 수행기관 로고">
              <ul className="logo-track">
                {[...featuredPartners, ...featuredPartners].map((partner, index) => {
                  const duplicate = index >= featuredPartners.length;
                  return (
                    <li className="logo-item" key={`${partner.name}-${index}`} aria-hidden={duplicate ? true : undefined}>
                      <Image src={partner.logo} width={260} height={88} alt={duplicate ? "" : `${partner.name} 로고`} />
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="featured-partners-note">기관명과 로고는 교육 수행 이력을 알리기 위한 식별 목적으로 사용했습니다.</p>
          </div>
        </section>


        <section className="intro">
          <div className="wrap intro-grid">
            <p className="eyebrow">HUMAN FIRST</p>
            <blockquote>
              “배운 AI가 현장에서 사용될 때 교육이 되고,
              <br />일하는 방식이 달라질 때 비로소 혁신이 됩니다.”
            </blockquote>
            <p>
              기능을 빠르게 보여주는 데서 멈추지 않습니다. 구성원의 수준과 업무과제를 먼저 이해하고,
              직접 만든 결과물이 조직 안에서 계속 활용되도록 돕습니다.
            </p>
          </div>
        </section>

        <section className="audit-programs" aria-labelledby="programs-title">
          <div className="wrap">
            <div className="section-heading"><h2 id="programs-title">우리 조직에 맞는 교육을 찾아보세요</h2><p>교육 대상과 만들고 싶은 결과물로 과정을 비교할 수 있습니다.</p></div>
            <div className="highlight-grid four">
              <a className="highlight-card" href="/corporate-ai-training.html"><h3>기업 실무교육</h3><p>보고서·기획안·자료 분석을 업무용 초안과 템플릿으로 연결합니다.</p></a>
              <a className="highlight-card" href="/public-ai-training.html"><h3>공공기관 AI 교육</h3><p>공문·정책자료·민원 업무와 기관의 보안 기준을 함께 다룹니다.</p></a>
              <a className="highlight-card" href="/executive-ax-training.html"><h3>임원·관리자 AX 교육</h3><p>AI 적용 우선순위와 조직의 실행 과제를 정리합니다.</p></a>
              <a className="highlight-card" href="/ai-automation-training.html"><h3>업무자동화 실습</h3><p>AI와 대화하며 반복업무를 돕는 도구의 시제품을 만듭니다.</p></a>
            </div>
          </div>
        </section>


        <section id="learning-path" className="expertise-section" aria-labelledby="learning-path-title">
          <div className="wrap">
            <div className="section-heading light">
              <p className="eyebrow">2026 LEARNING PATH</p>
              <h2 id="learning-path-title">도구 사용법에서,<br />AI에게 일을 맡기는 조직으로</h2>
              <p>조직의 AX 단계에 맞춰 네 개 트랙 중 필요한 구간부터 시작합니다. 앞 단계의 결과물이 다음 단계의 실습 재료가 됩니다.</p>
            </div>
            <ol className="track-grid">
              {learningTracks.map((track, index) => (
                <li className="track-card" key={track.title}>
                  <div className="track-top">
                    <span className="track-step">{String(index + 1).padStart(2, "0")} · {track.stage}</span>
                    <span className="track-time">{track.time}</span>
                  </div>
                  <h3>{track.title}</h3>
                  <ul>
                    {track.points.map((point) => <li key={point}>{point}</li>)}
                  </ul>
                  <p className="track-output"><strong>남는 결과물</strong>{track.output}</p>
                  <a className="text-link" href={track.href}>과정 자세히 보기 →</a>
                </li>
              ))}
            </ol>
            <p className="track-footnote">
              서울국제AI영화제 공식 MC·GV 활동은 <a href="/mc.html">AI 영화제 MC 페이지</a>에서 확인하실 수 있습니다.
            </p>
          </div>
        </section>

        <section id="cases">
          <div className="wrap">
            <div className="section-heading">
              <p className="eyebrow">SELECTED CASES</p>
              <h2>먼저 분석하고, 결과물이 남도록 설계합니다</h2>
            </div>
            <div className="case-grid">
              {cases.map((item) => (
                <article className="case-card" key={item.title}>
                  {item.image && (
                    <figure className="case-photo">
                      <WorkshopPhoto compact />
                      <figcaption className="sr-only">바이브코딩 업무자동화 실습 현장</figcaption>
                    </figure>
                  )}
                  <span className="tag">{item.tag}</span>
                  <h3>{item.title}</h3>
                  <dl>
                    <div><dt>해결 과제</dt><dd>{item.problem}</dd></div>
                    <div><dt>남은 결과</dt><dd>{item.outcome}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="center-action">
              <a className="btn btn-outline" href="/cases.html">기관별 교육 사례 자세히 보기</a>
              <a className="btn btn-primary" href="/contact.html">
                우리 조직에 맞는 과정 문의
              </a>
            </div>
          </div>
        </section>

        <section className="education-press" aria-labelledby="education-press-title">
          <div className="wrap">
            <div className="section-heading">
              <p className="eyebrow">EDUCATION IN THE NEWS</p>
              <h2 id="education-press-title">배미주 박사 교육 관련 기사</h2>
              <p>기업·공공기관에서 진행한 생성형 AI 실무교육을 언론 보도로 확인해 보세요.</p>
            </div>
            <div className="article-grid">
              {educationArticles.map((article) => (
                <a
                  className="article-card"
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={article.href}
                  aria-label={`${article.title} 원문 기사 새 창에서 보기`}
                >
                  <div className="article-meta"><strong>{article.outlet}</strong><time dateTime={article.isoDate}>{article.date}</time></div>
                  <h3>{article.title}</h3>
                  <span>원문 기사 보기 <span aria-hidden="true">↗</span></span>
                </a>
              ))}
            </div>
            <div className="center-action">
              <a className="btn btn-outline" href="/education-news.html">교육 관련 기사 전체 보기</a>
            </div>
          </div>
        </section>

        <section className="testimonial-section">
          <div className="wrap">
            <div className="section-heading center">
              <p className="eyebrow">FIELD IMPACT</p>
              <h2>현장에서 확인된 변화</h2>
              <p>
                단순히 AI 기능을 소개하는 데 그치지 않고, 교육생이 직접 결과물을 완성하고
                자신의 업무와 연결할 수 있도록 설계합니다.
                <br />
                교육청·인재개발원·공공기관·기업 교육 현장에서 확인한 참여자의 변화와
                지속적인 교육 의뢰 사례를 소개합니다.
              </p>
            </div>
            <div className="testimonial-accordion">
              {testimonials.map((item, index) => {
                const isOpen = openTestimonial === index;
                const panelId = `testimonial-panel-${index + 1}`;
                return (
                  <article
                    className={`testimonial-item${index === 0 ? " featured" : ""}${isOpen ? " open" : ""}`}
                    key={`${item.organization}-${item.name}`}
                  >
                    {index === 0 && <p className="testimonial-label">대표 후기</p>}
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenTestimonial(isOpen ? null : index)}
                      >
                        <span className="testimonial-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="testimonial-summary">{item.summary}</span>
                        <span className="testimonial-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                      </button>
                    </h3>
                    <div className="testimonial-panel" id={panelId} hidden={!isOpen}>
                      <blockquote>“{item.quote}”</blockquote>
                      <div className="testimonial-meta">
                        <strong>{item.name}</strong>
                        <span>{item.organization}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>
        </section>

        <section className="final-cta">
          <div className="wrap final-cta-inner">
            <div>
              <p className="eyebrow">START WITH YOUR WORK</p>
              <h2>우리 조직의 AI 교육,<br />업무과제부터 함께 살펴보겠습니다</h2>
              <p>기관명, 교육 대상과 희망 주제만 알려주세요. 일정·인원이 미정이어도 적합한 방향을 안내합니다.</p>
            </div>
            <div className="cta-buttons">
              <a className="btn btn-primary" href="/contact.html">
                AI 교육 문의하기
              </a>
              <a href="/diagnosis" className="btn btn-light" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                5분 AX 준비도 진단
              </a>
              <a href="/ai-training-request-guide.html" className="cta-text-link">
                교육 담당자용 품의 자료 보기 →
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-lockup">
              <Image src="/brand-logo-transparent.png" width={1050} height={600} alt="휴먼AI융합교육원 로고" />
              <strong>휴먼AI융합교육원</strong>
            </div>
            <p className="foot-eyebrow">AX TRANSFORMATION PARTNER</p>
            <p className="foot-tagline">조직의 업무혁신과 AX 전환을 함께 설계하는 전략 파트너.</p>
          </div>
          <div>
            <h3>교육</h3>
            <a href="/corporate-ai-training.html">기업 생성형 AI 교육</a>
            <a href="/public-ai-training.html">공공기관 AI 교육</a>
            <a href="/executive-ax-training.html">임원 AX 전략교육</a>
            <a href="/ai-automation-training.html">바이브코딩 랩</a>
            <a href="/ai-agent-training.html">AI 에이전트 교육</a>
            <a href="/small-business-ai-training.html">소상공인 AI 교육</a>
          </div>
          <div>
            <h3>교육원</h3>
            <a href="/ax-transformation.html">AX 전환이란</a>
            <a href="/about.html">교육원 소개</a>
            <a href="/expert.html">전문가 소개</a>
            <a href="/mc.html">AI 영화제 MC·GV</a>
            <a href="/insights.html">AI 교육 인사이트</a>
            <a href="/faq.html">FAQ</a>
          </div>
          <div>
            <h3>문의</h3>
            <a href="/contact.html">AI 교육 문의</a>
            <a href="/ai-training-request-guide.html">교육 담당자 자료실</a>
            <a href="/privacy.html">개인정보처리방침</a>
            <a href="https://blog.naver.com/ai-ed" target="_blank" rel="noreferrer">네이버 블로그</a>
            <a href="https://www.youtube.com/@Justdoit-%EA%B7%B8%EB%83%A5AI" target="_blank" rel="noreferrer">유튜브</a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 휴먼AI융합교육원. All rights reserved. · 사업자등록번호 352-16-02365</span>
          <span>Human First · Workflow Design · Real Transformation</span>
        </div>
      </footer>

      <a className="floating-contact" href="/contact.html" aria-label="교육 문의 페이지로 이동">
        <span>교육</span>문의
      </a>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://www.humanai-edu.kr/#website",
                url: "https://www.humanai-edu.kr/",
                name: "휴먼AI융합교육원",
                inLanguage: "ko-KR",
                publisher: { "@id": "https://www.humanai-edu.kr/#organization" },
              },
              {
                "@type": "EducationalOrganization",
                "@id": "https://www.humanai-edu.kr/#organization",
                name: "휴먼AI융합교육원",
                url: "https://www.humanai-edu.kr/",
                logo: "https://www.humanai-edu.kr/logo.png",
                description: "기업·공공기관의 생성형 AI 교육과 AX 전환을 설계하는 전문 교육기관",
                founder: { "@id": "https://www.humanai-edu.kr/expert.html#person" },
                employee: { "@id": "https://www.humanai-edu.kr/expert.html#person" },
                email: "orthia66@gmail.com",
                telephone: "010-6398-5354",
                sameAs: [
                  "https://blog.naver.com/ai-ed",
                  "https://www.youtube.com/@Justdoit-%EA%B7%B8%EB%83%A5AI",
                ],
              },
              {
                "@type": "Person",
                "@id": "https://www.humanai-edu.kr/expert.html#person",
                name: "배미주",
                honorificSuffix: "교육학 박사",
                jobTitle: "휴먼AI융합교육원 원장 · AI 교육 컨설턴트",
                url: "https://www.humanai-edu.kr/expert.html",
                image: "https://www.humanai-edu.kr/profile-photo.jpg",
                worksFor: { "@id": "https://www.humanai-edu.kr/#organization" },
                knowsAbout: ["생성형 AI 교육", "AX 전환", "프롬프트 설계", "AI 에이전트 활용", "컨텍스트 엔지니어링", "바이브코딩", "업무자동화 교육", "AI 리터러시", "교육 효과 측정"],
                sameAs: [
                  "https://trend-m.com/lecture/?bmode=view&idx=57246101",
                  "https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000005370408",
                  "https://blog.naver.com/ai-ed",
                ],
              },
              {
                "@type": "WebPage",
                "@id": "https://www.humanai-edu.kr/#webpage",
                url: "https://www.humanai-edu.kr/",
                name: "기업·공공기관 AI 교육 | 휴먼AI융합교육원",
                isPartOf: { "@id": "https://www.humanai-edu.kr/#website" },
                about: { "@id": "https://www.humanai-edu.kr/#organization" },
                mainEntity: { "@id": "https://www.humanai-edu.kr/expert.html#person" },
                inLanguage: "ko-KR",
              },
            ],
          }),
        }}
      />
    </>
  );
}
