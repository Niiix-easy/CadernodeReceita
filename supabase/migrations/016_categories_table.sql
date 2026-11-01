-- Tabela para gerenciar categorias dinamicamente
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Seed categorias iniciais
insert into public.categories (name) values 
('Receitas de Saúde'), 
('Sabão Artesanal'), 
('Comidas/Outros'), 
('Industrial')
on conflict (name) do nothing;
