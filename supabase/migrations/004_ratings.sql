-- Adicionar tabela de avaliações
create table if not exists public.ratings (
  id bigint generated always as identity primary key,
  item_id text not null references public.items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  unique(item_id, user_id)
);
alter table public.ratings enable row level security;
create policy "leitura avaliacoes" on public.ratings for select to authenticated using (true);
create policy "insercao/update avaliacoes" on public.ratings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
