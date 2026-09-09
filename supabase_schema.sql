-- ================================================================
-- MINI-MALL.UZ — Схема базы данных для Supabase (PostgreSQL)
-- Запустите этот скрипт в Supabase -> SQL Editor -> New query -> Run
-- Скрипт полностью идемпотентен (его можно запускать повторно много раз)
-- ================================================================

-- 0. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ (mm_users) — кастомная email/пароль авторизация
CREATE TABLE IF NOT EXISTS public.mm_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,   -- В продакшене хранить хэш (bcrypt)!
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mm_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for mm_users" ON public.mm_users;
CREATE POLICY "Enable all for mm_users" ON public.mm_users
    FOR ALL USING (true) WITH CHECK (true);

-- 1. ТАБЛИЦА КАТЕГОРИЙ (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    label_ru TEXT NOT NULL,
    label_uz TEXT NOT NULL,
    icon TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ТАБЛИЦА ТОВАРОВ (products)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_uz TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price BIGINT NOT NULL,
    old_price BIGINT,
    image TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    voltage TEXT,
    power TEXT,
    type TEXT DEFAULT 'Сетевой',
    desc_ru TEXT,
    desc_uz TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    badge TEXT,
    in_stock BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ТАБЛИЦА ЗАКАЗОВ (orders)
--    user_id — ID покупателя из user_profiles (NULL = гость)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'shipping', 'completed', 'cancelled')),
    user_id TEXT
);

-- 4. ТАБЛИЦА БАННЕРОВ (banners)
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title_ru TEXT NOT NULL,
    title_uz TEXT NOT NULL,
    desc_ru TEXT,
    desc_uz TEXT,
    image TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT true,
    badge1 TEXT,
    badge2 TEXT,
    badge3 TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ПРОФИЛИ ПОКУПАТЕЛЕЙ (user_profiles)
--    Хранит данные доставки для быстрого повторного заказа
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    city TEXT DEFAULT 'Ташкент',
    address TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ТАБЛИЦА АДМИНИСТРАТОРОВ (mm_admins)
CREATE TABLE IF NOT EXISTS public.mm_admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'manager')),
    is_super_admin BOOLEAN DEFAULT false,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Добавление главного супер-администратора по умолчанию (если еще нет)
INSERT INTO public.mm_admins (id, username, name, password, role, is_super_admin, permissions, is_active)
VALUES (
    'superadmin-1',
    'admin',
    'Главный Администратор',
    'admin123',
    'superadmin',
    true,
    '["all", "products_view", "products_create", "products_edit", "products_delete", "products_export", "orders_view", "orders_edit", "banners_manage", "admins_manage", "system_settings"]'::jsonb,
    true
)
ON CONFLICT (username) DO NOTHING;

-- ================================================================
-- НАСТРОЙКА БЕЗОПАСНОСТИ (Row Level Security - RLS)
-- ================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mm_admins ENABLE ROW LEVEL SECURITY;

-- Категории: публичное чтение
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (true);

-- Товары: публичное чтение, вставка/обновление для anon
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all for products" ON public.products;
CREATE POLICY "Enable all for products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

-- Баннеры: публичное чтение, полное управление
DROP POLICY IF EXISTS "Public read banners" ON public.banners;
CREATE POLICY "Public read banners" ON public.banners
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all for banners" ON public.banners;
CREATE POLICY "Enable all for banners" ON public.banners
    FOR ALL USING (true) WITH CHECK (true);

-- Заказы: полное управление (фильтрация по user_id на клиенте)
DROP POLICY IF EXISTS "Enable insert for orders" ON public.orders;
CREATE POLICY "Enable insert for orders" ON public.orders
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read/write for orders" ON public.orders;
CREATE POLICY "Enable read/write for orders" ON public.orders
    FOR ALL USING (true) WITH CHECK (true);

-- Профили: полное управление (anon-ключ, фильтрация на клиенте)
DROP POLICY IF EXISTS "Enable all for user_profiles" ON public.user_profiles;
CREATE POLICY "Enable all for user_profiles" ON public.user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Администраторы: чтение и управление через anon API
DROP POLICY IF EXISTS "Enable all for mm_admins" ON public.mm_admins;
CREATE POLICY "Enable all for mm_admins" ON public.mm_admins
    FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- ХРАНИЛИЩЕ ФАЙЛОВ (SUPABASE STORAGE: minimall-media)
-- ================================================================
-- Создаем публичный бакет для картинок товаров и баннеров
INSERT INTO storage.buckets (id, name, public)
VALUES ('minimall-media', 'minimall-media', true)
ON CONFLICT (id) DO NOTHING;

-- Политики доступа к картинкам
DROP POLICY IF EXISTS "Public Access minimall-media" ON storage.objects;
CREATE POLICY "Public Access minimall-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'minimall-media');

DROP POLICY IF EXISTS "Public Upload minimall-media" ON storage.objects;
CREATE POLICY "Public Upload minimall-media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'minimall-media');

DROP POLICY IF EXISTS "Public Update minimall-media" ON storage.objects;
CREATE POLICY "Public Update minimall-media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'minimall-media');

DROP POLICY IF EXISTS "Public Delete minimall-media" ON storage.objects;
CREATE POLICY "Public Delete minimall-media" ON storage.objects
    FOR DELETE USING (bucket_id = 'minimall-media');
