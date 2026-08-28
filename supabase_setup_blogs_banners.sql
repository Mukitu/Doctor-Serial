-- ========================================================================
-- MyDocBD (mydocbd.com) - Additional Supabase Schema & Storage Migrations
-- This script creates the Blogs, Promo Banners, and Storage Bucket rules.
-- It is completely idempotent and safe to run multiple times.
-- ========================================================================

-- 1. Create Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cover_image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT,
    author TEXT DEFAULT 'MyDocBD মেডিকেল টিম',
    is_published BOOLEAN DEFAULT true,
    views INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Promo Banners Table (Aligned with client types & placement slots)
CREATE TABLE IF NOT EXISTS public.promo_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT,
    slot TEXT NOT NULL CHECK (slot IN ('hero', 'directory', 'sidebar', 'footer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- 4. Public SELECT Policies (Anonymous read access)
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" ON public.blogs
    FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "Public can view active promo banners" ON public.promo_banners;
CREATE POLICY "Public can view active promo banners" ON public.promo_banners
    FOR SELECT TO public USING (is_active = true);

-- 5. Admin Write Policies (Authenticated users with admin/super_admin role)
DROP POLICY IF EXISTS "Admins full access to blogs" ON public.blogs;
CREATE POLICY "Admins full access to blogs" ON public.blogs
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access to promo_banners" ON public.promo_banners;
CREATE POLICY "Admins full access to promo_banners" ON public.promo_banners
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- 6. Storage Buckets Creation (Idempotent INSERTs into storage.buckets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('blog-images', 'blog-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('banner-images', 'banner-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('doctor-images', 'doctor-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. Storage RLS Security Policies
-- Enable RLS on storage if not already enabled (by default, Supabase Storage enables RLS)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out to prevent ownership permissions errors (ERROR: 42501)

-- Allow public anonymous read access to all public buckets
DROP POLICY IF EXISTS "Public select for public images" ON storage.objects;
CREATE POLICY "Public select for public images" ON storage.objects
    FOR SELECT TO public USING (bucket_id IN ('blog-images', 'banner-images', 'doctor-images'));

-- Allow authorized admin profiles to upload (INSERT) image assets
DROP POLICY IF EXISTS "Admin insert for images" ON storage.objects;
CREATE POLICY "Admin insert for images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id IN ('blog-images', 'banner-images', 'doctor-images') 
        AND public.is_admin(auth.uid())
    );

-- Allow authorized admin profiles to update (UPDATE) image assets
DROP POLICY IF EXISTS "Admin update for images" ON storage.objects;
CREATE POLICY "Admin update for images" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id IN ('blog-images', 'banner-images', 'doctor-images') 
        AND public.is_admin(auth.uid())
    );

-- Allow authorized admin profiles to delete (DELETE) image assets
DROP POLICY IF EXISTS "Admin delete for images" ON storage.objects;
CREATE POLICY "Admin delete for images" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id IN ('blog-images', 'banner-images', 'doctor-images') 
        AND public.is_admin(auth.uid())
    );
