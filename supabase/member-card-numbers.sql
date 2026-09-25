-- Run once in Supabase SQL Editor before enabling the short member card barcode.
-- Card numbers are not citizen IDs. They are unique, private-to-this-system
-- EAN-13 numbers starting with 2 and ending with a check digit.
begin;

create sequence if not exists public.member_card_number_seq start with 1;

create table if not exists public.member_card_numbers (
  member_id text primary key,
  card_number text not null unique check (card_number ~ '^2[0-9]{12}$'),
  created_at timestamptz not null default now()
);

alter table public.member_card_numbers enable row level security;
revoke all on table public.member_card_numbers from public, anon, authenticated;
revoke all on sequence public.member_card_number_seq from public, anon, authenticated;
grant select on table public.member_card_numbers to service_role;

-- Called by the server with its service-role key after verifying the signed
-- member/admin session. The lock ensures one number per member on concurrent requests.
create or replace function public.get_or_create_member_card_number(p_member_id text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_card text;
  v_serial bigint;
  v_base text;
  v_sum integer := 0;
  v_index integer;
begin
  if p_member_id is null or not exists
    (select 1 from public.members where id::text = p_member_id) then
    raise exception 'Member not found';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_member_id, 0));
  select card_number into v_card from public.member_card_numbers where member_id = p_member_id;
  if v_card is not null then return v_card; end if;

  v_serial := nextval('public.member_card_number_seq'::pg_catalog.regclass);
  if v_serial > 99999999999 then raise exception 'Member card number space exhausted'; end if;
  v_base := '2' || pg_catalog.lpad(v_serial::text, 11, '0');
  for v_index in 1..12 loop
    v_sum := v_sum + pg_catalog.substring(v_base from v_index for 1)::integer
      * case when v_index % 2 = 0 then 3 else 1 end;
  end loop;
  v_card := v_base || ((10 - v_sum % 10) % 10)::text;
  insert into public.member_card_numbers(member_id, card_number)
    values (p_member_id, v_card);
  return v_card;
end $$;

revoke all on function public.get_or_create_member_card_number(text)
  from public, anon, authenticated;
grant execute on function public.get_or_create_member_card_number(text)
  to service_role;
commit;
