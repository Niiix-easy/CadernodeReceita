-- Atualizar categorias permitidas no banco de dados
alter table public.items drop constraint items_category_check;
alter table public.items add constraint items_category_check 
  check (category in ('receitas de saude', 'receitas de produçao de produtos artesanais', 'receitas de comidas', 'outros', 'industrial'));
