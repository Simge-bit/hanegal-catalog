-- Hanegal Katalog - Supabase Şeması
-- Bu dosyayı Supabase SQL Editor'da çalıştır

-- Ürünler tablosu
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  model_code text not null unique,
  base_model text not null,
  size_inch integer not null,
  color_variant text not null check (color_variant in ('silver', 'black_chrome', 'bicolor', 'black')),
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ürün görselleri için storage bucket
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict do nothing;

-- Storage politikası (herkes okuyabilir)
create policy "Public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admin upload" on storage.objects for insert with check (bucket_id = 'product-images');
create policy "Admin update" on storage.objects for update using (bucket_id = 'product-images');
create policy "Admin delete" on storage.objects for delete using (bucket_id = 'product-images');

-- RLS (Row Level Security)
alter table products enable row level security;

-- Herkes ürünleri görebilir
create policy "Public read products" on products for select using (true);

-- Sadece authenticated kullanıcılar (admin) yazabilir
create policy "Admin insert" on products for insert with check (auth.role() = 'authenticated');
create policy "Admin update" on products for update using (auth.role() = 'authenticated');
create policy "Admin delete" on products for delete using (auth.role() = 'authenticated');

-- Güncelleme tarihi otomatik güncelle
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();