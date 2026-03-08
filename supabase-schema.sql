-- =====================================================
-- GOOD VIBES - Esquema de base de datos (Supabase)
-- Corré esto en el SQL Editor de Supabase
-- =====================================================

-- Tabla de productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null default 'otro',
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  created_at timestamptz default now()
);

-- Índices para búsquedas rápidas
create index if not exists products_category_idx on products(category);
create index if not exists products_created_at_idx on products(created_at desc);

-- Row Level Security: cualquiera puede leer, nadie puede escribir desde el cliente
alter table products enable row level security;

create policy "Public read access" on products
  for select using (true);

-- Las escrituras se hacen desde el server con service role key (bypassa RLS)

-- =====================================================
-- Storage bucket para imágenes
-- =====================================================
-- Hacé esto desde el panel de Supabase > Storage > New bucket:
-- Nombre: product-images
-- Public: true
-- 
-- Luego en Policies del bucket agregá:
-- Allow public read: para que las imágenes sean públicas
-- =====================================================
