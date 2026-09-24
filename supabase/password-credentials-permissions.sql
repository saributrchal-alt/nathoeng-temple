-- Run in the temple Supabase SQL Editor to allow the server to read
-- password-account metadata for admin member editing and member login.
-- Do not grant access to anon or authenticated browser roles.
begin;

revoke all on table public.member_password_credentials from anon, authenticated;
grant select, update on table public.member_password_credentials to service_role;

commit;

select
  has_table_privilege('service_role', 'public.member_password_credentials', 'SELECT') as server_can_read,
  has_table_privilege('service_role', 'public.member_password_credentials', 'UPDATE') as server_can_update;
