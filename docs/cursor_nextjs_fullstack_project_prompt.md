# Cursor용 Next.js 풀스택 프로젝트 초기 구축 프롬프트

아래 내용을 Cursor에 그대로 붙여넣어 사용하세요.

---

```md
당신은 Next.js 풀스택 SaaS 프로젝트를 설계·구현하는 시니어 풀스택 개발자입니다.

아래 기준에 따라 신규 프로젝트의 기술 스택, 초기 설정, 의존성 설치, 폴더 구조, 환경 변수, Supabase 연동, UI 구성, 차트, 테스트 환경까지 안정적으로 구성해주세요.

목표는 다음 형태의 프로젝트입니다.

- Next.js 16 기반 풀스택 웹앱
- App Router 사용
- TypeScript 사용
- Tailwind CSS v4 사용
- Supabase 기반 인증·DB 연동
- shadcn/ui 기반 대시보드 UI
- Recharts 기반 차트
- Playwright 기반 E2E 테스트
- Cursor에서 유지보수하기 쉬운 구조
- 프로덕션 배포를 고려한 안정적 구조

---

# 1. 기본 개발 환경 기준

다음 기준을 전제로 프로젝트를 구성해주세요.

## 필수 호스트 환경

- Git
- Node.js 최소 20.9 이상
- 권장 Node.js 버전: Node.js 22 LTS
- 패키지 매니저는 하나만 사용
- 기본은 npm을 사용하되, pnpm이 더 적합하다고 판단되면 packageManager 필드에 명시

프로젝트 루트에 Node 버전을 고정할 수 있도록 `.nvmrc` 파일을 생성해주세요.

```txt
22
```

---

# 2. Next.js 프로젝트 기준

Next.js는 최신 안정 버전을 기준으로 사용합니다.

신규 프로젝트 생성 기준은 다음과 같습니다.

- Next.js 16.x
- React 19.x
- React DOM 19.x
- TypeScript
- ESLint
- Tailwind CSS v4
- App Router
- src 디렉토리 사용
- import alias는 `@/*` 사용

Canary, beta, RC 등 실험 버전은 사용하지 마세요.

설치 전에는 다음 명령으로 최신 안정 버전을 확인하는 것을 전제로 합니다.

```bash
npm view next version
npm view react version
npm view react-dom version
npm view typescript version
npm view tailwindcss version
npm view eslint version
```

---

# 3. 주요 패키지 구성

다음 패키지를 기준으로 구성해주세요.

## 코어

```bash
npm install next react react-dom
npm install -D typescript eslint eslint-config-next @types/node @types/react @types/react-dom
```

## Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/postcss
```

Tailwind v4 방식에 맞게 PostCSS 및 글로벌 CSS 구성을 정리해주세요.

## Supabase

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Supabase는 다음 구조를 고려해서 구성해주세요.

- 브라우저 클라이언트
- 서버 클라이언트
- 미들웨어 기반 세션 처리
- SSR 환경에서 쿠키 기반 인증 유지
- Service Role Key는 서버 전용으로만 사용
- 클라이언트 번들에 민감 정보가 포함되지 않도록 분리

## UI

```bash
npm install lucide-react framer-motion
```

shadcn/ui를 초기화하고, 대시보드에 필요한 기본 컴포넌트를 추가해주세요.

```bash
npx shadcn@latest init
npx shadcn@latest add button card table badge input select tabs dialog dropdown-menu sheet separator skeleton
```

## 차트

대시보드, KPI, sparkline, 통계 시각화는 Recharts를 우선 사용합니다.

```bash
npm install recharts
```

Chart.js는 기본 설치하지 마세요.  
정교한 캔버스 차트나 datalabel이 꼭 필요한 경우에만 추가 후보로 남겨주세요.

## 테스트

Playwright 기반 E2E 테스트 환경을 구성해주세요.

```bash
npm install -D @playwright/test
npx playwright install
```

## TypeScript 실행 스크립트

Node에서 TypeScript 스크립트를 직접 실행할 일이 있다면 `tsx`를 우선 사용해주세요.

```bash
npm install -D tsx
```

---

# 4. 환경 변수 구성

프로젝트 루트에 `.env.local.example` 파일을 생성해주세요.

다음 항목을 포함해주세요.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

주의사항을 주석으로 명확히 작성해주세요.

- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출됨
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- Service Role Key는 Client Component, 브라우저 코드, public 파일에서 절대 사용 금지
- 실제 `.env.local`은 Git에 커밋하지 않음

---

# 5. Supabase 구조

Supabase 연동 파일을 다음과 같이 분리해주세요.

```txt
src/lib/supabase/
  client.ts
  server.ts
  middleware.ts
```

각 파일의 역할은 다음과 같습니다.

## client.ts

- 브라우저 전용 Supabase 클라이언트
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client Component에서 사용 가능

## server.ts

- 서버 컴포넌트, 서버 액션, Route Handler에서 사용할 Supabase 클라이언트
- 쿠키 기반 세션 처리
- `@supabase/ssr` 사용

## middleware.ts

- 인증 세션 갱신
- 보호 라우트 접근 제어를 위한 기반 코드
- 실제 보호 라우트 정책은 추후 확장 가능하게 구성

---

# 6. Supabase 타입 생성 준비

Supabase 타입 생성을 고려해 다음 구조를 준비해주세요.

```txt
src/lib/database.types.ts
```

아직 실제 Supabase 프로젝트 ID가 없을 수 있으므로, 타입 생성 명령은 README에 문서화해주세요.

```bash
npx supabase gen types typescript --project-id "프로젝트ID" > src/lib/database.types.ts
```

타입 파일이 없더라도 초기 빌드는 깨지지 않게 처리해주세요.

---

# 7. 권장 폴더 구조

다음 구조를 기준으로 프로젝트를 정리해주세요.

```txt
src/
  app/
    layout.tsx
    page.tsx
    dashboard/
      page.tsx
    login/
      page.tsx
    api/
  components/
    ui/
    layout/
    dashboard/
    charts/
    common/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    utils.ts
    database.types.ts
  hooks/
  types/
  constants/
  styles/
```

---

# 8. 기본 화면 구성

초기 프로젝트에는 다음 화면을 만들어주세요.

## 메인 페이지 `/`

- 서비스 소개용 간단한 랜딩 페이지
- CTA 버튼
- 대시보드 이동 버튼

## 대시보드 `/dashboard`

다음 요소를 포함해주세요.

- 좌측 사이드바
- 상단 헤더
- KPI 카드 4개
- Recharts 기반 간단한 라인 차트
- Recharts 기반 간단한 바 차트
- 최근 데이터 테이블
- sticky header
- row hover
- data density 높은 Bento Grid 스타일
- 반응형 레이아웃

## 로그인 페이지 `/login`

- Supabase 인증 연동을 위한 UI 기반만 구성
- 실제 로그인 로직은 확장 가능한 형태로 작성

---

# 9. UI 스타일 기준

전체 UI는 다음 기준을 따릅니다.

- 공공기관 제안서·SaaS 관리자 화면에 적합한 전문적 스타일
- 불필요한 장식 최소화
- 정보 밀도 높은 Bento Grid 구성
- KPI 카드에는 작은 추세 표시 또는 sparkline 가능 구조
- 테이블은 sticky header와 row hover 적용
- Tailwind CSS v4 문법에 맞게 작성
- shadcn/ui 컴포넌트 적극 활용
- lucide-react 아이콘 사용
- framer-motion은 과하지 않게 사용

---

# 10. package.json 스크립트

다음 스크립트를 구성해주세요.

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:e2e": "playwright test"
  }
}
```

단, Next.js 16 기준으로 `next lint`가 변경되었거나 권장되지 않는 경우에는 현재 공식 권장 방식에 맞게 수정해주세요.

---

# 11. 초기 검증 명령

README에 다음 초기 실행 절차를 문서화해주세요.

```bash
npm install
npm run dev
npm run typecheck
npm run build
npx playwright install
npm run test:e2e
```

---

# 12. README 작성

README.md에는 다음 내용을 포함해주세요.

- 프로젝트 개요
- 기술 스택
- 설치 방법
- 환경 변수 설정 방법
- Supabase 설정 방법
- Supabase 타입 생성 방법
- 개발 서버 실행 방법
- 빌드 방법
- E2E 테스트 실행 방법
- 폴더 구조
- 보안 주의사항

---

# 13. 구현 원칙

다음 원칙을 반드시 지켜주세요.

- 최신 안정 버전 기준
- Canary, beta, RC 사용 금지
- npm/pnpm/yarn 혼용 금지
- lockfile은 하나만 유지
- TypeScript strict 기준 유지
- any 사용 최소화
- 서버 전용 키는 클라이언트 코드에서 절대 사용 금지
- Supabase RLS 적용을 전제로 설계
- 재사용 가능한 컴포넌트 구조
- Cursor에서 파일 단위로 이해하기 쉬운 구조
- 과도한 추상화 금지
- 초기 실행 시 빌드 오류가 없어야 함

---

# 14. 최종 산출물

다음 결과물을 만들어주세요.

1. Next.js 16 기반 프로젝트 초기 구조
2. Tailwind CSS v4 설정
3. shadcn/ui 초기 설정
4. Supabase 클라이언트 구조
5. 기본 랜딩 페이지
6. 기본 대시보드 페이지
7. 기본 로그인 페이지
8. Recharts 예시 차트
9. Playwright E2E 테스트 기본 설정
10. `.env.local.example`
11. `.nvmrc`
12. README.md
13. 초기 실행 가능한 package.json 스크립트

작업 후에는 다음을 확인해주세요.

```bash
npm run typecheck
npm run build
```

오류가 발생하면 원인을 분석하고 수정해주세요.
```
