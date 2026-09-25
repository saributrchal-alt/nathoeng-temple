-- Apply once in the Supabase SQL Editor after admin-edit-members.sql.
-- English names and addresses are private to the member and authorized administrators.
begin;

create table if not exists public.member_profile_details (
  member_id text primary key,
  full_name_en text not null default '' check (length(full_name_en) <= 200),
  member_address text not null default '' check (length(member_address) <= 500),
  updated_at timestamptz not null default now()
);
alter table public.member_profile_details enable row level security;
revoke all on public.member_profile_details from public, anon, authenticated;
grant select, insert, update on public.member_profile_details to service_role;

create or replace function public.admin_edit_member_with_details(
  p_member_id text,
  p_full_name text,
  p_identity_number text,
  p_birth_date date,
  p_profile_image_url text,
  p_remove_profile_image boolean,
  p_country_code text,
  p_username text,
  p_password_salt text,
  p_password_hash text,
  p_actor_member_id text,
  p_full_name_en text,
  p_member_address text
) returns text language plpgsql security definer set search_path = '' as $$
declare v_id text;
begin
  if length(coalesce(p_full_name_en, '')) > 200 or length(coalesce(p_member_address, '')) > 500 then
    raise exception 'English name or address is too long';
  end if;
  -- Both updates run inside one transaction; a failure rolls back the entire edit.
  v_id := public.admin_edit_member(
    p_member_id, p_full_name, p_identity_number, p_birth_date,
    p_profile_image_url, p_remove_profile_image, p_country_code,
    p_username, p_password_salt, p_password_hash, p_actor_member_id
  );
  insert into public.member_profile_details(member_id, full_name_en, member_address, updated_at)
  values (v_id, trim(coalesce(p_full_name_en, '')), trim(coalesce(p_member_address, '')), now())
  on conflict (member_id) do update
  set full_name_en = excluded.full_name_en,
      member_address = excluded.member_address,
      updated_at = excluded.updated_at;
  return v_id;
end $$;

revoke all on function public.admin_edit_member_with_details(text,text,text,date,text,boolean,text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.admin_edit_member_with_details(text,text,text,date,text,boolean,text,text,text,text,text,text,text)
  to service_role;

commit;
notify pgrst, 'reload schema';
