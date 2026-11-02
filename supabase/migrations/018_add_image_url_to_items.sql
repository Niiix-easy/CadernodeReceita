-- Adiciona coluna de imagem para itens
alter table public.items add column if not exists image_url text;
