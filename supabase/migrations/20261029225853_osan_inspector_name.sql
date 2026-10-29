-- 오산 지도점검: 시설별 점검자 기록
alter table osan.facilities
  add column if not exists inspector_name text;

comment on column osan.facilities.inspector_name is '점검 완료 시 선택한 점검자 이름';
