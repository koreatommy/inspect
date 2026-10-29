-- 오산 현장사진에 기구유형·사진별 점검내용을 붙인다.

alter table osan.facility_photos
  add column if not exists equipment_type text,
  add column if not exists caption text;
