-- ====================================================================
-- SUPABASE MIGRATION: Auto-Create Tables & Enable Realtime Sync
-- Application: MyDocBD (mydocbd.com)
-- Safe & Idempotent: Can be executed safely in Supabase SQL Editor
-- ====================================================================

-- 1. Create missing tables if they don't exist yet
CREATE TABLE IF NOT EXISTS public.districts (
    id TEXT PRIMARY KEY,
    name_bn TEXT,
    name_en TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.specialties (
    id TEXT PRIMARY KEY,
    name_bn TEXT,
    name_en TEXT,
    icon_name TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.facilities (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    district_id TEXT,
    address TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT,
    bmdc_number TEXT,
    sub_specialty TEXT,
    degrees TEXT,
    specialty_id TEXT,
    district_id TEXT,
    hospital_name TEXT,
    phone TEXT,
    email TEXT,
    experience_years INT DEFAULT 0,
    display_priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chambers (
    id TEXT PRIMARY KEY,
    doctor_id TEXT,
    facility_id TEXT,
    facility_name TEXT,
    address TEXT,
    visiting_days TEXT[],
    visiting_hours TEXT,
    fee NUMERIC DEFAULT 0,
    serial_phone TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    booking_code TEXT,
    doctor_id TEXT,
    chamber_id TEXT,
    patient_name TEXT,
    patient_phone TEXT,
    patient_age TEXT,
    patient_gender TEXT,
    preferred_date TEXT,
    status TEXT DEFAULT 'pending',
    assigned_facility_name TEXT,
    assigned_room_no TEXT,
    assigned_floor TEXT,
    assigned_building TEXT,
    confirmed_visiting_time TEXT,
    special_instructions TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    content TEXT,
    author TEXT,
    category TEXT,
    image_url TEXT,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    is_published BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.promo_banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    image_url TEXT,
    target_url TEXT,
    placement_slot TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    doctor_id TEXT,
    patient_name TEXT,
    rating INT DEFAULT 5,
    comment TEXT,
    review_text TEXT,
    is_approved BOOLEAN DEFAULT true,
    is_admin_created BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns if missing
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS sub_specialty TEXT;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS booking_code TEXT,
ADD COLUMN IF NOT EXISTS assigned_facility_name TEXT,
ADD COLUMN IF NOT EXISTS assigned_room_no TEXT,
ADD COLUMN IF NOT EXISTS assigned_floor TEXT,
ADD COLUMN IF NOT EXISTS assigned_building TEXT,
ADD COLUMN IF NOT EXISTS confirmed_visiting_time TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_phone ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_code ON public.appointments(booking_code);

-- 4. Enable RLS or disable for smooth open operation
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chambers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles DISABLE ROW LEVEL SECURITY;

-- 5. Safely Enable Realtime for all tables (Standard Postgres PL/pgSQL block)
DO $$
DECLARE
    tbl TEXT;
    tbls TEXT[] := ARRAY['appointments', 'doctors', 'chambers', 'specialties', 'facilities', 'districts', 'blogs', 'promo_banners', 'reviews', 'admin_profiles'];
BEGIN
    FOR tbl IN SELECT unnest(tbls) LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if table already exists in publication or minor issue
            NULL;
        END;
    END LOOP;
END $$;

-- 6. Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Complete!
