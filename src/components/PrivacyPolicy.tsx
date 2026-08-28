import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, Database, Users } from 'lucide-react';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export default function PrivacyPolicy({ onBackToHome }: PrivacyPolicyProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBackToHome}
        className="group mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
        id="privacy-back-btn"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
        <span>হোম পেজে ফিরে যান</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-[#0D9488]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0D9488] border border-teal-100">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl" id="privacy-title-text">
                গোপনীয়তা নীতি (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1">
                রোগীর তথ্যের সর্বোচ্চ সুরক্ষা নিশ্চিতকরণে MyDocBD প্রতিশ্রুতিবদ্ধ
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#0D9488] border border-teal-100">
            <ShieldCheck className="h-4 w-4" />
            <span>১০০% নিরাপদ ও সুরক্ষিত</span>
          </span>
        </div>
      </div>

      {/* Core Privacy Grid */}
      <div className="grid gap-6">
        {/* Section 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100">
              <Database className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              ১. সংগৃহীত তথ্যের বিবরণ
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            সিরিয়াল নিশ্চিত করার লক্ষ্যে আমরা শুধুমাত্র রোগীর নাম, বয়স, মোবাইল নম্বর এবং কাঙ্ক্ষিত অ্যাপয়েন্টমেন্টের তারিখ সংগ্রহ করি।
          </p>
        </div>

        {/* Section 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <EyeOff className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              ২. মোবাইল নম্বরের সুরক্ষা ও গোপনীয়তা (Strict Privacy)
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-4">
            রোগীর মোবাইল নম্বর কখনোই ওয়েবসাইটে উন্মুক্ত বা পাবলিকলি প্রকাশ করা হয় না। এটি শুধুমাত্র নিচের উদ্দেশ্যগুলোতে ব্যবহার করা হয়:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-400 font-semibold pl-1">
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">ক</span>
              <span>সিরিয়ালের কনফার্মেশন ও আপডেট জানানোর জন্য,</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">খ</span>
              <span>ট্র্যাকিং পেজে রোগীর অতীত হিস্ট্রি দেখানোর জন্য, এবং</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">গ</span>
              <span>চিকিৎসকের কাছে নেওয়া সেবার ভিত্তিতে ভেরিফায়েড রিভিউ দেওয়ার সত্যতা যাচাইয়ে ব্যবহৃত হয়।</span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-[#0284C7] border border-sky-100">
              <Users className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              ৩. তথ্য বিনিময় নীতি (Data Sharing)
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            সিরিয়াল রেজিস্ট্রেশনের প্রয়োজনে রোগীর নাম ও অ্যাপয়েন্টমেন্টের তথ্য কেবল সংশ্লিষ্ট ক্লিনিক/ডাক্তারের সহকারীর সাথে শেয়ার করা হয়। কোনো বাণিজ্যিক তৃতীয় পক্ষের কাছে তথ্য বিক্রি বা অপব্যবহার করা হয় না।
          </p>
        </div>

        {/* Section 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0D9488] border border-teal-100">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              ৪. ডাটাবেজ সিকিউরিটি
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            ব্যবহারকারীর সকল ডেটা আন্তর্জাতিক মানের এনক্রিপ্টেড ক্লাউড ডাটাবেজে (Supabase PostgreSQL) অত্যন্ত সুরক্ষিতভাবে সংরক্ষিত থাকে।
          </p>
        </div>
      </div>
    </div>
  );
}
