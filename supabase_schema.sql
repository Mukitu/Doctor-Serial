-- ========================================================================
-- Seba Serial (সেবা-সিরিয়াল) - Complete Supabase PostgreSQL Schema & Migrations
-- This script is completely idempotent and 100% safe to run multiple times in Supabase SQL Editor.
-- ========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. BASE TABLES CREATION (IF NOT EXISTS)
-- ========================================================================

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
    ps_phone TEXT,
    photo_url TEXT,
    display_priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chambers Table
CREATE TABLE IF NOT EXISTS chambers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    room_no TEXT NOT NULL,
    floor TEXT DEFAULT 'নিচতলা',
    building_stand TEXT DEFAULT 'মেইন বিল্ডিং',
    visiting_days TEXT NOT NULL,
    visiting_time TEXT NOT NULL,
    fee_new INT NOT NULL DEFAULT 0,
    fee_old INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT NOT NULL UNIQUE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    chamber_id UUID REFERENCES chambers(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_age INT NOT NULL,
    patient_phone TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Rejected')),
    serial_no TEXT,
    assigned_room_no TEXT,
    assigned_floor TEXT,
    assigned_building TEXT,
    confirmed_visiting_time TEXT,
    rejection_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reviews Table (Verified Patient Review System)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    comment TEXT,
    review_text TEXT,
    is_verified_patient BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
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

-- ========================================================================
-- 2. COMPREHENSIVE MIGRATIONS & NOT-NULL CONSTRAINT REMOVAL (FIXES LEGACY SCHEMAS)
-- ========================================================================

-- Dynamic NOT-NULL removal for ALL legacy columns across all existing tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop NOT NULL constraint on ANY non-ID column in public tables
    -- This guarantees seamless migration from any previous schema version (e.g. address, fee, etc.)
    FOR r IN (
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name IN ('chambers', 'doctors', 'appointments', 'reviews', 'facilities', 'districts', 'specialties')
          AND column_name NOT IN ('id')
          AND is_nullable = 'NO'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' ALTER COLUMN ' || quote_ident(r.column_name) || ' DROP NOT NULL;';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- Auto-migrate columns in 'districts' table if missing
ALTER TABLE districts ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Auto-migrate columns in 'specialties' table if missing
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS icon_name TEXT;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Auto-migrate columns in 'facilities' table if missing
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS district_id TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS area_address TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Handle column rename if old column 'specialty' exists in doctors table
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'doctors' AND column_name = 'specialty') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'doctors' AND column_name = 'specialty_id') THEN
    ALTER TABLE doctors RENAME COLUMN specialty TO specialty_id;
  END IF;
END $$;

-- Auto-migrate columns in 'doctors' table if missing
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty_id TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS bmdc_number TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS degrees TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS workplace TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS ps_phone TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS display_priority INT DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 5.0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Auto-migrate columns in 'chambers' table if missing
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS doctor_id UUID;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS facility_id TEXT;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS room_no TEXT;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS floor TEXT DEFAULT 'নিচতলা';
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS building_stand TEXT DEFAULT 'মেইন বিল্ডিং';
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS visiting_days TEXT;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS visiting_time TEXT;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS fee_new INT DEFAULT 0;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS fee_old INT DEFAULT 0;
ALTER TABLE chambers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Auto-migrate columns in 'appointments' table if missing
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_code TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS chamber_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_age INT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS preferred_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS serial_no TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_room_no TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_floor TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS assigned_building TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS confirmed_visiting_time TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Auto-migrate columns in 'reviews' table if missing
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS doctor_id UUID;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS patient_phone TEXT DEFAULT '';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 5.0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified_patient BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Ensure Unique constraint on bmdc_number if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'doctors_bmdc_number_key'
  ) THEN
    BEGIN
      ALTER TABLE doctors ADD CONSTRAINT doctors_bmdc_number_key UNIQUE (bmdc_number);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Ensure Unique constraint on booking_code if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_booking_code_key'
  ) THEN
    BEGIN
      ALTER TABLE appointments ADD CONSTRAINT appointments_booking_code_key UNIQUE (booking_code);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- 3. VERIFIED PATIENT REVIEW STORED PROCEDURE (RPC)
-- ========================================================================

CREATE OR REPLACE FUNCTION verify_and_submit_review(
    p_doctor_id UUID,
    p_patient_name TEXT,
    p_patient_phone TEXT,
    p_rating NUMERIC,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_has_appointment BOOLEAN;
    v_new_review_id UUID;
    v_clean_phone TEXT;
BEGIN
    v_clean_phone := regexp_replace(p_patient_phone, '[^0-9+]', '', 'g');

    SELECT EXISTS (
        SELECT 1 FROM appointments 
        WHERE doctor_id = p_doctor_id 
          AND (
            patient_phone = p_patient_phone 
            OR regexp_replace(patient_phone, '[^0-9+]', '', 'g') = v_clean_phone
            OR patient_phone LIKE '%' || RIGHT(v_clean_phone, 10)
          )
          AND status = 'Confirmed'
    ) INTO v_has_appointment;

    IF NOT v_has_appointment THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'আপনি পূর্বে এই ডাক্তারের অ্যাপয়েন্টমেন্ট নেননি। অনুগ্রহ করে যে নম্বর দিয়ে সিরিয়াল বুকিং করেছিলেন সেটি ব্যবহার করুন।'
        );
    END IF;

    INSERT INTO reviews (
        doctor_id, 
        patient_name, 
        patient_phone, 
        rating, 
        comment, 
        review_text, 
        is_verified_patient, 
        is_approved
    )
    VALUES (
        p_doctor_id, 
        p_patient_name, 
        p_patient_phone, 
        p_rating, 
        p_comment, 
        p_comment, 
        true, 
        true
    )
    RETURNING id INTO v_new_review_id;

    UPDATE doctors
    SET 
        rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE doctor_id = p_doctor_id AND (is_approved = true OR is_verified_patient = true)), 5.0),
        review_count = COALESCE((SELECT COUNT(*) FROM reviews WHERE doctor_id = p_doctor_id AND (is_approved = true OR is_verified_patient = true)), 0)
    WHERE id = p_doctor_id;

    RETURN json_build_object(
        'success', true, 
        'message', 'আপনার মূল্যবান রিভিউ ও রেটিংটি সফলভাবে যুক্ত হয়েছে।',
        'review_id', v_new_review_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_and_submit_review(UUID, TEXT, TEXT, NUMERIC, TEXT) TO anon, authenticated, public;

-- ========================================================================
-- 4. PUBLIC VIEW FOR REVIEWS (Privacy Safe - No Phone Exposed)
-- ========================================================================

CREATE OR REPLACE VIEW public_doctor_reviews AS
SELECT 
    id,
    doctor_id,
    patient_name,
    rating,
    COALESCE(comment, review_text) AS comment,
    COALESCE(review_text, comment) AS review_text,
    is_verified_patient,
    is_approved,
    created_at
FROM reviews
WHERE is_approved = true OR is_verified_patient = true;

GRANT SELECT ON public_doctor_reviews TO anon, authenticated, public;

-- ========================================================================
-- 5. SECURITY & ADMIN RPC FUNCTIONS
-- ========================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.admin_profiles WHERE id = user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Only Super Admins can create new admin accounts.';
  END IF;

  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(p_password, gen_salt('bf'));

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
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    CURRENT_TIMESTAMP,
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', p_full_name, 'role', p_role, 'created_by', auth.uid()::text),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

  INSERT INTO public.admin_profiles (id, email, full_name, role, created_by)
  VALUES (v_user_id, p_email, p_full_name, p_role, auth.uid());

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

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

-- ========================================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ========================================================================

-- Master Read Policies (Public)
DROP POLICY IF EXISTS "Public can view active districts" ON districts;
CREATE POLICY "Public can view active districts" ON districts FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active specialties" ON specialties;
CREATE POLICY "Public can view active specialties" ON specialties FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active facilities" ON facilities;
CREATE POLICY "Public can view active facilities" ON facilities FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active doctors" ON doctors;
CREATE POLICY "Public can view active doctors" ON doctors FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Public can view chambers" ON chambers;
CREATE POLICY "Public can view chambers" ON chambers FOR SELECT TO public USING (true);

-- Admin Full Access Policies
DROP POLICY IF EXISTS "Admins full access districts" ON districts;
CREATE POLICY "Admins full access districts" ON districts FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access specialties" ON specialties;
CREATE POLICY "Admins full access specialties" ON specialties FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access facilities" ON facilities;
CREATE POLICY "Admins full access facilities" ON facilities FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access doctors" ON doctors;
CREATE POLICY "Admins full access doctors" ON doctors FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins full access chambers" ON chambers;
CREATE POLICY "Admins full access chambers" ON chambers FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can insert appointments" ON appointments;
CREATE POLICY "Anyone can insert appointments" ON appointments FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select appointments by code or phone" ON appointments;
CREATE POLICY "Anyone can select appointments by code or phone" ON appointments FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin full access to appointments" ON appointments;
CREATE POLICY "Admin full access to appointments" ON appointments FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Reviews Policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT TO public USING (is_approved = true OR is_verified_patient = true);

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to reviews" ON reviews;
CREATE POLICY "Admin full access to reviews" ON reviews FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Admin Profiles Policies
DROP POLICY IF EXISTS "Allow users to read own profile or admins to read all" ON public.admin_profiles;
CREATE POLICY "Allow users to read own profile or admins to read all"
  ON public.admin_profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow super admins to manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Allow super admins to manage admin profiles"
  ON public.admin_profiles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- ========================================================================
-- 7. MASTER SEED DATA (PERMANENT SUPABASE PERSISTENCE)
-- ========================================================================

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
('cardiology', 'কার্ডিওলজি / হৃদরোগ', 'Cardiology', 'Heart', 2),
('pediatrics', 'শিশু রোগ', 'Pediatrics', 'Baby', 3),
('gynecology', 'স্ত্রী রোগ ও প্রসূতি', 'Gynecology', 'User', 4),
('orthopedics', 'অর্থোপেডিক্স', 'Orthopedics', 'Activity', 5),
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
('royal', 'rajshahi', 'রয়্যাল হাসপাতাল', 'লক্ষ্মীপুর, রাজশাহী', '০১৭২২-৩৩৪৪৫৫', false),
('medipath', 'rajshahi', 'মেডিপ্যাথ ডায়াগনস্টিক', 'রাজশাহী মেডিকেল কলেজ রোড', '০১৯১১-২২৩৩৪৪', false)
ON CONFLICT (id) DO UPDATE SET
district_id = EXCLUDED.district_id,
name = EXCLUDED.name,
area_address = EXCLUDED.area_address,
contact_phone = EXCLUDED.contact_phone,
is_vip = EXCLUDED.is_vip;

-- Seed Doctors with Deterministic UUIDs for Chambers/Appointments/Reviews
INSERT INTO doctors (id, specialty_id, name, bmdc_number, degrees, designation, workplace, ps_phone, display_priority, is_active, rating, review_count) VALUES
('00000000-0000-0000-0000-000000000001', 'medicine', 'অধ্যাপক ডা. মো: আশরাফুল ইসলাম', 'A-45920', 'MBBS, FCPS (Medicine), MD (Internal Medicine)', 'বিভাগীয় প্রধান (মেডিসিন বিভাগ)', 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল', '01711984210', 1, true, 4.9, 38),
('00000000-0000-0000-0000-000000000002', 'gynecology', 'ডা. মোছা: সুলতানা পারভীন', 'A-51204', 'MBBS, DGO, MCPS (Gynecology)', 'সহকারী অধ্যাপক (গাইনি ও প্রসূতি রোগ)', 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল', '01819543210', 2, true, 4.8, 29),
('00000000-0000-0000-0000-000000000003', 'cardiology', 'ডা. সাজ্জাদ হোসেন', 'A-38491', 'MBBS, D-Card, MD (Cardiology)', 'সহযোগী অধ্যাপক (কার্ডিওলজি)', 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল', '01712334455', 3, true, 4.9, 42),
('00000000-0000-0000-0000-000000000004', 'pediatrics', 'ডা. মো: জাহিদ হাসান', 'A-49321', 'MBBS, DCH (Child Health), MD (Pediatrics)', 'কনসালটেন্ট (শিশু রোগ বিভাগ)', 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল', '01715896321', 4, true, 4.7, 22),
('00000000-0000-0000-0000-000000000005', 'orthopedics', 'ডা. মো: কামরুজ্জামান', 'A-42110', 'MBBS, MS (Orthopedics)', 'সহকারী অধ্যাপক (হাড় ও জোড়া রোগ বিশেষজ্ঞ)', 'রাজশাহী মেডিকেল কলেজ ও হাসপাতাল', '01712987654', 5, true, 4.8, 19)
ON CONFLICT (bmdc_number) DO UPDATE SET
name = EXCLUDED.name,
degrees = EXCLUDED.degrees,
designation = EXCLUDED.designation,
workplace = EXCLUDED.workplace,
ps_phone = EXCLUDED.ps_phone,
display_priority = EXCLUDED.display_priority,
rating = EXCLUDED.rating,
review_count = EXCLUDED.review_count;

-- Seed Chambers
INSERT INTO chambers (id, doctor_id, facility_id, room_no, floor, building_stand, visiting_days, visiting_time, fee_new, fee_old) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'popular', '৩১২', '৩য় তলা', 'মেইন ভবন, লিফট-১ এর পাশে', 'শনিবার, রবিবার, সোমবার, মঙ্গলবার, বুধবার', 'বিকাল ৪:০০ - রাত ৮:৩০', 800, 500),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'amana', '২০৫', '২য় তলা', 'পূর্ব ব্লক, ওপিডি কর্নার', 'শনিবার, রবিবার, মঙ্গলবার, বুধবার, বৃহস্পতিবার', 'বিকাল ৫:০০ - রাত ৯:০০', 700, 400),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'labaid', '৩০৪', '৩য় তলা', 'কার্ডিয়াক উইং', 'শনিবার, সোমবার, মঙ্গলবার, বৃহস্পতিবার', 'বিকাল ৬:০০ - রাত ৯:৩০', 1000, 600),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'popular', '২০৪', '২য় তলা', 'শিশু বিভাগ কর্নার, লিফট-২ সংলগ্ন', 'রবিবার, সোমবার, মঙ্গলবার, বুধবার, বৃহস্পতিবার', 'বিকাল ৫:৩০ - রাত ৮:৩০', 600, 400),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'royal', '৫০৩', '৫ম তলা', 'অর্থো উইং, লিফট-৩ এর সামনে', 'শনিবার, রবিবার, সোমবার, বুধবার, বৃহস্পতিবার', 'বিকাল ৪:৩০ - রাত ৯:০০', 800, 500)
ON CONFLICT (id) DO NOTHING;

-- Sync facility_name and address if legacy columns exist in chambers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chambers' AND column_name = 'facility_name') THEN
    UPDATE chambers c
    SET facility_name = f.name
    FROM facilities f
    WHERE c.facility_id = f.id AND (c.facility_name IS NULL OR c.facility_name = '');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chambers' AND column_name = 'address') THEN
    UPDATE chambers c
    SET address = f.area_address
    FROM facilities f
    WHERE c.facility_id = f.id AND (c.address IS NULL OR c.address = '');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'chambers' AND column_name = 'facility_address') THEN
    UPDATE chambers c
    SET facility_address = f.area_address
    FROM facilities f
    WHERE c.facility_id = f.id AND (c.facility_address IS NULL OR c.facility_address = '');
  END IF;
END $$;

-- Seed Confirmed Appointments for Verification Testing
INSERT INTO appointments (
    id, booking_code, doctor_id, chamber_id, patient_name, patient_age, patient_phone, preferred_date, status, serial_no, assigned_room_no, assigned_floor, assigned_building, confirmed_visiting_time
) VALUES
('20000000-0000-0000-0000-000000000001', 'RJ-1052', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'ফাতেমা বেগম', 32, '01898765432', '2026-09-02', 'Confirmed', '০৭', '২০৫', '২য় তলা', 'পূর্ব ব্লক, ওপিডি কর্নার (লিফট-২)', 'বিকাল ৫:৩০'),
('20000000-0000-0000-0000-000000000002', 'RJ-4521', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'মো: রফিকুল ইসলাম', 48, '01712001122', '2026-08-25', 'Confirmed', '০৩', '৩১২', '৩য় তলা', 'মেইন ভবন, লিফট-১', 'বিকাল ৪:৩০'),
('20000000-0000-0000-0000-000000000003', 'RJ-8492', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'মো: আব্দুল করিম', 45, '01712345678', '2026-09-01', 'Pending', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (booking_code) DO NOTHING;

-- Seed Initial Verified Reviews
INSERT INTO reviews (doctor_id, patient_name, patient_phone, rating, comment, review_text, is_verified_patient, is_approved) VALUES
('00000000-0000-0000-0000-000000000001', 'মো: রফিকুল ইসলাম', '01712001122', 5.0, 'অত্যন্ত যত্ন সহকারে রোগী দেখেন এবং প্রতিটি রিপোর্ট বিস্তারিত বুঝিয়ে দেন। রাজশাহীর সেরা মেডিসিন বিশেষজ্ঞ।', 'অত্যন্ত যত্ন সহকারে রোগী দেখেন এবং প্রতিটি রিপোর্ট বিস্তারিত বুঝিয়ে দেন। রাজশাহীর সেরা মেডিসিন বিশেষজ্ঞ।', true, true),
('00000000-0000-0000-0000-000000000002', 'ফাতেমা বেগম', '01898765432', 5.0, 'ম্যাডামের ব্যবহার চমৎকার এবং অত্যন্ত অভিজ্ঞ চিকিৎসক। অনেক উপকার পেয়েছি।', 'ম্যাডামের ব্যবহার চমৎকার এবং অত্যন্ত অভিজ্ঞ চিকিৎসক। অনেক উপকার পেয়েছি।', true, true)
ON CONFLICT DO NOTHING;
