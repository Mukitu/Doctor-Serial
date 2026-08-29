import React from 'react';
import { ShieldCheck, PhoneCall } from 'lucide-react';
import brandLogo from '@/app/about/MyDocBD-Logo.png';
import { ActiveTab } from '../types';

interface FooterProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Footer({ activeTab, setActiveTab }: FooterProps) {
  const handleNavigation = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Logo and Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="inline-block bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm mb-3">
              <img 
                src="/MyDocBD-Logo.png" 
                alt="MyDocBD Logo" 
                className="h-8 md:h-9 w-auto object-contain" 
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              দেশের সেরা বিশেষজ্ঞ চিকিৎসকদের ডিজিটাল ডিরেক্টরি ও সিরিয়াল বুকিং প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-1.5 text-teal-400 text-[10px] font-bold">
              <ShieldCheck className="h-4 w-4" />
              <span>১০০% বিএমডিসি ভেরিফাইড নেটওয়ার্ক</span>
            </div>
          </div>

          {/* Quick Links with Exact Hierarchy */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">নেভিগেশন</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('home')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'home' ? 'text-[#0284C7]' : ''}`}
                >
                  হোম পেজ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('doctors')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'doctors' ? 'text-[#0284C7]' : ''}`}
                >
                  ডাক্তার খুঁজুন
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('track')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'track' ? 'text-[#0284C7]' : ''}`}
                >
                  সিরিয়াল ট্র্যাক করুন
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('blog')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'blog' ? 'text-[#0284C7]' : ''}`}
                >
                  স্বাস্থ্য ব্লগ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('faq')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'faq' ? 'text-[#0284C7]' : ''}`}
                >
                  সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('about')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'about' ? 'text-[#0284C7]' : ''}`}
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('terms')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'terms' ? 'text-[#0284C7]' : ''}`}
                >
                  ব্যবহারের নিয়মাবলী
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNavigation('privacy')}
                  className={`text-left hover:text-[#0284C7] transition cursor-pointer ${activeTab === 'privacy' ? 'text-[#0284C7]' : ''}`}
                >
                  প্রাইভেসি পলিসি
                </button>
              </li>
            </ul>
          </div>

          {/* Selected District Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">সার্ভিস এরিয়া</h4>
            <p className="text-xs leading-relaxed font-semibold">
              বর্তমানে আমাদের প্ল্যাটফর্মটি দেশজুড়ে সকল বিশেষজ্ঞ চিকিৎসকদের ভেরিফাইড চেম্বার সিডিউল ও সহজে সিরিয়াল বুকিং সেবা প্রদান করছে। বিশেষ করে রাজশাহী বিভাগের রোগীদের সুবিধার্থে এটি কাজ করছে।
            </p>
          </div>

          {/* Emergency Hotline Contact block */}
          <div className="rounded-lg bg-slate-800/30 p-4 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">সহায়তার জন্য হটলাইন</span>
            <div className="flex items-center gap-2 text-white">
              <PhoneCall className="h-4 w-4 text-[#0D9488]" />
              <span className="font-mono text-base font-black">০৯৬১২-৩৪৫৬৭৮</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত আমাদের সাপোর্ট টিম আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-slate-500">
          <p>© 2026 MyDocBD (mydocbd.com). সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleNavigation('terms')}
              className="hover:underline cursor-pointer"
            >
              ব্যবহারের নিয়মাবলী
            </button>
            <button
              type="button"
              onClick={() => handleNavigation('privacy')}
              className="hover:underline cursor-pointer"
            >
              প্রাইভেসি পলিসি
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
