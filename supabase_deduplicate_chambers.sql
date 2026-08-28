-- ========================================================================
-- MyDocBD (mydocbd.com) - Database Deduplication & Foreign Key Cleanup SQL
-- Run this script in your Supabase SQL Editor
-- ========================================================================

-- 1. Ensure Foreign Key Constraint between chambers and doctors with ON DELETE CASCADE
DO $$
BEGIN
    -- Check if constraint already exists, if so drop and recreate to ensure ON DELETE CASCADE
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chambers_doctor_id_fkey'
    ) THEN
        ALTER TABLE public.chambers DROP CONSTRAINT chambers_doctor_id_fkey;
    END IF;

    ALTER TABLE public.chambers 
    ADD CONSTRAINT chambers_doctor_id_fkey 
    FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;
END $$;

-- 2. Identify & Merge Duplicate Doctor Entries based on BMDC Number or Name
-- Step A: Reassign any chambers associated with duplicate doctors to the primary doctor record (oldest record)
WITH ranked_doctors AS (
    SELECT 
        id,
        COALESCE(NULLIF(TRIM(bmdc_number), ''), LOWER(TRIM(name))) as dedup_key,
        ROW_NUMBER() OVER (
            PARTITION BY COALESCE(NULLIF(TRIM(bmdc_number), ''), LOWER(TRIM(name))) 
            ORDER BY created_at ASC, id ASC
        ) as rn,
        FIRST_VALUE(id) OVER (
            PARTITION BY COALESCE(NULLIF(TRIM(bmdc_number), ''), LOWER(TRIM(name))) 
            ORDER BY created_at ASC, id ASC
        ) as primary_id
    FROM public.doctors
),
duplicates AS (
    SELECT id, primary_id FROM ranked_doctors WHERE rn > 1
)
UPDATE public.chambers
SET doctor_id = duplicates.primary_id
FROM duplicates
WHERE chambers.doctor_id = duplicates.id;

-- Step B: Delete duplicate doctor entries (their chambers have now been safely migrated to the primary doctor)
WITH ranked_doctors AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY COALESCE(NULLIF(TRIM(bmdc_number), ''), LOWER(TRIM(name))) 
            ORDER BY created_at ASC, id ASC
        ) as rn
    FROM public.doctors
)
DELETE FROM public.doctors
WHERE id IN (SELECT id FROM ranked_doctors WHERE rn > 1);

-- 3. Validation comment for visiting_days column
COMMENT ON COLUMN public.chambers.visiting_days IS 'Structured comma-separated list or JSON array of visiting days (e.g. Saturday, Monday, Wednesday or শনিবার, সোমবার, বুধবার)';
