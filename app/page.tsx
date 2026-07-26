"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

const FORM_URL = "https://forms.gle/3Ee7fwzN5gBRDurWA";
const EMAIL = "orthia66@gmail.com";
const PHONE = "010-6398-5354";

const highlights = [
  ["Ph.D.", "교육학 박사", "교육과정·공학과 교육심리를 바탕으로 조직 맞춤 교육을 설계합니다."],
  ["12권", "AI 저서 집필", "AI 리터러시부터 실무 활용·콘텐츠 제작까지 지식을 체계화했습니다."],
  ["145+", "출강 기관", "대학·정부·지자체·기업의 다양한 업무 환경을 경험했습니다."],
  ["10,000+", "누적 수강생", "초보자부터 임원·실무자까지 수준에 맞는 교육을 진행했습니다."],
  ["공공·기업", "직무 맞춤 교육", "실제 보고서·정책·민원·데이터·홍보 업무로 실습합니다."],
  ["검증·책임", "안전한 AI 활용", "출처·사실·수치·개인정보·보안을 함께 점검합니다."],
];

const universityClients = [
  "강원대", "부산대", "원광대", "경복대", "인제대", "연세대", "유원대", "동양대",
  "대진대", "대전대", "한양대", "한림대", "극동대", "청주대", "동국대", "인덕대",
  "부천대", "공주대", "가톨릭대", "한양대 최고위과정", "인천대 CEO 과정",
];

const organizationClients = [
  "중소벤처기업부", "문화체육관광부", "행정안전부", "법무부", "과학기술정보통신부",
  "교육부", "국가보훈부", "조달청", "지방자치인재개발원", "경기도인재개발원",
  "세종시교육청", "대구광역시", "광주광역시", "의정부시", "천안시", "포천시",
  "삼성 홈플러스", "풀무원식품", "3M", "KG케미칼", "패스트캠퍼스", "한국산업안전보건공단",
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
    image: "/field-ai-workshop-original.jpg",
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

const testimonials = [
  {
    organization: "중앙부처 현직 공무원",
    name: "김0정",
    quote: "정책 소통에 AI와 빅데이터를 어떻게 활용할지 궁금했는데, 실무 적용 방향과 출처 검증 방법까지 함께 익힐 수 있었습니다. 다음 과정에서는 NotebookLM·Perplexity를 활용한 정책자료 비교·검증과 인포그래픽 제작을 더 깊이 배우고 싶습니다.",
  },
  {
    organization: "방위사업청 표준지원팀",
    name: "이0현",
    quote: "빅데이터와 AI가 실제 정책 소통에 어떻게 활용되는지 이해하고, 업무에 바로 적용할 수 있는 인사이트를 얻었습니다.",
  },
  {
    organization: "국가기록원 기록관리 담당자",
    name: "박0민",
    quote: "사례와 실습 중심으로 구성되어 실제 기록관리와 정책 소통 업무의 연결성을 구체적으로 체감할 수 있었습니다.",
  },
  {
    organization: "질병관리청 홍보업무 담당자",
    name: "최0서",
    quote: "NotebookLM의 다양한 기능과 데이터 기반 메시지 설계 과정을 익히며 AI를 업무에 적용할 자신감이 생겼습니다.",
  },
  {
    organization: "KG케미칼 임직원",
    name: "정0윤",
    quote: "AI 도구가 낯설었지만 실생활과 회사 업무에 바로 적용할 수 있는 방법을 배우면서 활용 의지가 크게 높아졌습니다.",
  },
  {
    organization: "공공기관 바이브코딩 교육 참가자",
    name: "한0진",
    quote: "코딩을 몰라도 공문 작성과 반복업무를 줄이는 도구를 직접 만들어 보니 업무혁신이 현실적으로 느껴졌습니다. 후속 과정에서는 팀 공용 자동화 도구를 완성하고 공유·배포하는 단계까지 배우고 싶습니다.",
  },
  {
    organization: "중앙부처 대변인실 참가자",
    name: "오0은",
    quote: "정책자료에서 핵심 메시지를 도출하고 대상별 표현으로 바꾸는 실습이 보도자료와 정책홍보 업무에 특히 유용했습니다.",
  },
  {
    organization: "국가데이터처 참가자",
    name: "서0우",
    quote: "데이터를 요약하는 데서 끝나지 않고 근거를 검증하고 시각화해 설명하는 과정까지 연결되어 실무 활용도가 높았습니다. 다음에는 데이터 품질 검증과 시각화 자동화를 실제 공공데이터 과제로 수행하는 심화과정에도 참여하고 싶습니다.",
  },
  {
    organization: "지자체 행정업무 담당자",
    name: "윤0희",
    quote: "막연하게 느껴졌던 생성형 AI를 민원 안내, 보고자료 정리, 회의 결과 요약 등 실제 행정업무에 적용해 보면서 활용 기준을 잡을 수 있었습니다. 부서의 반복업무를 자동화하는 실습 과정도 이어서 배우고 싶습니다.",
  },
];

function WorkshopPhoto({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "workshop-photo compact" : "workshop-photo"}>
      <Image
        src="/field-ai-workshop-original.jpg"
        fill
        alt=""
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"quick" | "diagnosis">("quick");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const firstField = useRef<HTMLInputElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openModal = (trigger?: HTMLElement, mode: "quick" | "diagnosis" = "quick") => {
    lastTrigger.current = trigger ?? null;
    setModalMode(mode);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError("");
    setTimeout(() => lastTrigger.current?.focus(), 0);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (modalMode === "quick") setTimeout(() => firstField.current?.focus(), 0);
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modalOpen, modalMode]);

  const handleDialogKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled])',
      ),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const submitQuickInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!consent) {
      setFormError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }
    const subject = encodeURIComponent(
      `[교육문의] ${String(data.get("org") || "기관 미입력")} · ${String(data.get("name") || "")}`,
    );
    const body = encodeURIComponent(
      [
        `이름: ${data.get("name")}`,
        `기관명: ${data.get("org")}`,
        `연락처: ${data.get("contact")}`,
        `희망 주제: ${data.get("topic")}`,
        `희망 일정: ${data.get("schedule") || "협의 필요"}`,
        "",
        "문의 내용:",
        `${data.get("message") || ""}`,
      ].join("\n"),
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <header className="site-header">
        <div className="wrap nav">
          <a className="brand" href="#top" aria-label="휴먼AI융합교육원 전문가 소개 맨 위로">
            <Image src="/brand-logo-transparent.png" width={1050} height={600} alt="휴먼AI융합교육원 로고" priority />
            <span>휴먼AI융합교육원</span>
          </a>
          <nav
            id="mobile-navigation"
            className={menuOpen ? "nav-links open" : "nav-links"}
            aria-label="주요 메뉴"
          >
            <a href="https://www.humanai-edu.kr/ax-transformation.html" onClick={() => setMenuOpen(false)}>AX 전환</a>
            <a href="https://www.humanai-edu.kr/programs.html" onClick={() => setMenuOpen(false)}>교육 프로그램</a>
            <a href="https://www.humanai-edu.kr/about.html" onClick={() => setMenuOpen(false)}>교육원 소개</a>
            <a href="https://www.humanai-edu.kr/expert.html" aria-current="page" onClick={() => setMenuOpen(false)}>전문가 소개</a>
            <a href="https://www.humanai-edu.kr/faq.html" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button type="button" onClick={(e) => { setMenuOpen(false); openModal(e.currentTarget); }}>교육 문의</button>
          </nav>
          <div className="nav-actions">
            <button className="btn btn-small btn-primary desktop-cta" onClick={(e) => openModal(e.currentTarget, "diagnosis")}>
              무료 AX 진단
            </button>
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
            <h1 className="sr-only">
              AI 도입 이후 증폭된 업무 환경을 지휘하는 리더십과 현장 중심 AI 교육
            </h1>
            <Image
              className="hero-main-image"
              src="/hero-main-ai-leadership.png"
              width={1664}
              height={936}
              alt="AI 측정 격차, 업무 몰입도, 집중 시간의 세 가지 리더십 인사이트를 설명하는 배미주 박사"
              priority
              sizes="(max-width: 1160px) calc(100vw - 30px), 1120px"
            />
            <div className="hero-image-actions">
              <div>
                <p className="eyebrow">AI EDUCATION · AX TRANSFORMATION</p>
                <strong>조직의 실제 업무를 바꾸는 AI 교육과 AX 전환을 설계합니다.</strong>
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={(e) => openModal(e.currentTarget)}>
                  강의·컨설팅 문의
                </button>
                <a className="btn btn-outline" href="#proof">대표 이력 보기</a>
              </div>
            </div>
          </div>
          <div className="stats-bar">
            <div className="wrap stats">
              <div><strong>Ph.D.</strong><span>교육학 박사</span></div>
              <div><strong>12권</strong><span>AI 저서</span></div>
              <div><strong>145+</strong><span>출강 기관</span></div>
              <div><strong>10,000+</strong><span>누적 수강생</span></div>
            </div>
          </div>
        </section>

        <section className="clients-section" aria-labelledby="clients-title">
          <div className="wrap clients-heading">
            <p className="eyebrow">TRUSTED EDUCATION PARTNERS</p>
            <h2 id="clients-title">주요 출강 및 교육 수행기관</h2>
            <p>대학·정부·지자체·기업의 다양한 현장에서 생성형 AI와 AX 전환 교육을 진행했습니다.</p>
          </div>
          <div className="client-panorama" aria-label="주요 대학 출강기관">
            <div className="client-track">
              {[...universityClients, ...universityClients].map((name, index) => (
                <span className="client-chip university" key={`${name}-${index}`} aria-hidden={index >= universityClients.length}>{name}</span>
              ))}
            </div>
          </div>
          <div className="client-panorama reverse" aria-label="주요 정부·지자체·기업 교육기관">
            <div className="client-track">
              {[...organizationClients, ...organizationClients].map((name, index) => (
                <span className="client-chip organization" key={`${name}-${index}`} aria-hidden={index >= organizationClients.length}>{name}</span>
              ))}
            </div>
          </div>
        </section>
        <section className="field-photo-section" aria-labelledby="field-photo-title">
          <div className="wrap field-photo-grid">
            <figure className="field-photo">
              <WorkshopPhoto />
              <figcaption>AI 실습 중심 교육 현장 · 개인정보 보호를 위해 참석자 얼굴 모자이크 처리</figcaption>
            </figure>
            <div className="field-photo-copy">
              <p className="eyebrow">FIELD-BASED AI EDUCATION</p>
              <h2 id="field-photo-title">강의에서 끝나지 않고,<br />현장에서 직접 완성합니다</h2>
              <p>
                교육생이 자신의 업무자료와 과제를 바탕으로 직접 실습하고,
                교육 후에도 활용할 수 있는 결과물을 만드는 참여형 AI 교육을 진행합니다.
              </p>
              <a className="text-link" href="#cases">대표 교육 사례 보기 →</a>
            </div>
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

        <section id="proof" className="soft-section">
          <div className="wrap">
            <div className="section-heading">
              <p className="eyebrow">PROOF &amp; EXPERIENCE</p>
              <h2>전문성을 한눈에 확인하세요</h2>
              <p>학문적 기반, 현장 경험, 저술과 책임 있는 AI 교육을 하나의 설계 역량으로 연결합니다.</p>
            </div>
            <div className="highlight-grid">
              {highlights.map(([number, title, description]) => (
                <article className="highlight-card" key={title}>
                  <strong>{number}</strong>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="expertise" className="expertise-section">
          <div className="wrap">
            <div className="section-heading light">
              <p className="eyebrow">TWO EXPERTISE AREAS</p>
              <h2>AI 교육을 중심으로, 콘텐츠 소통까지</h2>
              <p>주력 분야인 교육·컨설팅과 AI 콘텐츠 현장의 진행 경험이 서로를 강화합니다.</p>
            </div>
            <div className="expertise-grid">
              <article className="expertise-card primary">
                <span className="tag">주력 · 교육 및 컨설팅</span>
                <h3>AI 교육 · AX 전환 설계</h3>
                <p>
                  조직 진단부터 직무별 실습, 업무 산출물, 자동화 도구와 정착 지원까지
                  현장 적용을 기준으로 설계합니다.
                </p>
                <ul>
                  <li>기업·공공기관 생성형 AI 실무교육</li>
                  <li>임원·관리자 AX 전략교육</li>
                  <li>직무별 프롬프트·NotebookLM 문서분석</li>
                  <li>바이브코딩 업무자동화 랩</li>
                </ul>
                <a href="https://www.humanai-edu.kr/programs.html" className="text-link">
                  교육 프로그램 자세히 보기 →
                </a>
              </article>
              <article className="expertise-card secondary">
                <span className="tag gold">확장 · 영화제 및 진행</span>
                <h3>AI 영화제 MC · GV</h3>
                <p>
                  서울국제AI영화제 공식 사회 경험을 바탕으로 복잡한 기술과 작품의 메시지를
                  관객의 언어로 연결합니다.
                </p>
                <a href="https://www.humanai-edu.kr/mc.html" className="text-link gold-link">
                  MC·GV 활동 보기 →
                </a>
              </article>
            </div>
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
              <button className="btn btn-primary" onClick={(e) => openModal(e.currentTarget)}>
                우리 조직에 맞는 과정 문의하기
              </button>
            </div>
          </div>
        </section>

        <section className="philosophy soft-section">
          <div className="wrap philosophy-grid">
            <div>
              <p className="eyebrow">EDUCATION PRINCIPLES</p>
              <h2>교육의 기준은 도구가 아니라 변화입니다</h2>
              <p className="lead">
                교육 대상과 조직의 업무과제를 분석하고, 초보자도 직접 결과물을 만들며,
                AI 결과를 안전하게 검증하도록 가르칩니다.
              </p>
            </div>
            <div className="principles">
              <div><strong>01</strong><span>사람의 수용성과 자신감부터 확인</span></div>
              <div><strong>02</strong><span>실제 업무자료와 직무과제로 실습</span></div>
              <div><strong>03</strong><span>교육생 1인 1산출물 완성</span></div>
              <div><strong>04</strong><span>출처·사실·보안·책임까지 검증</span></div>
            </div>
          </div>
        </section>

        <section className="testimonial-section">
          <div className="wrap">
            <div className="section-heading center">
              <p className="eyebrow">FIELD VOICES</p>
              <h2>현장에서 확인된 변화</h2>
            </div>
            <div className="testimonial-grid">
              {testimonials.map((item) => (
                <article className="testimonial-card" key={`${item.organization}-${item.name}`}>
                  <div className="testimonial-stars" aria-label="별점 5점 만점에 5점"><span aria-hidden="true">★★★★★</span></div>
                  <blockquote>“{item.quote}”</blockquote>
                  <div className="testimonial-meta">
                    <strong>{item.name}</strong>
                    <span>{item.organization}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="wrap final-cta-inner">
            <div>
              <p className="eyebrow">START WITH YOUR WORK</p>
              <h2>우리 조직의 AI 교육,<br />업무과제부터 함께 살펴보겠습니다</h2>
              <p>기관명·교육대상·인원·희망일정·목적을 알려주시면 적합한 방향을 제안합니다.</p>
            </div>
            <div className="cta-buttons">
              <button className="btn btn-primary" onClick={(e) => openModal(e.currentTarget)}>
                빠른 교육문의
              </button>
              <button className="btn btn-light" onClick={(e) => openModal(e.currentTarget, "diagnosis")}>
                5분 AX 준비도 진단
              </button>
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
            <a href="https://www.humanai-edu.kr/programs.html#corporate">기업 생성형 AI 교육</a>
            <a href="https://www.humanai-edu.kr/programs.html#public">공공기관 AI 교육</a>
            <a href="https://www.humanai-edu.kr/programs.html#executive">임원 AX 전략교육</a>
            <a href="https://www.humanai-edu.kr/programs.html#vibe">바이브코딩 랩</a>
            <a href="https://www.humanai-edu.kr/programs.html#voice-assistant">소상공인 AI 교육</a>
          </div>
          <div>
            <h3>교육원</h3>
            <a href="https://www.humanai-edu.kr/ax-transformation.html">AX 전환이란</a>
            <a href="https://www.humanai-edu.kr/about.html">교육원 소개</a>
            <a href="https://www.humanai-edu.kr/expert.html">전문가 소개</a>
            <a href="https://www.humanai-edu.kr/faq.html">FAQ</a>
          </div>
          <div>
            <h3>문의</h3>
            <button className="footer-link" type="button" onClick={(e) => openModal(e.currentTarget)}>교육 문의하기</button>
            <a href="https://www.humanai-edu.kr/privacy.html">개인정보처리방침</a>
            <a href="https://blog.naver.com/ai-ed" target="_blank" rel="noreferrer">네이버 블로그</a>
            <a href="https://www.youtube.com/@Justdoit-%EA%B7%B8%EB%83%A5AI" target="_blank" rel="noreferrer">유튜브</a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 휴먼AI융합교육원. All rights reserved. · 사업자등록번호 352-16-02365</span>
          <span>Human First · Workflow Design · Real Transformation</span>
        </div>
      </footer>

      <button className="floating-contact" onClick={(e) => openModal(e.currentTarget)} aria-haspopup="dialog">
        <span>교육</span>문의
      </button>

      {modalOpen && (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            aria-describedby="inquiry-description"
            ref={dialogRef}
            onKeyDown={handleDialogKey}
          >
            <button className="modal-close" type="button" onClick={closeModal} aria-label="문의 창 닫기">×</button>
            <div className="modal-intro">
              <p className="eyebrow">CONTACT</p>
              <h2 id="inquiry-title">교육·컨설팅 문의</h2>
              <p id="inquiry-description">빠르게 문의하거나, 5분 진단으로 조직의 현재 단계를 확인하세요.</p>
              <div className="direct-links">
                <a href={`tel:${PHONE.replaceAll("-", "")}`}><small>전화</small>{PHONE}</a>
                <a href={`mailto:${EMAIL}`}><small>이메일</small>{EMAIL}</a>
              </div>
            </div>
            <div className="modal-content">
              <div className="modal-tabs" role="tablist" aria-label="문의 방식 선택">
                <button role="tab" aria-selected={modalMode === "quick"} className={modalMode === "quick" ? "active" : ""} onClick={() => setModalMode("quick")}>
                  빠른 문의
                </button>
                <button role="tab" aria-selected={modalMode === "diagnosis"} className={modalMode === "diagnosis" ? "active" : ""} onClick={() => setModalMode("diagnosis")}>
                  AX 진단
                </button>
              </div>
              {modalMode === "quick" ? (
                <form onSubmit={submitQuickInquiry}>
                  <div className="form-grid">
                    <label>이름 <span>*</span><input ref={firstField} name="name" required autoComplete="name" /></label>
                    <label>기관명 <span>*</span><input name="org" required autoComplete="organization" /></label>
                  </div>
                  <label>연락처 또는 이메일 <span>*</span><input name="contact" required /></label>
                  <label>희망 주제·교육 대상 <span>*</span><input name="topic" required placeholder="예: 임직원 생성형 AI 교육, 30명" /></label>
                  <label>희망 일정<input name="schedule" placeholder="예: 2026년 9월 중" /></label>
                  <label>문의 내용<textarea name="message" rows={3} placeholder="교육 시간·장소·목적을 알려주세요." /></label>
                  <label className="consent">
                    <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setFormError(""); }} />
                    <span>상담을 위한 개인정보 수집·이용에 동의합니다. <a href="https://www.humanai-edu.kr/privacy.html" target="_blank" rel="noreferrer">자세히 보기</a></span>
                  </label>
                  {formError && <p className="form-error" role="alert">{formError}</p>}
                  <button className="btn btn-primary submit-button" type="submit">이메일 문의 작성하기</button>
                  <p className="form-note">입력한 내용으로 이메일 작성 화면이 열립니다.</p>
                </form>
              ) : (
                <div className="diagnosis-panel">
                  <p>5분 진단을 완료하면 조직의 AI 활용 단계와 우선 교육과제를 확인할 수 있습니다.</p>
                  <ul>
                    <li>조직의 현재 AI 활용 단계 파악</li>
                    <li>우선 교육과제 도출</li>
                    <li>권장 프로그램과 실행 방향 확인</li>
                  </ul>
                  <a className="btn btn-primary submit-button" href={FORM_URL} target="_blank" rel="noreferrer">
                    AX 준비도 진단 시작하기
                  </a>
                  <p className="form-note">현재 운영 중인 진단 양식이 새 창에서 열립니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: "배미주",
              honorificSuffix: "교육학 박사",
              jobTitle: "AI 교육 컨설턴트 · 휴먼AI융합교육원 원장",
              image: "https://www.humanai-edu.kr/og-image.jpg",
              worksFor: { "@type": "EducationalOrganization", name: "휴먼AI융합교육원" },
              knowsAbout: ["생성형 AI 교육", "AX 전환", "프롬프트 설계", "바이브코딩", "AI 리터러시"],
            },
          }),
        }}
      />
    </>
  );
}

