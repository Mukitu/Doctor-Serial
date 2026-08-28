'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Calendar, 
  Building2, 
  Search, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getAppointments, confirmAppointment } from '../../../src/lib/supabase';
import { Appointment } from '../../../src/types';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmingApp, setConfirmingApp] = useState<any | null>(null);
  const [confFacilityName, setConfFacilityName] = useState('');
  const [confSerialNo, setConfSerialNo] = useState('');
  const [confRoomNo, setConfRoomNo] = useState('');
  const [confFloor, setConfFloor] = useState('');
  const [confBuilding, setConfBuilding] = useState('');
  const [confVisitingTime, setConfVisitingTime] = useState('');
  const [confAdminNotes, setConfAdminNotes] = useState('');
  const [confSubmitting, setConfSubmitting] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        const localApps = await getAppointments();
        setAppointments(localApps);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors:doctor_id (
            id,
            name,
            degrees,
            specialty_id,
            specialties (name_bn)
          ),
          chambers:chamber_id (
            id,
            room_no,
            floor,
            building_info,
            visiting_time,
            fee_new,
            facilities:facility_id (
              id,
              name,
              area_address
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAppointments(data);
      } else {
        const fallback = await getAppointments();
        setAppointments(fallback);
      }
    } catch (err) {
      console.error('Error fetching appointments with Supabase query:', err);
      const fallback = await getAppointments();
      setAppointments(fallback);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenConfirmModal = (app: any) => {
    setConfirmingApp(app);

    // Extract chamber details from nested relation or direct attributes
    const ch = app.chambers || {};
    const fac = ch.facilities || {};
    const doc = app.doctors || {};

    const facilityName = app.assigned_facility_name || fac.name || app.facilityName || doc.facility || 'পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী';

    // Auto calculate serial number for that date
    const sameDateConfirmed = appointments.filter((a: any) => 
      (a.doctor_id === app.doctor_id || a.doctorId === app.doctorId) && 
      (a.preferred_date === app.preferred_date || a.preferredDate === app.preferredDate) &&
      a.status === 'Confirmed'
    ).length;
    const nextSerial = String(sameDateConfirmed + 1).padStart(2, '0');

    setConfFacilityName(facilityName);
    setConfSerialNo(app.serial_no || app.serialNo || nextSerial);
    setConfRoomNo(app.assigned_room_no || app.assignedRoomNo || ch.room_no || app.chamberRoomNo || '১০১');
    setConfFloor(app.assigned_floor || app.assignedFloor || ch.floor || app.chamberFloor || '১ম তলা');
    setConfBuilding(app.assigned_building || app.assignedBuilding || ch.building_info || app.chamberBuildingStand || 'প্রধান ভবন, লিফট-১');
    setConfVisitingTime(app.confirmed_visiting_time || app.confirmedVisitingTime || ch.visiting_time || app.visitingTime || 'বিকাল ৫:০০ - রাত ৮:৩০');
    setConfAdminNotes(app.special_instructions || app.admin_notes || app.adminNotes || '');
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingApp) return;

    setConfSubmitting(true);
    try {
      const bookingCode = confirmingApp.booking_code || confirmingApp.id;

      await confirmAppointment({
        bookingCode,
        serialNo: confSerialNo.trim(),
        assignedRoomNo: confRoomNo.trim(),
        assignedFloor: confFloor.trim(),
        assignedBuilding: confBuilding.trim(),
        confirmedVisitingTime: confVisitingTime.trim(),
        assignedFacilityName: confFacilityName.trim(),
        specialInstructions: confAdminNotes.trim(),
        adminNotes: confAdminNotes.trim() || undefined
      });

      showToast('সিরিয়াল ও রুম নম্বর সফলভাবে অনুমোদিত হয়েছে!');
      setConfirmingApp(null);
      loadAppointments();
    } catch (err: any) {
      console.error('Confirmation error:', err);
      showToast(err.message || 'সিরিয়াল অনুমোদন করা সম্ভব হয়নি');
    } finally {
      setConfSubmitting(false);
    }
  };

  const filtered = appointments.filter((app) => {
    const patientName = app.patient_name || app.patientName || '';
    const patientPhone = app.patient_phone || app.patientMobile || app.patientPhone || '';
    const bookingCode = app.booking_code || app.id || '';
    const status = app.status || 'Pending';

    const matchesSearch = 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientPhone.includes(searchTerm) ||
      bookingCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 border border-emerald-100">
                <Calendar className="h-5 w-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                রোগীদের অ্যাপয়েন্টমেন্ট ও সিরিয়াল অনুমোদন
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              চেম্বারের তথ্যানুযায়ী নির্ধারিত সিরিয়াল নম্বর, রুম নম্বর, ফ্লোর ও রিপোর্টিং সময় বরাদ্দ দিন।
            </p>
          </div>

          <button
            onClick={loadAppointments}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="রোগীর নাম, ফোন নম্বর বা বুকিং কোড দিয়ে খুঁজুন..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Pending', 'Confirmed', 'Cancelled', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer shrink-0 ${
                  filterStatus === st
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'সকল সিরিয়াল' : st === 'Pending' ? 'অপেক্ষমান (Pending)' : st === 'Confirmed' ? 'অনুমোদিত (Confirmed)' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-4 text-[11px] uppercase tracking-wider">বুকিং কোড & তারিখ</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider">রোগীর নাম ও মোবাইল</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider">ডাক্তার ও স্পেশালিটি</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider">বরাদ্দকৃত চেম্বার ও রুম</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider text-center">স্ট্যাটাস</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                      <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2 text-[#0284C7]" />
                      অ্যাপয়েন্টমেন্ট লোড হচ্ছে...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                      কোনো বুকিং পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const code = app.booking_code || app.id;
                    const pName = app.patient_name || app.patientName;
                    const pPhone = app.patient_phone || app.patientMobile || app.patientPhone;
                    const pDate = app.preferred_date || app.preferredDate;
                    const status = app.status || 'Pending';
                    const docName = app.doctors?.name || app.doctorName || 'ডাক্তার';
                    const docDegrees = app.doctors?.degrees || app.doctorDegrees || '';
                    const facName = app.chambers?.facilities?.name || app.facilityName || app.assigned_facility_name || 'চেম্বার';

                    return (
                      <tr key={code} className="hover:bg-slate-50/60 transition">
                        <td className="p-4">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700 mb-1 border border-slate-200">
                            #{code}
                          </span>
                          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#0284C7]" />
                            <span>{pDate}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-slate-900">{pName}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 font-bold">
                            <Phone className="h-3 w-3 text-emerald-600" />
                            <span>{pPhone}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-slate-800">{docName}</div>
                          {docDegrees && <div className="text-[10px] text-slate-400 font-medium">{docDegrees}</div>}
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-[#0284C7] flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span>{facName}</span>
                          </div>
                          {app.assigned_room_no || app.assignedRoomNo ? (
                            <div className="text-[10px] font-bold text-slate-600 mt-0.5">
                              সিরিয়াল: <span className="text-emerald-700 font-black">{app.serial_no || app.serialNo || '০১'}</span> | রুম: {app.assigned_room_no || app.assignedRoomNo} ({app.assigned_floor || app.assignedFloor || ''})
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-600 font-bold mt-0.5 italic">
                              রুম বরাদ্দ পেন্ডিং
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'Rejected' || status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {status === 'Confirmed' ? 'অনুমোদিত' : status === 'Pending' ? 'অপেক্ষমান' : status}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleOpenConfirmModal(app)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition shadow-xs ${
                              status === 'Confirmed'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            <span>{status === 'Confirmed' ? 'রুম/সিরিয়াল পরিবর্তন' : 'অনুমোদন ও রুম প্রদান'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">সিরিয়াল অনুমোদন ও রুম নম্বর বরাদ্দ</h3>
                  <p className="text-[11px] text-[#0284C7] font-bold">বুকিং আইডি: #{confirmingApp.booking_code || confirmingApp.id}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="p-6 space-y-4 text-xs font-semibold">
              {/* Patient, Doctor & Hospital Card Snapshot */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">রোগীর নাম</span>
                    <span className="font-extrabold text-slate-900 text-xs block">{confirmingApp.patient_name || confirmingApp.patientName}</span>
                    <span className="block text-[10px] text-slate-500 font-bold">{confirmingApp.patient_phone || confirmingApp.patientMobile}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">ডাক্তার ও তারিখ</span>
                    <span className="font-extrabold text-slate-900 text-xs block">{confirmingApp.doctors?.name || confirmingApp.doctorName || 'চিকিৎসক'}</span>
                    <span className="block text-[10px] text-emerald-700 font-bold">{confirmingApp.preferred_date || confirmingApp.preferredDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1 text-[#0284C7] bg-sky-50/70 p-2 rounded-lg border border-sky-100">
                  <Building2 className="h-4 w-4 shrink-0 mt-0.5 text-[#0284C7]" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">হাসপাতাল / ডায়াগনস্টিক সেন্টারের নাম</span>
                    <span className="font-extrabold text-slate-900 text-xs">{confFacilityName || confirmingApp.facilityName || 'পপুলার ডায়াগনস্টিক সেন্টার'}</span>
                  </div>
                </div>
              </div>

              {/* Facility Input */}
              <div>
                <label className="block text-[#0284C7] mb-1 font-extrabold">হাসপাতাল / ডায়াগনস্টিক সেন্টারের নাম (Facility Name) *</label>
                <input
                  type="text"
                  required
                  value={confFacilityName}
                  onChange={(e) => setConfFacilityName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="যেমন: পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী"
                />
              </div>

              {/* Serial & Room Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0284C7] mb-1 font-extrabold">নির্ধারিত সিরিয়াল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={confSerialNo}
                    onChange={(e) => setConfSerialNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: ০১"
                  />
                </div>
                <div>
                  <label className="block text-[#0284C7] mb-1 font-extrabold">রুম নম্বর (Room No) *</label>
                  <input
                    type="text"
                    required
                    value={confRoomNo}
                    onChange={(e) => setConfRoomNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: ৩১০"
                  />
                </div>
              </div>

              {/* Floor & Building Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-extrabold">ফ্লোর / কত তলা (Floor) *</label>
                  <input
                    type="text"
                    required
                    value={confFloor}
                    onChange={(e) => setConfFloor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: ৩য় তলা"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-extrabold">বিল্ডিং / লিফট তথ্য</label>
                  <input
                    type="text"
                    value={confBuilding}
                    onChange={(e) => setConfBuilding(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: মেইন ভবন, লিফট-১"
                  />
                </div>
              </div>

              {/* Visiting Time */}
              <div>
                <label className="block text-slate-700 mb-1 font-extrabold">রিপোর্টিং / উপস্থিতির সময়সূচী *</label>
                <input
                  type="text"
                  required
                  value={confVisitingTime}
                  onChange={(e) => setConfVisitingTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="যেমন: বিকাল ৫:৩০ মিনিট"
                />
              </div>

              {/* Admin Note / Special Instructions */}
              <div>
                <label className="block text-slate-700 mb-1 font-extrabold">রোগীর জন্য বিশেষ নির্দেশিকা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={confAdminNotes}
                  onChange={(e) => setConfAdminNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: পূর্বের সকল প্রেসক্রিপশন ও রিপোর্ট সাথে রাখবেন।"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmingApp(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={confSubmitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white font-extrabold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{confSubmitting ? 'প্রসেসিং হচ্ছে...' : 'অনুমোদন ও কনফার্ম প্রদান'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
