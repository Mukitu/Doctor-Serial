import React from 'react';
import { 
  Building, 
  Calendar, 
  Clock, 
  CreditCard, 
  Eye, 
  ShieldCheck, 
  Star
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorCardProps {
  key?: string | number;
  doctor: Doctor;
  onSelectProfile: (doctor: Doctor) => void;
  onBookNow: (doctor: Doctor) => void;
}

export default function DoctorCard({
  doctor,
  onSelectProfile,
  onBookNow,
}: DoctorCardProps) {
  const chambersList = doctor.chambers && doctor.chambers.length > 0 
    ? doctor.chambers 
    : [
        {
          id: doctor.chamberId || 'primary',
          doctorId: doctor.doctorId || doctor.id,
          facilityId: doctor.facilityId || '',
          facilityName: doctor.facilityName || doctor.facility || 'হাসপাতাল/চেম্বার',
          facilityAddress: doctor.facilityAddress || doctor.chamberAddress || '',
          roomNo: doctor.chamberRoomNo || '',
          floor: doctor.chamberFloor || 'নিচতলা',
          buildingStand: doctor.chamberBuildingStand || 'মেইন বিল্ডিং',
          visitingDays: doctor.visitingDays || [],
          visitingTime: doctor.visitingTime || '',
          feeNew: doctor.feesNew || 0,
          feeOld: doctor.feesOld || 0,
        }
      ];

  // Primary chamber or first chamber for fee display
  const primaryChamber = chambersList[0];

  return (
    <div
      onClick={() => onSelectProfile(doctor)}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#0284C7] hover:shadow-md shadow-sm cursor-pointer"
      id={`doctor-card-${doctor.id}`}
    >
      <div>
        {/* Header: Photo, Specialty, Verification & Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectProfile(doctor);
              }}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-800 font-black text-xs border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 transition"
            >
              {doctor.photoUrl ? (
                <img
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>
                  {doctor.name
                    .split(' ')
                    .filter(n => !n.includes('ডা.') && !n.includes('অধ্যাপক'))
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('') || 'DR'}
                </span>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white">
                <ShieldCheck className="h-3 w-3" />
              </div>
            </div>

            <div>
              {/* Specialty Badges & Rating */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(doctor.specialties && doctor.specialties.length > 0
                  ? doctor.specialties
                  : (doctor.specialtyNameBn || doctor.specialty || 'মেডিসিন').split(/[,/]/).map(s => s.trim())
                ).map((specName, sIdx) => (
                  <span key={sIdx} className="inline-flex rounded-md bg-sky-50 px-2 py-0.5 text-[9px] font-extrabold text-[#0284C7] border border-sky-100">
                    {specName}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/60">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                  <span>{(doctor.rating || 5.0).toFixed(1)}</span>
                  <span className="text-[9px] text-amber-600 font-semibold">({doctor.reviewCount || 10})</span>
                </span>
              </div>
              <h3 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProfile(doctor);
                }}
                className="mt-1 font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#0284C7] transition cursor-pointer"
              >
                {doctor.name}
              </h3>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200/30 shrink-0">
            <ShieldCheck className="h-3 w-3" />
            <span>BM&DC ভেরিফাইড</span>
          </span>
        </div>

        {/* Qualifications & Designation */}
        <div className="mt-3.5 border-t border-slate-100 pt-2.5">
          <p className="text-xs font-bold text-slate-700 line-clamp-1">{doctor.degrees}</p>
          <p className="text-[11px] font-bold text-[#0D9488] mt-0.5">{doctor.designation}</p>
          <p className="text-[11px] font-bold text-slate-400 mt-0.5">{doctor.workplace}</p>
        </div>

        {/* ACTIVE HOSPITAL / CLINIC BADGES */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            রোগী দেখার চেম্বারসমূহ ({chambersList.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {chambersList.map((ch, idx) => (
              <span
                key={ch.id || idx}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0284C7]/10 px-2.5 py-1 text-[10px] font-bold text-[#0284C7] border border-[#0284C7]/20"
              >
                <Building className="h-3 w-3 shrink-0" />
                <span>
                  [{ch.facilityName || (ch as any).facility || (ch as any).facility_name || (ch as any).facilities?.name || doctor.facilityName || doctor.facility || 'হাসপাতাল/চেম্বার'}{ch.facilityAddress || (ch as any).facility_address || (ch as any).facilities?.area_address ? ` - ${ch.facilityAddress || (ch as any).facility_address || (ch as any).facilities?.area_address}` : ''}]
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* SCHEDULE SUMMARY PER CHAMBER */}
        <div className="mt-3 space-y-2 rounded-lg bg-slate-50/70 p-3 text-xs text-slate-600 font-semibold border border-slate-150">
          {chambersList.map((ch, idx) => (
            <div key={ch.id || idx} className={idx > 0 ? 'pt-2 border-t border-slate-200/60' : ''}>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-[#0284C7]">
                  <Building className="h-3 w-3" />
                  <span>{ch.facilityName || (ch as any).facility || (ch as any).facility_name || (ch as any).facilities?.name || doctor.facilityName || doctor.facility || 'হাসপাতাল/চেম্বার'}</span>
                </span>
                {ch.roomNo && (
                  <span className="text-[10px] text-slate-500 font-normal">
                    কক্ষ: {ch.roomNo} ({ch.floor})
                  </span>
                )}
              </div>
              
              <div className="mt-1.5 grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{ch.visitingTime || 'সময় নির্ধারিত নয়'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    দিনসমূহ: {Array.isArray(ch.visitingDays) && ch.visitingDays.length > 0 ? ch.visitingDays.join(', ') : 'সবদিন'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consultation Fees */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
            <span>ফি (নতুন রোগী):</span>
          </div>
          <span className="font-extrabold text-slate-800">৳ {primaryChamber?.feeNew || doctor.feesNew || 0}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-400">
          <span>ফি (পুরাতন রোগী):</span>
          <span className="font-extrabold text-slate-600">৳ {primaryChamber?.feeOld || doctor.feesOld || 0}</span>
        </div>
      </div>

      {/* Action Buttons: Details/Reviews + Booking Trigger */}
      <div className="mt-4 pt-2 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onSelectProfile(doctor)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-center text-xs font-bold text-slate-700 transition cursor-pointer"
          id={`view-reviews-btn-${doctor.id}`}
        >
          <Eye className="h-3.5 w-3.5 text-[#0284C7]" />
          <span>বিস্তারিত ও রিভিউ</span>
        </button>
        
        <button
          type="button"
          onClick={() => onBookNow(doctor)}
          className="w-full rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2.5 text-center text-xs font-bold text-white transition cursor-pointer shadow-xs"
          id={`book-doctor-btn-${doctor.id}`}
        >
          সিরিয়াল বুক করুন
        </button>
      </div>
    </div>
  );
}
