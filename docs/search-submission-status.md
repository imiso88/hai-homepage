# 검색 관리 도구 확인 (2026-10-22)

## Google Search Console에서 실제 확인한 정보

- 도메인 속성: humanai-edu.kr.
- sitemap.xml 재제출 후 화면에 ‘Sitemap submitted successfully’ 표시 확인.
- 과거 정상 사이트맵은 성공, 마지막 읽기 2026-10-20, 발견 URL 30개로 표시됨.
  이번 실제 공개 사이트맵은 28개 URL. 새 처리 결과와 구분할 것.
- 홈페이지 URL 자체를 사이트맵으로 등록한 별도 항목은 오류 1건. 삭제하지 않음.
- 페이지 색인 보고서 기준일 2026-10-16: 색인 17, 미색인 16.
- 미색인 사유: 리다이렉트 3, noindex 1, 발견됐지만 아직 색인되지 않음 12.
- 색인 완료 예시 목록에서 메인과 public-ai-training.html 확인.
- 아직 실행하지 않은 작업: 개별 URL 검사 및 색인 생성 요청, 미색인 예시 12개 URL의 개별 조사.
  브라우저 화면 읽기와 주소 이동은 가능하지만 버튼 클릭은 좌표 확인 오류로 실행되지 않음.

## NAVER

- 웹마스터 도구 진입 시 네이버 로그인 페이지로 이동함. 로그인은 계정 소유자가 직접 해야 함.
- 관리자 사이트 등록 현황·사이트맵 제출 상태는 아직 확인하지 못함.
- 공식 IndexNow 프로토콜용 공개 소유 확인 파일과 명시적 실행 스크립트를 준비함.
- 이 확인 파일은 웹사이트에서 공개하는 것이 프로토콜의 요구사항이며, 이메일 발송·시트 저장의 비밀값과 무관함.

## IndexNow 실행

배포 후 소유 확인 파일과 각 페이지의 200 응답·대표 주소·noindex 여부를 검증한 뒤 전송한다.
기본은 dry run이며 `--submit`이 있을 때만 NAVER에 알린다. 변경한 URL만 전달하고 반복 요청하지 않는다.

```text
node scripts/notify-indexnow.mjs https://www.humanai-edu.kr/expert.html
node scripts/notify-indexnow.mjs --submit https://www.humanai-edu.kr/expert.html
```

HTTP 200은 접수 성공, 202는 키 확인 중이다. 색인 완료·순위 상승을 뜻하지 않는다.
이 알림은 Google의 개별 색인 요청이나 관리자 사이트맵 상태 확인을 대체하지 않는다.
자동 주기 실행·전체 사이트 과거 URL 일괄 전송은 포함하지 않는다.

공식 문서:
- https://searchadvisor.naver.com/guide/indexnow-api-key
- https://searchadvisor.naver.com/guide/indexnow-request
- https://searchadvisor.naver.com/guide/indexnow-faq
