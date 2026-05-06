# 안전점검실시대장 · 인쇄 미리보기 개선 메모

대상: `/inspections/[inspectionId]/ledger` 안전점검실시대장 미리보기 및 브라우저 인쇄(`window.print()`).

---

## 1. 현재 구현 요약

| 영역 | 내용 |
|------|------|
| 인쇄 진입 | `PrintButton` → `window.print()` (`src/components/ledger/print-button.tsx`) |
| 용지 | `@media print`에서 `A4 portrait`, 여백 `10mm` (`src/app/globals.css`) |
| 타이포 | 화면 대비 인쇄 시 고정 축소: 테이블 `print:text-[9px]` 등 (`ledger-table.tsx`, `ledger/page.tsx`) |
| 레이아웃 | `.ledger-print-root`에 `min-height: 277mm` (인쇄 버튼의 A4 높이 상수와 동일 개념) |
| 행 높이 | 인쇄 직전 `applyPrintRowHeights`: 헤더·thead·`ledger-row-active` 높이를 뺀 나머지를 `ledger-row-empty`에 분배. **데이터가 있는 월만 12개면 empty 행이 없어 분배가 사실상 동작하지 않음** |
| 페이지 분할 | 앱 레벨의 다중 A4 페이징·페이지별 헤더 반복 로직 **없음**. `tbody tr`에 `page-break-inside: avoid`만 적용 |
| 외부 라이브러리 | 인쇄/PDF 전용 페이징 패키지 **미사용** (`package.json` 기준) |

---

## 2. 알려진 한계

1. **긴 연간 대장**: 월별 특이사항·서명이 많을 때 한 페이지를 넘기면 브라우저 기본 분할에만 의존하며, 행이 매우 길 경우 잘리거나 이상하게 나뉠 수 있음.
2. **`applyPrintRowHeights`와 실제 데이터 불일치**: 누적 월별 데이터로 `ledger-row-active`가 여러 개인 설계와, “한 장을 empty 행으로 채운다”는 초기 가정이 어긋남.
3. **미리보기와 인쇄 결과**: 화면은 일반 스타일, 인쇄는 `print:` 변형이라 **인쇄 미리보기 전용 WYSIWYG**에 가깝게 맞추려면 별도 검토가 필요함.
4. **브라우저 의존**: 배율·여백·배경 그래픽은 사용자 설정에 따라 달라짐; 앱에서 통제하지 않음.

---

## 3. 개선 후보 (우선순위는 프로덕트에서 조정)

### 3.1 인쇄 레이아웃 · 페이징

- [ ] **의도적 다페이지**: 2페이지 이상일 때 `thead` 반복(`display: table-header-group` 등), 페이지마다 시설명/제목 반복 여부 정책 확정.
- [ ] **`page-break-inside: avoid` 완화 검토**: 특이사항이 긴 한 행이 한 페이지 높이를 넘을 때 브라우저별 처리 개선(행 내부 분할 허용 vs 셀 분할 등).
- [ ] **`applyPrintRowHeights` 정리**: 다월 데이터 기준으로 재정의하거나, 제거하고 순수 CSS/테이블 자연 높이로 통일.
- [ ] **`.ledger-print-root` `min-height: 277mm`**: 다페이지 인쇄 시 불필요한 빈 공간·인쇄 이슈가 없는지 검증 후 조정.

### 3.2 미리보기 UX

- [ ] **인쇄와 동일한 미리보기**: `print` 미디어 에뮬레이션 또는 인쇄 전용 레이어로 “보는 것 = 인쇄물”에 가깝게.
- [ ] **페이지 경계 표시**: 스크롤 가능한 미리보기에서 A4 단위 점선/구획(클라이언트 계산 또는 CSS `break` 힌트).
- [ ] **PDF 저장 품질**: 브라우저 “PDF로 저장” 외에 서버/클라이언트 PDF 생성 시 레이아웃 고정 여부 PRD와 맞추기 (`docs` PRD의 PDF 단계 참고).

### 3.3 접근성 · 운영

- [ ] **작은 인쇄 글꼴(9px)**: 법적·현장 가독성 요구가 있으면 최소 크기·줄간 검토.
- [ ] **다크 모드**: `PrintLayout`에 `dark:text-zinc-950` 등이 있으나 인쇄 시 배경·대비 일관성 재확인.
- [ ] **서명 이미지**: 인쇄 해상도·용량, 만료된 signed URL 재요청 등 운영 시나리오 문서화.

### 3.4 기술 부채 · 테스트

- [ ] **상수 단일화**: `A4_PRINT_HEIGHT_MM`(277)와 CSS `277mm`의 단일 소스(주석·모듈)로 정리.
- [ ] **E2E**: 주요 브라우저에서 인쇄 미리보기 1페이지/다페이지 스냅샷 또는 PDF 바이트 길이 등 회귀 검증(플레이크 주의).

---

## 4. 참고 파일

- `src/components/ledger/print-button.tsx` — 인쇄 트리거, 행 높이 보정
- `src/components/ledger/print-layout.tsx` — 루트 래퍼(`ledger-print-root`)
- `src/components/ledger/ledger-table.tsx` — 연간 테이블, `print:` 타이포
- `src/app/(dashboard)/inspections/[inspectionId]/ledger/page.tsx` — 대장 페이지 조합
- `src/app/globals.css` — `.ledger-print-*`, `@media print`

---

## 5. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-05 | 초안 작성 (현 구조 점검 및 개선 후보 목록화) |
