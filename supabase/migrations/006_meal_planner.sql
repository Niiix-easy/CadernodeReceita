-- Tabela de Planejamento de Refeições
create table if not exists public.meal_plans (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.items(id) on delete cascade,
  day_of_week text not null check (day_of_week in ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom')),
  created_at timestamptz default now()
);
alter table public.meal_plans enable row level security;
create policy "leitura plano" on public.meal_plans for select to authenticated using (user_id = auth.uid());
create policy "insercao plano" on public.meal_plans for insert to authenticated with check (user_id = auth.uid());
create policy "delete plano" on public.meal_plans for delete to authenticated using (user_id = auth.uid());
