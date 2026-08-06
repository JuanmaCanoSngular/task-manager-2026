-- Emparejamiento de canales externos (Telegram, etc.)
-- Ejecutar en el SQL Editor de Supabase.

create table if not exists channel_links (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  provider     text not null check (provider in ('telegram')),
  external_id  text not null,
  created_at   timestamptz not null default now(),
  unique (provider, external_id),
  unique (user_id, provider)
);

create index if not exists channel_links_user_id_idx on channel_links (user_id);

-- Códigos de un solo uso para vincular el chat de Telegram con la cuenta.
create table if not exists channel_link_codes (
  code         text primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

create index if not exists channel_link_codes_user_id_idx on channel_link_codes (user_id);

alter table channel_links enable row level security;
alter table channel_link_codes enable row level security;

-- El usuario solo lee sus vínculos. Altas/bajas las hace la Edge Function (service_role).
drop policy if exists "channel_links propios" on channel_links;
create policy "channel_links propios" on channel_links
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "channel_link_codes propios" on channel_link_codes;
create policy "channel_link_codes propios" on channel_link_codes
  for select to authenticated
  using (user_id = auth.uid());
