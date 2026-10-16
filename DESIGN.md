---
name: 2026 태국 가족여행
description: 옥빛과 금빛, 양피지 질감의 한국어 여행 대시보드
colors:
  ink: "#12211E"
  ink-soft: "#3D544D"
  ink-muted: "#5E7167"
  paper: "#F6F2E8"
  card: "#FFFFFF"
  line: "#E2D9C6"
  jade: "#1E4B41"
  jade-deep: "#0E2822"
  jade-tint: "#DDE9E3"
  gold: "#B58A28"
  gold-text: "#7A5A17"
  gold-tint: "#F5E7C0"
  coral: "#A94A2C"
  coral-tint: "#F7E2D8"
  ok: "#2C6B4C"
  wait: "#7E640F"
  parchment: "#F1E4C3"
  parchment-card: "#FBF4E1"
  parchment-ink: "#3B2A14"
typography:
  display:
    fontFamily: "Fraunces, serif"
  body:
    fontFamily: "Inter, sans-serif"
  label:
    fontFamily: "IBM Plex Mono, monospace"
rounded:
  sm: "6px"
  md: "12px"
  lg: "14px"
  pill: "99px"
components:
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  chip:
    backgroundColor: "{colors.jade-tint}"
    textColor: "{colors.jade}"
    rounded: "{rounded.pill}"
---

# Design System

## Overview

**Creative North Star: "여행 노트"** — 옥빛 잉크와 금빛 포인트가 얹힌 따뜻한 종이 노트. 정보는 조용하고 선명하게 보이고, 재미는 놀이터와 지도 같은 한정된 장면에서만 드러난다.

## Colors

- **바탕**: `paper` 따뜻한 종이색. 카드는 흰색(`card`), 구분선은 `line`.
- **주색**: `jade` 계열이 제목, 히어로, 버튼의 중심이다. 히어로 위 글자는 크림(`--fg-cream`), 보조 글자는 옥빛 틴트(`--hero-dim`)를 쓰고 회색을 쓰지 않는다.
- **포인트**: `gold`는 강조와 장식에만, 글자에는 `gold-text`를 쓴다. `coral`은 고기·열정 같은 따뜻한 의미에 쓴다.
- **상태**: `ok`(확정), `wait`(확인 대기). 상태는 색만으로 구분하지 않고 글자도 함께 쓴다.
- **대동여지도**: `parchment` 계열 양피지 팔레트와 핀 색(`--pin-*`)은 지도 화면에서만 쓴다.
- 반복해서 쓰이는 색은 `:root` 토큰으로 정의한다. 새 색을 직접 쓰지 않는다. 다크모드는 없다.

## Typography

- 제목과 숫자 강조: Fraunces. 본문: Inter와 한글 시스템 글꼴. 라벨, 시간, 수치: IBM Plex Mono.
- 자간은 `.05em` 이하로 둔다. 본문은 고령 사용자를 고려해 작은 글씨를 피한다.
- 문장 안에서 " — " 대신 ": "나 쉼표를 쓴다.

## Layout

- 모바일 우선, 한 열. 좌우 여백 16px, 하단 내비게이션(높이 62px).
- 탭: 홈, 일정, 지도, 놀이터. 일정 탭 상단에 여정 띠(`#jr`)가 있다.
- 본문으로 건너뛰기 링크가 `main#main`으로 이동한다.

## Elevation & Depth

그림자는 약하고 부드럽게 `--sh` 하나를 쓴다. 색이 있는 발광은 카운트다운과 등불 같은 장식에만 허용하고, 조작 요소에는 쓰지 않는다.

## Shapes

작은 요소 6~10px, 카드 12~14px, 칩과 버튼은 알약형(99px). 카드 안에 카드를 겹치지 않는다.

## Components

- **카드**: 흰 바탕, 12px 모서리, `--sh`.
- **칩**: 알약형. 활성은 옥빛 바탕에 크림 글자.
- **시트(지도, 놀이터)**: 아래에서 올라오는 전체 화면 패널. 닫기 버튼과 키보드 닫기를 제공한다.
- **상태 표시 카드**: 한 종류에 한해 왼쪽 4px 색 띠를 쓴다(의도적 예외).

## Do's and Don'ts

- Do: 확인되지 않은 정보는 "—", "미확인"으로 표시한다.
- Do: 장식 애니메이션은 횟수를 제한하고 `prefers-reduced-motion`을 지킨다.
- Do: 새 요소는 기존 토큰과 반경만 쓴다.
- Don't: 다크모드, 그라디언트 글자, 카드 안의 카드, 영구 반복 깜빡임.
- Don't: 도장첩·빙고처럼 참여를 요구하는 장치를 기본 화면에 두지 않는다(접힘 처리).
