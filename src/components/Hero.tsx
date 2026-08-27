import React, { useState } from 'react';
import { 
  Stethoscope, 
  Heart, 
  Baby, 
  Activity, 
  ChevronRight, 
  Search, 
  CheckCircle, 
  Clock, 
  CalendarCheck,
  Building,
  UserCheck
} from 'lucide-react';
import { POPULAR_SPECIALTIES, DISTRICTS, FACILITIES } from '../data/mockData';
import { ActiveTab, District, Specialty, Facility } from '../types';

interface HeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSearchFilters: (filters: { district: string; specialty: string; facility: string }) => void;
  selectedDistrict: string;
  districts?: District[];
  specialties?: Specialty[];
  facilities?: Facility[];
}

export default function Hero({ 
  setActiveTab, 
  setSearchFilters, 
  selectedDistrict,
  districts = [],
  specialties = [],
  facilities = [],
}: HeroProps) {
  const [specialty, setSpecialty] = useState('');
  const [facility, setFacility] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilters({
      district: selectedDistrict,
      specialty: specialty,
      facility: facility
    });
    setActiveTab('doctors');
  };

  const handleCategoryClick = (specialtyName: string) => {
    setSearchFilters({
      district: selectedDistrict,
      specialty: specialtyName,
      facility: ''
    });
    setActiveTab('doctors');
  };

  // Icon helper mapping to prevent dynamic key resolution issues
  const renderSpecialtyIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="h-6 w-6 text-[#0284C7]" />;
      case 'Heart':
        return <Heart className="h-6 w-6 text-[#0D9488]" />;
      case 'Baby':
        return <Baby className="h-6 w-6 text-amber-500" />;
      case 'User':
        return <UserCheck className="h-6 w-6 text-pink-500" />;
      case 'Activity':
        return <Activity className="h-6 w-6 text-emerald-500" />;
      default:
        return <Stethoscope className="h-6 w-6 text-sky-500" />;
    }
  };

  // Resolve dynamic vs static lists
  const renderedSpecialties = specialties.length > 0 
    ? specialties.map(s => ({ id: s.id, name: s.nameBn, labelEn: s.nameEn, icon: s.iconName }))
    : POPULAR_SPECIALTIES;

  const renderedFacilities = facilities.length > 0 
    ? facilities.filter(f => !selectedDistrict || f.districtName === selectedDistrict || f.isActive)
    : FACILITIES;

  return (
    <section className="relative overflow-hidden py-10 md:py-16 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
            ✦ ১০০% ভেরিফাইড বিএমডিসি রেজিঃপ্রাপ্ত ডাক্তার
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            সহজে খুঁজুন ডাক্তার, <br />
            <span className="text-[#0284C7] font-black">
              নিশ্চিত করুন সিরিয়াল মুহূর্তেই
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
            রাজশাহী বিভাগের স্বনামধন্য ডাক্তারদের চেম্বার শিডিউল এবং সরাসরি সিরিয়াল বুকিংয়ের আধুনিক প্ল্যাটফর্ম। ঘরে বসেই কয়েক ক্লিকে আপনার ট্র্যাকিং নম্বর সংগ্রহ করুন।
          </p>
        </div>

        {/* Hero Search & Filter Form */}
        <div className="mx-auto mt-8 max-w-4xl">
          <form 
            onSubmit={handleSearch}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
            id="hero-search-form"
          >
            <div className="grid gap-3.5 md:grid-cols-3">
              {/* District Select */}
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50/60 p-3 border border-slate-200/50">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building className="h-3 w-3" /> জেলা
                </label>
                <select
                  disabled
                  value={selectedDistrict}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-not-allowed"
                >
                  <option value={selectedDistrict}>{selectedDistrict}</option>
                </select>
              </div>

              {/* Specialty Selector */}
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50/60 p-3 border border-slate-200/50 focus-within:border-slate-300">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" /> বিশেষজ্ঞ ক্যাটাগরি (Specialty)
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  id="hero-specialty-select"
                >
                  <option value="">সকল বিশেষজ্ঞ সিলেক্ট করুন</option>
                  {renderedSpecialties.map((spec) => (
                    <option key={spec.id} value={spec.name}>
                      {spec.name} {spec.labelEn ? `(${spec.labelEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital/Facility Selector */}
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50/60 p-3 border border-slate-200/50 focus-within:border-slate-300">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Building className="h-3 w-3" /> হাসপাতাল বা ডায়াগনস্টিক
                </label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  id="hero-facility-select"
                >
                  <option value="">সকল হাসপাতাল/চেম্বার</option>
                  {renderedFacilities.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name.replace(', রাজশাহী', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Search Button */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-6 py-3 text-xs font-bold text-white transition cursor-pointer"
                id="hero-submit-btn"
              >
                <Search className="h-4 w-4" />
                <span>ডাক্তার খুঁজুন (Search Doctor)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Popular Specialties Category Grid */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 md:text-xl">
              জনপ্রিয় বিশেষজ্ঞ ক্যাটাগরি সমূহ
            </h2>
            <button
              onClick={() => {
                setSearchFilters({ district: selectedDistrict, specialty: '', facility: '' });
                setActiveTab('doctors');
              }}
              className="group flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:underline"
              id="view-all-specialties-btn"
            >
              <span>সকল ডাক্তার দেখুন</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {renderedSpecialties.slice(0, 5).map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleCategoryClick(spec.name)}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4.5 text-center transition hover:border-[#0284C7] hover:bg-slate-50/50"
                id={`category-card-${spec.id}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 transition group-hover:bg-sky-50">
                  {renderSpecialtyIcon(spec.icon)}
                </div>
                <h3 className="mt-3 font-bold text-slate-800 text-xs group-hover:text-[#0284C7] transition">
                  {spec.name}
                </h3>
                {spec.labelEn && (
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {spec.labelEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3-Step Patient Workflow Banner */}
        <div className="mt-12 md:mt-16 rounded-xl border border-slate-200 bg-white p-6 md:p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-800 md:text-xl">
              সহজ ৩ ধাপে সিরিয়াল বুকিং ও কনফার্মেশন
            </h2>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              কোন জটিলতা ছাড়াই দ্রুত আপনার প্রয়োজনীয় চিকিৎসকের সময় এবং সিরিয়াল স্লট বুক করুন
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 font-bold text-sm text-slate-700">
                ০১
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-800">ডাক্তার খুঁজুন</h3>
              <p className="mt-1.5 text-[11px] text-slate-500 px-3 leading-relaxed font-semibold">
                রাজশাহী জেলার স্বনামধন্য ডাক্তারদের চেম্বার শিডিউল এবং সরাসরি সিরিয়াল বুকিংয়ের আধুনিক প্ল্যাটফর্ম।
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 font-bold text-sm text-slate-700">
                ০২
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-800">রিকোয়েস্ট দিন</h3>
              <p className="mt-1.5 text-[11px] text-slate-500 px-3 leading-relaxed font-semibold">
                রোগীর নাম, বয়স ও ফোন নম্বর প্রদান করে আপনার সুবিধাজনক চেম্বার দিনের জন্য সিরিয়ালের আবেদন করুন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 font-bold text-sm text-slate-700">
                ০৩
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-800">সিরিয়াল কনফার্মেশন</h3>
              <p className="mt-1.5 text-[11px] text-slate-500 px-3 leading-relaxed font-semibold">
                উক্ত ট্র্যাকিং নম্বর দিয়ে সিরিয়ালের আপডেট ট্র্যাক করুন। এডমিন কনফার্ম করার সাথে সাথেই বুকিং নিশ্চিত হবে।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
