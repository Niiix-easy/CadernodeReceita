-- Atualizar categorias existentes na tabela items (exemplo: migração de dados)
update public.items set category = 'receitas de comidas' where category = 'food';
update public.items set category = 'receitas de saude' where category = 'health';
update public.items set category = 'receitas de produçao de produtos artesanais' where category = 'soap';
