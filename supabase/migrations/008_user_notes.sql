-- Tabela de notas pessoais
create table if not exists public.user_recipe_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id),
  item_id text not null references public.items(id) on delete cascade,
  note text not null,
  created_at timestamptz default now(),
  unique(user_id, item_id)
);
alter table public.user_recipe_notes enable row level security;
create policy "usuarios gerenciam notas" on public.user_recipe_notes for all to authenticated using (user_id = auth.uid());
