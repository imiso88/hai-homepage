# 교육담당자 검색 의도에 맞춘 콘텐츠 개선

기준일: 2026-10-22. 목적은 실제 교육 문의이며, BM25 점수나 검색 순위 상승을 보장하지 않는다.

## 적용 원칙

BM25의 단어 관련성·빈도 포화·문서 길이 보정은 검색 의도에 집중한 문서를 만드는 참고 원리다.
사이트에 BM25 코드나 메타 태그를 설치해 외부 검색 순위를 지정할 수는 없다.
Google·네이버의 실제 전체 순위 공식과 한국어 분석기는 이 저장소에서 알 수 없다.
키워드 밀도 목표나 문서 길이 정답을 설정하지 않는다. 필요한 정보를 삭제해 문서를 짧게 만들지도 않는다.

## 검색어와 대표 페이지

| 교육담당자가 입력할 수 있는 검색어 (검색량 미측정) | 대표 페이지 | 필요한 답변 |
| --- | --- | --- |
| 생성형 AI 기업교육, 기업 ChatGPT 교육 | corporate-ai-training.html | 직무별 실습, 보고서·기획안, 참여 수준, 교육 시간 |
| 공공기관 AI 교육, 공무원 AI 교육 | public-ai-training.html | 공문·정책자료·민원, 승인 도구, 보안·개인정보 |
| AX 전환 교육, 임원 AI 전략교육 | executive-ax-training.html | 적용 우선과제, 의사결정·책임 기준, 실행 계획 |
| AI 업무자동화 교육, 비전공자 바이브코딩 교육 | ai-automation-training.html | 반복업무 시제품, 코딩 경험, 보안·운영 조건 |
| AI 교육 전문강사, 배미주 AI 교육 | expert.html | 강사 신원, 공개 이력, 실제 교육 사례와 문의 |
| AI 교육 강사 섭외, AI 교육 제안서 | ai-training-request-guide.html | 기존 담당자 자료실을 활용. 비슷한 페이지를 추가 생성하지 않음 |

## 이번에 실행한 변경

- 메인의 4개 교육 트랙에 상세 과정으로 가는 일반 HTML 링크 추가. 기존 자료 신청 버튼 유지.
- 과정별 title·meta description·Open Graph 제목/설명·Course 설명·본문 소개 일치.
- 4개 과정의 결과물 카드 총 16개에서 동일 문구를 실제 수행 내용으로 교체.
- 과정별 실습 H2 구체화, 강의·과정 설계자 배미주 박사 링크 연결.
- 기업·공공기관 과정에 관련 공개 교육 사례와 담당자 자료실 링크 추가.
- 전문가 페이지 제목에 ‘AI 교육 전문강사’와 인물·교육 대상을 명확히 표기.
- 사이트맵은 실제 수정한 메인·과정 4개·전문가 페이지의 lastmod만 갱신.
- 리다이렉트 주소 contact.html과 noindex 페이지 privacy.html을 사이트맵에서 제외.
- JSON-LD는 기존 타입을 유지. 검색 결과에 FAQ·Course 특별 노출이 된다고 약속하지 않음.
- llms.txt를 노출 보장 수단으로 취급하지 않음. 실제 HTML·내부 링크·근거 콘텐츠를 우선 개선.

## 확인과 남은 작업

로컬 브라우저: 메인·과정 4개·전문가 페이지를 PC 1366px / 모바일 390px에서 검사.
H1 1개, 자기 참조 canonical, JSON-LD 파싱·설명 일치, 과정 링크 4개, 가로 넘침 없음 확인.
모바일 과정 카드와 PC 기업 과정의 스크린샷 시각 확인 완료.

관리자 콘솔에 접근해 수행하지 않은 항목:

1. Google Search Console과 네이버 서치어드바이저에서 사이트맵 등록 상태 확인.
2. 수정한 대표 URL의 수집·색인 상태 확인 및 재수집 요청.
3. 변경 전후 같은 기간의 비브랜드 검색어 노출·클릭·클릭률·문의 전환 비교.
4. 검색어별 실제 수요가 확인되면 FAQ·사례를 보완. 검색량을 추정해 성과로 보고하지 않음.

성과 검토 시 평균 순위만 보지 않고 과정별 유입과 실제 문의를 함께 확인한다.
GA4에 이름·이메일 같은 개인 식별 정보를 넣지 않는다.

## 공식 참고

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google 사이트맵 지침: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google AI 검색 최적화 지침: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- 네이버 콘텐츠 스팸 정책: https://searchadvisor.naver.com/guide/content-abusing
