-- 오산 지도점검: 시설별 점검일시
alter table osan.facilities
  add column if not exists inspected_at timestamptz;

comment on column osan.facilities.inspected_at is '점검 완료 시 선택한 점검일시 (한국 시간 기준 입력)';
