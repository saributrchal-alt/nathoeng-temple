-- Run once in the TEMPLE Supabase SQL Editor before enabling the full registration form.
-- Requires walkin-members.sql, admin-edit-members.sql, member-profile-details.sql,
-- member-address-fields.sql, member-id-card-verification.sql and private-media-member-photos.sql.
-- Member, credentials, private details and card review all commit in one transaction.
begin;

create or replace function public.register_walkin_member_full(
  p_data jsonb, p_card_reviewed boolean default false
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_id text;
  v_actor text := p_data->>'p_actor_member_id';
  v_identity text := nullif(upper(trim(p_data->>'p_citizen_id')), '');
begin
  if v_actor is null or not exists (
    select 1 from public.members where id::text = v_actor and role = 'admin'
  ) then raise exception 'Administrator permission required'; end if;
  if p_card_reviewed and (v_identity is null or v_identity !~ '^[0-9]{13}$') then
    raise exception 'Thai ID card is required for verification';
  end if;
  -- Reuse the existing registration lock and duplicate checks. Credentials are
  -- created below, inside the same transaction, after validating the full profile.
  v_id := public.register_walkin_member(
    p_data->>'p_member_id', p_data->>'p_full_name',
    case when v_identity ~ '^[0-9]{13}$' then v_identity else null end,
    (p_data->>'p_birth_date')::date, p_data->>'p_profile_image_url',
    null, null, null, v_actor
  );
  v_id := public.admin_edit_member_with_address(
    v_id, p_data->>'p_full_name', v_identity,
    (p_data->>'p_birth_date')::date, p_data->>'p_profile_image_url', false,
    p_data->>'p_country_code', p_data->>'p_username',
    p_data->>'p_password_salt', p_data->>'p_password_hash', v_actor,
    p_data->>'p_full_name_en', p_data->>'p_member_address',
    p_data->>'p_address_house_no', p_data->>'p_address_village_no', p_data->>'p_address_extra',
    (p_data->>'p_address_province_id')::integer,
    (p_data->>'p_address_district_id')::integer,
    (p_data->>'p_address_subdistrict_id')::integer
  );
  if p_card_reviewed then
    update public.members set id_card_verified_at = clock_timestamp(), id_card_verified_by = v_actor
    where id::text = v_id and tax_id = v_identity;
    if not found then raise exception 'Saved identity does not match the reviewed card'; end if;
  end if;
  return v_id;
end $$;

revoke all on function public.register_walkin_member_full(jsonb,boolean) from public, anon, authenticated;
grant execute on function public.register_walkin_member_full(jsonb,boolean) to service_role;
commit;
notify pgrst, 'reload schema';
