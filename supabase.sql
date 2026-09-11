-- Centro Contas - banco Supabase
-- Execute todo este arquivo em: Supabase > SQL Editor > New query

create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  service_date date not null default current_date,
  device text not null,
  description text not null default '',
  amount numeric(12,2) not null check (amount > 0),
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  paid_at date not null default current_date,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'PIX',
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists stores_user_idx on public.stores(user_id);
create index if not exists services_store_idx on public.services(store_id);
create index if not exists services_user_idx on public.services(user_id);
create index if not exists payments_store_idx on public.payments(store_id);
create index if not exists payments_user_idx on public.payments(user_id);
create index if not exists allocations_service_idx on public.payment_allocations(service_id);
create index if not exists allocations_payment_idx on public.payment_allocations(payment_id);

alter table public.stores enable row level security;
alter table public.services enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

-- Cada conta enxerga somente os próprios dados.
drop policy if exists "stores_owner" on public.stores;
create policy "stores_owner" on public.stores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "services_owner" on public.services;
create policy "services_owner" on public.services for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payments_owner" on public.payments;
create policy "payments_owner" on public.payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "allocations_owner" on public.payment_allocations;
create policy "allocations_owner" on public.payment_allocations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fotos dos aparelhos (foto opcional anexada ao lançar um serviço)
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

drop policy if exists "service_photos_insert" on storage.objects;
create policy "service_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'service-photos' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "service_photos_select" on storage.objects;
create policy "service_photos_select" on storage.objects for select
  using (bucket_id = 'service-photos');

drop policy if exists "service_photos_delete" on storage.objects;
create policy "service_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'service-photos' and auth.uid()::text = (storage.foldername(name))[1]);
