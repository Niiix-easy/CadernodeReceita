-- Adicionar tabela de comentários
create table if not exists public.comments (
  id bigint generated always as identity primary key,
  item_id text not null references public.items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  author_name text
);
alter table public.comments enable row level security;
create policy "leitura comentarios" on public.comments for select to authenticated using (true);
create policy "insercao comentarios" on public.comments for insert to authenticated with check (user_id = auth.uid());
