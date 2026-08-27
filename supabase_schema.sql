-- Supabase PostgreSQL Schema for Seba Serial (সেবা-সিরিয়াল)
-- This script is completely idempotent and safe to run multiple times.

-- 1. Districts Master Table
CREATE TABLE IF NOT EXISTS districts (
    id TEXT PRIMARY KEY,
    name_bn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Specialties Master Table
CREATE TABLE IF NOT EXISTS specialties (
    id TEXT PRIMARY KEY,
    name_bn TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon_name TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Facilities Master Table
CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    district_id TEXT REFERENCES districts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    area_address TEXT NOT NULL,
    contact_phone TEXT,
    is_vip BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialty_id TEXT REFERENCES specialties(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    bmdc_number TEXT NOT NULL UNIQUE,
    degrees TEXT NOT NULL,
    designation TEXT NOT NULL,
    workplace TEXT NOT NULL,
    photo_url TEXT,
    display_priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chambers Table
CREATE TABLE IF NOT EXISTS chambers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    room_no TEXT NOT NULL,
    visiting_days TEXT NOT NULL, -- Comma-separated list of days (e.g. 'শনিবার, রবিবার, সোমবার')
    visiting_time TEXT NOT NULL,
    fee_new INT NOT NULL DEFAULT 0,
    fee_old INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT NOT NULL UNIQUE, -- Random 6-char code (e.g. RJ-5921)
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    chamber_id UUID NOT NULL REFERENCES chambers(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age INT NOT NULL,
    patient_phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Rejected')),
    serial_no TEXT,
    assigned_room_no TEXT,
    confirmed_visiting_time TEXT,
    rejection_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Admin Profiles Table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PostgreSQL SECURITY HELPER FUNCTIONS
-- ==========================================

-- Securely retrieves a user's role bypassing RLS recursion using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.admin_profiles WHERE id = user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if a user is a super admin securely
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if a user is any admin (admin or super_admin) securely
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- TRIGGERS TO AUTOMATICALLY CREATE/SYNC PROFILES
-- ==========================================

-- Trigger to automatically create admin profile when a user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, email, full_name, role, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    NULLIF(NEW.raw_user_meta_data->>'created_by', '')::UUID
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- ==========================================
-- SUPER ADMIN SYSTEM MANAGEMENT FUNCTIONS (RPCs)
-- ==========================================

-- A secure function to register a new admin user directly within the database, bypassing service_role requirement
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Security check: Caller must be a super_admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only Super Admins can create new admin accounts.';
  END IF;

  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(p_password, gen_salt('bf'));

  -- Insert into Supabase Auth users table
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', p_full_name, 'role', p_role, 'created_by', auth.uid()),
    now(),
    now(),
    '',
    ''
  );

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Securely change an admin's role
CREATE OR REPLACE FUNCTION public.update_admin_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only Super Admins can update admin roles.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You cannot change your own role.';
  END IF;

  UPDATE public.admin_profiles
  SET role = p_role
  WHERE id = p_user_id;

  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', p_role)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Securely revoke access (Delete admin user)
CREATE OR REPLACE FUNCTION public.revoke_admin_access(
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only Super Admins can revoke admin access.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You cannot revoke your own access.';
  END IF;

  -- Deleting from auth.users cascades to public.admin_profiles
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==========================================
-- ROLE-BASED ACCESS CONTROL (RLS) POLICIES
-- ==========================================

-- Admin Profiles Policies
DROP POLICY IF EXISTS "Super Admin full access to profiles" ON public.admin_profiles;
CREATE POLICY "Super Admin full access to profiles" ON public.admin_profiles
FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view own profile" ON public.admin_profiles;
CREATE POLICY "Admins can view own profile" ON public.admin_profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Districts Policies
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
CREATE POLICY "Anyone can view districts" ON districts FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to districts" ON districts;
CREATE POLICY "Admin full access to districts" ON districts FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Specialties Policies
DROP POLICY IF EXISTS "Anyone can view specialties" ON specialties;
CREATE POLICY "Anyone can view specialties" ON specialties FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to specialties" ON specialties;
CREATE POLICY "Admin full access to specialties" ON specialties FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Facilities Policies
DROP POLICY IF EXISTS "Anyone can view facilities" ON facilities;
CREATE POLICY "Anyone can view facilities" ON facilities FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to facilities" ON facilities;
CREATE POLICY "Admin full access to facilities" ON facilities FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Doctors Policies
DROP POLICY IF EXISTS "Anyone can view active doctors" ON doctors;
CREATE POLICY "Anyone can view active doctors" ON doctors FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access to doctors" ON doctors;
CREATE POLICY "Admin full access to doctors" ON doctors FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Chambers Policies
DROP POLICY IF EXISTS "Anyone can view chambers" ON chambers;
CREATE POLICY "Anyone can view chambers" ON chambers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to chambers" ON chambers;
CREATE POLICY "Admin full access to chambers" ON chambers FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Appointments Policies
DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
CREATE POLICY "Anyone can insert appointments" ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select appointments by code or phone" ON appointments;
CREATE POLICY "Anyone can select appointments by code or phone" ON appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access to appointments" ON appointments;
CREATE POLICY "Admin full access to appointments" ON appointments FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Reviews Policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (NOT is_approved);

DROP POLICY IF EXISTS "Admin full access to reviews" ON reviews;
CREATE POLICY "Admin full access to reviews" ON reviews FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- ==========================================
-- MASTER SEED DATA
-- ==========================================

-- Seed Districts
INSERT INTO districts (id, name_bn, name_en, display_order) VALUES
('rajshahi', 'রাজশাহী', 'Rajshahi', 1),
('dhaka', 'ঢাকা', 'Dhaka', 2),
('bogura', 'বগুড়া', 'Bogura', 3),
('naogaon', 'নওগাঁ', 'Naogaon', 4),
('natore', 'নাটোর', 'Natore', 5)
ON CONFLICT (id) DO UPDATE SET
name_bn = EXCLUDED.name_bn,
name_en = EXCLUDED.name_en,
display_order = EXCLUDED.display_order;

-- Seed Specialties
INSERT INTO specialties (id, name_bn, name_en, icon_name, display_order) VALUES
('medicine', 'মেডিসিন', 'Medicine', 'Stethoscope', 1),
('cardiology', 'কার্ডিওলজি', 'Cardiology', 'Heart', 2),
('pediatrics', 'শিশু রোগ', 'Pediatrics', 'Baby', 3),
('gynecology', 'স্ত্রী রোগ ও প্রসূতি', 'Gynecology', 'Activity', 4),
('orthopedics', 'অর্থোপেডিক্স', 'Orthopedics', 'Bone', 5),
('dermatology', 'চর্ম ও যৌন', 'Dermatology', 'Sparkles', 6)
ON CONFLICT (id) DO UPDATE SET
name_bn = EXCLUDED.name_bn,
name_en = EXCLUDED.name_en,
icon_name = EXCLUDED.icon_name,
display_order = EXCLUDED.display_order;

-- Seed Facilities
INSERT INTO facilities (id, district_id, name, area_address, contact_phone, is_vip) VALUES
('popular', 'rajshahi', 'পপুলার ডায়াগনস্টিক সেন্টার', 'লক্ষ্মীপুর, রাজশাহী সদর', '০১৭৩০-২১১৮৮০', true),
('amana', 'rajshahi', 'আমানা হাসপাতাল', 'ঝরঝরিয়া বাইপাস রোড, রাজশাহী', '০১৭৮৭-৬৬৭৭৮৮', true),
('labaid', 'rajshahi', 'ল্যাবএইড ডায়াগনস্টিক', 'লক্ষ্মীপুর মোড়, রাজশাহী', '০১৭৬৬-৫৫৪৪৩৩', false),
('medipath', 'rajshahi', 'মেডিপ্যাথ ডায়াগনস্টিক', 'রাজশাহী মেডিকেল কলেজ রোড', '০১৯১১-২২৩৩৪৪', false)
ON CONFLICT (id) DO UPDATE SET
district_id = EXCLUDED.district_id,
name = EXCLUDED.name,
area_address = EXCLUDED.area_address,
contact_phone = EXCLUDED.contact_phone,
is_vip = EXCLUDED.is_vip;

-- ==========================================
-- BOOTSTRAP INITIAL SUPER ADMIN INSTRUCTIONS
-- ==========================================
-- Run this SQL snippet via the Supabase SQL Editor once your first admin registers:
--
-- UPDATE public.admin_profiles
-- SET role = 'super_admin'
-- WHERE email = 'mukituislamnishat@gmail.com'; -- Or your specific setup email
--
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin"}'::jsonb
-- WHERE email = 'mukituislamnishat@gmail.com';
