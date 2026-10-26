# 🇹🇭 2026 태국 가족 여행

2026.12.16 ~ 2027.1.4, 파타야·방콕 3가족 10인 가족 여행의 일정·숙소·골프·비용정산 기록 저장소입니다.

## 웹 대시보드

**https://ywy9102-bot.github.io/2026-thailand/** — 카운트다운·현지 날씨·골프·숙소·정산·할 일을 한눈에.
소스는 빌드 없이 그대로 배포하는 정적 파일이에요.

| 파일 | 역할 |
|---|---|
| [`index.html`](index.html) | 화면 뼈대 + 첫 화면용 스타일(`<style id="critical">`, 자동 생성) |
| [`style.css`](style.css) | 전체 스타일 (색·간격 토큰은 `:root`, 설명은 [`DESIGN.md`](DESIGN.md)) |
| [`app.js`](app.js) | 앱 본체 (일정·정산·골프·홈 위젯) |
| `play.js` `story.js` `foodmap.js` `thai.js` | 놀이터·읽어보는 카드·맛집지도·태국어. 눌렀을 때(또는 한가할 때) 불러와요 |
| [`sw.js`](sw.js) | 서비스 워커 — 한 번 연 뒤에는 인터넷이 없어도 열려요 |
| [`PRODUCT.md`](PRODUCT.md) · [`DESIGN.md`](DESIGN.md) | 제품 맥락·디자인 규칙 |

### 개발 · 배포 전 점검

```bash
npm install && npx playwright install chromium   # 처음 한 번
npm run check      # 버전·조각 파일·서비스 워커 목록·문법·첫 화면 스타일 최신 여부
npm test           # 접근성(axe)·넘침·모든 시트·오프라인·키보드 탭 (약 1분)
npm run critical   # style.css를 고쳤다면 첫 화면용 스타일을 다시 만들어요
```

- 배포할 때마다 `index.html`의 `style.css?v=`·`app.js?v=`(여러 곳)를 **같은 버전**으로 올려요. 앱 버전과 서비스 워커 버전은 여기서 자동으로 따라와요.
- PR을 올리면 GitHub Actions가 `check`(빠른 점검)와 `test`(화면 시험)를 돌려요.

## 최신 문서

| 문서 | 설명 |
|---|---|
| [thailand_itinerary_v5.7_20260811.md](thailand_itinerary_v5.7_20260811.md) | 최신 일정표 (영문 파일명) |
| [태국여행_일정표_v5.7_20260811.md](태국여행_일정표_v5.7_20260811.md) | 최신 일정표 (한글 파일명, 동일 내용) |

## 개요

- **기간**: 2026.12.16(수) ~ 2027.1.2(토), 일부 인원 ~1.4(월)
- **인원**: 10명 (가족1 5인 / 가족2 3인 / 가족3 2인)
- **동선**: 인천 → 방콕 → 파타야(12.16~26) → 방콕(12.26~1.2) → 귀국
- **주요 활동**: 파타야·방콕 골프 8~9라운드, 숙소 빌라 통부라(파타야) / 티니디 카오산·GCP(방콕)

## 파일 구성

- `thailand_itinerary_initial.md` — 최초 구성안
- `thailand_itinerary_v1.x ~ v5.x_YYYYMMDD.md` — 버전별 일정표 개정 이력
- 각 문서에 참가자, 숙소(취소기한), 일정표, 비용정산, TBD 체크리스트 포함

버전 변경 이력은 각 일정표 문서 하단 "별첨: 변경이력" 참고.

## 여행 예고편 사진

`play.js`의 `PHOTOS`가 Wikimedia Commons 파일 이름을 가리켜요(`https://commons.wikimedia.org/wiki/File:<파일 이름>`에서 저자와 라이선스를 볼 수 있어요). 가족 내부용이라 외부에 공개하지 않아요. 파일을 바꾸려면 `PHOTOS`의 이름만 고치면 돼요.
