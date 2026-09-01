-- Fix Row-Level Security (RLS) policies for doctors and chambers tables in Supabase
-- Run this script in your Supabase SQL Editor to enable full read/write access for doctors and chambers tables.

ALTER TABLE IF EXISTS public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chambers ENABLE ROW LEVEL SECURITY;

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
