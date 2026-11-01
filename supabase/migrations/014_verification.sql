-- Add verification column to items table
alter table public.items add column if not exists verified boolean default false;
