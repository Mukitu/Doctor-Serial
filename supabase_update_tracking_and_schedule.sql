-- ====================================================================
-- SUPABASE MIGRATION: Tracking Link & Doctor Visiting Schedule Restrictions
-- Application: MyDocBD (mydocbd.com)
-- Execute this SQL in Supabase SQL Editor
-- ====================================================================

-- 1. Ensure doctors table has sub_specialty column
ALTER TABLE IF EXISTS public.doctors 
ADD COLUMN IF NOT EXISTS sub_specialty TEXT;

-- 2. Ensure appointments table has all required columns for booking & tracking
ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS booking_code TEXT,
ADD COLUMN IF NOT EXISTS assigned_facility_name TEXT,
ADD COLUMN IF NOT EXISTS assigned_room_no TEXT,
ADD COLUMN IF NOT EXISTS assigned_floor TEXT,
ADD COLUMN IF NOT EXISTS assigned_building TEXT,
ADD COLUMN IF NOT EXISTS confirmed_visiting_time TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Create index for fast phone & booking code tracking lookup
CREATE INDEX IF NOT EXISTS idx_appointments_patient_phone ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_booking_code ON public.appointments(booking_code);

-- 4. Disable RLS or grant full access to public role for seamless booking & tracking
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chambers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facilities DISABLE ROW LEVEL SECURITY;

-- Grant public full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Complete!
