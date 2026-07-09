-- Hanegal Katalog - Müşteri Girişi & Rol Ayrımı
-- Bu dosyayı Supabase SQL Editor'da çalıştır (mevcut supabase-schema.sql'den SONRA)
--
-- Ne yapar:
--   1. Her auth kullanıcısına 'admin' | 'customer' rolü atayan bir profiles tablosu kurar
--   2. Mevcut admin@hanegal.com hesabını 'admin' olarak işaretler, yeni kayıt olan herkes 'customer' olur
--   3. products / site_settings / storage yazma politikalarını "herhangi bir authenticated kullanıcı"dan
--      "sadece admin rolü" şartına daraltır (asıl güvenlik açığı buradaydı)
--   4. Müşteri favorilerini cihazlar arası senkronlamak için customer_favorites tablosu ekler

-- 1) Roller
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);

-- Yeni kayıt olan her kullanıcı için otomatik 'customer' profili oluştur
-- search_path'i açıkça 'public' olarak ayarlamak şart: bu trigger auth şeması bağlamında
-- çalışır ve public.profiles'ı şema öneki olmadan bulamayabilir ("Database error saving new user")
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role) values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Var olan kullanıcılar için profil oluştur; admin@hanegal.com -> admin, diğerleri -> customer
insert into profiles (id, role)
select id, case when email = 'admin@hanegal.com' then 'admin' else 'customer' end
from auth.users
on conflict (id) do update set role = excluded.role;

-- 1.5) site_settings tablosunu garantiye al (bazı projelerde bu tablo hiç oluşturulmamış olabilir;
-- kod tarafı hata vermeden DEFAULT_SETTINGS'e düştüğü için fark edilmemiş olabilir)
create table if not exists site_settings (
  id integer primary key default 1,
  whatsapp_number text not null default '905436190346',
  hero_tagline_tr text not null default 'Türkiye''nin önde gelen jant kapağı üreticisi. Kalite ve uyum bir arada.',
  hero_tagline_en text not null default 'Leading wheel cover manufacturer in Turkey. Quality and compatibility together.',
  footer_slogan_tr text not null default 'Kaliteli jant kapağı, uygun fiyat.',
  footer_slogan_en text not null default 'Quality wheel covers at the right price.',
  updated_at timestamp with time zone default now(),
  constraint site_settings_single_row check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

drop policy if exists "Public read settings" on site_settings;
create policy "Public read settings" on site_settings for select using (true);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists site_settings_updated_at on site_settings;
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- 2) products / site_settings yazma yetkisini sadece admin rolüyle sınırla
drop policy if exists "Admin insert" on products;
drop policy if exists "Admin update" on products;
drop policy if exists "Admin delete" on products;

create policy "Admin insert" on products for insert
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update" on products for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete" on products for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admin update settings" on site_settings;
create policy "Admin update settings" on site_settings for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 3) Storage: ürün görsellerini sadece admin yükleyip silebilsin
drop policy if exists "Admin upload" on storage.objects;
drop policy if exists "Admin update" on storage.objects;
drop policy if exists "Admin delete" on storage.objects;

create policy "Admin upload" on storage.objects for insert
  with check (bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin update" on storage.objects for update
  using (bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 4) Müşteri favorileri (cihazlar arası senkron)
-- product_id metin tutulur çünkü ürünler hem Supabase (uuid) hem de products.json fallback'ten (sayısal id) gelebiliyor
create table if not exists customer_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

alter table customer_favorites enable row level security;

drop policy if exists "Users read own favorites" on customer_favorites;
drop policy if exists "Users insert own favorites" on customer_favorites;
drop policy if exists "Users delete own favorites" on customer_favorites;

create policy "Users read own favorites" on customer_favorites for select using (auth.uid() = user_id);
create policy "Users insert own favorites" on customer_favorites for insert with check (auth.uid() = user_id);
create policy "Users delete own favorites" on customer_favorites for delete using (auth.uid() = user_id);
