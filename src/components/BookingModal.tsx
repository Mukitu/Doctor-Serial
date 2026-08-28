import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Phone, 
  Hash, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Doctor, Appointment } from '../types';

interface BookingModalProps {
  doctor: Doctor | null;
  onClose: () => void;
  onAddAppointment: (appointment: Appointment) => void;
  onNavigateToTrack: () => void;
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

  // Status and tracking states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [copied, setCopied] = useState(false);
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

    // Generate tracking ID (e.g., RJ-4921)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `RJ-${randomNum}`;

    const newAppointment: Appointment = {
      id: trackingId,
      doctorId: doctor.id,
      doctorName: doctor.name,
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

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-xl bg-white p-5 border border-slate-200 shadow-lg overflow-y-auto max-h-[90vh]"
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
              <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/50">
                {doctor.specialty}
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1" id="modal-doctor-name">
                {doctor.name}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {doctor.degrees} • {doctor.designation}
              </p>
            </div>

            {/* Chamber Schedule Table */}
            <div className="mt-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#0284C7]" /> চেম্বার শিডিউল এবং ফি
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3 text-[11px]">রোগী দেখার দিনসমূহ</th>
                      <th className="p-3 text-[11px]">সময়সূচী</th>
                      <th className="p-3 text-right text-[11px]">ভিজিট ফি</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 font-bold">
                    <tr className="border-b border-slate-150">
                      <td className="p-3 text-slate-800">
                        {doctor.visitingDays.join(', ')}
                      </td>
                      <td className="p-3">{doctor.visitingTime}</td>
                      <td className="p-3 text-right text-[#0D9488]">
                        ৳ {doctor.feesNew} (নতুন রোগী)
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-3 text-[11px] text-slate-400 font-semibold">
                        স্থান: {doctor.chamberAddress}
                      </td>
                      <td className="p-3 text-right text-slate-400 font-bold text-[11px]">
                        ৳ {doctor.feesOld} (পুরাতন)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="appointment-form">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-[#0D9488]" /> রোগী বা আবেদনকারীর তথ্য
              </h3>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-bold text-rose-600 border border-rose-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Patient Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">রোগীর নাম (Full Name) *</label>
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
                  <label className="text-[11px] font-bold text-slate-500">রোগীর বয়স (Age) *</label>
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
                  <label className="text-[11px] font-bold text-slate-500">মোবাইল নম্বর (১১ ডিজিট) *</label>
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

                {/* Preferred Date */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">সিরিয়ালের কাঙ্ক্ষিত তারিখ *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={todayStr}
                      max={maxDateStr}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      id="input-booking-date"
                    />
                    <Calendar className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  id="cancel-booking-btn"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-5 py-2 text-xs font-bold text-white transition cursor-pointer"
                  id="submit-booking-btn"
                >
                  সিরিয়াল রিকোয়েস্ট সাবমিট করুন
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* BOOKING SUCCESS VIEW CENTERING MOBILE NUMBER WITHOUT BOOKING CODES */
          <div className="py-8 text-center" id="booking-success-view">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#0D9488] mb-5 border border-emerald-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-200/30 mb-2">
              ● সিরিয়াল রিকোয়েস্টটি পর্যালোচনায় আছে
            </span>

            <h2 className="text-xl font-bold text-slate-800">MyDocBD-তে আপনার রিকোয়েস্টটি গৃহীত হয়েছে।</h2>
            
            {/* The exact requested text */}
            <div className="mx-auto mt-4 max-w-md rounded-xl bg-slate-50 border border-slate-200 p-5 text-center shadow-sm">
              <p className="text-xs font-bold text-sky-600 mb-1.5 uppercase tracking-wide">আপনার ট্র্যাকিং মোবাইল নম্বর</p>
              <p className="text-xl font-black text-slate-800 font-mono tracking-wider">{patientMobile}</p>
              
              <p className="mt-4 text-xs font-bold text-slate-700 leading-relaxed bg-white rounded-lg p-3 border border-slate-100">
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
