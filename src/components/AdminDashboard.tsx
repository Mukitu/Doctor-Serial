import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Check, 
  X, 
  Edit2, 
  PlusCircle, 
  AlertCircle,
  Trash2,
  CalendarCheck,
  ShieldCheck,
  Loader2,
  UserPlus
} from 'lucide-react';
import { Doctor, Appointment, Specialty, Facility, AdminProfile } from '../types';
import { getAdmins, createAdminUser, updateAdminRole, revokeAdminAccess } from '../lib/supabase';

interface AdminDashboardProps {
  doctors: Doctor[];
  appointments: Appointment[];
  specialties: Specialty[];
  facilities: Facility[];
  currentAdmin: AdminProfile | null;
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor: (doc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

type AdminSubTab = 'appointments' | 'doctors' | 'admins';

export default function AdminDashboard({
  doctors,
  appointments,
  specialties,
  facilities,
  currentAdmin,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onUpdateAppointmentStatus,
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<AdminSubTab>('appointments');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Super Admin Exclusive Management States
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'admin'>('admin');
  const [addAdminError, setAddAdminError] = useState<string | null>(null);
  const [addAdminSubmitting, setAddAdminSubmitting] = useState(false);

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const data = await getAdmins();
      setAdminProfiles(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'admins' && currentAdmin?.role === 'super_admin') {
      loadAdmins();
    }
  }, [subTab, currentAdmin]);

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);

    if (!newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) {
      setAddAdminError('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    if (newAdminPassword.length < 6) {
      setAddAdminError('পাসওয়ার্ডটি অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setAddAdminSubmitting(true);
    try {
      await createAdminUser(
        newAdminEmail.trim(),
        newAdminPassword,
        newAdminName.trim(),
        newAdminRole
      );
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminRole('admin');
      setShowAddAdminModal(false);
      await loadAdmins();
    } catch (err: any) {
      setAddAdminError(err.message || 'অ্যাডমিন অ্যাকাউন্ট তৈরি করা যায়নি।');
    } finally {
      setAddAdminSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, targetRole: 'super_admin' | 'admin') => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই অ্যাডমিনের রোল পরিবর্তন করতে চান?')) {
      try {
        await updateAdminRole(userId, targetRole);
        await loadAdmins();
      } catch (err: any) {
        alert(err.message || 'রোল পরিবর্তন করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই অ্যাডমিনের অ্যাক্সেস চিরতরে বাতিল করতে চান? এটি রিভার্স করা যাবে না।')) {
      try {
        await revokeAdminAccess(userId);
        await loadAdmins();
      } catch (err: any) {
        alert(err.message || 'অ্যাক্সেস বাতিল করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  // Doctor Form States
  const [docName, setDocName] = useState('');
  const [docBmdc, setDocBmdc] = useState('');
  const [docSpecialty, setDocSpecialty] = useState(specialties[0]?.nameBn || 'মেডিসিন');
  const [docFacility, setDocFacility] = useState(facilities[0]?.name || '');
  const [docDegrees, setDocDegrees] = useState('');
  const [docDesignation, setDocDesignation] = useState('');
  const [docWorkplace, setDocWorkplace] = useState('');
  const [docChamberAddress, setDocChamberAddress] = useState('');
  const [docVisitingDays, setDocVisitingDays] = useState<string[]>(['শনিবার', 'রবিবার', 'সোমবার']);
  const [docVisitingTime, setDocVisitingTime] = useState('বিকাল ৫:০০ - রাত ৮:৩০');
  const [docFeesNew, setDocFeesNew] = useState('৮০০');
  const [docFeesOld, setDocFeesOld] = useState('৫০০');
  const [docPriority, setDocPriority] = useState('১০');

  const DAYS_LIST = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

  const handleDayCheckbox = (day: string) => {
    setDocVisitingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleEditClick = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocName(doc.name);
    setDocBmdc(doc.bmdc);
    setDocSpecialty(doc.specialty);
    setDocFacility(doc.facility);
    setDocDegrees(doc.degrees);
    setDocDesignation(doc.designation);
    setDocWorkplace(doc.workplace);
    setDocChamberAddress(doc.chamberAddress);
    setDocVisitingDays(doc.visitingDays);
    setDocVisitingTime(doc.visitingTime);
    setDocFeesNew(doc.feesNew.toString());
    setDocFeesOld(doc.feesOld.toString());
    setDocPriority(doc.priorityIndex.toString());
    
    // Auto scroll to form
    const formElement = document.getElementById('doctor-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingDoctor(null);
    resetDoctorForm();
  };

  const resetDoctorForm = () => {
    setDocName('');
    setDocBmdc('');
    setDocSpecialty(specialties[0]?.nameBn || 'মেডিসিন');
    setDocFacility(facilities[0]?.name || '');
    setDocDegrees('');
    setDocDesignation('');
    setDocWorkplace('');
    setDocChamberAddress('');
    setDocVisitingDays(['শনিবার', 'রবিবার', 'সোমবার']);
    setDocVisitingTime('বিকাল ৫:০০ - রাত ৮:৩০');
    setDocFeesNew('৮০০');
    setDocFeesOld('৫০০');
    setDocPriority('১০');
    setError('');
  };

  // Convert English numerals in inputs to English if user typed in Bengali
  const cleanNumberInput = (val: string): number => {
    const banglaToEnglishMap: { [key: string]: string } = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    let clean = val;
    for (const key in banglaToEnglishMap) {
      clean = clean.replace(new RegExp(key, 'g'), banglaToEnglishMap[key]);
    }
    const num = parseInt(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Field validations
    if (!docName.trim()) return setError('ডাক্তারের নাম দেওয়া আবশ্যক।');
    if (!docBmdc.trim()) return setError('BM&DC রেজিঃ নম্বর দেওয়া আবশ্যক।');
    if (!docDegrees.trim()) return setError('শিক্ষাগত যোগ্যতা দেওয়া আবশ্যক।');
    if (!docDesignation.trim()) return setError('পদবী দেওয়া আবশ্যক।');
    if (!docWorkplace.trim()) return setError('কর্মস্থল দেওয়া আবশ্যক।');
    if (!docChamberAddress.trim()) return setError('চেম্বার কক্ষ ও ঠিকানা দেওয়া আবশ্যক।');
    if (docVisitingDays.length === 0) return setError('কমপক্ষে একটি রোগী দেখার দিন সিলেক্ট করুন।');

    const feesNewNum = cleanNumberInput(docFeesNew);
    const feesOldNum = cleanNumberInput(docFeesOld);
    const priorityNum = cleanNumberInput(docPriority);

    if (feesNewNum <= 0) return setError('নতুন রোগীর ফি সঠিকভাবে প্রদান করুন।');

    const doctorData: Doctor = {
      id: editingDoctor ? editingDoctor.id : `doc-${Date.now()}`,
      name: docName,
      bmdc: docBmdc,
      specialty: docSpecialty,
      facility: docFacility,
      degrees: docDegrees,
      designation: docDesignation,
      workplace: docWorkplace,
      chamberAddress: docChamberAddress,
      visitingDays: docVisitingDays,
      visitingTime: docVisitingTime,
      feesNew: feesNewNum,
      feesOld: feesOldNum,
      priorityIndex: priorityNum || 10,
    };

    if (editingDoctor) {
      onUpdateDoctor(doctorData);
      setSuccessMsg('ডাক্তারের তথ্য সফলভাবে আপডেট করা হয়েছে!');
      setEditingDoctor(null);
    } else {
      onAddDoctor(doctorData);
      setSuccessMsg('নতুন ডাক্তার সফলভাবে তালিকাভুক্ত করা হয়েছে!');
    }

    resetDoctorForm();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Admin Title Banner */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 md:p-6 mb-6">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
              ● অ্যাডমিন কন্ট্রোল প্যানেল
            </span>
            <h1 className="mt-2 text-xl font-bold text-slate-800 md:text-2xl">
              সেবা-সিরিয়াল অ্যাডমিন ড্যাশবোর্ড
            </h1>
            <p className="text-slate-400 font-semibold text-xs mt-1">
              রোগীর অ্যাপয়েন্টমেন্ট অনুমোদন, নতুন চিকিৎসক সংযোজন ও বিদ্যমান চিকিৎসকদের শিডিউল ও ভিজিট ম্যানেজ করুন।
            </p>
          </div>

          {/* Core Stats Overview */}
          <div className="flex gap-3 self-start md:self-center">
            <div className="rounded-lg bg-white py-2 px-3.5 text-center border border-slate-200 shadow-sm">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">মোট আবেদন</span>
              <span className="font-mono text-lg font-extrabold text-slate-800">{appointments.length}</span>
            </div>
            <div className="rounded-lg bg-white py-2 px-3.5 text-center border border-slate-200 shadow-sm">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">পেন্ডিং</span>
              <span className="font-mono text-lg font-extrabold text-amber-600">
                {appointments.filter((a) => a.status === 'Pending').length}
              </span>
            </div>
            <div className="rounded-lg bg-white py-2 px-3.5 text-center border border-slate-200 shadow-sm">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">ডাক্তার সংখ্যা</span>
              <span className="font-mono text-lg font-extrabold text-[#0284C7]">{doctors.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub tabs inside Dashboard */}
      <div className="mb-6 flex border-b border-slate-200" id="admin-subtabs">
        <button
          onClick={() => setSubTab('appointments')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'appointments'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-appointments-btn"
        >
          <CalendarCheck className="h-4 w-4" />
          <span>সিরিয়াল রিকোয়েস্ট বুকিং ({appointments.length})</span>
        </button>
        <button
          onClick={() => setSubTab('doctors')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'doctors'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-doctors-btn"
        >
          <Users className="h-4 w-4" />
          <span>ডাক্তার তালিকা ও নতুন যোগ ({doctors.length})</span>
        </button>
        {currentAdmin?.role === 'super_admin' && (
          <button
            onClick={() => setSubTab('admins')}
            className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              subTab === 'admins'
                ? 'border-[#0284C7] text-[#0284C7]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="admin-subtab-users-btn"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>অ্যাডমিন প্যানেল ব্যবহারকারী ({adminProfiles.length})</span>
          </button>
        )}
      </div>

      {/* SUBTAB 1: Appointment Request Management Table */}
      {subTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">সিরিয়াল আবেদনসমূহ</h2>
            <span className="text-[10px] font-bold text-slate-400">
              ওয়ান-ক্লিক কনফার্ম/ক্যান্সেল টগল
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">আবেদন আইডি</th>
                  <th className="p-3 text-[11px]">রোগীর নাম ও মোবাইল</th>
                  <th className="p-3 text-[11px]">ডাক্তার চেম্বার</th>
                  <th className="p-3 text-[11px]">আবেদনের তারিখ</th>
                  <th className="p-3 text-[11px]">বর্তমান অবস্থা (Status)</th>
                  <th className="p-3 text-center text-[11px]">দ্রুত অ্যাকশন (Quick Toggle)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 font-semibold">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      কোন সিরিয়াল আবেদন পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  [...appointments]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((app) => (
                      <tr key={app.id} className="border-b border-slate-150 hover:bg-slate-50/50" id={`admin-row-${app.id}`}>
                        {/* Booking ID */}
                        <td className="p-3 font-mono font-bold text-slate-900">{app.id}</td>

                        {/* Patient info */}
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{app.patientName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold">বয়স: {app.patientAge} বছর • {app.patientMobile}</p>
                        </td>

                        {/* Doctor */}
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{app.doctorName}</p>
                        </td>

                        {/* Booking Date */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{app.preferredDate}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3">
                          {app.status === 'Pending' && (
                            <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/30">
                              পেন্ডিং (Pending)
                            </span>
                          )}
                          {app.status === 'Confirmed' && (
                            <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/30">
                              নিশ্চিত (Confirmed)
                            </span>
                          )}
                          {app.status === 'Cancelled' && (
                            <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200/30">
                              বাতিল (Cancelled)
                            </span>
                          )}
                        </td>

                        {/* Quick Toggle Actions */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Confirm Button */}
                            <button
                              onClick={() => onUpdateAppointmentStatus(app.id, 'Confirmed')}
                              disabled={app.status === 'Confirmed'}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border transition ${
                                app.status === 'Confirmed'
                                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                              }`}
                              title="Confirm Appointment"
                              id={`admin-confirm-${app.id}`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>

                            {/* Cancel Button */}
                            <button
                              onClick={() => onUpdateAppointmentStatus(app.id, 'Cancelled')}
                              disabled={app.status === 'Cancelled'}
                              className={`flex h-7 w-7 items-center justify-center rounded-md border transition ${
                                app.status === 'Cancelled'
                                  ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                  : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer'
                              }`}
                              title="Cancel Appointment"
                              id={`admin-cancel-${app.id}`}
                            >
                              <X className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>

                            {/* Reset to Pending Button */}
                            {app.status !== 'Pending' && (
                              <button
                                onClick={() => onUpdateAppointmentStatus(app.id, 'Pending')}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200 bg-white text-amber-600 hover:bg-amber-50 cursor-pointer"
                                title="Reset to Pending"
                                id={`admin-pending-${app.id}`}
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Doctor Directory Management & Form */}
      {subTab === 'doctors' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Doctor Add/Edit Form */}
          <div className="lg:col-span-1" id="doctor-form-section">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 border-b border-slate-150 pb-3 mb-4">
                <PlusCircle className="h-4.5 w-4.5 text-[#0284C7]" />
                <h2 className="text-sm font-bold text-slate-800">
                  {editingDoctor ? 'চিকিৎসকের তথ্য পরিবর্তন' : 'নতুন চিকিৎসক যুক্ত করুন'}
                </h2>
              </div>

              {/* Status Feedbacks */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-bold text-rose-600 border border-rose-100 mb-4">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-bold text-emerald-600 border border-emerald-100 mb-4">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleDoctorSubmit} className="space-y-3.5" id="admin-doctor-form">
                {/* Doctor Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">ডাক্তারের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ডা. মো: সাজেদুর রহমান"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    id="admin-doc-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* BM&DC Reg */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">BM&DC রেজিঃ *</label>
                    <input
                      type="text"
                      required
                      placeholder="A-54321"
                      value={docBmdc}
                      onChange={(e) => setDocBmdc(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      id="admin-doc-bmdc"
                    />
                  </div>

                  {/* Specialty */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">ক্যাটাগরি *</label>
                    <select
                      value={docSpecialty}
                      onChange={(e) => setDocSpecialty(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      id="admin-doc-specialty"
                    >
                      {specialties.map((spec) => (
                        <option key={spec.id} value={spec.nameBn}>
                          {spec.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Facility/Hospital */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">হাসপাতাল/ডায়াগনস্টিক *</label>
                  <select
                    value={docFacility}
                    onChange={(e) => setDocFacility(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    id="admin-doc-facility"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Degrees */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">ডিগ্রি বা যোগ্যতা *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: MBBS, FCPS, MD (Internal Medicine)"
                    value={docDegrees}
                    onChange={(e) => setDocDegrees(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    id="admin-doc-degrees"
                  />
                </div>

                {/* Designation & Workplace */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">পদবী *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: সহকারী অধ্যাপক"
                      value={docDesignation}
                      onChange={(e) => setDocDesignation(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      id="admin-doc-designation"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">কর্মস্থল *</label>
                    <input
                      type="text"
                      required
                      placeholder="রাজশাহী মেডিকেল কলেজ"
                      value={docWorkplace}
                      onChange={(e) => setDocWorkplace(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      id="admin-doc-workplace"
                    />
                  </div>
                </div>

                {/* Chamber Room / Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">চেম্বার কক্ষ ও ঠিকানা *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: কক্ষ ৩১০, পপুলার ডায়াগনস্টিক, রাজশাহী"
                    value={docChamberAddress}
                    onChange={(e) => setDocChamberAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    id="admin-doc-chamber"
                  />
                </div>

                {/* Visiting Days Checkboxes */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">চেম্বার দিনসমূহ *</label>
                  <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    {DAYS_LIST.map((day) => {
                      const checked = docVisitingDays.includes(day);
                      return (
                        <label key={day} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleDayCheckbox(day)}
                            className="rounded text-[#0284C7] focus:ring-0"
                          />
                          <span>{day}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Visiting Time */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">চেম্বার সময়সূচী *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: বিকাল ৫:০০ - রাত ৮:৩০"
                    value={docVisitingTime}
                    onChange={(e) => setDocVisitingTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    id="admin-doc-time"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Fee New */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500">ফি (নতুন) *</label>
                    <input
                      type="text"
                      required
                      placeholder="৮০০"
                      value={docFeesNew}
                      onChange={(e) => setDocFeesNew(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                    />
                  </div>

                  {/* Fee Old */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">ফি (পুরাতন)</label>
                    <input
                      type="text"
                      placeholder="৫০০"
                      value={docFeesOld}
                      onChange={(e) => setDocFeesOld(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">অগ্রাধিকার (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="১০"
                      value={docPriority}
                      onChange={(e) => setDocPriority(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {editingDoctor && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                      id="admin-doc-cancel-edit-btn"
                    >
                      বাতিল
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2 px-4 text-xs font-bold text-white transition cursor-pointer"
                    id="admin-doc-submit-btn"
                  >
                    {editingDoctor ? 'তথ্য আপডেট করুন' : 'ডাক্তার যোগ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Existing Doctors Table Grid */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-bold text-slate-800 mb-4">নিবন্ধিত চিকিৎসকদের তালিকা</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="p-3 text-[11px]">ডাক্তার তথ্য</th>
                      <th className="p-3 text-[11px]">BM&DC রেজিঃ</th>
                      <th className="p-3 text-[11px]">বিশেষজ্ঞতা</th>
                      <th className="p-3 text-[11px]">ভিজিট ফি</th>
                      <th className="p-3 text-center text-[11px]">অগ্রাধিকার</th>
                      <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 font-semibold">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-150 hover:bg-slate-50/50" id={`admin-doc-row-${doc.id}`}>
                        {/* Doc Details */}
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-bold">{doc.degrees}</p>
                        </td>

                        {/* BM&DC ID */}
                        <td className="p-3 font-mono text-slate-600 font-bold">{doc.bmdc}</td>

                        {/* Specialty */}
                        <td className="p-3">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/50">
                            {doc.specialty}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="p-3 font-bold text-[#0D9488]">৳ {doc.feesNew}</td>

                        {/* Priority Index */}
                        <td className="p-3 text-center font-mono font-bold text-slate-500">{doc.priorityIndex}</td>

                        {/* Actions */}
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEditClick(doc)}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0284C7] transition cursor-pointer"
                              title="Edit Doctor Info"
                              id={`admin-doc-edit-${doc.id}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিত যে ডা. ${doc.name} কে ডিরেক্টরি থেকে মুছে ফেলতে চান?`)) {
                                  onDeleteDoctor(doc.id);
                                }
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-slate-50 transition cursor-pointer"
                              title="Delete Doctor"
                              id={`admin-doc-delete-${doc.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Admin User Profiles Management (Super Admin Exclusive) */}
      {subTab === 'admins' && currentAdmin?.role === 'super_admin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">সিস্টেম অ্যাডমিন প্যানেল ব্যবহারকারীগণ</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                শুধুমাত্র সুপার অ্যাডমিনরা নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি করতে, রোল পরিবর্তন করতে বা অ্যাক্সেস বাতিল করতে পারেন।
              </p>
            </div>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer animate-pulse"
              id="admin-add-new-user-btn"
            >
              <UserPlus className="h-4 w-4" />
              <span>নতুন অ্যাডমিন যোগ করুন</span>
            </button>
          </div>

          {adminsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-bold gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#0284C7]" />
              <span>লোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    <th className="p-3">পূর্ণ নাম</th>
                    <th className="p-3">ইমেইল ঠিকানা</th>
                    <th className="p-3">রোল / টাইপ</th>
                    <th className="p-3">তৈরির তারিখ</th>
                    <th className="p-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 font-semibold text-[11px]">
                  {adminProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{profile.fullName}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{profile.email}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-extrabold border ${
                          profile.role === 'super_admin' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {profile.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-semibold">
                        {new Date(profile.createdAt).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {profile.id !== currentAdmin.id ? (
                            <>
                              {/* Change Role Trigger */}
                              <select
                                value={profile.role}
                                onChange={(e) => handleChangeRole(profile.id, e.target.value as 'super_admin' | 'admin')}
                                className="rounded border border-slate-200 bg-slate-50 p-1 text-[10px] font-bold outline-none cursor-pointer"
                              >
                                <option value="admin">অ্যাডমিন বানান</option>
                                <option value="super_admin">সুপার অ্যাডমিন বানান</option>
                              </select>

                              {/* Revoke Access Button */}
                              <button
                                onClick={() => handleRevokeAccess(profile.id)}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-850 border border-red-200 bg-red-50/50 rounded px-2 py-1 transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>অ্যাক্সেস বাতিল</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">আপনি নিজে (লগড-ইন)</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add New Admin Modal Modal Overlay */}
          {showAddAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <h3 className="font-extrabold text-slate-800 text-sm">নতুন সিকিউর অ্যাডমিন সংযোজন</h3>
                  <button
                    onClick={() => setShowAddAdminModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form onSubmit={handleAddAdminSubmit} className="p-6 space-y-4 text-xs font-semibold">
                  {addAdminError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-[11px] text-red-700 flex items-start gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{addAdminError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">পূর্ণ নাম</label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                      placeholder="যেমন: ডা. হাসিবুর রহমান"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">ইমেইল ঠিকানা</label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                      placeholder="hasib@sebaserial.com"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">সিক্রেট পাসওয়ার্ড (কমপক্ষে ৬ ডিজিট)</label>
                    <input
                      type="password"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-bold">নিরাপত্তা রোল / পারমিশন স্তর</label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as 'super_admin' | 'admin')}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white cursor-pointer"
                    >
                      <option value="admin">সাধারণ অ্যাডমিন (Admin)</option>
                      <option value="super_admin">সুপার অ্যাডমিন (Super Admin)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={addAdminSubmitting}
                      className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-4 py-2 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {addAdminSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <span>অ্যাডমিন অ্যাকাউন্ট তৈরি করুন</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
