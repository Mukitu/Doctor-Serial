import React, { useEffect } from 'react';
import { HeartPulse, Mail, Phone, GraduationCap, Award, Target, Quote, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AboutUsProps {
  onBackToHome: () => void;
}

export default function AboutUs({ onBackToHome }: AboutUsProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-8">
          <button 
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোম পেজে ফিরে যান</span>
          </button>
        </div>

        {/* Hero Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 p-1 border border-sky-100 mb-4 shadow-xs">
            <img src="/MyDocBD-App-Icon.png" alt="MyDocBD Icon" className="h-9 w-9 object-contain rounded-lg" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            আমাদের নেতৃত্ব ও পরিচিতি
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm md:text-base text-slate-500 font-medium leading-relaxed">
            স্বাস্থ্যসেবার অভিজ্ঞতা ও আধুনিক প্রযুক্তির সমন্বয়ে গড়ে ওঠা <span className="text-sky-600 font-bold">MyDocBD</span>-এর পেছনে যারা কাজ করছেন।
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-sky-500 to-teal-500"></div>
        </div>

        {/* Responsive Grid Layout (Desktop: 2 Columns, Mobile/Tablet: Stacked) */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: FOUNDER & DIRECTOR PROFILE */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition duration-300">
            
            {/* Header with Styled Image & Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-slate-50 shadow-md">
                <img 
                  src="/Founder.jpeg" 
                  alt="তাওহীদ ইসলাম (Founder & Director)" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top transition duration-300 hover:scale-105"
                />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 border border-sky-100/50">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-sky-600" />
                  প্রতিষ্ঠাতা ও পরিচালক
                </span>
                <h2 className="text-2xl font-black text-slate-800">তাওহীদ ইসলাম</h2>
                <p className="text-sm font-bold text-slate-400 font-mono">Tauhid Islam</p>
                <p className="text-xs font-bold text-sky-600">MyDocBD (mydocbd.com)</p>
              </div>
            </div>

            {/* Structured Card Table for Executive Info */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-700 border-l-4 border-sky-600 pl-2">ব্যক্তিগত ও পেশাগত বিবরণ</h3>
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 w-1/3 bg-slate-100/40">পদবি</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800">প্রতিষ্ঠাতা ও পরিচালক (Founder & Director)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">শিক্ষাগত যোগ্যতা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-sky-600 flex-shrink-0" />
                        <span>ডিএমএফ (DMF - Diploma in Medical Faculty)</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">অভিজ্ঞতা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <Award className="h-4 w-4 text-teal-600 flex-shrink-0" />
                        <span>স্বাস্থ্যসেবা ও রোগী ব্যবস্থাপনায় ১০+ বছরের বাস্তব অভিজ্ঞতা</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">পেশাগত ভূমিকা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800">প্ল্যাটফর্ম পরিচালনা, বিশেষজ্ঞ চিকিৎসক সমন্বয় ও স্বাস্থ্য তথ্য ব্যবস্থাপনা</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">ইমেইল</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 font-mono hover:text-sky-600 transition">
                        <a href="mailto:tauhidislam002@gmail.com" className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>tauhidislam002@gmail.com</span>
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">ফোন / মোবাইল</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 font-mono text-sky-600">
                        <a href="tel:+8801748182573" className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>+880 1748-182573</span>
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">মূল লক্ষ্য</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 flex items-center gap-1 text-teal-700">
                        <Target className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>রোগের ধরন অনুযায়ী সঠিক চিকিৎসক নির্বাচন ও নির্ভরযোগ্য স্বাস্থ্যসেবা নিশ্চিত করা</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Founder's Message Quote Card */}
            <div className="mt-8 relative rounded-xl bg-slate-50 border border-slate-150 p-6 shadow-xs overflow-hidden">
              <div className="absolute -right-2 -bottom-2 text-slate-200/60 pointer-events-none">
                <Quote className="h-24 w-24 transform rotate-180" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Quote className="h-5 w-5 text-sky-600" />
                <h4 className="text-sm font-extrabold text-slate-800">প্রতিষ্ঠাতার বার্তা (Founder's Message)</h4>
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed italic relative z-10">
                "স্বাস্থ্যসেবা খাতে এক দশকেরও বেশি সময় ধরে কাজ করার অভিজ্ঞতায় দেখেছি, অসুস্থতার সময় সঠিক বিষয়ের বিশেষজ্ঞ চিকিৎসক খুঁজে পাওয়া এবং তাদের নির্ভরযোগ্য তথ্য জানা রোগীদের জন্য অনেক বড় একটি চ্যালেঞ্জ। কেবল সিরিয়াল দেওয়া নয়—রোগের ধরন অনুযায়ী সঠিক ও ভেরিফায়েড চিকিৎসকের বিস্তারিত তথ্য তুলে ধরা এবং দ্রুততম সময়ে রোগীকে সঠিক ডাক্তারের কাছে পৌঁছে দেওয়াই আমাদের মূল অঙ্গীকার।"
              </p>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: CHIEF EXECUTIVE OFFICER (CEO) PROFILE */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm hover:shadow-md transition duration-300">
            
            {/* Header with Styled Image & Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-slate-50 shadow-md">
                <img 
                  src="/Ceo.jpeg" 
                  alt="মুকিতু ইসলাম নিশাত (CEO)" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top transition duration-300 hover:scale-105"
                />
              </div>
              <div className="text-center sm:text-left space-y-2">
                <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-100/50">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1 text-teal-600" />
                  প্রধান নির্বাহী কর্মকর্তা (CEO)
                </span>
                <h2 className="text-2xl font-black text-slate-800">মুকিতু ইসলাম নিশাত</h2>
                <p className="text-sm font-bold text-slate-400 font-mono">Mukitu Islam Nishat</p>
                <p className="text-xs font-bold text-teal-600">MyDocBD (mydocbd.com)</p>
              </div>
            </div>

            {/* Structured Card Table for Executive Info */}
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-700 border-l-4 border-teal-600 pl-2">ব্যক্তিগত ও পেশাগত বিবরণ</h3>
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 w-1/3 bg-slate-100/40">পদবি</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800">প্রধান নির্বাহী কর্মকর্তা (Chief Executive Officer - CEO)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">শিক্ষাগত যোগ্যতা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-teal-600 flex-shrink-0" />
                        <span>কম্পিউটার ইঞ্জিনিয়ার (B.Sc. in Computer Science & Engineering)</span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">পেশাগত ভূমিকা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800">সিস্টেম আর্কিটেকচার, প্ল্যাটফর্মের প্রযুক্তিগত উন্নয়ন ও কৌশলগত নেতৃত্ব</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">দক্ষতা</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800">হেলথ-টেক ইনোভেশন, সফটওয়্যার ডেভেলপমেন্ট ও ডিজিটাল সার্ভিস ডিজাইন</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">ইমেইল</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 font-mono hover:text-teal-600 transition">
                        <a href="mailto:mukitunishat@gmail.com" className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>mukitunishat@gmail.com</span>
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">ফোন / মোবাইল</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 font-mono text-teal-600">
                        <a href="tel:+8809638957563" className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>+880 9638957563</span>
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-100/40">মূল লক্ষ্য</td>
                      <td className="px-4 py-3 text-xs font-extrabold text-slate-800 flex items-center gap-1 text-sky-700">
                        <Target className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>আধুনিক প্রযুক্তির মাধ্যমে স্বাস্থ্যসেবাকে সাধারণ মানুষের হাতের নাগালে পৌঁছে দেওয়া</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CEO's Message Quote Card */}
            <div className="mt-8 relative rounded-xl bg-slate-50 border border-slate-150 p-6 shadow-xs overflow-hidden">
              <div className="absolute -right-2 -bottom-2 text-slate-200/60 pointer-events-none">
                <Quote className="h-24 w-24 transform rotate-180" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Quote className="h-5 w-5 text-teal-600" />
                <h4 className="text-sm font-extrabold text-slate-800">প্রধান নির্বাহীর বার্তা (CEO's Message)</h4>
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed italic relative z-10">
                "ডিজিটাল যুগে স্বাস্থ্যসেবা পাওয়া হওয়া উচিত সহজ, স্বচ্ছ ও সম্পূর্ণ ঝামেলামুক্ত। একজন কম্পিউটার ইঞ্জিনিয়ার হিসেবে আমার লক্ষ্য ছিল এমন একটি শক্তিশালী প্রযুক্তি প্ল্যাটফর্ম তৈরি করা, যার মাধ্যমে মানুষ ঘরে বসেই মুহূর্তের মধ্যে সঠিক চিকিৎসকের তথ্য পাবেন এবং নির্ভুলভাবে সেবা নিশ্চিত করতে পারবেন। প্রযুক্তি ও স্বাস্থ্যসেবার এই মেলবন্ধনে রোগীকে দ্রুততম সময়ে সঠিক সমাধানের সাথে যুক্ত করাই আমাদের প্রধান দায়িত্ব।"
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
