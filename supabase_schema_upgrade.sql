-- ========================================================================
-- MyDocBD - Database Schema Upgrade & Optimization SQL Script
-- Run this script in your Supabase Dashboard > SQL Editor
-- ========================================================================

-- 1. Ensure `chambers` table has all granular location and timing attributes
CREATE TABLE IF NOT EXISTS public.chambers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
    room_no TEXT,
    floor TEXT,
    building_info TEXT,
    visiting_time TEXT,
    fee_new NUMERIC DEFAULT 0,
    fee_old NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS room_no TEXT;
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS floor TEXT;
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS building_info TEXT;
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS visiting_time TEXT;
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS fee_new NUMERIC DEFAULT 0;
ALTER TABLE public.chambers ADD COLUMN IF NOT EXISTS fee_old NUMERIC DEFAULT 0;

-- 2. Ensure `appointments` table has all confirmation and assignment attributes
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    chamber_id UUID REFERENCES public.chambers(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_age INT,
    patient_phone TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Rejected')),
    serial_no TEXT,
    assigned_facility_name TEXT,
    assigned_room_no TEXT,
    assigned_floor TEXT,
    assigned_building TEXT,
    confirmed_visiting_time TEXT,
    special_instructions TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure confirmation columns exist on existing table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS serial_no TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assigned_facility_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assigned_room_no TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assigned_floor TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assigned_building TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS confirmed_visiting_time TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Ensure `promo_banners` table has correct columns and RLS Policies
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

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public Read Active Banners" ON public.promo_banners;
DROP POLICY IF EXISTS "Public can view active promo banners" ON public.promo_banners;
CREATE POLICY "Public Read Active Banners" ON public.promo_banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin Full Banners Access" ON public.promo_banners;
CREATE POLICY "Admin Full Banners Access" ON public.promo_banners FOR ALL USING (true) WITH CHECK (true);
