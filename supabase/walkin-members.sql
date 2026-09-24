-- Run in the temple Supabase SQL Editor before deploying the walk-in member UI.
-- Check and resolve duplicate 13-digit members.tax_id values before this migration.
begin;

alter table public.members
  add column if not exists birth_date date,
  add column if not exists profile_image_url text;

create unique index if not exists members_thai_citizen_id_unique
  on public.members (tax_id)
  where tax_id ~ '^[0-9]{13}$';

create table if not exists public.member_password_credentials (
  member_id text primary key,
  username text not null unique check (username ~ '^[a-z][a-z0-9._-]{3,31}$'),
  password_salt text not null,
  password_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.walkin_registration_audit (
  id bigint generated always as identity primary key,
  member_id text not null,
  actor_member_id text not null,
  operation text not null check (operation in ('create', 'update', 'password_reset')),
  created_at timestamptz not null default now()
);

alter table public.member_password_credentials enable row level security;
alter table public.walkin_registration_audit enable row level security;
revoke all on public.member_password_credentials, public.walkin_registration_audit from anon, authenticated;

-- Called only by the server with a service-role key after checking the signed Admin cookie.
-- The row lock and unique index keep two simultaneous registration desks from creating duplicates.
create or replace function public.register_walkin_member(
  p_member_id text, p_full_name text, p_citizen_id text,
  p_birth_date date, p_profile_image_url text,
  p_username text, p_password_salt text, p_password_hash text,
  p_actor_member_id text
) returns text language plpgsql security definer set search_path = '' as $$
declare v_id text; v_matched text; v_operation text;
begin
  if p_full_name is null or length(trim(p_full_name)) < 2 then
    raise exception 'Full name is required';
  end if;
  if p_citizen_id is not null and p_citizen_id !~ '^[0-9]{13}$' then
    raise exception 'Invalid citizen ID';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('temple-walkin-member', 0));
  if p_citizen_id is not null then
    select id::text into v_matched from public.members where tax_id = p_citizen_id;
    if v_matched is not null and v_matched is distinct from p_member_id then
      raise exception 'CARD_ALREADY_REGISTERED';
    end if;
  end if;
  if p_member_id is null then
    insert into public.members (display_name, full_name, role, country_code, tax_id, birth_date, profile_image_url)
    values (p_full_name, p_full_name, 'member', 'TH', p_citizen_id, p_birth_date, p_profile_image_url)
    returning id::text into v_id;
    v_operation := 'create';
  else
    select id::text into v_id from public.members where id::text = p_member_id for update;
    if v_id is null then raise exception 'Member not found'; end if;
    if exists (select 1 from public.members where id::text = v_id and tax_id is not null
               and p_citizen_id is not null and tax_id <> p_citizen_id) then
      raise exception 'MEMBER_HAS_DIFFERENT_ID';
    end if;
    update public.members set full_name = p_full_name,
      tax_id = coalesce(p_citizen_id, tax_id),
      birth_date = coalesce(p_birth_date, birth_date),
      profile_image_url = coalesce(p_profile_image_url, profile_image_url)
      where id::text = v_id;
    v_operation := 'update';
  end if;
  if p_username is not null then
    if exists (select 1 from public.member_password_credentials where member_id = v_id) then
      raise exception 'Member already has a username';
    end if;
    insert into public.member_password_credentials(member_id, username, password_salt, password_hash)
    values (v_id, p_username, p_password_salt, p_password_hash);
  end if;
  insert into public.walkin_registration_audit(member_id, actor_member_id, operation)
  values(v_id, p_actor_member_id, v_operation);
  return v_id;
end $$;

revoke all on function public.register_walkin_member(text,text,text,date,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.register_walkin_member(text,text,text,date,text,text,text,text,text)
  to service_role;

create or replace function public.record_member_password_attempt(p_username text, p_success boolean)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare v_locked timestamptz;
begin
  update public.member_password_credentials
  set failed_attempts = case when p_success then 0
        when failed_attempts >= 4 then 0 else failed_attempts + 1 end,
      locked_until = case when p_success then null
        when failed_attempts >= 4 then now() + interval '15 minutes' else locked_until end,
      updated_at = now()
  where username = p_username and (locked_until is null or locked_until <= now())
  returning locked_until into v_locked;
  return v_locked;
end $$;
revoke all on function public.record_member_password_attempt(text,boolean)
  from public, anon, authenticated;
grant execute on function public.record_member_password_attempt(text,boolean)
  to service_role;
commit;
