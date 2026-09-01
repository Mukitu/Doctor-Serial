-- ==============================================================================
-- Supabase Script: Add sub_specialty Column to doctors Table
-- Copy and run this script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Public doctors টেবিলে sub_specialty কলাম যুক্ত করার SQL
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS sub_specialty TEXT;

-- 2. মন্তব্য (Optional)
COMMENT ON COLUMN public.doctors.sub_specialty IS 'ডাক্তারের কাস্টম সাব-ক্যাটাগরি বা বিশেষ অভিজ্ঞতা (যেমন: ইন্টারভেনশনাল কার্ডিওলজি, শিশু নিউরোলজি)';
