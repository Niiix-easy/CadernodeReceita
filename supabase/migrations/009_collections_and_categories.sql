-- 1. Atualizar categorias na tabela items
alter table public.items drop constraint items_category_check;
alter table public.items add constraint items_category_check 
  check (category in ('receitas de saude', 'receitas de produçao de produtos artesanais', 'receitas de comidas', 'outros'));

-- 2. Criar coleções
create table if not exists public.collections (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
alter table public.collections enable row level security;
create policy "usuarios gerenciam colecoes" on public.collections for all to authenticated using (user_id = auth.uid());

create table if not exists public.collection_items (
  collection_id bigint not null references public.collections(id) on delete cascade,
  item_id text not null references public.items(id) on delete cascade,
  primary key (collection_id, item_id)
);
alter table public.collection_items enable row level security;
create policy "usuarios gerenciam itens colecoes" on public.collection_items for all to authenticated using (
  exists (select 1 from public.collections where id = collection_id and user_id = auth.uid())
);
