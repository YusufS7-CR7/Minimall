-- ==============================================================================
-- MINIMALL — ИСПРАВЛЕНИЕ ТАБЛИЦЫ CATEGORIES (subcategories)
-- ==============================================================================
-- Запустите в: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. Добавить колонку subcategories (если её ещё нет)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '[]'::jsonb;

-- 2. Убедиться что RLS разрешает запись (INSERT/UPDATE/DELETE) для anon-ключа
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories
    FOR SELECT USING (true);

-- 3. Обновить схему кэш
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- После выполнения: нажмите "Сохранить в БД" в Админ -> Категории
-- ==============================================================================
