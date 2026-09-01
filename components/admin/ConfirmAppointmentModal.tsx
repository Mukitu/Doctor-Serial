'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Building2, 
  DoorOpen, 
  Layers, 
  Hash, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { generateSmsText, getSmsUri, copySmsToClipboard, cleanPhone } from '@/lib/smsHelper';

export interface ConfirmAppointmentModalProps {
  isOpen: boolean;
  appointment: any;
  onClose: () => void;
  onSuccess: (updatedAppointment?: any) => void;
}

export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '০১';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const str = String(num).trim();
  if (/^[০-৯]+$/.test(str)) return str;
  const converted = str.replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
  if (converted.length === 1 && /^[০-৯]$/.test(converted)) {
    return '০' + converted;
  }
  return converted || '০১';
}

export default function ConfirmAppointmentModal({
  isOpen,
  appointment,
  onClose,
  onSuccess,
}: ConfirmAppointmentModalProps) {
  // Modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmedSuccess, setIsConfirmedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Editable form states pre-filled with chamber defaults
  const [serialNo, setSerialNo] = useState('০১');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [assignedFacilityName, setAssignedFacilityName] = useState('');
  const [assignedRoomNo, setAssignedRoomNo] = useState('');
  const [assignedFloor, setAssignedFloor] = useState('');
  const [assignedBuilding, setAssignedBuilding] = useState('');
  const [confirmedVisitingTime, setConfirmedVisitingTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset and pre-fill data when modal opens or appointment changes
  useEffect(() => {
    if (isOpen && appointment) {
      setIsConfirmedSuccess(false);
      setCopied(false);
      setErrorMessage('');

      // Extract chamber info from deep relations or flat fields
      const chamber = appointment.chambers || {};
      const facility = chamber.facilities || appointment.facilities || {};
      const doctor = appointment.doctors || {};

      // Auto-calculate next serial or use existing serial
      const rawSerial = appointment.serial_no || appointment.serialNo || '1';
      setSerialNo(toBengaliNumber(rawSerial));

      // Auto-populate date
      const defaultDate = 
        appointment.appointment_date || 
        appointment.preferred_date || 
        appointment.preferredDate || 
        new Date().toISOString().split('T')[0];
      setAppointmentDate(defaultDate);

      // Auto-populate hospital/facility name
      const facName = 
        appointment.assigned_facility_name || 
        appointment.assignedFacilityName || 
        appointment.facilityName || 
        appointment.facility_name || 
        facility.name || 
        chamber.facility_name || 
        doctor.facility || 
        doctor.facilityName || 
        '';
      setAssignedFacilityName(facName);

      // Auto-populate room no
      const room = 
        appointment.assigned_room_no || 
        appointment.assignedRoomNo || 
        appointment.chamberRoomNo || 
        chamber.room_no || 
        '';
      setAssignedRoomNo(room);

      // Auto-populate floor
      const floor = 
        appointment.assigned_floor || 
        appointment.assignedFloor || 
        appointment.chamberFloor || 
        chamber.floor || 
        '';
      setAssignedFloor(floor);

      // Auto-populate building info
      const building = 
        appointment.assigned_building || 
        appointment.assignedBuilding || 
        appointment.chamberBuildingStand || 
        chamber.building_info || 
        chamber.building_stand || 
        '';
      setAssignedBuilding(building);

      // Auto-populate visiting time
      const time = 
        appointment.confirmed_visiting_time || 
        appointment.confirmedVisitingTime || 
        appointment.visitingTime || 
        chamber.visiting_time || 
        doctor.visitingTime || 
        doctor.visiting_time || 
        '';
      setConfirmedVisitingTime(time);

      // Special instructions
      setSpecialInstructions(
        appointment.special_instructions || appointment.specialInstructions || ''
      );
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  // Extract patient & doctor details for display & SMS
  const doctorObj = appointment.doctors || {};
  const doctorName = doctorObj.name || appointment.doctorName || appointment.doctor_name || 'বিশেষজ্ঞ ডাক্তার';
  const patientName = appointment.patient_name || appointment.patientName || 'রোগী';
  const patientMobile = appointment.patient_mobile || appointment.patient_phone || appointment.patientMobile || appointment.patientPhone || '';

  // Generate real-time SMS text with full chamber and location details
  const smsText = generateSmsText({
    patientName,
    doctorName,
    facilityName: assignedFacilityName,
    serialNo,
    roomNo: assignedRoomNo,
    floor: assignedFloor,
    building: assignedBuilding,
    visitingTime: confirmedVisitingTime,
    date: appointmentDate,
    specialInstructions: specialInstructions,
    trackingCode: appointment.booking_code || appointment.id || appointment.bookingCode
  });

  const smsUri = getSmsUri(patientMobile, smsText);

  // Handle Save & Confirmation
  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const updateData = {
        status: 'Confirmed',
        serial_no: serialNo,
        appointment_date: appointmentDate,
        preferred_date: appointmentDate,
        assigned_facility_name: assignedFacilityName,
        assigned_room_no: assignedRoomNo,
        assigned_floor: assignedFloor,
        assigned_building: assignedBuilding,
        confirmed_visiting_time: confirmedVisitingTime,
        special_instructions: specialInstructions,
        updated_at: new Date().toISOString()
      };

      // 1. Supabase Database Update
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('appointments')
          .update(updateData)
          .eq('id', appointment.id);

        if (error) {
          console.error('[Supabase Confirm Error]:', error);
          throw new Error(error.message || 'সিরিয়াল নিশ্চিত করতে সমস্যা হয়েছে।');
        }
      }

      // 2. LocalStorage Fallback Update
      try {
        const saved = localStorage.getItem('sheba_appointments_v3');
        if (saved) {
          const list = JSON.parse(saved);
          const updatedList = list.map((item: any) => {
            if (item.id === appointment.id) {
              return {
                ...item,
                status: 'Confirmed',
                serialNo: serialNo,
                assignedRoomNo: assignedRoomNo,
                assignedFloor: assignedFloor,
                assignedBuilding: assignedBuilding,
                confirmedVisitingTime: confirmedVisitingTime,
                assignedFacilityName: assignedFacilityName,
                preferredDate: appointmentDate,
                specialInstructions: specialInstructions
              };
            }
            return item;
          });
          localStorage.setItem('sheba_appointments_v3', JSON.stringify(updatedList));
        }
      } catch (lsErr) {
        console.warn('LocalStorage update warning:', lsErr);
      }

      // Transition to success state
      setIsConfirmedSuccess(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'সিরিয়াল সংরক্ষণ করতে সমস্যা দেখা দিয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySms = async () => {
    const ok = await copySmsToClipboard(smsText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFinish = () => {
    onSuccess({
      ...appointment,
      status: 'Confirmed',
      serial_no: serialNo,
      serialNo: serialNo,
      appointment_date: appointmentDate,
      assigned_facility_name: assignedFacilityName,
      assigned_room_no: assignedRoomNo,
      assigned_floor: assignedFloor,
      assigned_building: assignedBuilding,
      confirmed_visiting_time: confirmedVisitingTime,
      special_instructions: specialInstructions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
              isConfirmedSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {isConfirmedSuccess ? <CheckCircle2 className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isConfirmedSuccess ? 'সিরিয়াল সফলভাবে নিশ্চিত হয়েছে!' : 'সিরিয়াল নিশ্চিতকরণ ও চেম্বার তথ্য'}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                রোগী: <span className="font-semibold text-slate-800">{patientName}</span> ({patientMobile})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={isConfirmedSuccess ? handleFinish : onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {!isConfirmedSuccess ? (
            /* Form View */
            <form id="confirm-appt-form" onSubmit={handleConfirmSubmit} className="space-y-4">
              
              {/* Doctor Summary Card */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-sky-600 font-bold uppercase tracking-wider">ডাক্তার</div>
                  <div className="text-sm font-bold text-slate-800">{doctorName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">বুকিং আইডি</div>
                  <div className="text-xs font-mono font-bold text-slate-700">{appointment.id}</div>
                </div>
              </div>

              {/* Grid 1: Serial No & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-sky-600" />
                    সিরিয়াল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    placeholder="e.g. ০১, ০২"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-sky-600" />
                    সিরিয়ালের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                </div>
              </div>

              {/* Facility / Hospital Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-sky-600" />
                  হাসপাতাল / ডায়াগনস্টিক সেন্টারের নাম
                </label>
                <input
                  type="text"
                  required
                  value={assignedFacilityName}
                  onChange={(e) => setAssignedFacilityName(e.target.value)}
                  placeholder="e.g. পপুলার ডায়াগনস্টিক সেন্টার"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                />
              </div>

              {/* Grid 2: Room, Floor, Building */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5 text-sky-600" />
                    রুম নম্বর
                  </label>
                  <input
                    type="text"
                    value={assignedRoomNo}
                    onChange={(e) => setAssignedRoomNo(e.target.value)}
                    placeholder="e.g. ৩০৪"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-sky-600" />
                    তলা / ফ্লোর
                  </label>
                  <input
                    type="text"
                    value={assignedFloor}
                    onChange={(e) => setAssignedFloor(e.target.value)}
                    placeholder="e.g. ৩য় তলা"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-sky-600" />
                    বিল্ডিং নির্দেশিকা
                  </label>
                  <input
                    type="text"
                    value={assignedBuilding}
                    onChange={(e) => setAssignedBuilding(e.target.value)}
                    placeholder="e.g. মেইন ভবন"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                  />
                </div>
              </div>

              {/* Visiting Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  রোগী দেখার সময়
                </label>
                <input
                  type="text"
                  required
                  value={confirmedVisitingTime}
                  onChange={(e) => setConfirmedVisitingTime(e.target.value)}
                  placeholder="e.g. বিকাল ৫:০০ - রাত ৮:০০"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                />
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  বিশেষ নির্দেশিকা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. ১৫ মিনিট পূর্বে চেম্বারে উপস্থিত থাকুন"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
                />
              </div>

            </form>
          ) : (
            /* Success & SMS Dispatcher View */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-center space-y-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-1 shadow-xs">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">
                  সিরিয়াল সফলভাবে কনফার্ম ও আপডেট করা হয়েছে!
                </h4>
                <p className="text-xs text-emerald-700 font-medium">
                  সিরিয়াল নম্বর: <span className="font-extrabold text-emerald-900 font-mono text-sm">{serialNo}</span> | সময়: {confirmedVisitingTime}
                </p>
              </div>

              {/* SMS Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-sky-600" />
                    প্রস্তুতকৃত SMS প্রিভিউ
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    প্রাপক: {cleanPhone(patientMobile)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-100 whitespace-pre-line leading-relaxed shadow-inner relative">
                  {smsText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={smsUri}
                  target="_self"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 active:scale-98 transition text-center cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>📱 সিম দিয়ে SMS পাঠান</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopySms}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold border transition shadow-xs ${
                    copied
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-600" />
                      <span>📋 টেক্সট কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center justify-end gap-3">
          {!isConfirmedSuccess ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                বাতিল
              </button>
              <button
                type="submit"
                form="confirm-appt-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-600/20 active:scale-98 transition disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>কনফার্ম ও সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-sm font-bold text-white transition shadow-sm"
            >
              সম্পন্ন
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
