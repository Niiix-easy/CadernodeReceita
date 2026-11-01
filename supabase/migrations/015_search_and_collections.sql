-- Tabela para rastrear buscas
create table if not exists public.search_logs (
  id bigint generated always as identity primary key,
  query text not null,
  created_at timestamptz default now()
);

-- Tabela para coleções de usuários
create table if not exists public.user_collections (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.collection_items (
  collection_id bigint not null references public.user_collections(id) on delete cascade,
  item_id text not null references public.items(id) on delete cascade,
  primary key (collection_id, item_id)
);
