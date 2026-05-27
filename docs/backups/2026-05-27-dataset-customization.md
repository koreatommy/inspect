# Phase 0 백업 산출물 — 시설정보 데이터셋 사용자화 1차 개발 전

> 본 문서는 1차 개발(데이터셋 모델 + RLS 교체)을 진행하기 전에 수행한 백업의 위치, 무결성 해시, 복구 절차를 기록합니다.

## 기본 정보

| 항목 | 값 |
|------|------|
| 수행 시각 | 2026-05-27 11:57 KST |
| Supabase project ref | `hliykvfxldohkxnizxpy` |
| Supabase project name | inspect |
| Region | ap-northeast-2 (Seoul) |
| Supabase CLI 버전 | 2.78.1 |
| pg_dump 버전 | PostgreSQL 18.1 (Homebrew) |
| DB 호스트 (pooler) | `aws-1-ap-northeast-2.pooler.supabase.com:5432` |
| 백업 사용자 | `postgres.hliykvfxldohkxnizxpy` |

## 산출물

### 1) 프로젝트 폴더 백업 (rsync)

| 항목 | 값 |
|------|------|
| 경로 | `/Users/eugene/Documents/safeplay_backup_before_dataset_customization_2026-05-27/` |
| 크기 | 41 MB |
| 제외 | `node_modules`, `.next`, `.vercel`, `.playwright-mcp` |
| 보존 확인 | `.env.local` 548B, `supabase/migrations/` 8개 파일, `.git/`, `src/`, `docs/`, `package.json`, `package-lock.json` 모두 존재 |

### 2) Supabase DB dump 3종 (`~/Documents/safeplay_db_backups/`)

| 파일 | 크기 | sha256 |
|------|------|--------|
| `db_backup_schema_before_dataset_customization_2026-05-27.sql` | 36,051 B | `c2f10f5dc64e433216540ba2a4bf61b06f3dc236e37314e2ec633e95351feb5e` |
| `db_backup_data_before_dataset_customization_2026-05-27.sql` | 702,801 B | `caf7df57fadf0e3e8ef659fddfebd7050f4cad0d6232d43a5cd6f9a59c0ac6bf` |
| `db_backup_roles_before_dataset_customization_2026-05-27.sql` | 7,180 B | `bced26ebd390d19042e359e3debce2193021c1918a36e392fe6f9d3b7930fbd4` |
| `SHA256SUMS.txt` | — | (위 세 해시 누적 기록) |

### 3) 스키마 dump 완전성 검증

| 항목 | 수량 |
|------|------|
| `CREATE TABLE` | 10 |
| `CREATE INDEX` | 12 |
| `CREATE POLICY` | 27 |
| `ENABLE ROW LEVEL SECURITY` | 10 |
| `CREATE [OR REPLACE] FUNCTION` | 6 |
| `CREATE TRIGGER` | 9 |
| `FOREIGN KEY` 제약 | 11 |
| `app_private` 참조 | 28 |

### 4) 데이터 dump 행 수 (`INSERT INTO`)

| 테이블 | 행 수 |
|--------|------|
| `public.facilities` | 60 |
| `public.equipment` | 343 |
| `public.facility_legal_inspections` | 60 |
| `public.safety_educations` | 60 |
| `public.liability_insurances` | 60 |
| `public.facility_managers` | 59 |
| `public.inspection_user_roles` | 3 |
| `public.monthly_inspections` | 1 |
| `public.monthly_inspection_items` | 5 |
| `public.inspection_ledger_rows` | 1 |
| 합계 | 652 |

## 사용한 명령

### 코드 백업

```bash
rsync -av \
  --exclude node_modules --exclude .next --exclude .vercel --exclude .playwright-mcp \
  /Users/eugene/Documents/inspect/ \
  ~/Documents/safeplay_backup_before_dataset_customization_2026-05-27/
```

### DB 백업 (pg_dump 직접 사용 — Docker Desktop 미가용 우회)

`~/.pgpass`에 자격 증명을 저장(권한 600)하여 비밀번호 노출 없이 실행했습니다.

```bash
cd ~/Documents/safeplay_db_backups

pg_dump \
  -h aws-1-ap-northeast-2.pooler.supabase.com -p 5432 \
  -U postgres.hliykvfxldohkxnizxpy -d postgres \
  --schema-only --no-owner --no-privileges \
  -n public -n app_private \
  -f db_backup_schema_before_dataset_customization_2026-05-27.sql

pg_dump \
  -h aws-1-ap-northeast-2.pooler.supabase.com -p 5432 \
  -U postgres.hliykvfxldohkxnizxpy -d postgres \
  --data-only --no-owner --no-privileges --column-inserts \
  -n public -n app_private \
  -f db_backup_data_before_dataset_customization_2026-05-27.sql

PGHOST=aws-1-ap-northeast-2.pooler.supabase.com PGPORT=5432 \
PGUSER=postgres.hliykvfxldohkxnizxpy \
  pg_dumpall --roles-only \
    -f db_backup_roles_before_dataset_customization_2026-05-27.sql
```

## 복구 절차

문제 발생 시 다음 순서로 복원합니다. **반드시 staging 환경에서 한 번 검증 후 production에 적용하십시오.**

### A. 코드 복구

```bash
mv /Users/eugene/Documents/inspect \
   /Users/eugene/Documents/inspect_failed_$(date +%Y%m%d_%H%M%S)
rsync -av \
  ~/Documents/safeplay_backup_before_dataset_customization_2026-05-27/ \
  /Users/eugene/Documents/inspect/
cd /Users/eugene/Documents/inspect && npm install
```

### B. DB 복구

복구 전 sha256 재확인:

```bash
cd ~/Documents/safeplay_db_backups
shasum -a 256 -c SHA256SUMS.txt
```

#### 옵션 1 — 신규 마이그레이션만 되돌리기 (선호)

1차 개발 중 새로 push한 마이그레이션이 적용된 상태에서 그것만 되돌리는 방법입니다.

```bash
cd /Users/eugene/Documents/inspect
supabase migration list --linked
# 되돌릴 마이그레이션 timestamp 확인 후
supabase migration repair --linked --status reverted <timestamp>
# 필요 시 supabase db push --linked 로 재정렬
```

추가로 RLS 정책이나 함수만 되돌려야 한다면 schema dump에서 해당 블록만 추출해 `psql`로 적용합니다.

#### 옵션 2 — 백업 SQL로 통째 복원

기존 데이터/스키마를 모두 백업 시점으로 되돌립니다(파괴적). 신규 마이그레이션이 추가한 테이블·컬럼·정책은 미리 명시적으로 `DROP`해 두어야 충돌이 없습니다.

```bash
# Supabase Dashboard → Project Settings → Database → Connection string (psql)에서 URL 확보
export SUPABASE_DB_URL='postgresql://postgres.hliykvfxldohkxnizxpy:<password>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres'

# (필요 시) 신규 객체 정리 — 1차 개발에서 추가된 테이블/컬럼/정책을 먼저 DROP
psql "$SUPABASE_DB_URL" -c "DROP TABLE IF EXISTS public.facility_dataset_memberships CASCADE;"
psql "$SUPABASE_DB_URL" -c "DROP TABLE IF EXISTS public.user_dataset_assignments CASCADE;"
psql "$SUPABASE_DB_URL" -c "DROP TABLE IF EXISTS public.facility_datasets CASCADE;"
psql "$SUPABASE_DB_URL" -c "ALTER TABLE public.monthly_inspections DROP COLUMN IF EXISTS dataset_id;"

# 백업 적용 (스키마 → 데이터 → 역할 순)
psql "$SUPABASE_DB_URL" -f db_backup_schema_before_dataset_customization_2026-05-27.sql
psql "$SUPABASE_DB_URL" -f db_backup_data_before_dataset_customization_2026-05-27.sql
psql "$SUPABASE_DB_URL" -f db_backup_roles_before_dataset_customization_2026-05-27.sql
```

#### 옵션 3 — Supabase Dashboard manual backup / PITR

위 두 옵션이 실패하거나 plataforma 측 백업이 더 신선한 경우 Supabase Dashboard → Database → Backups에서 manual backup 또는 PITR로 복원.

## 주의

- **`supabase db reset --linked`는 사용하지 마십시오.** 원격 DB의 모든 데이터를 초기화합니다.
- 복구 시 RLS·함수·트리거가 schema dump에만 들어 있고 data dump에는 정의가 없습니다. 항상 schema → data 순서로 적용해야 외래키 위반이 발생하지 않습니다.
- `~/.pgpass`에는 DB 비밀번호가 평문으로 저장되어 있습니다. 백업 작업이 끝나면 보안을 위해 Supabase Dashboard에서 DB 비밀번호를 회전(재설정)하고 `~/.pgpass`도 갱신 또는 삭제하는 것을 권장합니다.

## 향후 백업 위치 (1차 개발 진행 중 추가 백업이 필요할 경우)

| 시점 | 추천 파일명 prefix |
|------|--------------------|
| Phase 1 직후 (스키마만 추가, RLS 변경 전) | `db_backup_after_phase1_*` |
| Phase 5 직전 (RLS 교체 직전) | `db_backup_before_phase5_*` |
| 모든 Phase 완료 후 | `db_backup_after_phase6_*` |
