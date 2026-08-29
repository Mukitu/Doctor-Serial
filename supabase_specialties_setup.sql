-- ================================================================
-- MyDocBD - Dynamic Doctor Specialty / Category Management Setup
-- Run this SQL in the Supabase SQL Editor
-- ================================================================

-- 1. Create Storage Bucket for Category Icons
INSERT INTO storage.buckets (id, name, public)
VALUES ('specialty-icons', 'specialty-icons', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read Specialty Icons" ON storage.objects;
CREATE POLICY "Public Read Specialty Icons" ON storage.objects 
FOR SELECT USING (bucket_id = 'specialty-icons');

DROP POLICY IF EXISTS "Admin Manage Specialty Icons" ON storage.objects;
CREATE POLICY "Admin Manage Specialty Icons" ON storage.objects 
FOR ALL USING (bucket_id = 'specialty-icons');

-- 2. Specialties Table Definition
CREATE TABLE IF NOT EXISTS specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_bn TEXT NOT NULL,          -- e.g. "মেডিসিন"
    name_en TEXT NOT NULL,          -- e.g. "Medicine"
    slug TEXT UNIQUE NOT NULL,       -- e.g. "medicine"
    icon_url TEXT,                  -- Uploaded image or CDN link
    icon_name TEXT,                 -- Fallback Lucide icon identifier
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security Policies
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Specialties" ON specialties;
CREATE POLICY "Public Read Specialties" ON specialties FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Specialties Access" ON specialties;
CREATE POLICY "Admin Full Specialties Access" ON specialties FOR ALL USING (true) WITH CHECK (true);
