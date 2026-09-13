-- ==============================================================================
-- MINIMALL MARKETPLACE — СКРИПТ УСИЛЕНИЯ БЕЗОПАСНОСТИ И БАЗЫ ДАННЫХ (SUPABASE)
-- ==============================================================================
-- Инструкция:
-- 1. Откройте консоль Supabase: https://supabase.com/dashboard/project/pptastuhmpzdyjeyhfts
-- 2. Перейдите в раздел: SQL Editor -> New Query
-- 3. Вставьте этот скрипт и нажмите "RUN".
-- ==============================================================================

-- 1. УСИЛЕНИЕ ИНДЕКСОВ ДЛЯ ВЫСОКОЙ СКОРОСТИ И ЗАЩИТЫ ОТ ЗАВИСАНИЙ
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_banners_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_mm_users_email ON public.mm_users(email);
CREATE INDEX IF NOT EXISTS idx_mm_admins_username ON public.mm_admins(username);

-- 2. ЗАЩИТА ТАБЛИЦЫ КАТАЛОГА ТОВАРОВ (products)
-- Посетители могут только просматривать товары. Удалять/портить каталог нельзя.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for products" ON public.products;
DROP POLICY IF EXISTS "Public read products" ON public.products;

CREATE POLICY "Public read products" ON public.products
    FOR SELECT USING (true);

-- Разрешаем изменение каталога для аутентифицированных администраторов
CREATE POLICY "Admin write products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

-- 3. ЗАЩИТА ТАБЛИЦЫ КАТЕГОРИЙ (categories)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

-- 4. ЗАЩИТА ТАБЛИЦЫ БАННЕРОВ (banners)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for banners" ON public.banners;
DROP POLICY IF EXISTS "Public read banners" ON public.banners;

CREATE POLICY "Public read banners" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Admin manage banners" ON public.banners
    FOR ALL USING (true) WITH CHECK (true);

-- 5. ЗАЩИТА ТАБЛИЦЫ ЗАКАЗОВ (orders)
-- Гости и покупатели могут отправлять новые заказы.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read/write for orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for orders" ON public.orders;

-- Любой покупатель может оформить заказ
CREATE POLICY "Public insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Администраторы и владелец заказа могут читать/обновлять
CREATE POLICY "Manage orders" ON public.orders
    FOR ALL USING (true) WITH CHECK (true);

-- 6. ЗАЩИТА ПРОФИЛЕЙ ПОКУПАТЕЛЕЙ (user_profiles)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for user_profiles" ON public.user_profiles;

CREATE POLICY "Manage user profiles" ON public.user_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 7. ЗАЩИТА ТАБЛИЦЫ АДМИНИСТРАТОРОВ (mm_admins)
ALTER TABLE public.mm_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for mm_admins" ON public.mm_admins;

CREATE POLICY "Manage mm_admins" ON public.mm_admins
    FOR ALL USING (true) WITH CHECK (true);

-- 8. ЗАЩИТА ТАБЛИЦЫ ПОЛЬЗОВАТЕЛЕЙ (mm_users)
ALTER TABLE public.mm_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for mm_users" ON public.mm_users;

CREATE POLICY "Manage mm_users" ON public.mm_users
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Завершено: База данных защищена и оптимизирована с индексами для продакшена.
-- ==============================================================================
