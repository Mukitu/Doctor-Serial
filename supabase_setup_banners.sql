-- ========================================================================
-- MyDocBD - Promo Banners & Ads System SQL Schema & Storage Setup
-- Run this script in your Supabase Dashboard > SQL Editor
-- ========================================================================

-- 1. Create promo_banners table (Idempotent)
CREATE TABLE IF NOT EXISTS public.promo_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    banner_image TEXT NOT NULL,
    target_url TEXT,
    placement_slot TEXT NOT NULL DEFAULT 'home_hero_top',
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS placement_slot TEXT DEFAULT 'home_hero_top';
ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 1;
ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.promo_banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Policy 1 (Public Read):
DROP POLICY IF EXISTS "Public Read Active Banners" ON public.promo_banners;
DROP POLICY IF EXISTS "Public can view active promo banners" ON public.promo_banners;
CREATE POLICY "Public Read Active Banners" ON public.promo_banners FOR SELECT USING (is_active = true);

-- Policy 2 (Admin Full Access):
DROP POLICY IF EXISTS "Admin Full Banners Access" ON public.promo_banners;
DROP POLICY IF EXISTS "Admins full access to promo_banners" ON public.promo_banners;
CREATE POLICY "Admin Full Banners Access" ON public.promo_banners FOR ALL USING (true) WITH CHECK (true);

-- 3. Storage Bucket & Public Read Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banner-images', 'banner-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public Storage Read Policy for Objects
DROP POLICY IF EXISTS "Public Read Banner Images" ON storage.objects;
CREATE POLICY "Public Read Banner Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'banner-images');

-- Admin Upload/Update/Delete Storage Policies
DROP POLICY IF EXISTS "Admin Upload Banner Images" ON storage.objects;
CREATE POLICY "Admin Upload Banner Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Admin Update Banner Images" ON storage.objects;
CREATE POLICY "Admin Update Banner Images" ON storage.objects FOR UPDATE USING (bucket_id = 'banner-images');

DROP POLICY IF EXISTS "Admin Delete Banner Images" ON storage.objects;
CREATE POLICY "Admin Delete Banner Images" ON storage.objects FOR DELETE USING (bucket_id = 'banner-images');
