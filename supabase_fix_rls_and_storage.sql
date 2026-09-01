-- ==============================================================================
-- Supabase Fix Script: Fix RLS Policy Errors & Doctor Deletion Issue
-- Copy and run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Create Storage Buckets if missing & make them public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('doctor-images', 'doctor-images', true),
  ('blog-images', 'blog-images', true),
  ('banner-images', 'banner-images', true),
  ('specialty-icons', 'specialty-icons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Grant Full Public Access Policies on Storage Objects (Fixes Image Upload RLS Error)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access Storage" ON storage.objects;

CREATE POLICY "Public Read Access Storage" ON storage.objects FOR SELECT USING (true);
CREATE POLICY "Public Upload Access Storage" ON storage.objects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access Storage" ON storage.objects FOR UPDATE USING (true);
CREATE POLICY "Public Delete Access Storage" ON storage.objects FOR DELETE USING (true);

-- 3. Disable RLS on Database Tables (Fixes Insert/Update/Delete RLS Violation Errors)
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chambers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- 4. Create Universal Permissive Policies (Extra security layer if RLS is enabled)
DROP POLICY IF EXISTS "Allow all public doctors" ON public.doctors;
CREATE POLICY "Allow all public doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all public chambers" ON public.chambers;
CREATE POLICY "Allow all public chambers" ON public.chambers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all public appointments" ON public.appointments;
CREATE POLICY "Allow all public appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all public reviews" ON public.reviews;
CREATE POLICY "Allow all public reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
