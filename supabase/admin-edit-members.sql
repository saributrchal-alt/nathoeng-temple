-- Run once in the temple Supabase SQL Editor before deploying admin member editing.
-- Requires supabase/walkin-members.sql to have been applied already.
begin;

create or replace function public.admin_edit_member(
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
  p_actor_member_id text
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_id text;
  v_existing_username text;
  v_identity text := nullif(upper(trim(coalesce(p_identity_number, ''))), '');
  v_username text := nullif(lower(trim(coalesce(p_username, ''))), '');
begin
  if p_member_id is null or p_actor_member_id is null then
    raise exception 'Member and administrator are required';
  end if;
  if p_full_name is null or length(trim(p_full_name)) < 2 or length(p_full_name) > 200 then
    raise exception 'Invalid full name';
  end if;
  if p_country_code is null or p_country_code !~ '^[A-Z]{2}$' then
    raise exception 'Invalid country code';
  end if;
  if v_identity is not null and v_identity !~ '^[0-9]{13}$'
     and v_identity !~ '^[A-Z0-9]{5,20}$' then
    raise exception 'Invalid identity number';
  end if;
  if p_birth_date > current_date then raise exception 'Invalid birth date'; end if;
  if p_profile_image_url is not null and
     (length(p_profile_image_url) > 100000 or p_profile_image_url !~ '^data:image/jpeg;base64,/9j/') then
    raise exception 'Invalid profile image';
  end if;
  if v_username is not null and v_username !~ '^[a-z][a-z0-9._-]{3,31}$' then
    raise exception 'Invalid username';
  end if;
  if (p_password_salt is null) <> (p_password_hash is null) or
     (p_password_salt is not null and (p_password_salt !~ '^[0-9a-f]{32}$' or p_password_hash !~ '^[0-9a-f]{128}$')) then
    raise exception 'Invalid password hash';
  end if;

  select id::text into v_id from public.members where id::text = p_member_id for update;
  if v_id is null then raise exception 'Member not found'; end if;
  -- The partial unique index from walkin-members.sql also rejects duplicate Thai IDs.
  update public.members
  set full_name = trim(p_full_name),
      display_name = case when line_uid is null and telegram_uid is null
                          then trim(p_full_name) else display_name end,
      tax_id = v_identity,
      birth_date = p_birth_date,
      country_code = p_country_code,
      profile_image_url = case when p_remove_profile_image then null
                               else coalesce(p_profile_image_url, profile_image_url) end
  where id::text = v_id;

  select username into v_existing_username
  from public.member_password_credentials where member_id = v_id for update;
  if v_existing_username is not null then
    if v_username is null then raise exception 'Username is required for an existing password account'; end if;
    update public.member_password_credentials
    set username = v_username,
        password_salt = coalesce(p_password_salt, password_salt),
        password_hash = coalesce(p_password_hash, password_hash),
        failed_attempts = case when p_password_hash is null then failed_attempts else 0 end,
        locked_until = case when p_password_hash is null then locked_until else null end,
        updated_at = now()
    where member_id = v_id;
  elsif v_username is not null or p_password_hash is not null then
    if v_username is null or p_password_hash is null then
      raise exception 'Username and password are both required for a new password account';
    end if;
    insert into public.member_password_credentials(member_id, username, password_salt, password_hash)
    values (v_id, v_username, p_password_salt, p_password_hash);
  end if;

  insert into public.walkin_registration_audit(member_id, actor_member_id, operation)
  values (v_id, p_actor_member_id, 'update');
  if p_password_hash is not null then
    insert into public.walkin_registration_audit(member_id, actor_member_id, operation)
    values (v_id, p_actor_member_id, 'password_reset');
  end if;
  return v_id;
end $$;

revoke all on function public.admin_edit_member(text,text,text,date,text,boolean,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.admin_edit_member(text,text,text,date,text,boolean,text,text,text,text,text)
  to service_role;
commit;
