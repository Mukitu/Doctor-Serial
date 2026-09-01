-- SQL script to support Multiple Categories / Specialties for Doctors in Supabase
-- Run this in your Supabase SQL Editor to add multi-category support for doctor profiles.

-- 1. Add specialty_ids (TEXT[]) and specialties (TEXT[]) columns to doctors table if missing
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialty_ids TEXT[];
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- 2. Automatically populate multi-category arrays for existing single-category doctors
UPDATE public.doctors
SET 
  specialty_ids = ARRAY[specialty_id]::TEXT[],
  specialties = ARRAY[COALESCE((SELECT name_bn FROM public.specialties WHERE id = doctors.specialty_id), 'মেডিসিন')]::TEXT[]
WHERE specialty_id IS NOT NULL AND (specialty_ids IS NULL OR cardinality(specialty_ids) = 0);
