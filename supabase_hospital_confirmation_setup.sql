-- ====================================================================
-- MyDocBD: Supabase SQL Schema Upgrade for Hospital & Room Assignment
-- Copy & Run this SQL in your Supabase SQL Editor (SQL Query Runner)
-- ====================================================================

-- 1. Ensure columns exist on chambers table
ALTER TABLE chambers 
ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS room_no TEXT,
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS building_info TEXT,
ADD COLUMN IF NOT EXISTS visiting_time TEXT;

-- 2. Ensure hospital assignment & serial approval columns exist on appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS assigned_facility_name TEXT,
ADD COLUMN IF NOT EXISTS assigned_room_no TEXT,
ADD COLUMN IF NOT EXISTS assigned_floor TEXT,
ADD COLUMN IF NOT EXISTS assigned_building TEXT,
ADD COLUMN IF NOT EXISTS confirmed_visiting_time TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 3. Create indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_assigned_facility ON appointments(assigned_facility_name);
CREATE INDEX IF NOT EXISTS idx_chambers_facility_id ON chambers(facility_id);
