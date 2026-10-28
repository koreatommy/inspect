-- 오산시 지도점검 임시 페이지 전용 스키마 (격리: 제거 시 `drop schema osan cascade;` + 버킷 삭제로 완결)
-- 기존 public 스키마에 대한 의존성 없음.

create schema if not exists osan;

-- 시설 기본 정보 (엑셀 66개소)
create table if not exists osan.facilities (
  id uuid primary key default gen_random_uuid(),
  no integer,
  facility_code text unique,
  name text not null,
  place_type text,
  region text,
  indoor_outdoor text,
  representative text,
  phone text,
  email text,
  safety_manager text,
  inspection_status text,
  address text,
  lat double precision,
  lng double precision,
  visited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 시설당 사진 최대 5장 (Storage osan-photos 버킷 경로 참조)
create table if not exists osan.facility_photos (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references osan.facilities(id) on delete cascade,
  slot integer not null check (slot between 1 and 5),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (facility_id, slot)
);

-- 시설 메모 (다건, 타임스탬프)
create table if not exists osan.facility_notes (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references osan.facilities(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists facility_photos_facility_id_idx on osan.facility_photos (facility_id);
create index if not exists facility_notes_facility_id_idx on osan.facility_notes (facility_id);

-- RLS 활성화 (정책 없음 → service_role 서버 전용 접근, anon/authenticated 차단)
alter table osan.facilities enable row level security;
alter table osan.facility_photos enable row level security;
alter table osan.facility_notes enable row level security;

-- updated_at 자동 갱신
create or replace function osan.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_facilities_updated_at on osan.facilities;
create trigger trg_facilities_updated_at
  before update on osan.facilities
  for each row execute function osan.set_updated_at();

drop trigger if exists trg_notes_updated_at on osan.facility_notes;
create trigger trg_notes_updated_at
  before update on osan.facility_notes
  for each row execute function osan.set_updated_at();

-- Storage 전용 버킷 (공개 읽기, 쓰기는 서버 서명 URL로만)
insert into storage.buckets (id, name, public)
values ('osan-photos', 'osan-photos', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'osan_photos_public_read'
  ) then
    create policy osan_photos_public_read on storage.objects
      for select using (bucket_id = 'osan-photos');
  end if;
end $$;

-- service_role 권한 부여 (RLS 우회 + 스키마 접근)
grant usage on schema osan to service_role;
grant all privileges on all tables in schema osan to service_role;
grant all privileges on all sequences in schema osan to service_role;
alter default privileges in schema osan grant all on tables to service_role;
alter default privileges in schema osan grant all on sequences to service_role;

-- PostgREST에 osan 스키마 노출 (supabase-js .schema('osan') 사용을 위해 필요)
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, osan';
notify pgrst, 'reload config';
