-- Tabela de reações
create table if not exists public.recipe_reactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  item_id text not null references public.items(id) on delete cascade,
  reaction text not null check (reaction in ('❤️', '🔥', '👍')),
  created_at timestamptz default now(),
  unique(user_id, item_id, reaction)
);
alter table public.recipe_reactions enable row level security;
create policy "usuarios reagem" on public.recipe_reactions for all to authenticated using (user_id = auth.uid());
