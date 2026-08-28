import React from 'react';
import { Shield, ArrowLeft, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface TermsOfServiceProps {
  onBackToHome: () => void;
}

export default function TermsOfService({ onBackToHome }: TermsOfServiceProps) {
  const sections = [
    {
      id: 'introduction',
      title: '১. প্ল্যাটফর্মের ভূমিকা ও পরিধি',
      content: 'MyDocBD (mydocbd.com) মূলত রাজশাহী জেলার বিশেষজ্ঞ চিকিৎসক, হাসপাতাল ও ডায়াগনস্টিক সেন্টারের চেম্বার শিডিউল এবং রোগীদের সুবিধার্থে ম্যানুয়াল সিরিয়াল সমন্বয়কারী একটি ডিজিটাল ডিরেক্টরি প্ল্যাটফর্ম। প্ল্যাটফর্মটি নিজে কোনো চিকিৎসা সেবা প্রদান করে না, বরং রোগী এবং চেম্বারের মধ্যে সেতুবন্ধন হিসেবে কাজ করে।'
    },
    {
      id: 'booking',
      title: '২. সিরিয়াল বুকিং ও নিশ্চিতকরণ প্রক্রিয়া',
      content: "ওয়েবসাইটের মাধ্যমে সিরিয়াল রিকোয়েস্ট সাবমিট করলে তা 'অপেক্ষমান (Pending)' অবস্থায় থাকে। আমাদের প্রতিনিধি চেম্বার বা ডায়াগনস্টিক সেন্টারের সাথে যোগাযোগ করে সিরিয়াল ও আনুমানিক সময় নিশ্চিত করার পর স্ট্যাটাস 'Confirmed' করা হয়। অনিবার্য কারণে ডাক্তার চেম্বারে উপস্থিত না থাকলে MyDocBD কর্তৃপক্ষ দায়ী থাকবে না, তবে রোগীকে দ্রুত বিকল্প তথ্য প্রদানের চেষ্টা করা হবে।"
    },
    {
      id: 'fees',
      title: '৩. ভিজিট ফি ও আর্থিক লেনদেন',
      content: 'চিকিৎসকের পরামর্শ ফি বা চেম্বার ফি সম্পূর্ণভাবে সংশ্লিষ্ট হাসপাতাল/চেম্বারের নির্ধারিত। রোগী সরাসরি ডাক্তারের চেম্বারে গিয়ে এই ফি পরিশোধ করবেন। MyDocBD প্ল্যাটফর্মের সাধারণ বুকিংয়ের জন্য রোগীদের কাছ থেকে কোনো অগ্রিম অপ্রকাশিত ফি দাবি করে না।'
    },
    {
      id: 'responsibility',
      title: '৪. সঠিক তথ্যের দায়বদ্ধতা',
      content: 'রোগীকে বুকিংয়ের সময় সঠিক নাম, বয়স ও সচল মোবাইল নম্বর প্রদান করতে হবে। ভুল নম্বরের কারণে সিরিয়াল নিশ্চিতকরণে ব্যাঘাত ঘটলে তা ব্যবহারকারীর দায় হিসেবে গণ্য হবে।'
    },
    {
      id: 'property',
      title: '৫. সেবা পরিমার্জন ও স্বত্বাধিকার',
      content: 'প্ল্যাটফর্মের সকল লোগো, ডেটাবেজ আর্কিটেকচার এবং কনটেন্ট MyDocBD-এর নিজস্ব সম্পত্তি। কর্তৃপক্ষ যেকোনো সময় শর্তাবলীতে পরিমার্জন আনার অধিকার সংরক্ষণ করে।'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBackToHome}
        className="group mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
        id="terms-back-btn"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
        <span>হোম পেজে ফিরে যান</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-[#0284C7]" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl" id="terms-title-text">
                ব্যবহারের নিয়মাবলী ও শর্তসমূহ (Terms of Service)
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  সর্বশেষ পরিমার্জন: আগস্ট ২০২৬
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 text-[#0D9488]">
                  <Shield className="h-3.5 w-3.5" />
                  MyDocBD আইনি নীতিমালা
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Table of Contents - Sticky Desktop Sidebar */}
        <div className="hidden md:block md:col-span-4">
          <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">সূচিপত্র</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#0284C7] transition-all border-l-2 border-transparent hover:border-[#0284C7]"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Core Content */}
        <div className="md:col-span-8 space-y-6">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:shadow-xs"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-[#0284C7] text-xs font-bold border border-sky-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-800">
                  {section.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {section.content}
              </p>
            </section>
          ))}

          {/* Quick Notice */}
          <div className="rounded-xl bg-[#0D9488]/5 p-5 border border-[#0D9488]/10 text-xs font-semibold text-[#0D9488] leading-relaxed">
            <b>জরুরী দ্রষ্টব্য:</b> MyDocBD একটি ডিজিটাল ডিরেক্টরি এবং সমন্বয়কারী প্ল্যাটফর্ম মাত্র। চেম্বারে ডাক্তার পরিবর্তন বা আকস্মিক অনুপস্থিতি ঘটলে আমরা দায়বদ্ধ নই, তবে রোগীদের সার্বিক সহযোগিতায় আমাদের প্রতিনিধিরা নিরলসভাবে কাজ করে থাকেন।
          </div>
        </div>
      </div>
    </div>
  );
}
