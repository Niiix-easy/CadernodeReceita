-- Tabela para rastrear atividades diárias e calcular streaks
create table if not exists public.user_activities (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null, -- 'recipe_cooked', 'meal_planned', etc.
  completed_at date not null default current_date,
  unique(user_id, completed_at, activity_type)
);

alter table public.user_activities enable row level security;
create policy "usuarios gerenciam suas atividades" on public.user_activities for all to authenticated using (user_id = auth.uid());
