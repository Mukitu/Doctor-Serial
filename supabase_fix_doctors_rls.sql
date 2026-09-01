-- Fix Row-Level Security (RLS) policies for all tables in Supabase (Doctors, Chambers, Appointments, Reviews, etc.)
-- Run this script in your Supabase SQL Editor to enable full READ, INSERT, UPDATE, and DELETE access.

ALTER TABLE IF EXISTS public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Doctors Table Policies
DROP POLICY IF EXISTS "Public Read Active Doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public Read Doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public can view active doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins full access doctors" ON public.doctors;
DROP POLICY IF EXISTS "Full access to doctors" ON public.doctors;

CREATE POLICY "Full access to doctors" ON public.doctors
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- 2. Chambers Table Policies
DROP POLICY IF EXISTS "Public Read Chambers" ON public.chambers;
DROP POLICY IF EXISTS "Admins full access chambers" ON public.chambers;
DROP POLICY IF EXISTS "Full access to chambers" ON public.chambers;

CREATE POLICY "Full access to chambers" ON public.chambers
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- 3. Appointments Table Policies
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can select appointments by code or phone" ON public.appointments;
DROP POLICY IF EXISTS "Admin full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Full access to appointments" ON public.appointments;

CREATE POLICY "Full access to appointments" ON public.appointments
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- 4. Reviews Table Policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Full access to reviews" ON public.reviews;

CREATE POLICY "Full access to reviews" ON public.reviews
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);
