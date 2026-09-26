-- Run once in the temple Supabase SQL Editor after the existing member migrations.
-- Existing records deliberately remain unverified: no historical evidence/time is assumed.
begin;
alter table public.members
  add column if not exists id_card_verified_at timestamptz,
  add column if not exists id_card_verified_by text;

create or replace function public.clear_changed_card_verification()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.tax_id is distinct from old.tax_id
    or new.full_name is distinct from old.full_name
    or new.birth_date is distinct from old.birth_date then
    new.id_card_verified_at := null;
    new.id_card_verified_by := null;
  end if;
  return new;
end $$;
drop trigger if exists clear_changed_card_verification on public.members;
create trigger clear_changed_card_verification before update on public.members
for each row execute function public.clear_changed_card_verification();

-- Called only by the authenticated admin API after staff confirm imported card data.
-- Profile changes and verification either both commit or both roll back.
create or replace function public.save_member_with_card_verification(p_operation text, p_data jsonb)
returns text language plpgsql security definer set search_path = '' as $$
declare v_id text; v_actor text := p_data->>'p_actor_member_id';
  v_identity text := coalesce(p_data->>'p_identity_number', p_data->>'p_citizen_id');
begin
  if v_actor is null or not exists (
    select 1 from public.members where id::text = v_actor and role = 'admin'
  ) then raise exception 'Administrator permission required'; end if;
  if v_identity is null or v_identity !~ '^[0-9]{13}$' then
    raise exception 'Thai ID card is required for verification';
  end if;
  case p_operation
    when 'admin_edit_member' then v_id := public.admin_edit_member(
      (p_data->>'p_member_id'),
      (p_data->>'p_full_name'),
      (p_data->>'p_identity_number'),
      (p_data->>'p_birth_date')::date,
      (p_data->>'p_profile_image_url'),
      (p_data->>'p_remove_profile_image')::boolean,
      (p_data->>'p_country_code'),
      (p_data->>'p_username'),
      (p_data->>'p_password_salt'),
      (p_data->>'p_password_hash'),
      (p_data->>'p_actor_member_id')
    );
    when 'admin_edit_member_with_details' then v_id := public.admin_edit_member_with_details(
      (p_data->>'p_member_id'),
      (p_data->>'p_full_name'),
      (p_data->>'p_identity_number'),
      (p_data->>'p_birth_date')::date,
      (p_data->>'p_profile_image_url'),
      (p_data->>'p_remove_profile_image')::boolean,
      (p_data->>'p_country_code'),
      (p_data->>'p_username'),
      (p_data->>'p_password_salt'),
      (p_data->>'p_password_hash'),
      (p_data->>'p_actor_member_id'),
      (p_data->>'p_full_name_en'),
      (p_data->>'p_member_address')
    );
    when 'admin_edit_member_with_address' then v_id := public.admin_edit_member_with_address(
      (p_data->>'p_member_id'),
      (p_data->>'p_full_name'),
      (p_data->>'p_identity_number'),
      (p_data->>'p_birth_date')::date,
      (p_data->>'p_profile_image_url'),
      (p_data->>'p_remove_profile_image')::boolean,
      (p_data->>'p_country_code'),
      (p_data->>'p_username'),
      (p_data->>'p_password_salt'),
      (p_data->>'p_password_hash'),
      (p_data->>'p_actor_member_id'),
      (p_data->>'p_full_name_en'),
      (p_data->>'p_member_address'),
      (p_data->>'p_address_house_no'),
      (p_data->>'p_address_village_no'),
      (p_data->>'p_address_extra'),
      (p_data->>'p_address_province_id')::integer,
      (p_data->>'p_address_district_id')::integer,
      (p_data->>'p_address_subdistrict_id')::integer
    );
    when 'register_walkin_member' then v_id := public.register_walkin_member(
      (p_data->>'p_member_id'),
      (p_data->>'p_full_name'),
      (p_data->>'p_citizen_id'),
      (p_data->>'p_birth_date')::date,
      (p_data->>'p_profile_image_url'),
      (p_data->>'p_username'),
      (p_data->>'p_password_salt'),
      (p_data->>'p_password_hash'),
      (p_data->>'p_actor_member_id')
    );
    else raise exception 'Unsupported verification operation';
  end case;
  update public.members set id_card_verified_at = clock_timestamp(), id_card_verified_by = v_actor
  where id::text = v_id and tax_id = v_identity;
  if not found then raise exception 'Saved identity does not match the reviewed card'; end if;
  return v_id;
end $$;
revoke all on function public.save_member_with_card_verification(text,jsonb) from public, anon, authenticated;
grant execute on function public.save_member_with_card_verification(text,jsonb) to service_role;
commit;
notify pgrst, 'reload schema';
