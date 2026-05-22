# 핸드오프 패키지 — 어린이놀이시설 안전점검 SaaS 랜딩페이지

> "놀이지킴" — 어린이놀이시설 안전점검 SaaS의 마케팅 랜딩페이지 디자인입니다.

---

## 📦 패키지 내용

| 경로 | 설명 |
|---|---|
| `놀이지킴 랜딩페이지.html` | 진입점. 모든 컴포넌트를 로드하고 React 앱을 마운트 |
| `PRD.md` | 원본 제품 요구사항 문서 |
| `src/*.jsx` | React 컴포넌트 (Babel in-browser 변환 — 프로토타입 환경) |
| `wds/colors_and_type.css` | 디자인 토큰 — 컬러, 타이포그래피, 스페이싱, radius 등 |
| `tweaks-panel.jsx` | 디자인 모드의 토글 패널 (프로덕션에는 불필요) |

## 🎯 디자인 파일 안내

**이 번들의 파일들은 디자인 레퍼런스이지 그대로 복사할 프로덕션 코드가 아닙니다.**

- React + Babel을 브라우저에서 직접 변환하는 프로토타입 방식이라 운영용으로는 적합하지 않습니다.
- 작업자의 역할: **HTML 프로토타입에 담긴 비주얼·인터랙션을 타깃 코드베이스(Next.js / Vite + React / SvelteKit 등) 안에서 해당 환경의 패턴·라이브러리에 맞춰 다시 구현**하는 것입니다.
- 만약 코드베이스가 없는 신규 프로젝트라면, Next.js 14 App Router + Tailwind CSS + Framer Motion 조합을 권장합니다 (스크롤 애니메이션이 많기 때문).

## 🎨 디자인 충실도

**Hi-fi 프로토타입** — 픽셀 단위 마감입니다. 실제 컬러, 타이포그래피, 스페이싱, 인터랙션이 모두 최종안 기준으로 들어가 있으니, **그대로 재현**해 주세요. 다만 코드 구조는 타깃 코드베이스의 컨벤션을 따르면 됩니다.

---

## 🧩 페이지 구성 (위에서 아래로)

| # | 섹션 | 컴포넌트 | 배경 | 목적 |
|---|---|---|---|---|
| 1 | **Nav** | `src/Nav.jsx` | 투명 → 흰색(blur, scroll시) | 상단 고정 내비게이션 |
| 2 | **Hero** | `src/Hero.jsx` + `src/HeroVideo.jsx` | `#FBFCFE` + 패럴랙스 블롭 | 헤드라인 + 앱 시연 모션 데모 |
| 3 | **TrustStrip** | `src/TrustStrip.jsx` | `#F4F6FA` | 도입 기관 신뢰 strip |
| 4 | **Problem** | `src/Problem.jsx` | `#1B1C1E` (다크) | 현장 이슈 6개 |
| 5 | **CoreValue (sticky)** | `src/CoreValue.jsx` | `#FBFCFE` | 스크롤 sticky — 5개 핵심 가치 |
| 6 | **Features** | `src/Features.jsx` | `#ffffff` | 6개 기능 카드 그리드 |
| 7 | **Customers** | `src/Customers.jsx` | `#F4F6FA` | 도입 대상 6개 |
| 8 | **Pricing** | `src/Pricing.jsx` | `#ffffff` | 3-tier 요금제 카드 |
| 9 | **Calculator** | `src/Calculator.jsx` | `#0066FF` 그라데이션 | 실시간 요금 슬라이더 |
| 10 | **Comparison** | `src/Comparison.jsx` | `#FBFCFE` | 도입 전/후 표 |
| 11 | **FAQ** | `src/FAQ.jsx` | `#ffffff` | 6개 아코디언 |
| 12 | **FinalCTA + Footer** | `src/FinalCTA.jsx` | `#0F0F10` (다크) | 최종 CTA + 푸터 |

---

## 🌈 디자인 토큰

`wds/colors_and_type.css`에 전체 토큰 시스템이 들어 있습니다 (Wanted Design System 기반). 핵심만 정리하면:

### 컬러

| 토큰 | 값 | 용도 |
|---|---|---|
| `--semantic-primary-normal` | `#0066FF` | 브랜드 블루 (CTA, 강조) |
| `--semantic-primary-strong` | `#005EEB` | 호버/active |
| `--semantic-label-strong` | `#000000` | 본문 강조 (헤드라인) |
| `--semantic-label-normal` | `#171719` | 본문 |
| `--semantic-label-neutral` | `rgba(46, 47, 51, .88)` | 보조 본문 |
| `--semantic-label-alternative` | `rgba(55, 56, 60, .61)` | 보조 라벨 |
| `--semantic-label-assistive` | `rgba(55, 56, 60, .28)` | placeholder, hint |
| `--semantic-background-normal-normal` | `#ffffff` | 기본 배경 |
| `--semantic-background-normal-alternative` | `#F7F7F8` | 보조 배경 (카드 등) |
| `--semantic-line-normal-alternative` | `rgba(112,115,124,.08)` | 미세한 구분선 |
| `--semantic-line-normal-normal` | `rgba(112,115,124,.22)` | 일반 구분선 |
| `--semantic-status-positive` | `#00BF40` | 양호 |
| `--semantic-status-cautionary` | `#FF9200` | 요주의 |
| `--semantic-status-negative` | `#FF4242` | 요수리/위험 |

### 타이포그래피

- **폰트:** Pretendard Variable (한글 우선)
- **헤드라인:** `clamp(34px, 4.4vw, 56px)`, weight 700, letter-spacing `-.032em`, line-height 1.1
- **본문:** 15.5~18px, weight 400, line-height 1.5~1.7
- **eyebrow/kicker:** 13px, weight 600, uppercase, letter-spacing `.06em`

### 스페이싱

- 섹션 패딩: `120~140px (vertical)` × `32px (horizontal)`
- 최대 컨텐츠 폭: `1240px` (대부분), `1100px` (긴 텍스트 섹션)
- 카드 padding: `24~32px`
- 카드 gap: `16~20px`
- 카드 border-radius: `14~20px`

### Elevation (shadow)

```css
--semantic-elevation-shadow-small:  0px 2px 4px -2px rgba(23,23,23,.06), 0px 4px 6px -1px rgba(23,23,23,.06);
--semantic-elevation-shadow-medium: 0px 4px 6px -2px rgba(23,23,23,.07), 0px 10px 15px -3px rgba(23,23,23,.07);
--semantic-elevation-shadow-large:  0px 6px 10px -4px rgba(23,23,23,.08), 0px 16px 24px -6px rgba(23,23,23,.08);
```

---

## 🎬 인터랙션 명세

### 1. 스크롤 배경 전환 (`src/utils.jsx::useBackgroundTransition`)
모든 섹션에 `data-bg="<color>"` 어트리뷰트가 있고, IntersectionObserver 대신 scroll 이벤트에서 viewport 중앙에 가장 가까운 섹션의 색을 `html`의 `--page-bg` CSS 변수에 적용. `body { background: var(--page-bg); transition: background 700ms cubic-bezier(.2,.7,.2,1); }`

→ Framer Motion 환경에서는 `useScroll` + `useTransform`으로 같은 효과 가능.

### 2. Reveal 애니메이션 (`src/utils.jsx::Reveal`)
- IntersectionObserver `threshold: 0.15`, `rootMargin: '0px 0px -8% 0px'`
- visible 시 `opacity 0→1`, `translate3d(0, 24px, 0) → 0`
- transition: `700ms cubic-bezier(.2,.7,.2,1)`, delay 옵션 지원

→ Framer Motion의 `whileInView` + `viewport={{ once: true, amount: 0.15 }}`로 대체 권장.

### 3. Hero 패럴랙스
scroll position에 multiplier(0.10~0.28)를 곱해서 배경 블롭과 floating card의 `translate3d`를 계산. requestAnimationFrame 권장.

### 4. CoreValue Sticky 섹션 (`src/CoreValue.jsx`)
- 외부 wrapper의 height: `${5 * 80}vh` (5개 step × 80vh)
- 내부에 `position: sticky; top: 0; height: 100vh` 컨테이너
- 스크롤 progress(0~1)를 step 인덱스로 매핑하여 우측 텍스트와 좌측 카드 프리뷰가 동시에 변함
- 좌측 프리뷰는 5종 (checklist / obligations / pdf / repair / stats), 각자 진입 애니메이션 가짐

→ Framer Motion의 `useScroll({ target, offset })` + `useTransform`이 가장 적합.

### 5. Hero "동영상" — 앱 시연 모션 (`src/HeroVideo.jsx::HeroPhoneMock`)
실제 비디오 파일이 없어 phone mock 안에서 4 stage를 자동 순환합니다:
| stage | 시점 | 내용 |
|---|---|---|
| 0 | 0~4.4s | 체크리스트 5개 항목이 0.7초 간격으로 순차 체크 |
| 1 | 4.4~6.8s | 사진 4장 grid 스태거 페이드인 |
| 2 | 6.8~9.0s | 서명 SVG path stroke-dashoffset 애니메이션 |
| 3 | 9.0~11.8s | PDF 카드 회전 등장 + 성공 토스트 |

→ 실제 데모 영상이 생기면 `<video autoplay muted loop playsinline>`로 교체하거나, 디자인 의도를 유지하려면 이 컴포넌트를 그대로 포팅.

### 6. Calculator 슬라이더 (`src/Calculator.jsx`)
관리 시설 수 (1~500개소)에 따라 3-tier 누진 단가로 월 요금을 실시간 계산:
- 1~50개소: 기본료 50,000원 + 개소당 1,000원 (Starter)
- 51~200개소: 기본료 100,000원 + 1~50 1,000원 / 51~200 800원 (Growth)
- 201~500개소: 기본료 150,000원 + 1~50 1,000원 / 51~200 800원 / 201~500 600원 (Pro)
- 500개소 초과: 별도 견적

### 7. Nav 스크롤 전환 (`src/Nav.jsx`)
`scrollY > 24`에서 배경 `rgba(255,255,255,0) → rgba(255,255,255,.85)` + backdrop-filter blur 적용. transition 280ms.

### 8. Floating Card 부유 애니메이션 (`src/Hero.jsx::FloatingCard`)
`@keyframes floatY { 50% { translate: 0 -6px; } }`, 4.5s 무한 ease-in-out.

---

## 📐 반응형

- 데스크탑 우선 (≥980px)으로 디자인됨
- 980px 미만에서 모든 2단 grid가 1단으로 collapse (style 태그에 미디어 쿼리)
- 모바일 전용 디자인은 별도 작업 필요 — Hero 컴포넌트의 좌우 분할을 세로로 쌓고, CoreValue sticky를 모바일에서는 일반 스크롤 섹션으로 변환 권장

---

## 🔤 카피 (모두 PRD에서 확정된 카피)

전체 텍스트는 `PRD.md`에 들어 있습니다. **그대로 사용**해 주세요. 임의로 수정하면 안 됩니다.

---

## 🛠 구현 권장 스택

| 항목 | 권장 |
|---|---|
| 프레임워크 | Next.js 14 App Router |
| 스타일 | Tailwind CSS + CSS 변수로 디자인 토큰 노출 |
| 애니메이션 | Framer Motion (scroll, reveal, sticky) |
| 폰트 | `pretendard` npm 패키지 또는 next/font로 self-host |
| 아이콘 | `lucide-react` (현재 인라인 SVG는 거의 lucide 스타일) |
| 폼 | React Hook Form + Zod (CTA / 상담 신청용) |
| 분석 | GA4 + 핫자 / Amplitude (스크롤 깊이, CTA 클릭, calculator 사용) |

### Tailwind 마이그레이션 팁
1. `wds/colors_and_type.css`의 CSS 변수를 그대로 `globals.css`에 복붙
2. `tailwind.config.js`의 `theme.extend.colors`에서 변수를 참조:
   ```js
   colors: {
     primary: 'var(--semantic-primary-normal)',
     'label-strong': 'var(--semantic-label-strong)',
     'label-normal': 'var(--semantic-label-normal)',
     // ...
   }
   ```
3. 인라인 style은 Tailwind 클래스로 일괄 치환

---

## ✅ 작업 체크리스트

- [ ] 디자인 토큰을 코드베이스에 이식
- [ ] Pretendard 폰트 self-host
- [ ] 12개 섹션 각각 구현 (위 표 참고)
- [ ] 스크롤 배경 전환 구현
- [ ] CoreValue sticky 섹션 구현
- [ ] Hero 모션 데모 → 실제 영상으로 교체 또는 그대로 포팅
- [ ] Calculator 누진 로직 검증
- [ ] CTA 폼 백엔드 연결 (도입 상담 신청 / 데모 요청)
- [ ] SEO 메타 태그 (PRD §13 참고)
- [ ] 모바일 반응형 추가 작업
- [ ] 접근성 검토 (포커스 스타일, 키보드 네비, aria-label 등)
- [ ] `prefers-reduced-motion` 존중 확인

---

## 📁 자산

현재 번들에는 별도 이미지가 없고, 모든 비주얼이 SVG/CSS로 구성되어 있습니다. 추후 다음이 필요:
- 실제 데모 영상 (Hero)
- 도입 기관 실제 로고 (TrustStrip)
- OG 이미지 (메타 태그용)

---

## 📞 디자인 의도 / Open Question

- **Hero 동영상:** 실제 제품 화면을 녹화한 30~45초 데모 권장. 현재 모션 데모와 동일한 4-stage 흐름이 이상적.
- **요금 계산기:** 현재는 시설 수만 입력. 향후 점검자 수, 사진 용량 등 옵션 추가 시 결과 영역 확장 필요.
- **다크 섹션:** Problem / FinalCTA / Footer 3개만 다크. 나머지는 라이트. 이 리듬을 유지해 주세요.

질문이 있으면 디자이너에게 문의해 주세요.
