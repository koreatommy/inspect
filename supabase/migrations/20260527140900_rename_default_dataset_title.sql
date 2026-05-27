-- 기본 데이터셋 표시명 변경: 기존 시설 데이터 → 한국놀이시설연구원(60)
update public.facility_datasets
set
  name = '한국놀이시설연구원(60)',
  description = coalesce(
    nullif(description, ''),
    '구조안 A 마이그레이션 기본 데이터셋 (Phase 2 백필)'
  ),
  updated_at = now()
where name = '기존 시설 데이터';
