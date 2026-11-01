-- Tabela de seguidores
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);
alter table public.follows enable row level security;
create policy "usuarios gerenciam seguidores" on public.follows for all to authenticated using (follower_id = auth.uid());
