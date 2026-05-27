# 데이터셋 사용자화 검토 결과 (2026-05-27)

> 검토 범위: 마이그레이션 `20260527140000`~`20260527140700` (8개), 업로드/점검/할당 UI, RLS·헬퍼, `src/lib/dataset/*`  
> Supabase project ref: `hliykvfxldohkxnizxpy` (`.env.local`와 `supabase migration list --linked` 일치 확인)

## 요약

| 구분 | 결과 |
|------|------|
| 마이그레이션 | 로컬 9개 (`20260527140800` 후속 수정 포함) 원격 적용됨 |
| 후속 수정 | 2026-05-27 — RLS read/write 분리, facilities-table, 업로드·revalidate·감사 경고 반영 |
| 빌드·린트 | `npm run lint` · `npm run build` 통과 |
| 프로덕션 RLS (멤버십) | `using (true)` 임시 정책 **미잔존** (정책 2개만 존재) |
| 마이그레이션 소스 | `140500` DROP 정책명 오타 **존재** → 신규 환경 배포 시 위험 |
| 보관(archived) 후 점검 조회 | 설계 문서·UI 문구와 RLS **불일치** (비-ADMIN 차단) |
| 다중 데이터셋 UX | 시설 목록 월별 상태·점검 링크 **미지원** (단일 데이터셋 환경에서는 영향 없음) |

**권장 우선 조치:** (1) `140500` DROP 정책명 수정 마이그레이션, (2) archived 점검 조회 정책을 문서 또는 RLS 중 하나에 맞춤, (3) `facilities-table` 다중 데이터셋 대응.

---

## Phase 0 — 사전 확인

| 항목 | 결과 |
|------|------|
| project ref | `hliykvfxldohkxnizxpy` (.env.local URL 일치) |
| 마이그레이션 | `20260527140000`~`40700` 로컬·원격 모두 Applied |
| 백업 | [docs/backups/2026-05-27-dataset-customization.md](../backups/2026-05-27-dataset-customization.md) 기록 존재 |
| 문서 §14.4 | 마이그레이션 6개 기준 — 실제는 8개 + 2차 UI 반영 필요 |

---

## Phase 1 — 정적 코드·타입

### 1-1. 빌드·린트

| 명령 | 결과 |
|------|------|
| `npm run lint` | 통과 |
| `npm run build` | 통과 (TypeScript 포함) |
| `npm run check:types` | Supabase CLI pooler 인증 차단으로 **미완료** (circuit breaker). `database.generated.ts` drift는 수동 확인 권장 |

### 1-2. 서버 액션·권한 (코드 리뷰)

| 파일 | 판정 | 비고 |
|------|------|------|
| `admin/upload/actions.ts` | 통과 | ADMIN만, archived 거부, `recordDatasetUpload` 호출 |
| `admin/datasets/actions.ts` | 통과 | archive·할당 sync, 감사 로그, revalidate 양호 |
| `inspections/new/actions.ts` | 통과 | 할당·멤버십·중복·`dataset_id` insert 검증 |
| `settings/user-actions.ts` | 주의 | active 데이터셋만 할당 검증 OK. `syncDatasetUserAssignments` **미재사용**(중복 로직). `/admin/datasets/*` **revalidate 없음** |

### 1-3. 업로드·멤버십·감사

| 항목 | 심각도 | 내용 |
|------|--------|------|
| 부분 업로드 → 멤버십 비활성 | Medium | `deactivateMissingMemberships`는 **성공한 시설만** 스냅샷에 포함. JSON에 있으나 시설별 upsert 실패한 번호는 비활성 대상이 될 수 있음 ([uploader.ts](../../src/lib/json-parser/uploader.ts) 239–246행). 의도 문서화 또는 실패 시설 제외 로직 검토 |
| 감사 로그 실패 | Medium | `recordDatasetUpload` / `logDatasetAudit`는 insert 실패 시 `console.error`만 — 업로드는 성공으로 표시 |
| `fetchDatasetNameMap` | Low | Supabase `error` 미검사 → UI에 「알 수 없음」 |
| `getAccessibleDatasets` | Low | 쿼리 `error` 미처리 |
| `inspection-stats` → UI 타입 | Low | lib가 컴포넌트 타입에 역방향 의존 |
| `database.ts` `dataset_id` | Low | `MonthlyInspectionRow.dataset_id`가 여전히 `string \| null` (DB는 NOT NULL) |

---

## Phase 2 — DB·RLS

### 2-1. SEC-01 — memberships 정책 DROP 오타

**마이그레이션 소스**

- 생성 ([140100](../../supabase/migrations/20260527140100_facility_dataset_memberships.sql)): `"Facility dataset memberships are readable by authenticated **users**"`
- DROP ([140500](../../supabase/migrations/20260527140500_rls_dataset_filtering.sql) 321행): `"… authenticated **user**"` (단수)

**원격 DB 조회** (2026-05-27, `supabase db query --linked` 1회 성공):

| policyname | cmd | qual 요약 |
|------------|-----|-----------|
| Admins manage memberships | ALL | `has_role(ADMIN)` |
| Users read memberships within accessible datasets | SELECT | ADMIN OR 할당 `dataset_id` 매칭 |

`using (true)` 임시 정책은 **없음**.

| ID | 심각도 | 프로덕션 | 조치 |
|----|--------|----------|------|
| SEC-01 | Critical (신규 배포) / **Closed (현재 prod)** | 격리 정상 | `140500` DROP 이름 수정 또는 `DROP POLICY IF EXISTS` 보완 마이그레이션 추가 |

### 2-2. RLS 시나리오 (R1~R8)

| ID | 시나리오 | 결과 | 근거 |
|----|----------|------|------|
| R1 | 미할당 dataset 점검 SELECT | **미실행** | 테스트 DB에 active 데이터셋 1개만 존재. 비-ADMIN 비밀번호 미확보. 코드·RLS 정의상 `user_has_dataset_access`로 차단 예상 |
| R2 | 동월·동시설·다른 dataset 점검 2건 | **통과(스키마)** | `UNIQUE(facility_no, inspection_month, dataset_id)`, `dataset_id` NULL 0건 |
| R3 | archived 업로드·신규 점검 | **통과(앱)** | `upload/actions.ts` status 검증. INSERT RLS는 `user_has_dataset_access` → active만 |
| R4 | 비활성 멤버십 시설 SELECT | **통과(설계)** | `user_has_facility_access` → `m.is_active = true` |
| R5 | archived dataset **기존** 점검 SELECT | **실패(정책 불일치)** | `user_has_dataset_access`가 `fd.status = 'active'`만 허용. §12.3·`archive-toggle.tsx` 「기존 점검 조회 유지」와 불일치 |
| R6 | 타 사용자 dataset INSERT | **통과(설계)** | INSERT `with check`에 `user_has_dataset_access` |
| R7 | 정지(suspended) 계정 SELECT | **주의** | `has_role`은 `user_is_active` 포함(쓰기 차단). **SELECT**는 `user_has_*`만 사용 → 정지 계정도 할당만 있으면 시설·점검 **조회 가능**할 수 있음 |
| R8 | 멤버십 비활성 + dataset 할당만으로 INSERT | **통과(앱)** | RLS는 dataset만 검사. `createMonthlyInspection`에서 멤버십·`is_active` 추가 검증 |

### 2-3. 시드·무결성

| 검사 | 결과 |
|------|------|
| `monthly_inspections.dataset_id IS NULL` | 0건 |
| 비-ADMIN 할당 누락 | 0명 (INSPECTOR·VIEWER 모두 기본 데이터셋 할당) |
| `facility_dataset_uploads` / `dataset_audit_log` | 테이블 존재, 행 0 (업로드 후 이력 미기록 상태) |

### 2-4. 중간 배포

원격에는 `140000`~`140700` 일괄 적용된 것으로 보임. 중간 구간(`using (true)`만 있는 상태) 노출 여부는 배포 이력에 따름.

---

## Phase 3 — 기능·UI 시나리오

브라우저 자동화 세션 없음(`/login`이 랜딩 페이지, 별도 로그인 UI 미노출). 터미널 로그상 동일 환경에서 `/admin/upload`·`/settings/users` 200 응답은 확인됨.

| ID | 결과 | 비고 |
|----|------|------|
| U1~U4 | 코드 검증 | 업로드 플로우·archived 거부·부분 성공 모델 구현됨. 감사 테이블 행 0 |
| A1 | 코드 검증 | 데이터셋 액션 ↔ 사용자 액션 동일 테이블. 사용자 액션 쪽 dataset 상세 revalidate 누락 |
| A2 | RLS 설계 | 할당 해제 시 시설·점검 0건 예상 |
| A3 | 코드 검증 | UI는 active만. archived 할당 고아 가능 |
| I1~I2 | 코드 검증 | `getAccessibleDatasets` 0/1/N 분기, `datasetId` searchParams |
| I3 | R1과 동일 | 라이브 미실행 |
| I4 | **확인됨** | `/inspections/new?facilityNo=` 만 전달, `datasetId` 없음 |
| I5 | **확인됨** | `monthly_inspections` 조회에 `dataset_id` 필터 없음 → 다중 dataset 시 상태 혼동 |
| 3-6 revalidate | **확인됨** | `uploadJsonAction`: `/admin/datasets` 없음. `updateUserDatasetAssignmentsAction`: `/admin/datasets/*` 없음 |

---

## Phase 4 — 회귀·2차 경계

| 영역 | 판정 |
|------|------|
| 시설 상세·점검 저장 | RLS 위임 패턴 유지 (코드 변경 최소) |
| 글로벌 마스터 덮어쓰기 | §6.5 문서화된 동작 — 버그 아님 |
| 트랜잭션화·dataset 전환기 | 2차 범위 — 결함 아님 |

---

## 이슈 목록 (조치 추적)

| ID | 영역 | 설명 | 심각도 | 상태 | 권장 조치 |
|----|------|------|--------|------|-----------|
| SEC-01 | RLS | `140500` memberships DROP 정책명 오타 (`user` vs `users`) | Critical (신규 배포) | Open (소스) / Closed (prod) | 수정 마이그레이션 또는 `140500` 파일 정정 |
| POL-01 | RLS/문서 | archived 후 비-ADMIN 기존 점검 조회 불가 | High | Open | `user_has_dataset_access`에 archived+할당 허용 OR §12.3·UI 문구 수정 |
| UX-01 | facilities | 월별 점검 상태·링크에 `dataset_id` 미반영 | High (다중 dataset 시) | Open | 할당 dataset별 상태 표시, 링크에 `datasetId` 전달 |
| OPS-01 | upload | 부분 실패 시 의도치 않은 멤버십 비활성 | Medium | Open | 실패 `facility_no`를 비활성 대상에서 제외 또는 문서화 |
| OPS-02 | audit | 감사·업로드 이력 insert 실패 무시 | Medium | Open | 실패 시 사용자 경고 또는 재시도 |
| OPS-03 | cache | revalidate 경로 누락 | Medium | Open | upload·user 할당 액션에 `/admin/datasets` 추가 |
| SEC-02 | RLS | 정지 계정 SELECT 가능 | Medium | Open | `user_has_*`에 `user_is_active()` 추가 검토 |
| CODE-01 | settings | 할당 sync 로직 중복 | Low | Open | `syncDatasetUserAssignments` 재사용 |
| CODE-02 | types | `dataset_id` nullable 타입 잔존 | Low | Open | `database.ts`·`gen:types` 정합 |
| DOC-01 | docs | §14.4 마이그레이션 6개·검증 상태 구식 | Low | Open | 8개 마이그레이션·본 검토 링크 반영 |

---

## 검증에 사용한 방법

- `npx supabase migration list --linked`
- `npx supabase db query --linked` (멤버십 정책, NULL `dataset_id` — 일부 쿼리는 pooler circuit breaker로 실패)
- `@supabase/supabase-js` + service role: 역할·할당·무결성·archived 시나리오 셋업/정리
- `npm run lint`, `npm run build`
- 소스 정적 리뷰 (플랜 체크리스트 전항)

---

## 다음 단계 (구현 시)

1. `supabase/migrations/20260527140800_fix_memberships_policy_drop.sql` (예시): 올바른 이름으로 임시 정책 `DROP`.
2. archived 조회: `user_has_dataset_access`에서 `archived` + `user_dataset_assignments` 존재 시 SELECT만 허용하는지 제품 결정 후 RLS/문서 동기화.
3. `facilities-table.tsx`: `getAccessibleDatasets` 연동 또는 월별 상태를 dataset 단위로 조회.
4. `npm run check:types` — pooler 복구 후 CI에 추가.

---

*검토 수행: 2026-05-27. 본 문서는 [데이터셋 사용자화 검토 플랜](.cursor/plans/데이터셋_사용자화_검토_da1e82e3.plan.md)에 따른 산출물입니다.*
