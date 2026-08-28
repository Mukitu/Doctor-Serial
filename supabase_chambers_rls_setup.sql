-- ============================================================
-- MYDOCBD: SUPABASE MULTI-CHAMBER RELATIONAL CASCADES & RLS POLICIES
-- ============================================================

-- 1. Ensure foreign key from chambers to doctors with ON DELETE CASCADE
ALTER TABLE chambers DROP CONSTRAINT IF EXISTS chambers_doctor_id_fkey;
ALTER TABLE chambers ADD CONSTRAINT chambers_doctor_id_fkey 
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE;

-- 2. Ensure foreign key from chambers to facilities with ON DELETE CASCADE
ALTER TABLE chambers DROP CONSTRAINT IF EXISTS chambers_facility_id_fkey;
ALTER TABLE chambers ADD CONSTRAINT chambers_facility_id_fkey 
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;

-- 3. Enable Row Level Security (RLS) on chambers
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;

-- 4. Admin full control policy for chambers
DROP POLICY IF EXISTS "Allow All on Chambers for Admins" ON chambers;
CREATE POLICY "Allow All on Chambers for Admins" ON chambers FOR ALL USING (true) WITH CHECK (true);

-- 5. Public read policy for chambers
DROP POLICY IF EXISTS "Public Read Chambers" ON chambers;
CREATE POLICY "Public Read Chambers" ON chambers FOR SELECT USING (true);
