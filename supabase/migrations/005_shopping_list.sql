-- Tabela de Lista de Compras
create table if not exists public.shopping_list (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  ingredient text not null,
  checked boolean default false,
  created_at timestamptz default now()
);
alter table public.shopping_list enable row level security;
create policy "leitura lista" on public.shopping_list for select to authenticated using (user_id = auth.uid());
create policy "insercao lista" on public.shopping_list for insert to authenticated with check (user_id = auth.uid());
create policy "delete lista" on public.shopping_list for delete to authenticated using (user_id = auth.uid());
create policy "update lista" on public.shopping_list for update to authenticated using (user_id = auth.uid());
