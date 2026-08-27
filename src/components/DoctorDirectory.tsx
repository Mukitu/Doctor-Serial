import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { Doctor, Specialty, Facility, District } from '../types';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  specialties: Specialty[];
  facilities: Facility[];
  districts: District[];
  onBookDoctor: (doctor: Doctor) => void;
  initialFilters: { district: string; specialty: string; facility: string };
  resetInitialFilters: () => void;
  selectedDistrict: string;
}

export default function DoctorDirectory({
  doctors,
  specialties,
  facilities,
  districts,
  onBookDoctor,
  initialFilters,
  resetInitialFilters,
  selectedDistrict,
}: DoctorDirectoryProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialFilters.specialty);
  const [selectedFacility, setSelectedFacility] = useState(initialFilters.facility);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Synchronize initial filters from Hero if changed
  React.useEffect(() => {
    if (initialFilters.specialty) {
      setSelectedSpecialty(initialFilters.specialty);
    }
    if (initialFilters.facility) {
      setSelectedFacility(initialFilters.facility);
    }
  }, [initialFilters]);

  // Available visiting days for filtering
  const ALL_DAYS = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedFacility('');
    setSelectedDays([]);
    resetInitialFilters();
  };

  // Filter Logic matching the flattened relational database mapping
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      // 1. Keyword search (by name, degrees, bmdc)
      const matchesSearch = 
        searchTerm === '' ||
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.degrees.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.bmdc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.workplace.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Specialty Filter
      const specObj = specialties.find(s => s.id === doc.specialtyId || s.nameBn === selectedSpecialty);
      const matchesSpecialty = 
        selectedSpecialty === '' || 
        doc.specialtyId === selectedSpecialty || 
        (specObj && (specObj.nameBn === selectedSpecialty || specObj.id === doc.specialtyId));

      // 3. Chamber Facility Filter
      const matchesFacility = 
        selectedFacility === '' || 
        doc.facilityName === selectedFacility || 
        doc.facilityId === selectedFacility;

      // 4. District Filter
      const currentDistrictObj = districts.find(d => d.nameBn === selectedDistrict);
      const matchesDistrict = 
        !currentDistrictObj || 
        doc.facilityDistrictId === currentDistrictObj.id;

      // 5. Visiting Days Filter
      const matchesDays = 
        selectedDays.length === 0 || 
        selectedDays.some(day => doc.visitingDays.includes(day));

      return matchesSearch && matchesSpecialty && matchesFacility && matchesDistrict && matchesDays;
    }).sort((a, b) => a.priorityIndex - b.priorityIndex);
  }, [doctors, specialties, districts, selectedDistrict, searchTerm, selectedSpecialty, selectedFacility, selectedDays]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex rounded-lg bg-[#0284C7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0284C7]">
            ● ফিল্টারিং প্যানেল
          </span>
          <h1 className="text-xl font-extrabold text-slate-800 md:text-2xl mt-1.5">
            ডাক্তার ডিরেক্টরি ({selectedDistrict})
          </h1>
          <p className="text-slate-400 font-bold text-xs mt-0.5">
            ভেরিফাইড বিশেষজ্ঞ ডাক্তারদের তালিকা এবং সময়সূচী খুজে নিন।
          </p>
        </div>

        {/* Reset Filter Action Link */}
        {(searchTerm || selectedSpecialty || selectedFacility || selectedDays.length > 0) && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 self-start rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100/60 cursor-pointer"
            id="reset-filters-btn"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-once" />
            <span>ফিল্টার রিসেট করুন</span>
          </button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Left column: Sidebar Filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5 mb-3.5">
              <SlidersHorizontal className="h-4.5 w-4.5 text-[#0284C7]" />
              <h2 className="text-sm font-bold text-slate-800">সার্চ ফিল্টারসমূহ</h2>
            </div>

            {/* Keyword Search */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                ডাক্তারের নাম বা BM&DC রেজিঃ
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: আশরাফুল, A-45920"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-8.5 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-white"
                  id="filter-search-input"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Specialty Select Radio Buttons */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-[#0284C7] uppercase tracking-wider mb-2">
                বিশেষজ্ঞ বিভাগ (Specialty)
              </label>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                    selectedSpecialty === ''
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/40 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  id="specialty-all-btn"
                >
                  <span>সকল বিশেষজ্ঞ</span>
                  <span className="text-[10px] opacity-70">({doctors.length})</span>
                </button>
                {specialties.map((spec) => {
                  const count = doctors.filter(d => d.specialtyId === spec.id).length;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpecialty(spec.nameBn)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition ${
                        selectedSpecialty === spec.nameBn
                          ? 'bg-slate-100 text-slate-900 border border-slate-200/40 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      id={`specialty-filter-${spec.id}`}
                    >
                      <span>{spec.nameBn}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Facility Filter */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-2">
                হাসপাতাল / চেম্বার
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-700 focus:border-slate-400 focus:outline-none bg-white"
                id="facility-filter-select"
              >
                <option value="">সকল হাসপাতাল/চেম্বার</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visiting Days Filter */}
            <div className="mb-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                রোগী দেখার দিন
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_DAYS.map((day) => {
                  const isChecked = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`rounded-lg border py-1.5 px-1 text-center text-[10px] font-bold transition cursor-pointer ${
                        isChecked
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                          : 'border-slate-200 bg-slate-50/75 text-slate-600 hover:bg-slate-100/70'
                      }`}
                      id={`day-filter-${day}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Right column: Doctor List Grid */}
        <main className="lg:col-span-3">
          {filteredDoctors.length === 0 ? (
            /* Clean Empty State UI */
            <div 
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm"
              id="empty-state-container"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-[#0284C7] mb-4">
                <Search className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">কোনো ডাক্তার পাওয়া যায়নি</h3>
              <p className="mx-auto mt-2 max-w-sm text-[11px] text-slate-400 font-semibold leading-relaxed">
                আপনার দেওয়া ফিল্টারের সাথে মিলে এমন কোনো ডাক্তার এই মুহুর্তে পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো বিশেষজ্ঞ ক্যাটাগরি বা জেলা সিলেক্ট করুন।
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-5 rounded-lg bg-[#0284C7] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#0274af] cursor-pointer"
                id="empty-state-reset-btn"
              >
                সকল ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            /* Doctor Cards Grid */
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredDoctors.map((doc) => {
                return (
                  <div
                    key={doc.id}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#0284C7] shadow-sm"
                    id={`doctor-card-${doc.id}`}
                  >
                    <div>
                      {/* Header: Photo and Verification */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-800 font-black text-xs border border-slate-200">
                            {doc.name.split(' ').filter(n => !n.includes('ডা.') && !n.includes(' can')).map(n => n[0]).slice(0, 2).join('') || 'DR'}
                            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white">
                              <ShieldCheck className="h-3 w-3" />
                            </div>
                          </div>

                          <div>
                            {/* Specialty Badge */}
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/50">
                              {doc.specialtyNameBn || 'মেডিসিন'}
                            </span>
                            <h3 className="mt-1 font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#0284C7] transition">
                              {doc.name}
                            </h3>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200/30">
                          <ShieldCheck className="h-3 w-3" />
                          <span>BM&DC ভেরিফাইড</span>
                        </span>
                      </div>

                      {/* Qualifications & Designation */}
                      <div className="mt-4 border-t border-slate-100 pt-3">
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{doc.degrees}</p>
                        <p className="text-[11px] font-bold text-[#0D9488] mt-0.5">{doc.designation}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{doc.workplace}</p>
                      </div>

                      {/* Chambers list */}
                      <div className="mt-4 space-y-2 rounded-lg bg-slate-50/50 p-3 text-xs text-slate-600 font-semibold border border-slate-100">
                        <div className="flex items-start gap-2">
                          <Building className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed text-[11px]">
                            {doc.facilityName} (কক্ষ: {doc.chamberRoomNo})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-[11px]">{doc.visitingTime}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 leading-relaxed text-[11px]">
                            দিনসমূহ: {doc.visitingDays.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Consultation Fees */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          <span>ফি (নতুন রোগী):</span>
                        </div>
                        <span className="font-extrabold text-slate-800">৳ {doc.feesNew}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span>ফি (পুরাতন রোগী):</span>
                        <span className="font-extrabold text-slate-600">৳ {doc.feesOld}</span>
                      </div>
                    </div>

                    {/* Booking Trigger Button */}
                    <div className="mt-5 pt-2">
                      <button
                        onClick={() => onBookDoctor(doc)}
                        className="w-full rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2.5 text-center text-xs font-bold text-white transition cursor-pointer"
                        id={`book-doctor-btn-${doc.id}`}
                      >
                        সিরিয়াল বুক করুন
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
