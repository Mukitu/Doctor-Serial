import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface FAQProps {
  onBackToHome: () => void;
}

export default function FAQ({ onBackToHome }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open the first one

  const faqItems = [
    {
      question: 'MyDocBD কীভাবে কাজ করে?',
      answer: "আপনি জেলা, স্পেশালিটি বা ক্লিনিক ফিল্টার করে পছন্দের ডাক্তার খুঁজে 'সিরিয়াল নিন' বাটনে চাপ দিয়ে নাম ও ফোন নম্বর দিয়ে রিকোয়েস্ট পাঠাবেন। আমাদের টিম চেম্বার থেকে সিরিয়াল নিশ্চিত করে আপনাকে আপডেট জানিয়ে দেবে।"
    },
    {
      question: 'সিরিয়াল রিকোয়েস্ট দেওয়ার পর কীভাবে ট্র্যাক করব?',
      answer: "আমাদের 'সিরিয়াল ট্র্যাক' অপশনে গিয়ে শুধু আপনার ১১ ডিজিটের মোবাইল নম্বর দিলেই সিরিয়াল নম্বর, রুম নম্বর, ডাক্তারের বসার সময় এবং বর্তমান স্ট্যাটাস দেখতে পারবেন।"
    },
    {
      question: 'সিরিয়াল বুকিংয়ের জন্য কি কোনো অগ্রিম ফি দিতে হয়?',
      answer: "না। MyDocBD-তে সিরিয়াল বুকিংয়ের জন্য কোনো অগ্রিম ফি দিতে হয় না। ডাক্তারের মূল ভিজিট ফি আপনি সরাসরি চেম্বারে গিয়ে পরিশোধ করবেন।"
    },
    {
      question: 'ডাক্তার চেম্বারে না বসলে বা সময় পরিবর্তন হলে কীভাবে জানব?',
      answer: "চেম্বার থেকে ডাক্তারের কোনো জরুরি ছুটি বা সময় পরিবর্তনের খবর পাওয়া মাত্রই আপনার ট্র্যাকিং স্ট্যাটাস আপডেট করা হবে এবং আমাদের প্রতিনিধি আপনাকে ফোনে অবহিত করবে।"
    },
    {
      question: 'আমি কি বুকিং বাতিল বা পরিবর্তন করতে পারি?',
      answer: "হ্যাঁ, সিরিয়াল কনফার্মেশনের পূর্বে বা যেকোনো সময় আমাদের হেল্পলাইন নম্বরে যোগাযোগ করে সিরিয়াল পরিবর্তন বা বাতিল করতে পারবেন।"
    },
    {
      question: 'রিভিউ দেওয়ার সময় মোবাইল নম্বর কেন চাওয়া হয়?',
      answer: "ফেক এবং উদ্দেশ্যপ্রণোদিত রিভিউ ঠেকাতে কেবল যেসকল রোগী পূর্বে ওয়েবসাইট থেকে ওই ডাক্তারের সিরিয়াল নিয়েছিলেন, তারাই রিভিউ দিতে পারেন। আপনার নম্বরটি কেবল ভেরিফিকেশনে ব্যবহৃত হয়, অন্য কেউ এটি দেখতে পাবে না।"
    },
    {
      question: 'MyDocBD-তে রাজশাহীর কোন কোন ডায়াগনস্টিক সেন্টারের ডাক্তার আছেন?',
      answer: "রাজশাহীর পপুলার, আমানা হাসপাতাল, ল্যাবএইড, রয়েল ডায়াগনস্টিক, মেডিপ্যাথসহ লক্ষ্মীপুর ও সদর এলাকার সেরা ক্লিনিকগুলোর ডাক্তারদের তালিকা এখানে পাওয়া যায়।"
    }
  ];

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={onBackToHome}
        className="group mb-8 inline-flex items-center gap-2 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
        id="faq-back-btn"
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
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl" id="faq-title-text">
                সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1">
                MyDocBD ব্যবহারের সাধারণ প্রশ্নের নির্ভরযোগ্য উত্তর ও সমাধান
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#0D9488] border border-teal-100">
            <Sparkles className="h-4 w-4" />
            <span>স্মার্ট হেল্পলাইন</span>
          </span>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4" id="faq-accordion-list">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 bg-white shadow-2xs overflow-hidden ${
                isOpen ? 'border-[#0284C7]' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-bold text-xs transition-colors duration-200 ${
                    isOpen ? 'bg-sky-50 text-[#0284C7]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    Q
                  </span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm pt-0.5">
                    {item.question}
                  </span>
                </div>
                <div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#0284C7] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 border-t border-slate-100' : 'max-h-0'
                } overflow-hidden`}
              >
                <div className="px-5 py-4 bg-slate-50/50 flex items-start gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#0D9488] font-bold text-xs">
                    A
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold pt-0.5">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Support Banner */}
      <div className="mt-8 rounded-xl bg-slate-900 p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-white text-xs sm:text-sm">প্রশ্নগুলোর উত্তর পাননি?</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">আমাদের কাস্টমার কেয়ার টিম আপনাকে সরাসরি সাহায্য করতে প্রস্তুত।</p>
        </div>
        <a
          href="tel:০৯৬১২-৩৪৫৬৭৮"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          হটলাইনে কল করুন: ০৯৬১২-৩৪৫৬৭৮
        </a>
      </div>
    </div>
  );
}
