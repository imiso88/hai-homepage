import Image from "next/image";
import Script from "next/script";

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.humanai-edu.kr/#organization",
      name: "휴먼AI융합교육원",
      alternateName: "Human AI Convergence Education Center",
      url: "https://www.humanai-edu.kr/",
      logo: "https://www.humanai-edu.kr/brand-logo-transparent.png",
      description: "기업과 공공기관의 실제 업무를 반영한 생성형 AI 교육과 AX 전환 교육을 설계하고 운영합니다.",
      telephone: "+82-10-6398-5354",
      email: "orthia66@gmail.com",
      sameAs: ["https://blog.naver.com/ai-ed", "https://miso66.tistory.com/"],
    },
    {
      "@type": "Person",
      "@id": "https://www.humanai-edu.kr/expert.html#person",
      name: "배미주",
      jobTitle: "휴먼AI융합교육원 대표 강사",
      worksFor: { "@id": "https://www.humanai-edu.kr/#organization" },
      url: "https://www.humanai-edu.kr/expert.html",
    },
    {
      "@type": "ItemList",
      "@id": "https://www.humanai-edu.kr/#programs",
      name: "휴먼AI융합교육원 대표 교육과정",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "직무별 생성형 AI 실무교육", url: "https://www.humanai-edu.kr/corporate-ai-training.html" },
        { "@type": "ListItem", position: 2, name: "공공업무 AI 활용교육", url: "https://www.humanai-edu.kr/public-ai-training.html" },
        { "@type": "ListItem", position: 3, name: "AX 전략·리더십 교육", url: "https://www.humanai-edu.kr/executive-ax-training.html" },
      ],
    },
  ],
};

const stats = [["Ph.D.", "교육학 박사"], ["12권", "AI 저서"], ["145+", "출강 기관"], ["10,000+", "누적 수강생"]];
const programs = [
  { number: "01", audience: "기업 실무자", title: "직무별 생성형 AI 실무교육", description: "보고서·기획안·데이터 분석·홍보 콘텐츠를 실제 업무자료로 만들며 익힙니다.", outcome: "1인 1업무 산출물과 직무별 프롬프트", href: "/corporate-ai-training.html" },
  { number: "02", audience: "공공기관", title: "공공업무 AI 활용교육", description: "공문·정책자료·민원·기록관리 업무에 AI를 안전하게 적용하는 방법을 실습합니다.", outcome: "기관 보안 기준을 반영한 활용 체크리스트", href: "/public-ai-training.html" },
  { number: "03", audience: "임원·관리자", title: "AX 전략·리더십 교육", description: "조직의 AI 활용 수준을 진단하고 부서별 도입 우선순위와 실행 과제를 정리합니다.", outcome: "경영진 의사결정용 AX 실행 방향", href: "/executive-ax-training.html" },
];
const cases = [
  { tag: "공공기관", title: "바이브코딩 업무자동화", result: "공문과 반복업무를 돕는 개인별 자동화 시제품 완성" },
  { tag: "기업·경영진", title: "AI 활용 수준 진단", result: "부서별 활용 격차와 도입 우선순위를 담은 진단 리포트" },
  { tag: "중앙부처", title: "정책소통 AI 교육", result: "정책자료를 핵심 메시지·보도자료·카드뉴스로 전환" },
];
const reviews = [
  { quote: "정책 소통에 AI와 빅데이터를 적용하는 방향뿐 아니라 출처 검증 방법까지 익힐 수 있었습니다.", person: "중앙부처 현직 공무원" },
  { quote: "AI 도구를 실제 회사 업무에 바로 적용하는 방법을 배우면서 활용 의지가 크게 높아졌습니다.", person: "KG케미칼 임직원" },
  { quote: "코딩을 몰라도 반복업무를 줄이는 도구를 직접 만들어 업무혁신이 현실적으로 느껴졌습니다.", person: "공공기관 교육 참가자" },
];

const partners = [
  { src: "/partner-logos/mcst-7.jpg", alt: "문화체육관광부" },
  { src: "/partner-logos/mss.svg", alt: "중소벤처기업부" },
  { src: "/partner-logos/logodi.png", alt: "지방자치인재개발원" },
  { src: "/partner-logos/gyeonggi.png", alt: "경기도인재개발원" },
  { src: "/partner-logos/sejong.jpg", alt: "세종시교육청교육원" },
  { src: "/partner-logos/incheon-ih.gif", alt: "인천도시공사" },
  { src: "/partner-logos/kwdi.png", alt: "한국여성인권진흥원" },
  { src: "/partner-logos/3m.svg", alt: "3M" },
  { src: "/partner-logos/crown.png", alt: "크라운제과" },
  { src: "/partner-logos/kgchem.jpg", alt: "KG케미칼" },
  { src: "/partner-logos/fastcampus.svg", alt: "패스트캠퍼스" },
];
export default function Home() {
  return <>
    <Script
      id="home-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
    />
    <header className="home-header"><div className="wrap home-nav">
      <a className="brand" href="#top" aria-label="휴먼AI융합교육원 홈 맨 위로"><Image src="/brand-logo-transparent.png" width={1050} height={600} alt="휴먼AI융합교육원 로고" priority /><span>휴먼AI융합교육원</span></a>
      <nav className="home-desktop-nav" aria-label="주요 메뉴"><a href="#programs">교육과정</a><a href="#results">교육사례</a><a href="/expert.html">강사소개</a><a href="/faq.html">자주 묻는 질문</a></nav>
      <a className="btn btn-small btn-primary home-header-cta" href="/contact.html">맞춤교육 문의하기</a>
      <details className="home-mobile-nav"><summary aria-label="메뉴 열기"><span /><span /><span /></summary><nav aria-label="모바일 메뉴"><a href="#programs">교육과정</a><a href="#results">교육사례</a><a href="/expert.html">강사소개</a><a href="/faq.html">자주 묻는 질문</a><a href="/contact.html">맞춤교육 문의하기</a></nav></details>
    </div></header>

    <main id="top" className="home-page">
      <section className="home-hero" aria-labelledby="home-title"><div className="wrap home-hero-grid">
        <div className="home-hero-copy"><p className="home-kicker">기업·공공기관 직무 맞춤형 생성형 AI 교육</p><h1 id="home-title">우리 조직의 업무에<br /><em>바로 쓰는 AI 교육</em></h1><p className="home-lead">구성원의 직무와 AI 수준을 먼저 살펴보고, 보고서·자료 분석·공문·콘텐츠 제작을 실제 과제로 실습합니다.</p><div className="home-hero-action"><a className="btn btn-primary" href="/contact.html">맞춤교육 문의하기</a><span>주제·일정·인원이 미정이어도 상담할 수 있습니다.</span></div></div>
        <figure className="home-hero-photo">
          <Image src="/hero-main-ai-training-clean.png" width={1664} height={936} alt="배미주 박사가 기업과 공공기관 구성원을 대상으로 AI 교육을 진행하는 모습" sizes="(max-width: 820px) calc(100vw - 32px), 52vw" priority />
          <div className="home-screen-message">
            <span>HUMAN-FIRST AI EDUCATION</span>
            <strong>교육 후, 실제 업무<br />결과물이 남습니다</strong>
            <p>보고서 · 정책자료 · 데이터 분석 · 업무자동화</p>
            <small>진단부터 실습, 현업 적용까지</small>
          </div>
          <figcaption><strong>배미주 박사</strong></figcaption>
        </figure>
      </div></section>

      <section className="home-start" aria-labelledby="start-title"><div className="wrap home-start-inner"><div><p className="home-kicker">START HERE</p><h2 id="start-title">어떤 과정이 필요한지 몰라도 괜찮습니다.</h2><p>기관명, 교육 대상, 해결하고 싶은 업무만 알려주시면 적합한 과정과 진행안을 안내합니다.</p></div></div></section>

      <section className="home-proof" aria-labelledby="proof-title"><div className="wrap"><div className="home-section-heading"><p className="home-kicker">검증된 교육 경험</p><h2 id="proof-title">설명보다, 현장에서 쌓은 결과로 보여드립니다.</h2></div><div className="home-stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="home-logo-marquee" aria-label="주요 교육 수행기관과 기업"><ul className="home-logo-track">{[...partners, ...partners].map((partner, index) => <li className="home-logo-item" key={`${partner.src}-${index}`} aria-hidden={index >= partners.length}><Image src={partner.src} width={260} height={88} alt={index >= partners.length ? "" : partner.alt} /></li>)}</ul></div></div></section>

      <section id="programs" className="home-programs" aria-labelledby="programs-title"><div className="wrap"><div className="home-section-heading home-heading-row"><div><p className="home-kicker">대표 교육 3가지</p><h2 id="programs-title">교육 대상에 맞춰 빠르게 선택하세요.</h2></div><a href="/programs.html">전체 교육과정 보기</a></div><div className="home-program-grid">{programs.map((program) => <article className="home-program-card" key={program.title}><div className="home-program-meta"><span>{program.number}</span><strong>{program.audience}</strong></div><h3>{program.title}</h3><p>{program.description}</p><dl><dt>교육 후 남는 결과</dt><dd>{program.outcome}</dd></dl><a href={program.href}>과정 자세히 보기</a></article>)}</div></div></section>

      <section id="results" className="home-results" aria-labelledby="results-title"><div className="wrap"><div className="home-section-heading"><p className="home-kicker">교육 사례와 후기</p><h2 id="results-title">배우는 데서 끝나지 않고, 업무 결과물을 완성합니다.</h2></div><div className="home-result-layout"><div className="home-case-list">{cases.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><small>{item.tag}</small><h3>{item.title}</h3><p>{item.result}</p></div></article>)}<a className="home-inline-link" href="/cases.html">교육 사례 전체 보기</a></div><div className="home-review-list">{reviews.map((review) => <blockquote key={review.person}><p>“{review.quote}”</p><cite>{review.person}</cite></blockquote>)}<a className="home-inline-link" href="/testimonials.html">교육 후기 전체 보기</a></div></div></div></section>

      <section className="home-final" aria-labelledby="final-title"><div className="wrap home-final-inner"><div><p className="home-kicker">우리 조직의 업무부터 살펴보겠습니다</p><h2 id="final-title">AI 교육, 과정명보다<br />해결할 업무에서 시작하세요.</h2><p>교육 대상과 희망 주제만 알려주시면 추천 과정과 진행안을 안내합니다.</p></div><a className="btn btn-light" href="/contact.html">맞춤교육 문의하기</a></div></section>
    </main>

    <footer className="home-footer"><div className="wrap home-footer-inner"><div className="footer-brand-lockup"><Image src="/brand-logo-transparent.png" width={1050} height={600} alt="휴먼AI융합교육원 로고" /><strong>휴먼AI융합교육원</strong></div><p>조직의 업무혁신과 AX 전환을 함께 설계하는 교육 파트너</p><nav aria-label="하단 메뉴"><a href="/about.html">교육원 소개</a><a href="/expert.html">전문가 소개</a><a href="/privacy.html">개인정보처리방침</a><a href="https://blog.naver.com/ai-ed" target="_blank" rel="noopener">네이버 블로그</a><a href="https://miso66.tistory.com/" target="_blank" rel="noopener">티스토리 블로그</a></nav><small>© 2026 휴먼AI융합교육원. All rights reserved.</small></div></footer>
    <a className="home-mobile-cta" href="/contact.html">맞춤교육 문의하기</a>
  </>;
}







