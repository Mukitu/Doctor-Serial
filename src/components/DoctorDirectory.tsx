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
  UserCheck,
  Star,
  Eye,
  X,
  Filter
} from 'lucide-react';
import { Doctor, Specialty, Facility, District } from '../types';
import { filterDoctorsList } from '../utils/filterDoctors';
import DoctorProfileModal from './DoctorProfileModal';
import DoctorCard from './DoctorCard';
import PromoBannerComponent from './PromoBanner';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  specialties: Specialty[];
  facilities: Facility[];
  districts: District[];
  onBookDoctor: (doctor: Doctor) => void;
  initialFilters: { district: string; specialty: string; facility: string };
  resetInitialFilters: () => void;
  selectedDistrict: string;
  setSelectedDistrict?: (district: string) => void;
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
  setSelectedDistrict,
}: DoctorDirectoryProps) {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialFilters.specialty);
  const [selectedFacility, setSelectedFacility] = useState(initialFilters.facility);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null);

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

  // Filter Logic using unified helper
  const filteredDoctors = useMemo(() => {
    return filterDoctorsList(
      doctors,
      {
        searchTerm,
        selectedDistrict,
        selectedSpecialty,
        selectedFacility,
        selectedDays
      },
      specialties,
      districts
    ).sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0));
  }, [doctors, searchTerm, selectedSpecialty, selectedFacility, selectedDistrict, selectedDays, specialties, districts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex rounded-lg bg-[#0284C7]/10 px-2 py-0.5 text-[10px] font-bold text-[#0284C7]">
            ● ফিল্টারিং প্যানেল
          </span>
          <h1 className="text-xl font-extrabold text-slate-800 md:text-2xl mt-1.5">
            ডাক্তার ডিরেক্টরি {selectedDistrict ? `(${selectedDistrict})` : ''}
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
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <SlidersHorizontal className="h-4.5 w-4.5 text-[#0284C7]" />
              <h2 className="text-sm font-bold text-slate-800">সার্চ ফিল্টারসমূহ</h2>
            </div>

            {/* District Selector in Sidebar */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                জেলা (District)
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict?.(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-8 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-white cursor-pointer"
                  id="sidebar-district-select"
                >
                  <option value="সকল জেলা">সকল জেলা (All)</option>
                  {districts && districts.filter(d => d.isActive !== false).map((dist) => (
                    <option key={dist.id} value={dist.nameBn}>
                      {dist.nameBn} {dist.nameEn ? `(${dist.nameEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
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
            <div>
              <label className="block text-[10px] font-bold text-[#0284C7] uppercase tracking-wider mb-1.5">
                বিশেষজ্ঞ বিভাগ (Specialty)
              </label>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedSpecialty('')}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition cursor-pointer ${
                    selectedSpecialty === '' || selectedSpecialty === 'সকল বিশেষজ্ঞ'
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/40 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  id="specialty-all-btn"
                >
                  <span>সকল বিশেষজ্ঞ (All)</span>
                  <span className="text-[10px] opacity-70">({doctors.length})</span>
                </button>
                {specialties.filter(s => s.isActive !== false).map((spec) => {
                  const count = doctors.filter(d => 
                    d.specialtyId === spec.id || 
                    d.specialty === spec.nameBn || 
                    d.specialtyNameBn === spec.nameBn
                  ).length;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpecialty(spec.nameBn)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition cursor-pointer ${
                        selectedSpecialty === spec.nameBn
                          ? 'bg-slate-100 text-slate-900 border border-slate-200/40 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      id={`specialty-filter-${spec.id}`}
                    >
                      <span className="line-clamp-1">{spec.nameBn}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Facility Filter */}
            <div>
              <label className="block text-[10px] font-bold text-[#0D9488] uppercase tracking-wider mb-1.5">
                হাসপাতাল / চেম্বার
              </label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-700 focus:border-slate-400 focus:outline-none bg-white cursor-pointer"
                id="facility-filter-select"
              >
                <option value="">সকল হাসপাতাল ও ডায়াগনস্টিক (All)</option>
                {facilities.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visiting Days Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
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
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Sidebar Promo Banner Slot */}
            <PromoBannerComponent slot="sidebar_rect" className="mt-4 shadow-xs" />
          </div>
        </aside>

        {/* Right column: Doctor List Grid */}
        <main className="lg:col-span-3">
          {/* Active Filter Indicators and Count */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>ফলাফল:</span>
                <span className="rounded-md bg-[#0284C7]/10 px-2 py-0.5 text-xs font-black text-[#0284C7]">
                  {filteredDoctors.length} জন ডাক্তার
                </span>
              </span>

              {/* Active Filter Chips */}
              {selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)' && selectedDistrict !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700 border border-sky-200">
                  <span>জেলা: {selectedDistrict}</span>
                  <button 
                    onClick={() => setSelectedDistrict?.('সকল জেলা')}
                    className="hover:text-sky-900 cursor-pointer ml-0.5"
                    title="মুছে ফেলুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedSpecialty && selectedSpecialty !== 'সকল বিশেষজ্ঞ' && selectedSpecialty !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
                  <span>বিশেষজ্ঞ: {selectedSpecialty}</span>
                  <button 
                    onClick={() => setSelectedSpecialty('')}
                    className="hover:text-blue-900 cursor-pointer ml-0.5"
                    title="মুছে ফেলুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedFacility && selectedFacility !== 'সকল হাসপাতাল/চেম্বার' && selectedFacility !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[11px] font-bold text-teal-700 border border-teal-200">
                  <span>হাসপাতাল: {selectedFacility}</span>
                  <button 
                    onClick={() => setSelectedFacility('')}
                    className="hover:text-teal-900 cursor-pointer ml-0.5"
                    title="মুছে ফেলুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                  <span>অনুসন্ধান: "{searchTerm}"</span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="hover:text-amber-950 cursor-pointer ml-0.5"
                    title="মুছে ফেলুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {selectedDays.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <span>দিন: {selectedDays.join(', ')}</span>
                  <button 
                    onClick={() => setSelectedDays([])}
                    className="hover:text-emerald-950 cursor-pointer ml-0.5"
                    title="মুছে ফেলুন"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Clear All Trigger */}
            {(searchTerm || selectedSpecialty || selectedFacility || selectedDays.length > 0 || (selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)')) && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                সব ফিল্টার মুছুন
              </button>
            )}
          </div>

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
              {filteredDoctors.map((doc, idx) => (
                <React.Fragment key={doc.id}>
                  <DoctorCard
                    doctor={doc}
                    onSelectProfile={(d) => setSelectedDoctorForModal(d)}
                    onBookNow={(d) => onBookDoctor(d)}
                  />
                  {idx === 3 && (
                    <div className="col-span-full my-2">
                      <PromoBannerComponent slot="directory_middle" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Doctor Profile & Reviews Modal */}
      <DoctorProfileModal
        doctor={selectedDoctorForModal}
        isOpen={!!selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onBookNow={(doc) => onBookDoctor(doc)}
      />
    </div>
  );
}
