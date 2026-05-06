# 어린이놀이시설 월간 안전점검 관리 서비스 PRD

- 문서명: 어린이놀이시설 월간 안전점검 관리 서비스 PRD
- 버전: v1.0
- 작성일: 2026-04-28
- 개발 방식: Cursor 기반
- 기준 데이터: 어린이놀이시설 시설정보 JSON, 안전점검실시대장 예시 이미지
- 핵심 고유값: 시설번호 `pfctSn`
- 기구 고유값: 놀이기구번호 `rideSn`

---

## 1. 제품 개요

### 1.1 제품명

**어린이놀이시설 월간 안전점검 관리 서비스**

### 1.2 제품 정의

어린이놀이시설 안전관리시스템에서 수집한 시설정보 JSON을 기반으로 시설번호(`pfctSn`) 단위의 시설·기구 데이터를 등록하고, 월 1회 기구별 안전점검 결과를 입력한 뒤, 입력 결과를 **안전점검실시대장** 양식의 1행 단위 기록으로 자동 변환하여 미리보기·저장·출력할 수 있는 웹 기반 안전점검 관리 서비스이다.

### 1.3 제품 목적

본 서비스의 목적은 다음과 같다.

1. 시설정보 JSON 업로드만으로 시설·기구 데이터를 일괄 등록·갱신한다.
2. 시설번호 기준으로 월간 안전점검 대상을 관리한다.
3. 기구별 점검 결과를 `양호`, `요주의`, `요수리`, `이용금지`로 입력한다.
4. 비양호(요주의, 요수리, 이용금지) 항목은 한글 점검내용을 필수 입력하게 한다.
5. 안전관리자와 위탁점검자의 온라인 서명을 수집한다.
6. 입력된 점검 결과를 안전점검실시대장 양식으로 자동 변환한다.
7. 월별 점검 이력과 과거 대장을 재출력 가능하게 보존한다.

---

## 2. 개발 배경

어린이놀이시설 월간 안전점검은 현장에서 종이 대장, 엑셀, 수기 서명 방식으로 관리되는 경우가 많다. 이 방식은 다음 문제가 있다.


| 구분      | 문제                                         |
| ------- | ------------------------------------------ |
| 시설정보 관리 | 시설번호, 시설명, 주소, 관리주체, 기구정보를 반복 입력해야 함       |
| 기구별 점검  | 동일 시설 내 동일 기구명이 여러 개 있을 수 있어 수기 관리 시 혼동 가능 |
| 점검결과 정리 | 기구별 입력 결과를 안전점검실시대장 양식으로 다시 정리해야 함         |
| 특이사항 관리 | 요주의·요수리·이용금지 사유가 누락되기 쉬움                   |
| 서명 관리   | 안전관리자와 위탁점검자의 서명을 별도 수기로 받아야 함             |
| 이력 보존   | 과거 점검 대장 재출력 시 당시 기구정보와 현재 기구정보가 달라질 수 있음  |


본 서비스는 위 문제를 해결하기 위해 다음 흐름을 제공한다.

```text
시설정보 JSON 업로드
→ 시설번호 기준 시설·기구 데이터 동기화
→ 시설 선택
→ 기구별 월간 안전점검 입력
→ 온라인 서명
→ 안전점검실시대장 미리보기
→ 점검완료 및 스냅샷 저장
→ PDF 또는 인쇄 출력
```

---

## 3. 사용자 정의


| 사용자     | 설명                                   | 주요 권한                      |
| ------- | ------------------------------------ | -------------------------- |
| 시스템 관리자 | 시설정보 JSON을 업로드하고 전체 시설 데이터를 관리하는 사용자 | 시설 등록·수정, JSON 업로드, 사용자 관리 |
| 안전관리자   | 시설 관리주체 측 안전관리 담당자                   | 점검 확인, 서명, 점검완료            |
| 위탁점검자   | 현장 점검을 수행하는 외부 또는 내부 점검자             | 기구별 점검 입력, 서명              |
| 관리주체    | 점검 결과와 안전점검 대장을 확인·보관하는 사용자          | 점검 이력 조회, 대장 출력            |
| 일반 조회자  | 제한된 범위에서 시설 및 점검 이력을 확인하는 사용자        | 조회 전용                      |


---

## 4. 제품 목표

### 4.1 MVP 목표

```text
시설정보 JSON 업로드 → 기구별 월간 안전점검 입력 → 온라인 서명 → 안전점검실시대장 미리보기 → 저장·출력까지 가능한 MVP를 구현한다.
```

### 4.2 성공 기준


| 기준       | 성공 조건                                            |
| -------- | ------------------------------------------------ |
| 시설정보 업로드 | JSON 업로드 후 `pfctSn` 기준으로 시설정보가 등록 또는 업데이트된다.     |
| 기구정보 연동  | 시설 선택 시 해당 시설의 active 기구 목록이 `rideSn` 기준으로 표시된다. |
| 점검 입력    | 기구별로 `양호`, `요주의`, `요수리`, `이용금지`를 선택할 수 있다.       |
| 필수값 검증   | 비양호 항목은 점검내용 없이는 저장 또는 완료할 수 없다.                 |
| 서명 입력    | 안전관리자와 위탁점검자 서명이 온라인으로 저장된다.                     |
| 대장 미리보기  | 기구별 입력 결과가 안전점검실시대장 1행 구조로 자동 변환된다.              |
| 이력 보존    | 완료된 점검은 시설번호 + 점검월 기준으로 재조회 가능하다.                |
| 재출력 안정성  | JSON 재업로드 후에도 과거 완료 대장은 당시 내용으로 재출력된다.           |


---

## 5. MVP 범위

### 5.1 포함 범위


| 기능            | 포함 여부   | 비고                                                                         |
| ------------- | ------- | -------------------------------------------------------------------------- |
| 관리자 로그인       | 포함      | MVP 인증                                                                     |
| 시설정보 JSON 업로드 | 포함      | `basic`, `equipment`, `inspection`, `education`, `insurance`, `manager` 반영 |
| 시설 목록 및 검색    | 포함      | 시설번호, 시설명, 주소, 설치장소 기준                                                     |
| 시설 상세         | 포함      | 기본정보, 기구, 검사, 교육, 보험, 관리주체                                                 |
| 기구별 안전점검 입력   | 포함      | 기본값 전체 양호                                                                  |
| 점검 결과 상태 선택   | 포함      | 양호, 요주의, 요수리, 이용금지                                                         |
| 비양호 점검내용 입력   | 포함      | 필수 검증                                                                      |
| 온라인 서명        | 포함      | 안전관리자, 위탁점검자                                                               |
| 안전점검실시대장 미리보기 | 포함      | 대장 이미지 구조 반영                                                               |
| 점검 이력 조회      | 포함      | 시설별, 월별                                                                    |
| 인쇄 출력         | 포함      | 브라우저 인쇄 우선                                                                 |
| PDF 생성        | 1.5차 권장 | MVP 이후 안정화 가능                                                              |


### 5.2 제외 범위


| 기능               | 제외 사유               |
| ---------------- | ------------------- |
| AI 보고서 자동 작성     | MVP 이후 고도화 기능       |
| 사진 첨부 기반 위해요인 관리 | 2차 기능               |
| 수리이력 관리          | 2차 기능               |
| 조치 이행 관리         | 2차 기능               |
| 통계 대시보드          | 2차 기능               |
| 모바일 네이티브 앱       | 반응형 웹으로 우선 대응       |
| 공공 API 실시간 연동    | 초기에는 JSON 업로드 방식 사용 |


---

## 6. 기준 데이터 구조

### 6.1 시설정보 JSON 구조

첨부 JSON 기준으로 한 시설 데이터는 다음 구조를 가진다.

```json
{
  "basic": {},
  "equipment": [],
  "inspection": {},
  "education": {},
  "insurance": {},
  "manager": {}
}
```

### 6.2 JSON 섹션별 저장 정책


| JSON 섹션      | 저장 테이블                       | 설명             |
| ------------ | ---------------------------- | -------------- |
| `basic`      | `facilities`                 | 시설 기본정보        |
| `equipment`  | `equipment`                  | 놀이기구 정보        |
| `inspection` | `facility_legal_inspections` | 설치검사·정기시설검사 정보 |
| `education`  | `safety_educations`          | 안전교육 정보        |
| `insurance`  | `liability_insurances`       | 배상책임보험 정보      |
| `manager`    | `facility_managers`          | 관리주체·관리담당자 정보  |


---

## 7. 핵심 데이터 매핑

### 7.1 시설 기본정보 매핑


| 표시명      | JSON 원천 필드                            | 내부 필드                   | 필수  |
| -------- | ------------------------------------- | ----------------------- | --- |
| 시설번호     | `basic.pfctSn`                        | `facility_no`           | Y   |
| 시설명      | `basic.pfctNm`                        | `facility_name`         | Y   |
| 우편번호     | `basic.zip`                           | `zip_code`              | N   |
| 지번주소     | `basic.lotnoAddr`, `basic.lotnoDaddr` | `lot_address`           | N   |
| 도로명주소    | `basic.ronaAddr`, `basic.ronaDaddr`   | `road_address`          | N   |
| 설치일자     | `basic.instlYmd`                      | `installed_date`        | N   |
| 폐쇄일자     | `basic.clsgYmd`                       | `closed_date`           | N   |
| 인수일자     | `basic.acptnYmd`                      | `accepted_date`         | N   |
| 면적       | `basic.fcar`                          | `facility_area`         | N   |
| 설치장소 코드  | `basic.instlPlaceCd`                  | `install_place_code`    | N   |
| 설치장소명    | `basic.instlPlaceCdNm`                | `install_place_name`    | N   |
| 의무 여부 코드 | `basic.dutyCd`                        | `duty_code`             | N   |
| 의무 여부명   | `basic.dutyCdNm`                      | `duty_type_name`        | N   |
| 공공/민간 코드 | `basic.prvtPblcYnCd`                  | `public_private_code`   | N   |
| 공공/민간명   | `basic.prvtPblcYnCdNm`                | `public_private_name`   | N   |
| 운영 여부 코드 | `basic.operYnCd`                      | `operation_status_code` | N   |
| 운영 여부명   | `basic.operYnCdNm`                    | `operation_status_name` | N   |
| 실내외 코드   | `basic.idrodrCd`                      | `indoor_outdoor_code`   | N   |
| 실내외명     | `basic.idrodrCdNm`                    | `indoor_outdoor_name`   | N   |
| 지역 코드    | `basic.rgnCd`                         | `region_code`           | N   |
| 지역명      | `basic.rgnCdNm`                       | `region_name`           | N   |
| 위도       | `basic.latCrtsVl`                     | `latitude`              | N   |
| 경도       | `basic.lotCrtsVl`                     | `longitude`             | N   |


### 7.2 놀이기구 정보 매핑


| 표시명     | JSON 원천 필드                   | 내부 필드                      | 필수  |
| ------- | ---------------------------- | -------------------------- | --- |
| 기구번호    | `equipment[].rideSn`         | `equipment_no`             | Y   |
| 시설번호    | `equipment[].pfctSn`         | `facility_no`              | Y   |
| 시설명     | `equipment[].pfctNm`         | `facility_name`            | N   |
| 기구명     | `equipment[].rideNm`         | `equipment_name`           | Y   |
| 기구관리번호  | `equipment[].rideNo`         | `equipment_manage_no`      | N   |
| 설치위치    | `equipment[].rideLctn`       | `equipment_location`       | N   |
| 설치일자    | `equipment[].rideInstlYmd`   | `equipment_installed_date` | N   |
| 설치업체    | `equipment[].instlFrmNm`     | `installer_name`           | N   |
| 제조업체    | `equipment[].mnftrFrmNm`     | `manufacturer_name`        | N   |
| 인증번호    | `equipment[].certNo`         | `certification_no`         | N   |
| 기구형태 코드 | `equipment[].rideStylCd`     | `equipment_type_code`      | N   |
| 기구형태명   | `equipment[].rideStylCdNm`   | `equipment_type_name`      | N   |
| 세부형태 코드 | `equipment[].rideStylSbCd`   | `equipment_subtype_code`   | N   |
| 세부형태명   | `equipment[].rideStylSbCdNm` | `equipment_subtype_name`   | N   |


### 7.3 검사정보 매핑


| 표시명     | JSON 원천 필드               | 내부 필드                  |
| ------- | ------------------------ | ---------------------- |
| 시설번호    | `inspection.pfctSn`      | `facility_no`          |
| 검사종류 코드 | `inspection.inspKndCd`   | `inspection_type_code` |
| 검사종류명   | `inspection.inspKndCdNm` | `inspection_type_name` |
| 설치일자    | `inspection.instlYmd`    | `installed_date`       |
| 유효기간    | `inspection.vldYmd`      | `valid_until`          |
| 합격 여부   | `inspection.passYn`      | `pass_yn`              |
| 검사일     | `inspection.inspYmd`     | `inspection_date`      |
| 판정일     | `inspection.jgmtYmd`     | `judgment_date`        |
| 검사번호    | `inspection.inspNo`      | `inspection_no`        |
| 검사담당자   | `inspection.inspPic`     | `inspection_pic`       |


### 7.4 안전교육 정보 매핑


| 표시명    | JSON 원천 필드            | 내부 필드                 |
| ------ | --------------------- | --------------------- |
| 안전교육번호 | `education.sftyEduSn` | `safety_education_no` |
| 시설번호   | `education.pfctSn`    | `facility_no`         |
| 교육증 번호 | `education.cfacNo`    | `certificate_no`      |
| 교육일자   | `education.eduYmd`    | `education_date`      |
| 유효기간   | `education.vldYmd`    | `valid_until`         |
| 교육기관   | `education.instNm`    | `institution_name`    |


### 7.5 보험 정보 매핑


| 표시명    | JSON 원천 필드               | 내부 필드                    |
| ------ | ------------------------ | ------------------------ |
| 보험관리번호 | `insurance.insrncMngSn`  | `insurance_manage_no`    |
| 시설번호   | `insurance.pfctSn`       | `facility_no`            |
| 보험상품명  | `insurance.insrncGdsNm`  | `insurance_product_name` |
| 가입일    | `insurance.joinYmd`      | `join_date`              |
| 만기일    | `insurance.mtryYmd`      | `maturity_date`          |
| 보험증권번호 | `insurance.insrncEvdoNo` | `insurance_policy_no`    |
| 보험사    | `insurance.insu`         | `insurer`                |
| 보장내용   | `insurance.insrncCn`     | `insurance_content`      |


### 7.6 관리주체/담당자 정보 매핑


| 표시명       | JSON 원천 필드                              | 내부 필드                          |
| --------- | --------------------------------------- | ------------------------------ |
| 관리담당 번호   | `manager.mngMabdPicSn`                  | `manager_no`                   |
| 시설번호      | `manager.pfctSn`                        | `facility_no`                  |
| 사업자번호     | `manager.bzmnNo`                        | `business_no`                  |
| 기관명       | `manager.conm`                          | `company_name`                 |
| 대표자명      | `manager.rprsvFlnm`                     | `representative_name`          |
| 전화번호      | `manager.telno`                         | `tel_no`                       |
| 팩스번호      | `manager.fxno`                          | `fax_no`                       |
| 이메일       | `manager.eml`                           | `email`                        |
| 주소        | `manager.ronaAddr`, `manager.ronaDaddr` | `road_address`                 |
| 시설대표구분 코드 | `manager.fctyReperSeCd`                 | `facility_representative_code` |
| 시설대표구분명   | `manager.fctyReperSeCdNm`               | `facility_representative_name` |
| 관리주체구분 코드 | `manager.mngMabdSeCd`                   | `manager_type_code`            |
| 관리주체구분명   | `manager.mngMabdSeCdNm`                 | `manager_type_name`            |


---

## 8. 핵심 비즈니스 규칙

### 8.1 시설번호 기준 규칙

```text
- 모든 시설 데이터의 기준키는 basic.pfctSn이다.
- 사용자 화면에는 “시설번호”로 표시한다.
- 개발 내부에서는 facility_no로 매핑한다.
- facility_no는 unique로 관리한다.
```

### 8.2 기구 고유값 규칙

```text
- 모든 기구 데이터의 기준키는 equipment[].rideSn이다.
- 동일 시설 내 동일 기구명이 여러 개 존재할 수 있다.
- 점검 데이터는 반드시 rideNm이 아니라 rideSn 기준으로 저장한다.
- 화면에는 기구명 + 기구형태 + 설치일자 + 인증번호를 함께 표시하여 구분성을 높인다.
```

### 8.3 기구정보 동기화 규칙

```text
- JSON 업로드 시 equipment 배열의 rideSn을 기준으로 upsert한다.
- 기존 DB에는 있으나 최신 JSON에 없는 rideSn은 즉시 삭제하지 않는다.
- 최신 JSON에 없는 기구는 is_active = false로 비활성 처리한다.
- 과거 점검 이력과 연결된 기구 데이터는 물리 삭제하지 않는다.
```

### 8.4 충격흡수용표면재 처리 규칙

```text
- 충격흡수용표면재(모래), 충격흡수용표면재(기타바닥재)도 점검 대상에 포함한다.
- 화면에서 별도 필터를 제공할 수 있으나 기본 점검 대상에서 제외하지 않는다.
```

### 8.5 월간 점검 중복 방지 규칙

```text
- 동일 시설번호 + 동일 점검월에는 하나의 점검완료 데이터만 생성한다.
- 작성중 데이터는 수정 가능하다.
- 점검완료 후 수정은 관리자 권한으로만 가능하게 한다.
- 점검완료 후 수정 시 수정 이력을 남긴다.
```

### 8.6 점검완료 스냅샷 규칙

점검완료 시점에는 다음 데이터를 스냅샷으로 저장한다.

```text
- 시설번호
- 시설명
- 주소
- 기구번호
- 기구명
- 기구유형
- 점검일
- 점검월
- 점검결과
- 점검내용
- 안전관리자명
- 위탁점검자명
- 안전관리자 서명 이미지
- 위탁점검자 서명 이미지
```

이유는 JSON 재업로드로 시설정보 또는 기구정보가 변경되어도 과거 안전점검 대장이 당시 내용으로 재출력되어야 하기 때문이다.

---

## 9. 점검 상태값 정의


| 내부 코드      | 화면 표시 | 설명          | 점검내용 필수 |
| ---------- | ----- | ----------- | ------- |
| `GOOD`     | 양호    | 이상 없음       | N       |
| `CAUTION`  | 요주의   | 관찰 또는 주의 필요 | Y       |
| `REPAIR`   | 요수리   | 수리 필요       | Y       |
| `STOP_USE` | 이용금지  | 사용 제한 필요    | Y       |


### 9.1 기본값

점검 화면 진입 시 모든 기구의 점검결과는 기본값 `GOOD`으로 설정한다.

```text
초기 상태:
모든 equipment.result_status = GOOD
```

### 9.2 비양호(요주의, 요수리, 이용금지) 입력 검증

```text
if result_status != GOOD and note is empty:
    저장 불가
    점검완료 불가
```

---

## 10. 주요 사용자 흐름

### 10.1 관리자 시설정보 업로드 흐름

```text
관리자 로그인
→ 시설정보 관리
→ JSON 파일 업로드
→ JSON 구조 검증
→ basic.pfctSn 기준 시설 upsert
→ equipment[].rideSn 기준 기구 upsert
→ inspection / education / insurance / manager 정보 저장
→ 업로드 결과 확인
```

### 10.2 월간 안전점검 입력 흐름

```text
사용자 로그인
→ 월간 안전점검
→ 시설번호 또는 시설명 검색
→ 시설 선택
→ active 기구 목록 자동 표시
→ 전체 기본값 “양호” 확인
→ 이상 기구만 요주의/요수리/이용금지로 변경
→ 비양호 항목 점검내용 입력
→ 안전관리자 서명 입력
→ 위탁점검자 서명 입력
→ 안전점검실시대장 미리보기
→ 점검완료
```

### 10.3 대장 출력 흐름

```text
점검이력 조회
→ 시설 선택
→ 점검월 선택
→ 안전점검실시대장 미리보기
→ 브라우저 인쇄 또는 PDF 생성
```

---

## 11. 기능 요구사항

## 11.1 F-001. 관리자 로그인

### 설명

관리자는 시설정보 업로드, 사용자 관리, 점검 이력 관리 기능에 접근하기 위해 로그인해야 한다.

### 요구사항


| ID       | 요구사항                                                     |
| -------- | -------------------------------------------------------- |
| F-001-01 | 이메일/비밀번호 기반 로그인을 제공한다.                                   |
| F-001-02 | 로그인하지 않은 사용자는 관리자 화면에 접근할 수 없다.                          |
| F-001-03 | 사용자 권한은 `ADMIN`, `MANAGER`, `INSPECTOR`, `VIEWER`로 구분한다. |


---

## 11.2 F-002. 시설정보 JSON 업로드

### 설명

관리자는 JSON 파일을 업로드하여 시설정보와 기구정보를 등록 또는 업데이트한다.

### 요구사항


| ID       | 요구사항                                          |
| -------- | --------------------------------------------- |
| F-002-01 | 관리자 페이지에서 `.json` 파일을 업로드할 수 있다.              |
| F-002-02 | 업로드된 JSON은 배열 형태 또는 단일 객체 형태를 모두 지원한다.        |
| F-002-03 | `basic.pfctSn`이 없으면 해당 시설 데이터는 실패 처리한다.       |
| F-002-04 | `basic.pfctSn`이 DB에 없으면 신규 시설로 등록한다.          |
| F-002-05 | `basic.pfctSn`이 DB에 있으면 기존 시설정보를 업데이트한다.      |
| F-002-06 | `equipment[].rideSn` 기준으로 기구정보를 등록 또는 업데이트한다. |
| F-002-07 | 업로드 결과로 전체 건수, 성공 건수, 실패 건수, 실패 사유를 표시한다.     |
| F-002-08 | 실패 항목은 CSV 또는 JSON으로 다운로드할 수 있다.              |
| F-002-09 | 원본 JSON은 `raw_json`에 저장한다.                    |


### 업로드 결과 표시 예시


| 항목        | 수량    |
| --------- | ----- |
| 전체 요청     | 64    |
| 성공        | 60    |
| 실패        | 4     |
| 신규 시설     | 자동 계산 |
| 업데이트 시설   | 자동 계산 |
| 신규 기구     | 자동 계산 |
| 업데이트 기구   | 자동 계산 |
| 비활성 처리 기구 | 자동 계산 |


---

## 11.3 F-003. 시설 목록 및 검색

### 설명

사용자는 등록된 시설을 검색하고 상세정보를 확인할 수 있다.

### 검색 조건


| 검색 필드 | 기준                      |
| ----- | ----------------------- |
| 시설번호  | `facility_no`           |
| 시설명   | `facility_name`         |
| 도로명주소 | `road_address`          |
| 지번주소  | `lot_address`           |
| 설치장소  | `install_place_name`    |
| 실내외   | `indoor_outdoor_name`   |
| 운영 여부 | `operation_status_name` |


### 목록 표시 항목


| 항목     |
| ------ |
| 시설번호   |
| 시설명    |
| 주소     |
| 설치장소   |
| 의무/비의무 |
| 공공/민간  |
| 운영 여부  |
| 실내/실외  |
| 기구 수   |
| 최근 점검월 |
| 점검 상태  |


---

## 11.4 F-004. 시설 상세

### 설명

시설 상세 화면은 탭 구조로 구성한다.

### 탭 구조

```text
시설 상세
├─ 기본정보
├─ 놀이기구
├─ 정기시설검사
├─ 안전교육
├─ 보험가입
├─ 관리주체/담당자
└─ 월간점검 이력
```

### 기본정보 탭


| 표시 항목  |
| ------ |
| 시설번호   |
| 시설명    |
| 우편번호   |
| 주소     |
| 설치일자   |
| 설치장소   |
| 의무/비의무 |
| 공공/민간  |
| 운영 여부  |
| 실내/실외  |
| 면적     |
| 위도/경도  |


### 놀이기구 탭


| 표시 항목 |
| ----- |
| 기구번호  |
| 기구명   |
| 기구형태  |
| 세부형태  |
| 설치위치  |
| 설치일자  |
| 설치업체  |
| 제조업체  |
| 인증번호  |
| 활성 상태 |


### 정기시설검사 탭


| 표시 항목 |
| ----- |
| 검사종류  |
| 검사일   |
| 판정일   |
| 유효기간  |
| 합격 여부 |
| 검사번호  |
| 검사담당자 |


### 안전교육 탭


| 표시 항목  |
| ------ |
| 교육번호   |
| 교육일    |
| 유효기간   |
| 교육기관   |
| 교육증 번호 |


### 보험가입 탭


| 표시 항목  |
| ------ |
| 보험상품명  |
| 가입일    |
| 만기일    |
| 보험증권번호 |
| 보험사    |
| 보장내용   |


### 관리주체/담당자 탭


| 표시 항목  |
| ------ |
| 관리구분   |
| 관리주체명  |
| 대표자명   |
| 사업자번호  |
| 전화번호   |
| 이메일    |
| 주소     |
| 담당 시작일 |
| 담당 종료일 |


---

## 11.5 F-005. 월간 안전점검 생성

### 설명

시설번호와 점검월 기준으로 월간 안전점검을 생성한다.

### 요구사항


| ID       | 요구사항                                            |
| -------- | ----------------------------------------------- |
| F-005-01 | 사용자는 시설을 선택하여 월간 점검을 시작할 수 있다.                  |
| F-005-02 | 점검월 기본값은 현재 월이다.                                |
| F-005-03 | 점검일 기본값은 현재 날짜이다.                               |
| F-005-04 | 동일 시설번호 + 동일 점검월의 작성중 점검이 있으면 기존 작성중 데이터를 불러온다. |
| F-005-05 | 동일 시설번호 + 동일 점검월의 점검완료 데이터가 있으면 중복 생성을 방지한다.    |
| F-005-06 | 점검 생성 시 active 상태의 기구 목록을 자동으로 불러온다.            |
| F-005-07 | 모든 기구의 점검결과는 기본값 `양호`로 생성한다.                    |


---

## 11.6 F-006. 기구별 안전점검 입력

### 설명

시설에 연결된 기구 목록을 기준으로 기구별 점검 결과를 입력한다.

### 기구별 점검 테이블


| 열    | 내용                       |
| ---- | ------------------------ |
| 번호   | 자동 순번                    |
| 기구명  | `equipment_name`         |
| 기구유형 | `equipment_type_name`    |
| 세부유형 | `equipment_subtype_name` |
| 설치위치 | `equipment_location`     |
| 인증번호 | `certification_no`       |
| 점검결과 | 양호/요주의/요수리/이용금지          |
| 점검내용 | 비양호 시 필수 입력              |


### 요구사항


| ID       | 요구사항                                           |
| -------- | ---------------------------------------------- |
| F-006-01 | 기구 목록은 `rideSn` 기준으로 불러온다.                     |
| F-006-02 | 동일한 기구명이 여러 개일 경우 기구번호, 설치일자, 인증번호를 함께 표시한다.   |
| F-006-03 | 점검결과는 4개 상태 중 하나만 선택할 수 있다.                    |
| F-006-04 | 전체 양호 버튼을 제공한다.                                |
| F-006-05 | 비양호 상태 선택 시 점검내용 입력창을 표시한다.                    |
| F-006-06 | 비양호 상태의 점검내용이 비어 있으면 임시저장은 가능하되 점검완료는 불가하게 한다. |
| F-006-07 | 점검내용은 한글 입력이 가능해야 한다.                          |
| F-006-08 | 충격흡수용표면재도 점검 대상에 포함한다.                         |


---

## 11.7 F-007. 온라인 서명

### 설명

점검 입력 하단에 안전관리자와 위탁점검자의 온라인 서명 입력폼을 제공한다.

### 요구사항


| ID       | 요구사항                                                  |
| -------- | ----------------------------------------------------- |
| F-007-01 | 안전관리자명 입력 필드를 제공한다.                                   |
| F-007-02 | 위탁점검자명 입력 필드를 제공한다.                                   |
| F-007-03 | 안전관리자 서명패드를 제공한다.                                     |
| F-007-04 | 위탁점검자 서명패드를 제공한다.                                     |
| F-007-05 | 서명은 마우스 또는 터치로 입력할 수 있어야 한다.                          |
| F-007-06 | 서명 초기화 버튼을 제공한다.                                      |
| F-007-07 | 서명 이미지는 PNG 파일로 저장한다.                                 |
| F-007-08 | 서명 파일은 Supabase Storage에 저장하고 DB에는 URL 또는 path를 저장한다. |
| F-007-09 | 안전관리자 서명은 점검완료 필수값으로 한다.                              |
| F-007-10 | 위탁점검자 서명은 서비스 정책에 따라 필수 또는 선택으로 설정 가능하게 한다.           |


---

## 11.8 F-008. 안전점검실시대장 미리보기

### 설명

기구별 점검 입력 결과를 안전점검실시대장 양식에 맞춰 점검일 기준 1행으로 변환하여 표시한다.

### 대장 열 구조

```text
점검일
점검 결과
  - 양호
  - 요주의
  - 요수리
  - 이용금지
특이사항
안전관리자(인)
위탁점검자(인)
```

### 렌더링 규칙


| 입력 상태      | 대장 표시 위치      |
| ---------- | ------------- |
| `GOOD`     | 양호 칸          |
| `CAUTION`  | 요주의 칸         |
| `REPAIR`   | 요수리 칸         |
| `STOP_USE` | 이용금지 칸        |
| 비양호 note   | 특이사항 칸에 번호 목록 |
| 안전관리자 서명   | 안전관리자(인) 칸    |
| 위탁점검자 서명   | 위탁점검자(인) 칸    |


### 예시


| 점검일      | 양호              | 요주의  | 요수리 | 이용금지 | 특이사항                                        |
| -------- | --------------- | ---- | --- | ---- | ------------------------------------------- |
| 26.04.01 | 조합놀이대, 충격흡수용표면재 | 미끄럼틀 | 그네  |      | 1. 미끄럼틀: 활강면 오염 및 일부 긁힘 2. 그네: 체인 연결부 마모 확인 |


### 날짜 표시 규칙


| 저장값          | 출력값        |
| ------------ | ---------- |
| `2026-03-03` | `26.03.03` |
| `2026-04-01` | `26.04.01` |


DB에는 `YYYY-MM-DD`로 저장하고, 대장 미리보기와 출력 시에만 `YY.MM.DD`로 변환한다.

---

## 11.9 F-009. 점검완료 처리

### 설명

사용자는 입력값 검증을 통과한 점검을 완료 처리할 수 있다.

### 점검완료 조건

```text
1. 시설정보가 존재해야 한다.
2. 점검월이 입력되어야 한다.
3. 점검일이 입력되어야 한다.
4. 기구별 점검결과가 모두 존재해야 한다.
5. 비양호 항목의 점검내용이 모두 입력되어야 한다.
6. 안전관리자명이 입력되어야 한다.
7. 안전관리자 서명이 존재해야 한다.
8. 위탁점검자 서명이 필수 정책인 경우 위탁점검자 서명이 존재해야 한다.
```

### 완료 시 처리


| 처리 항목   | 설명                            |
| ------- | ----------------------------- |
| 상태 변경   | `draft` → `completed`         |
| 완료일 저장  | `completed_at` 저장             |
| 스냅샷 생성  | 시설·기구·점검·서명 정보 스냅샷 저장         |
| 대장 행 생성 | `inspection_ledger_rows` 생성   |
| 중복 방지   | 동일 시설번호 + 점검월 완료 데이터 추가 생성 방지 |


---

## 11.10 F-010. 점검이력 조회

### 설명

시설별·월별 점검 이력을 조회한다.

### 검색 조건


| 조건    |
| ----- |
| 시설번호  |
| 시설명   |
| 점검월   |
| 점검일   |
| 점검 상태 |
| 안전관리자 |
| 위탁점검자 |


### 목록 표시 항목


| 항목      |
| ------- |
| 시설번호    |
| 시설명     |
| 점검월     |
| 점검일     |
| 점검 상태   |
| 양호 건수   |
| 요주의 건수  |
| 요수리 건수  |
| 이용금지 건수 |
| 안전관리자   |
| 위탁점검자   |
| 완료일     |


---

## 11.11 F-011. 인쇄 및 PDF 출력

### 설명

점검완료된 안전점검실시대장을 인쇄 또는 PDF로 저장할 수 있게 한다.

### MVP 정책


| 항목     | 정책                     |
| ------ | ---------------------- |
| 1차     | 브라우저 인쇄 기능 우선          |
| 1.5차   | 서버 또는 클라이언트 기반 PDF 생성  |
| 용지     | A4 세로                  |
| 출력 양식  | 안전점검실시대장 표 형태          |
| 서명     | 서명 이미지를 대장 칸에 표시       |
| 페이지 처리 | 행 수 초과 시 다음 페이지로 자동 분리 |


---

## 12. 화면 구조

### 12.1 메뉴 구조

```text
대시보드
시설관리
  - 시설 목록
  - 시설정보 JSON 업로드
  - 시설 상세
월간 안전점검
  - 점검 대상 시설 선택
  - 기구별 점검 입력
  - 안전점검실시대장 미리보기
점검이력
  - 시설별 점검이력
  - 월별 점검이력
  - 안전점검실시대장 출력
설정
  - 사용자 관리
  - 서명 정책 설정
  - 출력 서식 설정
```

### 12.2 JSON 업로드 화면


| 영역     | 구성 요소                     |
| ------ | ------------------------- |
| 상단     | 업로드 안내, JSON 구조 설명        |
| 업로드 영역 | 파일 선택, 드래그 앤 드롭           |
| 옵션     | 기존 데이터 업데이트, 누락 기구 비활성 처리 |
| 실행     | 업로드 버튼                    |
| 결과     | 전체/성공/실패/신규/업데이트/비활성 건수   |
| 오류     | 실패 목록, 오류 다운로드            |


### 12.3 시설 목록 화면


| 영역  | 구성 요소                      |
| --- | -------------------------- |
| 검색  | 시설번호, 시설명, 주소, 설치장소, 운영 여부 |
| 목록  | 시설 테이블                     |
| 액션  | 상세보기, 점검 시작, 이력보기          |


### 12.4 월간 점검 입력 화면

```text
상단:
- 시설번호
- 시설명
- 주소
- 설치장소
- 실내/실외
- 점검월
- 점검일

본문:
- 기구별 점검 테이블

하단:
- 안전관리자명
- 안전관리자 서명
- 위탁점검자명
- 위탁점검자 서명
- 임시저장
- 대장 미리보기
- 점검완료
```

### 12.5 안전점검실시대장 미리보기 화면


| 영역  | 구성 요소                             |
| --- | --------------------------------- |
| 상단  | 안전점검실시대장 제목                       |
| 테이블 | 점검일, 양호, 요주의, 요수리, 이용금지, 특이사항, 서명 |
| 액션  | 이전, 임시저장, 점검완료, 인쇄, PDF           |


---

## 13. 데이터베이스 설계 초안

> 실제 구현 시 Supabase PostgreSQL 기준으로 작성한다.

### 13.1 `facilities`

```sql
create table facilities (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null unique,
  facility_name text not null,
  zip_code text,
  lot_address text,
  road_address text,
  installed_date date,
  accepted_date date,
  closed_date date,
  facility_area numeric,
  install_place_code text,
  install_place_name text,
  duty_code text,
  duty_type_name text,
  public_private_code text,
  public_private_name text,
  operation_status_code text,
  operation_status_name text,
  indoor_outdoor_code text,
  indoor_outdoor_name text,
  region_code text,
  region_name text,
  latitude numeric,
  longitude numeric,
  raw_json jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.2 `equipment`

```sql
create table equipment (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  equipment_no text not null,
  facility_name text,
  equipment_name text not null,
  equipment_manage_no text,
  equipment_location text,
  equipment_installed_date date,
  installer_name text,
  manufacturer_name text,
  certification_no text,
  equipment_type_code text,
  equipment_type_name text,
  equipment_subtype_code text,
  equipment_subtype_name text,
  raw_json jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (facility_no, equipment_no)
);
```

### 13.3 `facility_legal_inspections`

```sql
create table facility_legal_inspections (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  inspection_type_code text,
  inspection_type_name text,
  installed_date date,
  valid_until date,
  pass_yn text,
  inspection_date date,
  judgment_date date,
  inspection_no text,
  inspection_pic text,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.4 `safety_educations`

```sql
create table safety_educations (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  safety_education_no text,
  certificate_no text,
  education_date date,
  valid_until date,
  institution_name text,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.5 `liability_insurances`

```sql
create table liability_insurances (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  insurance_manage_no text,
  insurance_product_name text,
  join_date date,
  maturity_date date,
  insurance_policy_no text,
  insurer text,
  insurance_content text,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.6 `facility_managers`

```sql
create table facility_managers (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  manager_no text,
  business_no text,
  company_name text,
  representative_name text,
  tel_no text,
  fax_no text,
  email text,
  road_address text,
  facility_representative_code text,
  facility_representative_name text,
  manager_type_code text,
  manager_type_name text,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.7 `monthly_inspections`

```sql
create table monthly_inspections (
  id uuid primary key default gen_random_uuid(),
  facility_no text not null references facilities(facility_no),
  inspection_month text not null,
  inspection_date date not null,
  status text not null default 'draft',
  safety_manager_name text,
  consigned_inspector_name text,
  safety_manager_signature_url text,
  consigned_inspector_signature_url text,
  special_note_summary text,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (facility_no, inspection_month)
);
```

### 13.8 `monthly_inspection_items`

```sql
create table monthly_inspection_items (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references monthly_inspections(id) on delete cascade,
  facility_no text not null,
  equipment_no text not null,
  equipment_name text not null,
  equipment_type_name text,
  equipment_subtype_name text,
  result_status text not null check (
    result_status in ('GOOD', 'CAUTION', 'REPAIR', 'STOP_USE')
  ),
  note text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 13.9 `inspection_ledger_rows`

```sql
create table inspection_ledger_rows (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references monthly_inspections(id) on delete cascade,
  facility_no text not null,
  facility_name_snapshot text,
  road_address_snapshot text,
  inspection_date date not null,
  good_items text,
  caution_items text,
  repair_items text,
  stop_use_items text,
  special_notes text,
  safety_manager_name_snapshot text,
  consigned_inspector_name_snapshot text,
  safety_manager_signature_url text,
  consigned_inspector_signature_url text,
  rendered_at timestamptz default now()
);
```

---

## 14. 상태 정의

### 14.1 월간 점검 상태


| 상태 코드            | 화면 표시 | 설명                  |
| ---------------- | ----- | ------------------- |
| `not_started`    | 미점검   | 해당 월 점검 데이터 없음      |
| `draft`          | 작성중   | 점검 작성 중             |
| `completed`      | 점검완료  | 필수값과 서명 완료          |
| `needs_revision` | 수정필요  | 관리자 또는 안전관리자가 보완 요청 |
| `locked`         | 잠금    | 완료 후 수정 제한 상태       |


### 14.2 기구 활성 상태


| 상태                  | 설명                             |
| ------------------- | ------------------------------ |
| `is_active = true`  | 현재 점검 대상                       |
| `is_active = false` | 최신 JSON에서 제외되었거나 철거·비활성 처리된 기구 |


---

## 15. 유효성 검증

### 15.1 JSON 업로드 검증


| 검증 항목 | 실패 조건                   |
| ----- | ----------------------- |
| 파일 형식 | JSON이 아님                |
| 시설번호  | `basic.pfctSn` 없음       |
| 시설명   | `basic.pfctNm` 없음       |
| 기구번호  | `equipment[].rideSn` 없음 |
| 기구명   | `equipment[].rideNm` 없음 |
| 날짜 형식 | `YYYYMMDD`가 아닌 값        |
| 배열 구조 | `equipment`가 배열이 아님     |


### 15.2 점검완료 검증


| 검증 항목  | 실패 조건                  |
| ------ | ---------------------- |
| 점검일    | 미입력                    |
| 점검월    | 미입력                    |
| 점검항목   | 기구별 점검 결과 누락           |
| 비양호 내용 | 요주의/요수리/이용금지인데 점검내용 없음 |
| 안전관리자  | 이름 또는 서명 없음            |
| 위탁점검자  | 필수 정책인데 이름 또는 서명 없음    |


---

## 16. 권한 정책


| 기능          | ADMIN | MANAGER | INSPECTOR | VIEWER |
| ----------- | ----- | ------- | --------- | ------ |
| 시설 JSON 업로드 | Y     | N       | N         | N      |
| 시설 목록 조회    | Y     | Y       | Y         | Y      |
| 시설 상세 조회    | Y     | Y       | Y         | Y      |
| 월간 점검 생성    | Y     | Y       | Y         | N      |
| 점검 입력       | Y     | Y       | Y         | N      |
| 안전관리자 서명    | Y     | Y       | Y         | N      |
| 위탁점검자 서명    | Y     | Y       | Y         | N      |
| 점검완료        | Y     | Y       | Y         | N      |
| 완료 점검 수정    | Y     | 제한      | N         | N      |
| 점검이력 조회     | Y     | Y       | Y         | Y      |
| 대장 출력       | Y     | Y       | Y         | Y      |
| 사용자 관리      | Y     | N       | N         | N      |


---

## 17. 비기능 요구사항

### 17.1 성능


| 항목         | 기준                    |
| ---------- | --------------------- |
| 시설 목록 조회   | 3초 이내                 |
| 시설 상세 조회   | 3초 이내                 |
| 점검 입력 저장   | 2초 이내                 |
| 대장 미리보기 생성 | 3초 이내                 |
| JSON 업로드   | 1,000개 시설 기준 처리 가능 구조 |


### 17.2 보안


| 항목      | 요구사항                |
| ------- | ------------------- |
| 인증      | 로그인 기반 접근 제어        |
| 권한      | 역할별 기능 접근 제어        |
| 서명 파일   | 인증된 사용자만 접근 가능하게 저장 |
| 원본 JSON | 관리자만 접근 가능          |
| DB      | 시설번호, 점검월 기준 인덱스 적용 |
| 감사 로그   | 점검완료, 수정, 삭제 행위 기록  |


### 17.3 데이터 보존


| 항목      | 요구사항            |
| ------- | --------------- |
| 완료 점검   | 삭제하지 않고 보존      |
| 과거 대장   | 스냅샷 기반 재출력      |
| 기구정보    | 과거 점검 연결 데이터 보존 |
| 원본 JSON | 업로드 이력별 보존 권장   |


### 17.4 반응형


| 화면   | 대응            |
| ---- | ------------- |
| 데스크톱 | 기본 최적화        |
| 태블릿  | 점검 입력 가능      |
| 모바일  | 조회 및 간단 점검 가능 |
| 서명패드 | 터치 지원 필수      |


---

## 18. 기술 스택 권장안


| 영역      | 권장 스택                                      |
| ------- | ------------------------------------------ |
| 프론트엔드   | Next.js, React, TypeScript                 |
| 스타일     | Tailwind CSS                               |
| UI 컴포넌트 | shadcn/ui                                  |
| 백엔드     | Supabase                                   |
| DB      | PostgreSQL                                 |
| 인증      | Supabase Auth                              |
| 파일 저장   | Supabase Storage                           |
| 서명패드    | react-signature-canvas 또는 canvas 기반 커스텀    |
| PDF     | 브라우저 인쇄 우선, 이후 React PDF 또는 Playwright PDF |
| 배포      | Vercel                                     |
| 개발 도구   | Cursor                                     |


---

## 19. 인수 기준

### 19.1 관리자 기능

```text
Given 관리자가 로그인한 상태에서
When 시설정보 JSON 파일을 업로드하면
Then 시스템은 pfctSn 기준으로 시설정보를 등록 또는 업데이트하고
And rideSn 기준으로 기구정보를 등록 또는 업데이트해야 한다.
```

### 19.2 점검 입력 기능

```text
Given 사용자가 특정 시설을 선택한 상태에서
When 월간 점검을 시작하면
Then 해당 시설의 active 기구 목록이 표시되고
And 모든 기구의 점검결과는 기본값 양호여야 한다.
```

### 19.3 비양호 검증

```text
Given 사용자가 특정 기구를 요주의, 요수리, 이용금지 중 하나로 선택한 상태에서
When 점검내용을 입력하지 않고 점검완료를 시도하면
Then 시스템은 점검완료를 막고 점검내용 입력을 요구해야 한다.
```

### 19.4 대장 미리보기

```text
Given 사용자가 기구별 점검결과를 입력한 상태에서
When 안전점검실시대장 미리보기를 실행하면
Then 양호, 요주의, 요수리, 이용금지 상태별로 기구명이 분류되어 표시되어야 하고
And 비양호 항목의 점검내용은 특이사항 칸에 번호 목록으로 표시되어야 한다.
```

### 19.5 서명 반영

```text
Given 안전관리자와 위탁점검자가 온라인 서명을 입력한 상태에서
When 대장 미리보기를 실행하면
Then 각 서명 이미지는 안전관리자(인), 위탁점검자(인) 칸에 표시되어야 한다.
```

### 19.6 과거 대장 보존

```text
Given 2026년 4월 점검을 완료한 상태에서
When 이후 JSON 재업로드로 시설명 또는 기구명이 변경되어도
Then 2026년 4월 안전점검실시대장은 완료 당시 스냅샷 기준으로 재출력되어야 한다.
```

---

## 20. 미결정 사항


| 항목            | 결정 필요 내용            | 권장안                    |
| ------------- | ------------------- | ---------------------- |
| 위탁점검자 서명      | 필수 여부               | 설정값으로 관리               |
| PDF 생성 방식     | 브라우저 인쇄 또는 서버 PDF   | MVP는 브라우저 인쇄, 1.5차 PDF |
| 완료 후 수정       | 허용 여부               | 관리자만 허용, 수정이력 저장       |
| 사진 첨부         | MVP 포함 여부           | 2차 기능                  |
| 이용금지 후속 조치    | 알림/조치관리 연동 여부       | 2차 기능                  |
| 안전관리자 자동 불러오기 | manager 정보 사용 여부    | 가능하면 기본값으로 불러오기        |
| 대장 양식 확장      | 법정 서식 외 상세점검표 병행 여부 | 2차 기능                  |


---

## 21. Cursor 개발용 초기 프롬프트

```md
# 어린이놀이시설 월간 안전점검 관리 서비스 MVP 개발 지시

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase 기반으로 어린이놀이시설 월간 안전점검 관리 서비스를 개발한다.

## 핵심 개념
- 시설 고유값은 JSON의 basic.pfctSn이며, 화면에서는 “시설번호”로 표시한다.
- 기구 고유값은 equipment[].rideSn이다.
- 기구명 rideNm은 중복될 수 있으므로 점검 데이터는 반드시 rideSn 기준으로 저장한다.
- 관리자는 JSON 파일을 업로드하여 시설정보와 기구정보를 등록/업데이트한다.
- 점검자는 시설을 선택하고 해당 시설의 active 기구 목록을 불러와 기구별 안전점검을 실시한다.
- 점검 결과는 양호, 요주의, 요수리, 이용금지 중 하나이다.
- 내부 코드는 GOOD, CAUTION, REPAIR, STOP_USE를 사용한다.
- 점검 화면 진입 시 모든 기구의 기본 상태는 GOOD, 즉 양호이다.
- 요주의, 요수리, 이용금지를 선택하면 한글 점검내용을 입력해야 한다.
- 충격흡수용표면재도 점검 대상에 포함한다.
- 점검 입력 하단에는 안전관리자와 위탁점검자의 온라인 서명 입력폼을 제공한다.
- 입력 완료 후 안전점검실시대장 형태의 미리보기 화면을 제공한다.
- 점검주기는 매월 1회이며, 시설번호 + 점검월 기준으로 점검 이력을 관리한다.

## JSON 구조
각 시설 데이터는 다음 섹션으로 구성된다.
- basic: 시설 기본정보
- equipment: 놀이기구 목록
- inspection: 정기시설검사 정보
- education: 안전교육 정보
- insurance: 보험가입 정보
- manager: 관리주체 또는 관리담당자 정보

## 주요 화면
1. 대시보드
2. 시설 목록
3. 시설정보 JSON 업로드
4. 시설 상세
5. 월간 안전점검 시설 선택
6. 기구별 점검 입력
7. 온라인 서명
8. 안전점검실시대장 미리보기
9. 점검 이력 조회
10. 안전점검실시대장 출력

## 데이터 테이블
- facilities
- equipment
- facility_legal_inspections
- safety_educations
- liability_insurances
- facility_managers
- monthly_inspections
- monthly_inspection_items
- inspection_ledger_rows

## 안전점검실시대장 미리보기
대장은 기구별 입력을 점검일 기준 1행으로 요약하여 표시한다.

테이블 열:
- 점검일
- 점검 결과 > 양호
- 점검 결과 > 요주의
- 점검 결과 > 요수리
- 점검 결과 > 이용금지
- 특이사항
- 안전관리자(인)
- 위탁점검자(인)

렌더링 규칙:
- GOOD 항목의 기구명은 양호 칸에 표시한다.
- CAUTION 항목의 기구명은 요주의 칸에 표시한다.
- REPAIR 항목의 기구명은 요수리 칸에 표시한다.
- STOP_USE 항목의 기구명은 이용금지 칸에 표시한다.
- note가 있는 항목은 특이사항 칸에 번호 목록으로 표시한다.
- 안전관리자 서명 이미지는 안전관리자(인) 칸에 표시한다.
- 위탁점검자 서명 이미지는 위탁점검자(인) 칸에 표시한다.
- 저장 날짜는 YYYY-MM-DD로 관리하고, 출력 시 YY.MM.DD 형식으로 표시한다.

## 데이터 보존
점검완료 시점에는 시설명, 기구명, 기구유형, 점검결과, 점검내용, 서명 이미지, 점검일을 스냅샷으로 저장한다.
이후 JSON 재업로드로 시설정보나 기구정보가 변경되어도 과거 안전점검 대장은 당시 내용으로 재출력되어야 한다.
```

---

## 22. 최종 구현 순서

Cursor에서는 다음 순서로 개발한다.

```text
1. Next.js + TypeScript + Tailwind + shadcn/ui 프로젝트 생성
2. Supabase 연결
3. DB 스키마 생성
4. 인증 및 권한 구조 구현
5. JSON 업로드 파서 구현
6. 시설 목록/상세 구현
7. 월간 점검 생성 기능 구현
8. 기구별 점검 입력 UI 구현
9. 온라인 서명 컴포넌트 구현
10. 안전점검실시대장 미리보기 구현
11. 점검완료 및 스냅샷 저장 구현
12. 점검이력 조회 구현
13. 인쇄 출력 구현
14. PDF 생성 기능 고도화
```

---

## 23. 최종 정리

본 PRD의 핵심 설계 원칙은 다음 4가지이다.

```text
1. 시설의 기준키는 pfctSn이다.
2. 기구의 기준키는 rideSn이다.
3. 입력은 기구별로 받고, 출력은 점검일 기준 안전점검실시대장 1행으로 변환한다.
4. 완료된 점검은 스냅샷으로 보존하여 과거 대장의 재출력 안정성을 확보한다.
```

