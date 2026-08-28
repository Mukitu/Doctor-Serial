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
  UserCheck,
  MapPin,
  Eye,
  Brain,
  Pill,
  Award,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { POPULAR_SPECIALTIES, DISTRICTS, FACILITIES } from '../data/mockData';
import { ActiveTab, District, Specialty, Facility } from '../types';

interface HeroProps {
  setActiveTab: (tab: ActiveTab) => void;
  setSearchFilters: React.Dispatch<React.SetStateAction<{ district: string; specialty: string; facility: string }>> | ((filters: { district: string; specialty: string; facility: string }) => void);
  searchFilters?: { district: string; specialty: string; facility: string };
  selectedDistrict: string;
  setSelectedDistrict?: (district: string) => void;
  districts?: District[];
  specialties?: Specialty[];
  facilities?: Facility[];
}

export default function Hero({ 
  setActiveTab, 
  setSearchFilters, 
  searchFilters,
  selectedDistrict,
  setSelectedDistrict,
  districts = [],
  specialties = [],
  facilities = [],
}: HeroProps) {
  const specialty = searchFilters?.specialty || '';
  const facility = searchFilters?.facility || '';

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict?.(newDistrict);
    setSearchFilters(prev => ({
      ...(typeof prev === 'object' ? prev : {}),
      district: newDistrict,
      specialty: searchFilters?.specialty || '',
      facility: searchFilters?.facility || ''
    }));
  };

  const handleSpecialtyChange = (newSpecialty: string) => {
    setSearchFilters(prev => ({
      ...(typeof prev === 'object' ? prev : {}),
      district: selectedDistrict,
      specialty: newSpecialty,
      facility: searchFilters?.facility || ''
    }));
  };

  const handleFacilityChange = (newFacility: string) => {
    setSearchFilters(prev => ({
      ...(typeof prev === 'object' ? prev : {}),
      district: selectedDistrict,
      specialty: searchFilters?.specialty || '',
      facility: newFacility
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = document.getElementById('featured-doctors-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (specialtyName: string) => {
    handleSpecialtyChange(specialtyName);
    const target = document.getElementById('featured-doctors-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Icon helper mapping to support all common specialty icons dynamically
  const renderSpecialtyIcon = (iconName: string = '') => {
    const norm = (iconName || '').toLowerCase().trim();
    if (norm.includes('heart') || norm.includes('cardio') || norm.includes('হৃদ')) {
      return <Heart className="h-5.5 w-5.5 text-rose-500" />;
    }
    if (norm.includes('baby') || norm.includes('pediatric') || norm.includes('শিশু') || norm.includes('child')) {
      return <Baby className="h-5.5 w-5.5 text-amber-500" />;
    }
    if (norm.includes('eye') || norm.includes('vision') || norm.includes('চক্ষু')) {
      return <Eye className="h-5.5 w-5.5 text-indigo-500" />;
    }
    if (norm.includes('brain') || norm.includes('neuro') || norm.includes('মস্তিষ্ক')) {
      return <Brain className="h-5.5 w-5.5 text-purple-500" />;
    }
    if (norm.includes('user') || norm.includes('gyn') || norm.includes('women') || norm.includes('নারী') || norm.includes('গাইনি')) {
      return <UserCheck className="h-5.5 w-5.5 text-pink-500" />;
    }
    if (norm.includes('bone') || norm.includes('ortho') || norm.includes('হাড়')) {
      return <Activity className="h-5.5 w-5.5 text-emerald-500" />;
    }
    if (norm.includes('pill') || norm.includes('pharma') || norm.includes('ঔষধ')) {
      return <Pill className="h-5.5 w-5.5 text-teal-500" />;
    }
    if (norm.includes('award') || norm.includes('medal') || norm.includes('star')) {
      return <Award className="h-5.5 w-5.5 text-amber-600" />;
    }
    if (norm.includes('shield')) {
      return <ShieldCheck className="h-5.5 w-5.5 text-emerald-600" />;
    }
    if (norm.includes('sparkle')) {
      return <Sparkles className="h-5.5 w-5.5 text-yellow-500" />;
    }
    return <Stethoscope className="h-5.5 w-5.5 text-[#0284C7]" />;
  };

  // Resolve dynamic vs static lists
  const renderedDistricts = (districts && districts.length > 0)
    ? districts
        .filter(d => d.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(d => ({ id: d.id, name: d.nameBn, nameEn: d.nameEn }))
    : DISTRICTS;

  const renderedSpecialties = (specialties && specialties.length > 0)
    ? specialties
        .filter(s => s.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(s => ({ id: s.id, name: s.nameBn, labelEn: s.nameEn, icon: s.iconName }))
    : POPULAR_SPECIALTIES;

  const currentDistrictObj = districts.find(
    d => d.nameBn === selectedDistrict || d.id === selectedDistrict || d.nameEn?.toLowerCase() === selectedDistrict.toLowerCase()
  );

  const renderedFacilities = (facilities && facilities.length > 0)
    ? facilities.filter(f => {
        if (!selectedDistrict || selectedDistrict === 'সকল জেলা') return f.isActive !== false;
        if (currentDistrictObj && f.districtId) {
          return f.districtId === currentDistrictObj.id || f.districtName === selectedDistrict;
        }
        return f.districtName === selectedDistrict || f.isActive !== false;
      })
    : FACILITIES;

  return (
    <section className="relative overflow-hidden py-10 md:py-16 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
            ✦ ১০০% ভেরিফাইড বিএমডিসি রেজিঃপ্রাপ্ত ডাক্তার
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            <span className="text-sky-600 font-black">MyDocBD</span>-তে স্বাগতম — <br />
            <span className="text-teal-600 font-extrabold">বিশেষজ্ঞ চিকিৎসকদের নির্ভরযোগ্য ডিজিটাল ডিরেক্টরি</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            পছন্দের ডাক্তার খুঁজুন এবং MyDocBD-এর মাধ্যমে সহজেই চেম্বার সিরিয়াল নিশ্চিত করুন।
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
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50/60 p-3 border border-slate-200/50 focus-within:border-slate-300">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" /> জেলা (District)
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  id="hero-district-select"
                >
                  <option value="সকল জেলা">সকল জেলা (All)</option>
                  {renderedDistricts.map((dist) => (
                    <option key={dist.id} value={dist.name}>
                      {dist.name} {dist.nameEn ? `(${dist.nameEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Selector */}
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50/60 p-3 border border-slate-200/50 focus-within:border-slate-300">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" /> বিশেষজ্ঞ ক্যাটাগরি (Specialty)
                </label>
                <select
                  value={specialty}
                  onChange={(e) => handleSpecialtyChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  id="hero-specialty-select"
                >
                  <option value="">সকল বিশেষজ্ঞ (All)</option>
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
                  onChange={(e) => handleFacilityChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  id="hero-facility-select"
                >
                  <option value="">সকল হাসপাতাল ও ডায়াগনস্টিক (All)</option>
                  {renderedFacilities.map((fac) => (
                    <option key={fac.id} value={fac.name}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Auto-filter info and Search Doctor Action */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>সিলেক্ট করলেই নিচে স্বয়ংক্রিয়ভাবে ডাক্তারদের তালিকা ফিল্টার হবে</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(specialty || facility || (selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)')) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDistrictChange('সকল জেলা');
                      handleSpecialtyChange('');
                      handleFacilityChange('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2 cursor-pointer transition"
                  >
                    রিসেট (Reset)
                  </button>
                )}
                <button
                  type="submit"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer shadow-xs"
                  id="hero-submit-btn"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>ডাক্তার তালিকা দেখুন (View List)</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Popular Specialties Category Grid */}
        <div className="mt-12 md:mt-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                বিশেষজ্ঞ ক্যাটাগরি সমূহ
              </h2>
              <p className="text-xs text-slate-400 font-medium">আপনার কাঙ্ক্ষিত রোগ অনুযায়ী সঠিক বিশেষজ্ঞ নির্বাচন করুন</p>
            </div>
            <button
              onClick={() => {
                setSearchFilters({ district: selectedDistrict, specialty: '', facility: '' });
                setActiveTab('doctors');
              }}
              className="group flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              id="view-all-specialties-btn"
            >
              <span>সকল ডাক্তার দেখুন</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {renderedSpecialties.map((spec) => (
              <div
                key={spec.id}
                onClick={() => handleCategoryClick(spec.name)}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:border-[#0284C7] hover:shadow-sm hover:bg-slate-50/50"
                id={`category-card-${spec.id}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition group-hover:scale-105 group-hover:bg-sky-50">
                  {renderSpecialtyIcon(spec.icon)}
                </div>
                <h3 className="mt-2.5 font-bold text-slate-800 text-xs group-hover:text-[#0284C7] transition">
                  {spec.name}
                </h3>
                {spec.labelEn && (
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 line-clamp-1">
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
                স্বনামধন্য ডাক্তারদের চেম্বার শিডিউল এবং সরাসরি সিরিয়াল বুকিংয়ের আধুনিক প্ল্যাটফর্ম।
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
