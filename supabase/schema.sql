-- 모브숲 (mob-forest) 스키마
-- 적용 방법: Supabase 대시보드 > SQL Editor에 붙여넣고 실행
-- 사전 조건: Authentication > Sign In / Providers > Anonymous Sign-Ins 활성화

create extension if not exists pgcrypto with schema extensions;

-- 1. posts: 익명 글
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('sighting', 'chat', 'meme')),
  content text not null check (char_length(content) between 1 and 2000),
  image_url text,
  mob_nickname text not null,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  password_hash text,
  reaction_count integer not null default 0,
  dislike_count integer not null default 0,
  report_count integer not null default 0,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists posts_category_created_at_idx
  on public.posts (category, created_at desc);

alter table public.posts enable row level security;

create policy "누구나 게시된 글을 읽을 수 있음"
  on public.posts for select
  using (status = 'published');

create policy "로그인(익명 포함)한 사용자만 글을 쓸 수 있음"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "본인 글만 삭제 가능"
  on public.posts for delete
  using (auth.uid() = author_id);

-- 2. reactions: 공감 / 비추 (kind로 구분, 한 사람당 글 하나에 하나만)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null default 'like' check (kind in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (post_id, author_id)
);

alter table public.reactions enable row level security;

create policy "누구나 공감/비추 개수를 확인할 수 있음"
  on public.reactions for select
  using (true);

create policy "로그인(익명 포함)한 사용자만 공감/비추 가능"
  on public.reactions for insert
  with check (auth.uid() = author_id);

create policy "본인 반응만 변경 가능"
  on public.reactions for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "본인 반응만 취소 가능"
  on public.reactions for delete
  using (auth.uid() = author_id);

-- 3. reports: 신고 (최소 모더레이션 장치)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table public.reports enable row level security;

create policy "로그인(익명 포함)한 사용자만 신고 가능"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- 신고 목록은 운영자만 봐야 하므로 공개 select 정책을 만들지 않는다
-- (Supabase 대시보드에서 service role로만 조회)

-- 4. 카운터 트리거: reactions/reports 증감을 posts에 반영
-- kind별로 reaction_count(공감) / dislike_count(비추)를 나눠서 관리하고,
-- 공감 <-> 비추 전환(UPDATE)도 양쪽 카운터를 함께 보정한다.
create or replace function public.handle_reaction_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    if (new.kind = 'like') then
      update public.posts set reaction_count = reaction_count + 1 where id = new.post_id;
    else
      update public.posts set dislike_count = dislike_count + 1 where id = new.post_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    if (old.kind = 'like') then
      update public.posts set reaction_count = greatest(reaction_count - 1, 0) where id = old.post_id;
    else
      update public.posts set dislike_count = greatest(dislike_count - 1, 0) where id = old.post_id;
    end if;
    return old;
  elsif (tg_op = 'UPDATE' and new.kind <> old.kind) then
    if (new.kind = 'like') then
      update public.posts
        set reaction_count = reaction_count + 1,
            dislike_count = greatest(dislike_count - 1, 0)
        where id = new.post_id;
    else
      update public.posts
        set dislike_count = dislike_count + 1,
            reaction_count = greatest(reaction_count - 1, 0)
        where id = new.post_id;
    end if;
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_reaction_change on public.reactions;
create trigger on_reaction_change
  after insert or delete or update on public.reactions
  for each row execute function public.handle_reaction_change();

create or replace function public.handle_report_insert()
returns trigger as $$
begin
  update public.posts set report_count = report_count + 1 where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_report_insert on public.reports;
create trigger on_report_insert
  after insert on public.reports
  for each row execute function public.handle_report_insert();

-- 5. 글 삭제용 비밀번호: 세션이 아니라 비밀번호 대조로 본인 확인한다.
-- 해시 생성/대조 모두 DB 함수 안에서만 이뤄지고, password_hash 컬럼은
-- 애플리케이션 코드에서 select 대상에 절대 포함하지 않는다.
create or replace function public.hash_password(password text)
returns text
language sql
security definer
set search_path = public, extensions
as $$
  select extensions.crypt(password, extensions.gen_salt('bf'));
$$;

revoke all on function public.hash_password(text) from public;
grant execute on function public.hash_password(text) to anon, authenticated;

create or replace function public.delete_post_with_password(post_id uuid, password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_hash text;
begin
  select password_hash into stored_hash from public.posts where id = post_id;

  if stored_hash is null then
    return false;
  end if;

  if stored_hash = extensions.crypt(password, stored_hash) then
    delete from public.posts where id = post_id;
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.delete_post_with_password(uuid, text) from public;
grant execute on function public.delete_post_with_password(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 비추(dislike) 기능 추가 마이그레이션
-- 이미 위 스키마를 적용한 기존 DB라면 아래만 SQL Editor에서 실행하면 된다.
-- (신규 설치는 위 create 문에 이미 반영돼 있어 실행할 필요 없음)
-- ---------------------------------------------------------------------------
-- alter table public.posts add column if not exists dislike_count integer not null default 0;
-- alter table public.reactions add column if not exists kind text not null default 'like'
--   check (kind in ('like', 'dislike'));
-- 이후 위의 handle_reaction_change 함수와 on_reaction_change 트리거,
-- "본인 반응만 변경 가능" update 정책을 그대로 다시 실행하면 최신 상태가 된다.

-- ---------------------------------------------------------------------------
-- 글 삭제용 비밀번호 마이그레이션
-- 이미 위 스키마를 적용한 기존 DB라면 아래만 SQL Editor에서 실행하면 된다.
-- (신규 설치는 위 create 문/함수 정의에 이미 반영돼 있어 실행할 필요 없음)
-- ---------------------------------------------------------------------------
-- create extension if not exists pgcrypto with schema extensions;
-- alter table public.posts add column if not exists password_hash text;
-- 이후 위의 hash_password, delete_post_with_password 함수 정의(revoke/grant 포함)를
-- 그대로 다시 실행하면 최신 상태가 된다.
-- (참고: 이 마이그레이션 적용 전에 작성된 글은 password_hash가 비어 있어
--  비밀번호로 삭제할 수 없다.)
