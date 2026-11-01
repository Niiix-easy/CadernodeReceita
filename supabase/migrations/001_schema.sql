-- Caderno de Receitas: esquema, regras de acesso (RLS) e assinatura.

-- ========== Itens (receitas, dicas, sabão) ==========
create table if not exists public.items (
  id text primary key,
  category text not null check (category in ('food','health','soap')),
  title text not null,
  level text,
  "time" text,
  servings text,
  summary text,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  safety boolean not null default false,
  video_id text,
  channel_url text,
  source_url text,
  note text,
  recipe_type text not null default 'caseira' check (recipe_type in ('caseira', 'industrial'))
);
alter table public.items enable row level security;

-- ========== Favoritos ==========
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.favorites enable row level security;

-- ========== Assinatura ==========
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mp_preapproval_id text unique,
  status text not null default 'none'
    check (status in ('none','pending','authorized','paused','cancelled')),
  next_payment_date timestamptz,
  access_until timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

create policy "ler propria assinatura" on public.subscriptions
  for select to authenticated using (user_id = auth.uid());
-- Sem policies de insert/update/delete: só as Edge Functions (service role) escrevem.
revoke insert, update, delete on public.subscriptions from anon, authenticated;

-- ========== Função: assinatura ativa? ==========
create or replace function public.has_active_subscription(uid uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid
      and (s.status = 'authorized' or coalesce(s.access_until, 'epoch'::timestamptz) > now())
  );
$$;
revoke all on function public.has_active_subscription(uuid) from public, anon;
grant execute on function public.has_active_subscription(uuid) to authenticated;

-- ========== Regras de acesso ==========
-- Conteúdo completo: só assinantes.
drop policy if exists "itens so assinantes" on public.items;
create policy "itens so assinantes" on public.items
  for select to authenticated using (public.has_active_subscription(auth.uid()));

-- Favoritos: cada usuário só mexe nos seus; gravar exige assinatura.
drop policy if exists "favoritos leitura" on public.favorites;
drop policy if exists "favoritos insercao" on public.favorites;
drop policy if exists "favoritos remocao" on public.favorites;
create policy "favoritos leitura" on public.favorites
  for select to authenticated using (user_id = auth.uid());
create policy "favoritos insercao" on public.favorites
  for insert to authenticated with check (user_id = auth.uid() and public.has_active_subscription(auth.uid()));
create policy "favoritos remocao" on public.favorites
  for delete to authenticated using (user_id = auth.uid());

-- Itens nunca são alterados pelo cliente.
revoke insert, update, delete on public.items from anon, authenticated;

-- ========== Catálogo (plano Grátis): só título, categoria, nível e tempo ==========
-- A view roda com os privilégios do dono (ignora a RLS de items) e expõe apenas campos não sensíveis.
create or replace view public.items_catalog with (security_invoker = false) as
  select id, category, title, level, "time" from public.items;
revoke all on public.items_catalog from public, anon;
grant select on public.items_catalog to authenticated;
