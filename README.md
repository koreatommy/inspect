# inspect

어린이놀이시설 **월간 안전점검** 관리 서비스입니다.

**흐름:** 시설 JSON 업로드 → 월간 점검 생성 → 기구별 점검·서명 → 완료 → 안전점검실시대장 출력

## 기술 스택

- Next.js 16.2 · React 19.2
- Supabase (Auth, Postgres, Storage)
- Tailwind CSS 4

## 사전 요구사항

- Node.js 20+
- npm
- (선택) [Supabase CLI](https://supabase.com/docs/guides/cli)

## 로컬 설정

```bash
npm install
cp .env.local.example .env.local
# .env.local에 Supabase URL·키 입력
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

### 환경 변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL (브라우저 노출) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개(Publishable/anon) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` 또는 `SUPABASE_SECRET_KEY` | 서버 전용 elevated 키 (사용자 관리 등) |

**Supabase 프로젝트 ref:** `hliykvfxldohkxnizxpy` — URL·MCP·CLI가 모두 이 프로젝트를 가리키는지 확인하세요.

`.env.local`과 루트 `admin` 같은 자격증명 메모 파일은 **Git에 커밋하지 마세요**. 노출된 계정은 비밀번호를 교체하세요.

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint (CI 전 로컬 실행 권장)
```

## Supabase

```bash
npx supabase link --project-ref hliykvfxldohkxnizxpy
npx supabase migration list --linked
```

스키마는 [`supabase/migrations/20260430115700_init_inspection_schema.sql`](supabase/migrations/20260430115700_init_inspection_schema.sql) 에 정의되어 있습니다.

## 역할·권한

[`src/lib/auth/permissions.ts`](src/lib/auth/permissions.ts) 기준:

| 역할 | 설명 |
|------|------|
| ADMIN | 시스템 관리자 — 시설 업로드, 사용자 관리 등 |
| MANAGER | 안전관리자 — 점검 생성·완료·서명 |
| INSPECTOR | 위탁점검자 — 점검 입력·서명 |
| VIEWER | 일반 조회자 — 조회 위주 |

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 대시보드 |
| `/login` | 로그인 |
| `/admin/upload` | 시설 JSON 업로드 |
| `/facilities` | 시설 목록 |
| `/inspections/new` | 월간 점검 생성 |
| `/inspections/[inspectionId]` | 점검 상세 |
| `/inspections/[inspectionId]/ledger` | 안전점검실시대장 |
| `/inspections/history` | 점검 이력 |
| `/settings` | 설정 |
| `/price` | 요금 안내 HTML |

## 프로젝트 구조

```
src/app/              App Router 페이지·Route Handler
src/lib/supabase/     Supabase SSR 클라이언트·세션
src/proxy.ts          인증 프록시 (세션 갱신·보호 라우트)
src/lib/auth/         권한·역할
src/types/database.ts DB 타입
supabase/migrations/  Postgres 마이그레이션
```

## 보안

- Service Role / Secret 키는 서버 코드에서만 사용합니다.
- MCP·CLI로 DB 작업 시 프로젝트 ref가 `hliykvfxldohkxnizxpy`인지 확인합니다 (상세: [`.cursor/rules/supabase-mcp-project.mdc`](.cursor/rules/supabase-mcp-project.mdc)).
