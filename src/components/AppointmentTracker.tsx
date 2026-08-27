import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  Phone, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ArrowRight,
  BadgeAlert,
  ClipboardList,
  Stethoscope,
  Building,
  DollarSign
} from 'lucide-react';
import { Appointment } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AppointmentTrackerProps {
  appointments: Appointment[];
}

export default function AppointmentTracker({ appointments }: AppointmentTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Calculate local today string (YYYY-MM-DD)
  const getTodayStr = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSearched(true);

    const phoneQuery = searchQuery.trim();
    if (!phoneQuery) {
      setValidationError('অনুগ্রহ করে আপনার ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।');
      setResults([]);
      return;
    }

    // Strictly validate 11-digit mobile number format
    if (!/^(01)[3-9]\d{8}$/.test(phoneQuery)) {
      setValidationError('অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।');
      setResults([]);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      setLoading(true);
      try {
        // Fetch ALL appointments for this patient phone
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors (
              name,
              degrees,
              fees_new,
              fees_old,
              specialties (
                name_bn
              )
            ),
            chambers (
              room_no,
              floor,
              building_stand,
              visiting_time,
              facilities (
                name,
                area_address
              )
            )
          `)
          .eq('patient_phone', phoneQuery);

        if (error) throw error;

        const mappedResults: Appointment[] = (data || []).map((app: any) => {
          const doc = app.doctors;
          const spec = doc?.specialties;
          const ch = app.chambers;
          const fac = ch?.facilities;
          const phone = app.patient_phone || '';
          return {
            id: app.booking_code || app.id,
            doctorId: app.doctor_id,
            doctorName: doc?.name || 'Unknown Doctor',
            doctorDegrees: doc?.degrees || '',
            doctorSpecialty: spec?.name_bn || '',
            chamberId: app.chamber_id,
            facilityName: fac?.name || '',
            facilityAddress: fac?.area_address || '',
            patientName: app.patient_name,
            patientAge: app.patient_age,
            patientPhone: phone,
            patientMobile: phone,
            preferredDate: app.preferred_date,
            status: app.status as Appointment['status'],
            serialNo: app.serial_no || undefined,
            assignedRoomNo: app.assigned_room_no || ch?.room_no || undefined,
            assignedFloor: app.assigned_floor || ch?.floor || undefined,
            assignedBuilding: app.assigned_building || ch?.building_stand || undefined,
            confirmedVisitingTime: app.confirmed_visiting_time || ch?.visiting_time || undefined,
            rejectionReason: app.rejection_reason || undefined,
            adminNotes: app.admin_notes || undefined,
            createdAt: app.created_at,
            updatedAt: app.updated_at
          };
        });

        // Sort by date newest first
        mappedResults.sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));
        setResults(mappedResults);
      } catch (err) {
        console.error('Real-time tracking error:', err);
        // Fallback to local filtering
        filterLocal(phoneQuery);
      } finally {
        setLoading(false);
      }
    } else {
      filterLocal(phoneQuery);
    }
  };

  const filterLocal = (phoneNum: string) => {
    const found = appointments.filter(
      (app) => app.patientMobile === phoneNum || app.patientPhone === phoneNum
    );
    // Sort by date newest first
    found.sort((a, b) => b.preferredDate.localeCompare(a.preferredDate));
    setResults(found);
  };

  // Helper to determine the lifecycle status of an appointment
  const getSmartLifecycle = (app: Appointment) => {
    const todayStr = getTodayStr();
    
    if (app.status === 'Pending') {
      return {
        type: 'pending' as const,
        titleBn: 'অপেক্ষমান',
        badgeClass: 'bg-amber-50 border border-amber-200 text-amber-700',
        message: 'আপনার রিকোয়েস্টটি পর্যালোচনায় আছে। আমাদের প্রতিনিধি চেম্বার থেকে সিরিয়াল নম্বর কনফার্ম করছেন।',
        bgGradient: 'from-amber-50/50 to-amber-100/10'
      };
    }
    
    if (app.status === 'Confirmed') {
      if (app.preferredDate >= todayStr) {
        return {
          type: 'active' as const,
          titleBn: 'নিশ্চিত ও সক্রিয়',
          badgeClass: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
          message: 'চেম্বার থেকে আপনার কাঙ্ক্ষিত সিরিয়ালটি সফলভাবে নিশ্চিত করা হয়েছে।',
          bgGradient: 'from-emerald-50/50 to-emerald-100/10'
        };
      } else {
        return {
          type: 'completed' as const,
          titleBn: 'সেবা সম্পন্ন (অতীত ইতিহাস)',
          badgeClass: 'bg-slate-100 border border-slate-300 text-slate-600',
          message: 'ভিজিট সম্পন্ন হয়েছে',
          bgGradient: 'from-slate-50/80 to-slate-100/30'
        };
      }
    }

    return {
      type: 'rejected' as const,
      titleBn: 'বাতিল',
      badgeClass: 'bg-rose-50 border border-rose-200 text-rose-700',
      message: app.rejectionReason || 'অনিবার্য কারণবশত আপনার সিরিয়াল রিকোয়েস্টটি বাতিল করা হয়েছে।',
      bgGradient: 'from-rose-50/50 to-rose-100/10'
    };
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0284C7]/5 px-3.5 py-1.5 text-[11px] font-black text-[#0284C7] border border-[#0284C7]/15">
          <ClipboardList className="h-3.5 w-3.5" /> ১০০% সুরক্ষিত লাইভ আপডেট পোর্টাল
        </span>
        <h1 className="text-xl font-bold text-slate-900 md:text-3xl mt-3 tracking-tight font-sans">
          সিরিয়াল ট্র্যাকিং ও ইতিহাস
        </h1>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-lg mx-auto leading-relaxed">
          আপনার <span className="text-[#0284C7]">১১ ডিজিটের মোবাইল নম্বর</span> দিয়ে রাজশাহী অঞ্চলের সকল ডাক্তারের চেম্বার সিরিয়ালের বর্তমান অবস্থা এবং পূর্ববর্তী ইতিহাস দেখুন।
        </p>
      </div>

      {/* Tracking Form */}
      <form 
        onSubmit={handleSearch} 
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        id="tracker-search-form"
      >
        <div className="flex flex-col gap-3">
          <label className="block text-xs font-bold text-slate-500">রোগীর মোবাইল নম্বর দিন</label>
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative w-full">
              <input
                type="tel"
                placeholder="যেমন: 017XXXXXXXX"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxLength={11}
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] bg-slate-50/50"
                id="tracker-search-input"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-6 py-3 text-xs font-bold text-white transition cursor-pointer flex items-center justify-center gap-1.5"
              id="tracker-submit-btn"
            >
              <Search className="h-4 w-4" />
              <span>অনুসন্ধান করুন</span>
            </button>
          </div>
          {validationError && (
            <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}
        </div>
      </form>

      {/* Results Display */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" id="tracker-loading-spinner">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[#0284C7]" />
            <p className="mt-3 text-xs font-bold text-slate-500">সার্ভার থেকে তথ্য সংগ্রহ করা হচ্ছে...</p>
          </div>
        ) : searched && !validationError && (
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                খুঁজে পাওয়া বুকিং সমূহ ({results.length} টি)
              </h2>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded">
                {searchQuery}
              </span>
            </div>

            {results.length === 0 ? (
              <div 
                className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
                id="tracker-no-results"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 border border-amber-100">
                  <BadgeAlert className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">কোন বুকিং পাওয়া যায়নি</h3>
                <p className="mx-auto mt-2 max-w-xs text-xs text-slate-500 leading-relaxed font-semibold">
                  প্রদত্ত মোবাইল নম্বর "{searchQuery}" দিয়ে কোনো সিরিয়াল রিকোয়েস্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক মোবাইল নম্বর দিয়ে আবার চেষ্টা করুন।
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {results.map((app) => {
                  const lifecycle = getSmartLifecycle(app);
                  return (
                    <div
                      key={app.id}
                      className={`overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br ${lifecycle.bgGradient} shadow-sm transition hover:shadow-md`}
                      id={`tracking-card-${app.id}`}
                    >
                      {/* Top status bar */}
                      <div className="flex items-center justify-between border-b border-slate-150 p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>আবেদনের তারিখ:</span>
                          <strong className="text-slate-700">
                            {new Date(app.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </strong>
                        </div>
                        <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${lifecycle.badgeClass}`}>
                          {lifecycle.titleBn}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="p-5">
                        {/* 1. Status Callout */}
                        <div className="mb-5 rounded-lg bg-white/70 border border-slate-100 p-3 flex items-start gap-2 text-xs font-semibold text-slate-700 shadow-inner">
                          {lifecycle.type === 'active' && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />}
                          {lifecycle.type === 'pending' && <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />}
                          {lifecycle.type === 'completed' && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />}
                          {lifecycle.type === 'rejected' && <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />}
                          <div>
                            <span className="font-extrabold text-slate-800">স্ট্যাটাস মেসেজ: </span>
                            {lifecycle.message}
                          </div>
                        </div>

                        {/* 2. Main Details Grid */}
                        <div className="grid gap-5 md:grid-cols-2">
                          
                          {/* Left Column: Doctor Details */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <Stethoscope className="h-3.5 w-3.5 text-[#0284C7]" /> চিকিৎসক ও চেম্বারের তথ্য
                            </h4>
                            <div className="rounded-lg bg-white border border-slate-150 p-3.5 shadow-sm space-y-2">
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{app.doctorName}</h5>
                                <p className="text-[10px] font-bold text-[#0D9488] mt-0.5">{app.doctorDegrees || 'এমবিবিএস'}</p>
                              </div>
                              <div className="border-t border-slate-100 pt-2 space-y-1 text-xs text-slate-600 font-semibold">
                                <p className="flex items-center gap-1.5">
                                  <Building className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{app.facilityName || 'পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী'}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 pl-5">
                                  {app.facilityAddress || 'লক্ষ্মীপুর, রাজশাহী'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Serial confirmation details or past summary */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-indigo-600" /> সিরিয়াল ও রোগীর বিবরণ
                            </h4>
                            
                            {/* If Active / Confirmed Upcoming */}
                            {lifecycle.type === 'active' && (
                              <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-4 space-y-3 shadow-xs">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-emerald-150 pb-3 text-center">
                                  <div className="p-2 rounded bg-white border border-emerald-100">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">সিরিয়াল নং</span>
                                    <p className="text-base font-black text-emerald-800">#{app.serialNo || 'নির্ধারিত'}</p>
                                  </div>
                                  <div className="p-2 rounded bg-white border border-emerald-100">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">রুম নম্বর</span>
                                    <p className="text-base font-black text-emerald-800">{app.assignedRoomNo || 'নির্ধারিত নয়'}</p>
                                  </div>
                                  <div className="p-2 rounded bg-white border border-emerald-100">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">ফ্লোর / তলা</span>
                                    <p className="text-xs font-black text-emerald-800 mt-1">{app.assignedFloor || 'নিচতলা'}</p>
                                  </div>
                                  <div className="p-2 rounded bg-white border border-emerald-100">
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">বিল্ডিং / স্ট্যান্ড</span>
                                    <p className="text-[11px] font-black text-emerald-800 mt-1 truncate" title={app.assignedBuilding || 'মেইন ভবন'}>
                                      {app.assignedBuilding || 'মেইন ভবন'}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1 text-[11px] text-slate-600 font-bold">
                                  <p className="flex justify-between">
                                    <span>রোগীর নাম:</span>
                                    <span className="text-slate-800">{app.patientName} ({app.patientAge} বছর)</span>
                                  </p>
                                  <p className="flex justify-between">
                                    <span>ভিজিটের সময়সূচী:</span>
                                    <span className="text-indigo-700 font-extrabold">{app.confirmedVisitingTime || 'চেম্বার সময়সূচী অনুযায়ী'}</span>
                                  </p>
                                  <p className="flex justify-between text-[#0D9488]">
                                    <span>সিরিয়ালের তারিখ:</span>
                                    <span className="font-extrabold">{app.preferredDate}</span>
                                  </p>
                                  {app.adminNotes && (
                                    <p className="p-2 rounded bg-white/80 border border-emerald-100 text-[10px] text-slate-600 font-medium mt-1">
                                      <strong className="text-emerald-700">বিশেষ দ্রষ্টব্য:</strong> {app.adminNotes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* If Completed Past */}
                            {lifecycle.type === 'completed' && (
                              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2 shadow-sm text-xs">
                                <p className="text-[#0D9488] font-bold flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-100">
                                  <CheckCircle2 className="h-4 w-4" /> ভিজিট সম্পন্ন হয়েছে
                                </p>
                                <div className="space-y-1 text-slate-500 font-semibold pl-1">
                                  <p>রোগী: <strong className="text-slate-700">{app.patientName} ({app.patientAge} বছর)</strong></p>
                                  <p>তারিখ: <strong className="text-slate-700">{app.preferredDate}</strong></p>
                                  <p>কনফার্মড সিরিয়াল: <strong className="text-slate-700">{app.serialNo || 'N/A'}</strong></p>
                                </div>
                              </div>
                            )}

                            {/* If Pending */}
                            {lifecycle.type === 'pending' && (
                              <div className="rounded-lg bg-amber-50/30 border border-amber-100 p-3.5 space-y-2 text-xs">
                                <p className="text-amber-800 font-bold flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-amber-500" /> সিরিয়াল নিশ্চিতকরণ পেন্ডিং আছে
                                </p>
                                <div className="space-y-1 text-slate-600 font-semibold pl-1 text-[11px]">
                                  <p>আবেদনকারী: <strong className="text-slate-800">{app.patientName} ({app.patientAge} বছর)</strong></p>
                                  <p>মোবাইল নম্বর: <strong className="text-slate-800">{app.patientMobile}</strong></p>
                                  <p>কাঙ্ক্ষিত তারিখ: <strong className="text-indigo-700 font-bold">{app.preferredDate}</strong></p>
                                </div>
                              </div>
                            )}

                            {/* If Rejected */}
                            {lifecycle.type === 'rejected' && (
                              <div className="rounded-lg bg-rose-50/40 border border-rose-100 p-3.5 space-y-1.5 text-xs">
                                <p className="text-rose-700 font-bold flex items-center gap-1">
                                  <XCircle className="h-4 w-4 text-rose-500" /> সিরিয়াল আবেদন বাতিল হয়েছে
                                </p>
                                <p className="text-slate-600 pl-1">রোগী: <strong className="text-slate-800">{app.patientName}</strong></p>
                                {app.rejectionReason && (
                                  <div className="bg-white rounded p-2 border border-rose-100 mt-2">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">বাতিল করার কারণ</p>
                                    <p className="text-[11px] font-bold text-rose-700 mt-0.5">{app.rejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Informational static guide before user searches */}
        {!searched && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-[#0284C7]" /> কীভাবে লাইভ সিরিয়াল ট্র্যাক করবেন?
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-600 font-semibold leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[#0284C7] font-black text-sm mb-1">১. নম্বর প্রবেশ করুন</p>
                <p className="text-slate-500 text-[11px]">বুকিং বা আবেদনের সময় ব্যবহৃত আপনার ১১ ডিজিটের মোবাইল নম্বরটি লিখুন।</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[#0284C7] font-black text-sm mb-1">২. অনুসন্ধান চাপুন</p>
                <p className="text-slate-500 text-[11px]">খুঁজুন বাটনে ক্লিক করুন। সিস্টেম সেকেন্ডের মধ্যে আপনার ডেটা নিয়ে আসবে।</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[#0284C7] font-black text-sm mb-1">৩. স্ট্যাটাস দেখুন</p>
                <p className="text-slate-500 text-[11px]">আপনার সিরিয়াল পেন্ডিং, কনফার্মড নাকি অতীত ইতিহাস তা সহজে দেখে নিন।</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
