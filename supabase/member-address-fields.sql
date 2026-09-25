-- Run after supabase/member-profile-details.sql, in the same temple Supabase project.
-- Existing free-text addresses are retained until a member or administrator reviews them.
begin;

alter table public.member_profile_details
  add column if not exists address_house_no text not null default '',
  add column if not exists address_village_no text not null default '',
  add column if not exists address_extra text not null default '',
  add column if not exists address_province_id integer,
  add column if not exists address_district_id integer,
  add column if not exists address_subdistrict_id integer;

create or replace function public.admin_edit_member_with_address(
  p_member_id text, p_full_name text, p_identity_number text,
  p_birth_date date, p_profile_image_url text, p_remove_profile_image boolean,
  p_country_code text, p_username text, p_password_salt text,
  p_password_hash text, p_actor_member_id text, p_full_name_en text,
  p_member_address text, p_address_house_no text, p_address_village_no text,
  p_address_extra text, p_address_province_id integer,
  p_address_district_id integer, p_address_subdistrict_id integer
) returns text language plpgsql security definer set search_path = '' as $$
declare v_id text;
begin
  if length(coalesce(p_address_house_no, '')) > 40
    or length(coalesce(p_address_village_no, '')) > 20
    or length(coalesce(p_address_extra, '')) > 200 then
    raise exception 'Address field is too long';
  end if;
  if (nullif(trim(coalesce(p_address_house_no, '')), '') is not null
      or p_address_province_id is not null
      or p_address_district_id is not null
      or p_address_subdistrict_id is not null)
    and (nullif(trim(coalesce(p_address_house_no, '')), '') is null
      or p_address_province_id is null
      or p_address_district_id is null
      or p_address_subdistrict_id is null) then
    raise exception 'House number, province, district and subdistrict are required together';
  end if;
  v_id := public.admin_edit_member_with_details(
    p_member_id, p_full_name, p_identity_number, p_birth_date,
    p_profile_image_url, p_remove_profile_image, p_country_code,
    p_username, p_password_salt, p_password_hash, p_actor_member_id,
    p_full_name_en, p_member_address
  );
  update public.member_profile_details set
    address_house_no = trim(coalesce(p_address_house_no, '')),
    address_village_no = trim(coalesce(p_address_village_no, '')),
    address_extra = trim(coalesce(p_address_extra, '')),
    address_province_id = p_address_province_id,
    address_district_id = p_address_district_id,
    address_subdistrict_id = p_address_subdistrict_id,
    updated_at = now()
  where member_id = v_id;
  return v_id;
end $$;

revoke all on function public.admin_edit_member_with_address(
  text,text,text,date,text,boolean,text,text,text,text,text,text,text,
  text,text,text,integer,integer,integer) from public, anon, authenticated;
grant execute on function public.admin_edit_member_with_address(
  text,text,text,date,text,boolean,text,text,text,text,text,text,text,
  text,text,text,integer,integer,integer) to service_role;

commit;
notify pgrst, 'reload schema';
