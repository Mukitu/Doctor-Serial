import React, { useState, useMemo } from 'react';
import appIcon from '@/app/about/MyDocBD-App-Icon.png';
import { 
  X, 
  Calendar, 
  User, 
  Phone, 
  Hash, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Doctor, Appointment, Chamber } from '../types';

interface BookingModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onAddAppointment: (appointment: Appointment) => void;
  onNavigateToTrack: () => void;
}

// Helper maps for day matching validation
const DAY_MAP: Record<number, string[]> = {
  0: ['sunday', 'sun', 'রবিবার', 'রবি'],
  1: ['monday', 'mon', 'সোমবার', 'সোম'],
  2: ['tuesday', 'tue', 'মঙ্গলবার', 'মঙ্গল'],
  3: ['wednesday', 'wed', 'বুধবার', 'বুধ'],
  4: ['thursday', 'thu', 'বৃহস্পতিবার', 'বৃহস্পতি'],
  5: ['friday', 'fri', 'শুক্রবার', 'শুক্র'],
  6: ['saturday', 'sat', 'শনিবার', 'শনি'],
};

const BENGALI_DAY_NAMES: Record<number, string> = {
  0: 'রবিবার',
  1: 'সোমবার',
  2: 'মঙ্গলবার',
  3: 'বুধবার',
  4: 'বৃহস্পতিবার',
  5: 'শুক্রবার',
  6: 'শনিবার',
};

export function isDateValidForVisitingDays(dateStr: string, visitingDays: string[]): { isValid: boolean; selectedDayNameBn: string } {
  if (!dateStr || !visitingDays || visitingDays.length === 0) {
    return { isValid: true, selectedDayNameBn: '' };
  }

  const parts = dateStr.split('-');
  if (parts.length !== 3) return { isValid: true, selectedDayNameBn: '' };

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  const dayIdx = dateObj.getDay();

  const aliases = DAY_MAP[dayIdx] || [];
  const selectedDayNameBn = BENGALI_DAY_NAMES[dayIdx] || '';

  // Check if visiting days list contains all days / সবদিন
  const isAllDays = visitingDays.some(vd => {
    const vdClean = vd.toLowerCase().trim();
    return vdClean.includes('সবদিন') || vdClean.includes('প্রতিদিন') || vdClean.includes('all');
  });

  if (isAllDays) {
    return { isValid: true, selectedDayNameBn };
  }

  const isValid = visitingDays.some(vd => {
    const vdClean = vd.toLowerCase().trim();
    return aliases.some(alias => vdClean.includes(alias) || alias.includes(vdClean));
  });

  return { isValid, selectedDayNameBn };
}

export default function BookingModal({
  doctor,
  onClose,
  onAddAppointment,
  onNavigateToTrack,
}: BookingModalProps) {
  // Form fields
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  // Multi-chamber state
  const chambersList = useMemo(() => {
    if (!doctor) return [];
    if (doctor.chambers && doctor.chambers.length > 0) {
      return doctor.chambers.map(ch => {
        const facName = ch.facilityName || (ch as any).facility || (ch as any).facility_name || (ch as any).facilities?.name || doctor.facilityName || doctor.facility || 'হাসপাতাল/ডায়াগনস্টিক সেন্টার';
        const facAddr = ch.facilityAddress || (ch as any).facility_address || (ch as any).area_address || (ch as any).facilities?.area_address || doctor.facilityAddress || doctor.chamberAddress || '';
        return {
          ...ch,
          facilityName: facName,
          facilityAddress: facAddr,
        };
      });
    }
    return [
      {
        id: doctor.chamberId || 'primary-chamber',
        doctorId: doctor.doctorId || doctor.id,
        facilityId: doctor.facilityId || '',
        facilityName: doctor.facilityName || doctor.facility || (doctor as any).facilities?.name || 'হাসপাতাল/ডায়াগনস্টিক সেন্টার',
        facilityAddress: doctor.facilityAddress || doctor.chamberAddress || (doctor as any).facilities?.area_address || '',
        roomNo: doctor.chamberRoomNo || '',
        floor: doctor.chamberFloor || 'নিচতলা',
        buildingStand: doctor.chamberBuildingStand || 'মেইন বিল্ডিং',
        visitingDays: doctor.visitingDays || [],
        visitingTime: doctor.visitingTime || '',
        feeNew: doctor.feesNew || 0,
        feeOld: doctor.feesOld || 0,
      } as Chamber
    ];
  }, [doctor]);

  const [selectedChamberIndex, setSelectedChamberIndex] = useState(0);

  // Selected chamber details
  const currentChamber = chambersList[selectedChamberIndex] || chambersList[0];

  // Day validation computation
  const dayValidation = useMemo(() => {
    if (!preferredDate || !currentChamber) {
      return { isValid: true, selectedDayNameBn: '' };
    }
    return isDateValidForVisitingDays(preferredDate, currentChamber.visitingDays || []);
  }, [preferredDate, currentChamber]);

  // Status and tracking states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [error, setError] = useState('');

  if (!doctor) return null;

  // Generate date bounds (from today to 30 days from now)
  const todayStr = new Date().toISOString().split('T')[0];
  const maxDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!patientName.trim()) {
      setError('অনুগ্রহ করে রোগীর নাম প্রদান করুন।');
      return;
    }
    const ageNum = parseInt(patientAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setError('অনুগ্রহ করে সঠিক বয়স প্রদান করুন।');
      return;
    }
    if (!/^(01)[3-9]\d{8}$/.test(patientMobile)) {
      setError('অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }
    if (!preferredDate) {
      setError('অনুগ্রহ করে কাঙ্ক্ষিত তারিখ নির্বাচন করুন।');
      return;
    }

    if (!dayValidation.isValid) {
      setError(`নির্বাচিত তারিখে (${dayValidation.selectedDayNameBn}) ডা. ${doctor.name} এই চেম্বারে বসেন না। বসার নির্ধারিত দিনে তারিখ সিলেক্ট করুন।`);
      return;
    }

    // Generate tracking ID (e.g., RJ-4921)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `RJ-${randomNum}`;

    const facName = currentChamber?.facilityName || doctor.facilityName || doctor.facility || '';
    const room = currentChamber?.roomNo || doctor.chamberRoomNo || '';
    const flr = currentChamber?.floor || doctor.chamberFloor || '';
    const bld = currentChamber?.buildingStand || doctor.chamberBuildingStand || '';
    const vTime = currentChamber?.visitingTime || doctor.visitingTime || '';

    const newAppointment: Appointment = {
      id: trackingId,
      doctorId: doctor.id,
      chamberId: currentChamber?.id || doctor.chamberId || '',
      doctorName: doctor.name,
      facilityName: facName,
      assignedFacilityName: facName,
      chamberRoomNo: room,
      assignedRoomNo: room,
      chamberFloor: flr,
      assignedFloor: flr,
      chamberBuildingStand: bld,
      assignedBuilding: bld,
      visitingTime: vTime,
      confirmedVisitingTime: vTime,
      patientName: patientName,
      patientAge: ageNum,
      patientMobile: patientMobile,
      preferredDate: preferredDate,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    onAddAppointment(newAppointment);
    setGeneratedId(trackingId);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xl overflow-y-auto max-h-[90vh]"
        id="booking-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
          id="close-booking-modal-btn"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          /* BOOKING FORM VIEW */
          <div>
            {/* Header / Doctor Info */}
            <div className="border-b border-slate-200 pb-4 pr-8">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="/MyDocBD-App-Icon.png" alt="MyDocBD App Icon" className="h-6 w-6 object-contain rounded" />
                <span className="text-xs font-black text-[#0284C7] uppercase tracking-wider">সিরিয়াল বুকিং</span>
                <span className="inline-flex rounded-md bg-[#0284C7]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#0284C7] border border-[#0284C7]/20 ml-auto">
                  {doctor.specialtyNameBn || doctor.specialty || 'মেডিসিন'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-800" id="modal-doctor-name">
                {doctor.name}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                {doctor.degrees} • {doctor.designation}
              </p>
              <p className="text-[11px] font-semibold text-[#0D9488] mt-0.5">
                {doctor.workplace}
              </p>
            </div>

            {/* CHAMBER SELECTION RADIO CARDS */}
            <div className="mt-5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-[#0284C7]" />
                <span>চেম্বার / হাসপাতাল নির্বাচন করুন ({chambersList.length} টি চেম্বার উপলব্ধ)</span>
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {chambersList.map((ch, idx) => {
                  const isSelected = selectedChamberIndex === idx;
                  return (
                    <div
                      key={ch.id || idx}
                      onClick={() => setSelectedChamberIndex(idx)}
                      className={`relative flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer ${
                        isSelected 
                          ? 'border-[#0284C7] bg-sky-50/40 ring-2 ring-[#0284C7]/20 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      id={`chamber-option-${idx}`}
                    >
                      <input
                        type="radio"
                        name="chamberSelection"
                        checked={isSelected}
                        onChange={() => setSelectedChamberIndex(idx)}
                        className="mt-1 h-4 w-4 text-[#0284C7] focus:ring-[#0284C7]"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-800">
                            {ch.facilityName || (ch as any).facility || (ch as any).facility_name || (ch as any).facilities?.name || doctor.facilityName || doctor.facility || 'হাসপাতাল/ডায়াগনস্টিক সেন্টার'}
                          </span>
                          <span className="text-[11px] font-bold text-[#0D9488] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                            ফি: ৳{ch.feeNew} (নতুন) / ৳{ch.feeOld} (পুরাতন)
                          </span>
                        </div>

                        {ch.facilityAddress && (
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            ঠিকানা: {ch.facilityAddress}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-600">
                          {ch.roomNo && (
                            <span className="text-slate-700 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              কক্ষ: {ch.roomNo} ({ch.floor || 'নিচতলা'}, {ch.buildingStand || 'মেইন ভবন'})
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-600">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{ch.visitingTime || 'সময়সূচী'}</span>
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-800">
                          <Calendar className="h-3.5 w-3.5 text-[#0284C7] shrink-0" />
                          <span>
                            বসার দিনসমূহ: {Array.isArray(ch.visitingDays) && ch.visitingDays.length > 0 ? ch.visitingDays.join(', ') : 'সবদিন'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="appointment-form">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 border-t border-slate-100 pt-4">
                <User className="h-3.5 w-3.5 text-[#0D9488]" /> রোগী বা আবেদনকারীর তথ্য ও তারিখ
              </h3>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-700 border border-rose-200 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Patient Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600">রোগীর নাম (Full Name) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="যেমন: আবদুর রহমান"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      id="input-patient-name"
                    />
                    <User className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Patient Age */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600">রোগীর বয়স (Age) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      placeholder="যেমন: ৩০"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      id="input-patient-age"
                    />
                    <Hash className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Patient Mobile */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600">মোবাইল নম্বর (১১ ডিজিট) *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 01712345678"
                      value={patientMobile}
                      onChange={(e) => setPatientMobile(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      id="input-patient-mobile"
                    />
                    <Phone className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Preferred Date with Day Matching Validation */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-[11px] font-bold text-slate-600">সিরিয়ালের কাঙ্ক্ষিত তারিখ *</label>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400">বসার দিন:</span>
                      {(currentChamber?.visitingDays && currentChamber.visitingDays.length > 0 ? currentChamber.visitingDays : ['সবদিন']).map((d, idx) => (
                        <span key={idx} className="inline-flex rounded bg-[#0284C7]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#0284C7] border border-[#0284C7]/20">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      max={maxDateStr}
                      value={preferredDate}
                      onChange={(e) => {
                        const dateVal = e.target.value;
                        if (!dateVal) {
                          setPreferredDate('');
                          setError('');
                          return;
                        }
                        const parts = dateVal.split('-');
                        if (parts.length === 3) {
                          const year = parseInt(parts[0], 10);
                          const month = parseInt(parts[1], 10) - 1;
                          const day = parseInt(parts[2], 10);
                          const selectedDate = new Date(year, month, day);
                          const dayOfWeek = selectedDate.getDay();

                          const getActiveIndexes = (days: string[]): number[] => {
                            if (!days || days.length === 0) return [0, 1, 2, 3, 4, 5, 6];
                            const daysLower = days.map(d => d.toLowerCase().trim());
                            if (daysLower.some(d => d.includes('সবদিন') || d.includes('প্রতিদিন') || d.includes('all'))) {
                              return [0, 1, 2, 3, 4, 5, 6];
                            }
                            const indexes: number[] = [];
                            const map = [
                              { keywords: ['রবিবার', 'রবি', 'sun', 'sunday'], idx: 0 },
                              { keywords: ['সোমবার', 'সোম', 'mon', 'monday'], idx: 1 },
                              { keywords: ['মঙ্গলবার', 'মঙ্গল', 'tue', 'tuesday'], idx: 2 },
                              { keywords: ['বুধবার', 'বুধ', 'wed', 'wednesday'], idx: 3 },
                              { keywords: ['বৃহস্পতিবার', 'বৃহস্পতি', 'thu', 'thursday'], idx: 4 },
                              { keywords: ['শুক্রবার', 'শুক্র', 'fri', 'friday'], idx: 5 },
                              { keywords: ['শনিবার', 'শনি', 'sat', 'saturday'], idx: 6 },
                            ];
                            for (const item of map) {
                              if (daysLower.some(d => item.keywords.some(k => d.includes(k)))) {
                                indexes.push(item.idx);
                              }
                            }
                            return indexes.length > 0 ? indexes : [0, 1, 2, 3, 4, 5, 6];
                          };

                          const activeIndexes = getActiveIndexes(currentChamber?.visitingDays || []);
                          if (!activeIndexes.includes(dayOfWeek)) {
                            setPreferredDate('');
                            const daysListStr = Array.isArray(currentChamber?.visitingDays) && currentChamber.visitingDays.length > 0
                              ? currentChamber.visitingDays.join(', ')
                              : 'সবদিন';
                            setError(`নির্বাচিত তারিখে ডাক্তার এই চেম্বারে বসেন না। ডাক্তারের বসার দিন: [${daysListStr}]`);
                            return;
                          }
                        }
                        setError('');
                        setPreferredDate(dateVal);
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      id="input-booking-date"
                    />
                    <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  {preferredDate && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <Check className="h-3 w-3" />
                      <span>সঠিক তারিখ নির্বাচিত হয়েছে ({dayValidation.selectedDayNameBn})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  id="cancel-booking-btn"
                >
                  বাতিল করুন
                </button>
                
                <button
                  type="submit"
                  disabled={!dayValidation.isValid}
                  className={`rounded-lg px-5 py-2.5 text-xs font-bold text-white transition shadow-xs ${
                    dayValidation.isValid
                      ? 'bg-[#0284C7] hover:bg-[#0274af] cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed opacity-70'
                  }`}
                  id="submit-booking-btn"
                >
                  সিরিয়াল রিকোয়েস্ট সাবমিট করুন
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* BOOKING SUCCESS VIEW */
          <div className="py-8 text-center" id="booking-success-view">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0D9488] mb-5 border border-emerald-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-200/30 mb-2">
              ● সিরিয়াল রিকোয়েস্টটি পর্যালোচনায় আছে
            </span>

            <h2 className="text-xl font-bold text-slate-800">MyDocBD-তে আপনার রিকোয়েস্টটি গৃহীত হয়েছে।</h2>
            
            <div className="mx-auto mt-4 max-w-md rounded-xl bg-slate-50 border border-slate-200 p-5 text-center shadow-sm">
              <p className="text-xs font-bold text-sky-600 mb-1.5 uppercase tracking-wide">আপনার ট্র্যাকিং মোবাইল নম্বর</p>
              <p className="text-xl font-black text-slate-800 font-mono tracking-wider">{patientMobile}</p>
              
              <p className="mt-3 text-xs font-bold text-slate-700 leading-relaxed bg-white rounded-lg p-3 border border-slate-100">
                চেম্বার: <b>{currentChamber.facilityName}</b>
                <br />
                তারিখ: <b>{preferredDate} ({dayValidation.selectedDayNameBn})</b>
              </p>
              
              <p className="mt-2 text-[11px] font-semibold text-slate-500">
                MyDocBD টিম সরাসরি চেম্বার থেকে সিরিয়াল নিশ্চিত করে আপনাকে আপডেট জানাবে।
              </p>
            </div>

            {/* Detailed Info Card */}
            <div className="mx-auto mt-6 max-w-md rounded-lg bg-emerald-50/50 border border-emerald-100/70 p-4 text-left text-xs text-emerald-900 font-semibold">
              <p className="font-bold flex items-center gap-1 text-[#0D9488]">
                <AlertCircle className="h-4 w-4" /> পরবর্তী আপডেট প্রক্রিয়া:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1.5 text-[11px] text-emerald-800 leading-relaxed font-semibold">
                <li>আমাদের প্রতিনিধি চেম্বার থেকে অল্প সময়ের মাঝে আপনার সিরিয়াল নম্বর ও সময় কনফার্ম করবেন।</li>
                <li>সিরিয়াল কনফার্ম হলে যেকোনো সময় এই মোবাইল নম্বর দিয়ে লগইন ছাড়াই সম্পূর্ণ বিবরণ দেখতে পারবেন।</li>
                <li>সিরিয়ালের লাইভ স্ট্যাটাস দেখতে উপরে ও মেনুতে <b>"সিরিয়াল ট্র্যাক করুন"</b> বাটনে চাপ দিন।</li>
              </ul>
            </div>

            {/* CTA Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                id="success-close-btn"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTrack();
                }}
                className="w-full sm:w-auto rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                id="success-track-btn"
              >
                সিরিয়াল ট্র্যাকিং স্ক্রিনে যান
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
