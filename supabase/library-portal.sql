-- Run once in the SAME Supabase project used by watt.nathoeng.com.
-- Requires the existing members and member_card_numbers tables.
begin;

create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  isbn text unique,
  title text not null,
  author text not null default '',
  publisher text not null default '',
  published_year text not null default '',
  description text not null default '',
  subject text not null default '',
  cover_url text not null default '',
  created_at timestamptz not null default now(),
  check (isbn is null or isbn ~ '^[0-9]{13}$')
);

create sequence if not exists public.library_copy_number_seq start with 1;
create table if not exists public.library_copies (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.library_books(id),
  copy_code text not null unique,
  shelf text not null default '',
  status text not null default 'available' check (status in ('available', 'on_loan', 'withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.library_staff (
  member_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.library_login_tickets (
  token_hash text primary key,
  member_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.library_loans (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  delivery_method text not null check (delivery_method in ('pickup', 'courier')),
  recipient_name text not null default '',
  recipient_phone text not null default '',
  shipping_address text not null default '',
  postal_code text not null default '',
  terms_accepted_at timestamptz not null,
  status text not null default 'requested' check (status in
    ('requested','approved','ready_pickup','in_transit','reading','return_in_person','return_in_transit','returned','rejected','cancelled')),
  due_date date,
  outbound_tracking text not null default '',
  return_tracking text not null default '',
  staff_member_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  returned_at timestamptz
);

create table if not exists public.library_loan_items (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.library_loans(id),
  book_id uuid not null references public.library_books(id),
  copy_id uuid references public.library_copies(id),
  unique (loan_id, book_id)
);

create index if not exists library_books_title_idx on public.library_books (lower(title));
create index if not exists library_copies_book_idx on public.library_copies (book_id, status);
create index if not exists library_loans_member_idx on public.library_loans (member_id, created_at desc);
create index if not exists library_loan_items_loan_idx on public.library_loan_items (loan_id);

alter table public.library_books enable row level security;
alter table public.library_copies enable row level security;
alter table public.library_staff enable row level security;
alter table public.library_login_tickets enable row level security;
alter table public.library_loans enable row level security;
alter table public.library_loan_items enable row level security;
revoke all on table public.library_books, public.library_copies, public.library_staff,
  public.library_login_tickets, public.library_loans, public.library_loan_items from public, anon, authenticated;
revoke all on sequence public.library_copy_number_seq from public, anon, authenticated;
grant all on table public.library_books, public.library_copies, public.library_staff,
  public.library_login_tickets, public.library_loans, public.library_loan_items to service_role;

create or replace function public.library_redeem_ticket(p_token_hash text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_member text;
begin
  delete from public.library_login_tickets
    where token_hash = p_token_hash and expires_at > now()
    returning member_id into v_member;
  return v_member;
end $$;

create or replace function public.library_search_books(p_query text, p_limit integer default 40)
returns table (id uuid, isbn text, title text, author text, publisher text,
  published_year text, description text, subject text, cover_url text,
  available_copies bigint, total_copies bigint)
language sql security definer set search_path = '' as $$
  select b.id, b.isbn, b.title, b.author, b.publisher, b.published_year,
    b.description, b.subject, b.cover_url,
    count(c.id) filter (where c.status = 'available'),
    count(c.id) filter (where c.status <> 'withdrawn')
  from public.library_books b left join public.library_copies c on c.book_id = b.id
  where pg_catalog.btrim(coalesce(p_query, '')) = '' or
    b.title ilike '%' || p_query || '%' or b.author ilike '%' || p_query || '%' or
    b.isbn ilike '%' || p_query || '%' or b.subject ilike '%' || p_query || '%'
  group by b.id
  order by b.title
  limit pg_catalog.least(pg_catalog.greatest(coalesce(p_limit, 40), 1), 50)
$$;

create or replace function public.library_add_copy(p_book_id uuid, p_shelf text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  if not exists (select 1 from public.library_books where id = p_book_id) then
    raise exception 'Book not found';
  end if;
  v_code := 'LIB-' || pg_catalog.lpad(nextval('public.library_copy_number_seq'::pg_catalog.regclass)::text, 8, '0');
  insert into public.library_copies(book_id, copy_code, shelf)
    values (p_book_id, v_code, pg_catalog.left(coalesce(p_shelf, ''), 100));
  return v_code;
end $$;

create or replace function public.library_request_loan(
  p_member_id text, p_book_ids uuid[], p_delivery text, p_name text,
  p_phone text, p_address text, p_postal text, p_accepted boolean
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_loan uuid; v_book uuid;
begin
  if p_member_id is null or not exists
    (select 1 from public.members where id::text = p_member_id and membership_status is distinct from 'cancelled') then
    raise exception 'Member unavailable';
  end if;
  if p_accepted is distinct from true or p_delivery not in ('pickup','courier') or
     p_book_ids is null or pg_catalog.array_length(p_book_ids, 1) not between 1 and 5 or
     (select count(distinct chosen.book_id) from pg_catalog.unnest(p_book_ids) as chosen(book_id)) <> pg_catalog.array_length(p_book_ids, 1) then
    raise exception 'Invalid loan request';
  end if;
  if p_delivery = 'courier' and (pg_catalog.length(pg_catalog.btrim(coalesce(p_name,''))) < 2 or
     pg_catalog.length(pg_catalog.btrim(coalesce(p_phone,''))) < 7 or
     pg_catalog.length(pg_catalog.btrim(coalesce(p_address,''))) < 10 or
     p_postal !~ '^[0-9]{5}$') then
    raise exception 'Complete the shipping name, phone, address and postal code';
  end if;
  foreach v_book in array p_book_ids loop
    if not exists (select 1 from public.library_books where id = v_book) then raise exception 'Book not found'; end if;
  end loop;
  insert into public.library_loans(member_id, delivery_method, recipient_name, recipient_phone,
    shipping_address, postal_code, terms_accepted_at)
    values (p_member_id, p_delivery, pg_catalog.left(coalesce(p_name,''), 120),
      pg_catalog.left(coalesce(p_phone,''), 30), pg_catalog.left(coalesce(p_address,''), 500),
      pg_catalog.left(coalesce(p_postal,''), 10), now()) returning id into v_loan;
  foreach v_book in array p_book_ids loop
    insert into public.library_loan_items(loan_id, book_id) values (v_loan, v_book);
  end loop;
  return v_loan;
end $$;

create or replace function public.library_advance_loan(
  p_loan_id uuid, p_actor_id text, p_action text, p_due_date date default null,
  p_tracking text default null
) returns text language plpgsql security definer set search_path = '' as $$
declare v_loan public.library_loans%rowtype; v_item record; v_copy uuid; v_status text; v_staff boolean;
begin
  select * into v_loan from public.library_loans where id = p_loan_id for update;
  if not found then raise exception 'Loan not found'; end if;
  v_staff := exists (select 1 from public.library_staff where member_id = p_actor_id)
    or exists (select 1 from public.members where id::text = p_actor_id and role = 'admin');

  if p_action = 'cancel' and v_loan.member_id = p_actor_id and v_loan.status = 'requested' then
    v_status := 'cancelled';
  elsif p_action = 'confirm_reading' and v_loan.member_id = p_actor_id and
      ((v_loan.delivery_method = 'pickup' and v_loan.status = 'ready_pickup') or
       (v_loan.delivery_method = 'courier' and v_loan.status = 'in_transit')) then
    v_status := 'reading';
  elsif p_action = 'return_in_person' and v_loan.member_id = p_actor_id and v_loan.status = 'reading' then
    v_status := 'return_in_person';
  elsif p_action = 'return_by_courier' and v_loan.member_id = p_actor_id and v_loan.status = 'reading' and
      pg_catalog.length(pg_catalog.btrim(coalesce(p_tracking,''))) between 4 and 100 then
    v_status := 'return_in_transit';
  elsif v_staff and p_action = 'approve' and v_loan.status = 'requested' and p_due_date >= current_date then
    for v_item in select * from public.library_loan_items where loan_id = p_loan_id order by id loop
      select id into v_copy from public.library_copies
        where book_id = v_item.book_id and status = 'available'
        order by id limit 1 for update skip locked;
      if v_copy is null then raise exception 'A requested book has no available copy'; end if;
      update public.library_copies set status = 'on_loan' where id = v_copy;
      update public.library_loan_items set copy_id = v_copy where id = v_item.id;
      v_copy := null;
    end loop;
    v_status := 'approved';
  elsif v_staff and p_action = 'reject' and v_loan.status = 'requested' then
    v_status := 'rejected';
  elsif v_staff and p_action = 'ready_pickup' and v_loan.status = 'approved' and v_loan.delivery_method = 'pickup' then
    v_status := 'ready_pickup';
  elsif v_staff and p_action = 'ship' and v_loan.status = 'approved' and v_loan.delivery_method = 'courier' and
      pg_catalog.length(pg_catalog.btrim(coalesce(p_tracking,''))) between 4 and 100 then
    v_status := 'in_transit';
  elsif v_staff and p_action = 'confirm_handover' and v_loan.status = 'ready_pickup' then
    v_status := 'reading';
  elsif v_staff and p_action = 'receive_return' and v_loan.status in ('return_in_person','return_in_transit') then
    update public.library_copies set status = 'available' where id in
      (select copy_id from public.library_loan_items where loan_id = p_loan_id);
    v_status := 'returned';
  else
    raise exception 'This status change is not permitted';
  end if;

  update public.library_loans set status = v_status, updated_at = now(),
    staff_member_id = case when v_staff then p_actor_id else staff_member_id end,
    due_date = case when p_action = 'approve' then p_due_date else due_date end,
    outbound_tracking = case when p_action = 'ship' then pg_catalog.btrim(p_tracking) else outbound_tracking end,
    return_tracking = case when p_action = 'return_by_courier' then pg_catalog.btrim(p_tracking) else return_tracking end,
    returned_at = case when v_status = 'returned' then now() else returned_at end
    where id = p_loan_id;
  return v_status;
end $$;

revoke all on function public.library_redeem_ticket(text), public.library_search_books(text,integer), public.library_add_copy(uuid,text),
  public.library_request_loan(text,uuid[],text,text,text,text,text,boolean),
  public.library_advance_loan(uuid,text,text,date,text) from public, anon, authenticated;
grant execute on function public.library_redeem_ticket(text), public.library_search_books(text,integer), public.library_add_copy(uuid,text),
  public.library_request_loan(text,uuid[],text,text,text,text,text,boolean),
  public.library_advance_loan(uuid,text,text,date,text) to service_role;
commit;
