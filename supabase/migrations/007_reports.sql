-- Tabela de denúncias
create table if not exists public.reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  item_id text not null references public.items(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
create policy "usuarios podem denunciar" on public.reports for insert to authenticated with check (user_id = auth.uid());
