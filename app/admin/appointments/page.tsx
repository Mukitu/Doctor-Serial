'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  Phone, 
  Send, 
  Building2, 
  DoorOpen, 
  Layers, 
  User, 
  Trash2, 
  Filter, 
  Check, 
  FileText, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Hash
} from 'lucide-react';
import { supabase, isSupabaseConfigured, getDoctors } from '@/src/lib/supabase';
import { INITIAL_DOCTORS } from '@/src/data/mockData';
import { generateSmsText, getSmsUri, cleanPhone } from '@/lib/smsHelper';
import ConfirmAppointmentModal from '@/components/admin/ConfirmAppointmentModal';
import { Doctor } from '@/src/types';

export interface DoctorFilterItem {
  id: string;
  name: string;
  specialtyName?: string;
}

export default function AdminAppointmentsPage() {
  // Loading & State
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<DoctorFilterItem[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [actionError, setActionError] = useState<string>('');

  // Selected Modal Appointment
  const [confirmingAppointment, setConfirmingAppointment] = useState<any | null>(null);
  const [viewingSlipAppointment, setViewingSlipAppointment] = useState<any | null>(null);

  // Filters State
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD or empty
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'Pending' | 'Confirmed' | 'Cancelled'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get Today and Tomorrow formatted YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Doctor & Chamber Resolver Helper
  const resolveAppointmentDetails = useCallback((item: any) => {
    const docId = item.doctor_id || item.doctorId || item.doctors?.id;
    const docName = item.doctor_name || item.doctorName || item.doctors?.name;

    const matchedDoc = allDoctors.find(d => 
      (docId && (d.id === docId || d.id.split('::')[0] === String(docId).split('::')[0])) ||
      (docName && d.name && (d.name.trim() === docName.trim() || d.name.includes(docName) || docName.includes(d.name)))
    );

    const matchedChamber = matchedDoc?.chambers?.find((c: any) => c.id === item.chamber_id || c.id === item.chamberId)
      || matchedDoc?.chambers?.find((c: any) => c.facilityName && (item.facilityName || item.assigned_facility_name) && c.facilityName.includes(item.facilityName || item.assigned_facility_name))
      || matchedDoc?.chambers?.[0];

    const doctorName = 
      item.doctors?.name || 
      item.doctorName || 
      item.doctor_name || 
      matchedDoc?.name || 
      'বিশেষজ্ঞ ডাক্তার';

    const specialty = 
      item.doctors?.specialties?.name_bn || 
      item.doctorSpecialty || 
      matchedDoc?.specialty || 
      matchedDoc?.specialtyNameBn || 
      'মেডিসিন';

    const facilityName = 
      item.assigned_facility_name || 
      item.assignedFacilityName || 
      item.chambers?.facilities?.name || 
      item.facilities?.name || 
      item.facilityName || 
      item.facility_name || 
      matchedChamber?.facilityName || 
      matchedDoc?.facility || 
      'হাসপাতাল/চেম্বার';

    const roomNo = 
      item.assigned_room_no || 
      item.assignedRoomNo || 
      item.chamberRoomNo || 
      item.chambers?.room_no || 
      matchedChamber?.roomNo || 
      matchedDoc?.chamberRoomNo || 
      '';

    const floor = 
      item.assigned_floor || 
      item.assignedFloor || 
      item.chamberFloor || 
      item.chambers?.floor || 
      matchedChamber?.floor || 
      matchedDoc?.chamberFloor || 
      '';

    const building = 
      item.assigned_building || 
      item.assignedBuilding || 
      item.chamberBuildingStand || 
      item.chambers?.building_info || 
      matchedChamber?.buildingStand || 
      matchedDoc?.chamberBuildingStand || 
      '';

    const visitingTime = 
      item.confirmed_visiting_time || 
      item.confirmedVisitingTime || 
      item.visitingTime || 
      item.chambers?.visiting_time || 
      matchedChamber?.visitingTime || 
      matchedDoc?.visitingTime || 
      '';

    return {
      matchedDoc,
      doctorName,
      specialty,
      facilityName,
      roomNo,
      floor,
      building,
      visitingTime
    };
  }, [allDoctors]);

  // Fetch Data Query
  const fetchAppointmentsAndDoctors = useCallback(async () => {
    setLoading(true);
    setActionError('');

    try {
      // 1. Fetch full doctors first to populate reference cache
      const fullDocs = await getDoctors();
      if (fullDocs && fullDocs.length > 0) {
        setAllDoctors(fullDocs);
      }

      if (isSupabaseConfigured && supabase) {
        // 2. Fetch Relational Appointments
        const { data: apptData, error: apptError } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors (
              id,
              name,
              degrees,
              specialty_id,
              specialties (
                name_bn
              )
            ),
            chambers (
              id,
              room_no,
              floor,
              building_info,
              visiting_time,
              facilities (
                id,
                name,
                area_address
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (apptError) {
          console.error('[Supabase Fetch Appointments Error]:', apptError);
          // Fallback to simple select if deep join throws
          const { data: fallbackData } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackData) setAppointments(fallbackData);
        } else if (apptData) {
          setAppointments(apptData);
        }

        // 3. Fetch Active Doctors List for filter dropdown
        const { data: docData } = await supabase
          .from('doctors')
          .select('id, name, specialties(name_bn)')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (docData && docData.length > 0) {
          setDoctorsList(
            docData.map((d: any) => ({
              id: d.id,
              name: d.name,
              specialtyName: d.specialties?.name_bn || ''
            }))
          );
        } else if (fullDocs && fullDocs.length > 0) {
          setDoctorsList(
            fullDocs.map((d) => ({
              id: d.id,
              name: d.name,
              specialtyName: d.specialtyNameBn || d.specialty || ''
            }))
          );
        }
      } else {
        // LocalStorage Fallback
        const saved = localStorage.getItem('sheba_appointments_v3');
        if (saved) {
          setAppointments(JSON.parse(saved));
        }
        const savedDocs = localStorage.getItem('sheba_doctors_v3');
        if (savedDocs) {
          const list = JSON.parse(savedDocs);
          setAllDoctors(list);
          setDoctorsList(
            list.map((d: any) => ({
              id: d.id || d.doctorId,
              name: d.name,
              specialtyName: d.specialty || d.specialtyNameBn || ''
            }))
          );
        }
      }
    } catch (err: any) {
      console.error('Error fetching admin appointments:', err);
      setActionError('ডেটা লোড করতে সমস্যা দেখা দিয়েছে।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointmentsAndDoctors();

    let channel: any = null;
    let pollInterval: any = null;

    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('admin-appointments-realtime-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
            fetchAppointmentsAndDoctors();
          })
          .subscribe();
      } catch (err) {
        console.warn('Appointments Realtime subscription notice:', err);
      }

      pollInterval = setInterval(() => {
        fetchAppointmentsAndDoctors();
      }, 3000);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [fetchAppointmentsAndDoctors]);

  // Reset Filters
  const handleResetFilters = () => {
    setDateFilter('');
    setSelectedDoctorId('ALL');
    setStatusTab('ALL');
    setSearchQuery('');
  };

  // Top Real-time Stat Badges Calculations
  const stats = useMemo(() => {
    const todayCount = appointments.filter((a) => {
      const pDate = a.preferred_date || a.appointment_date || a.preferredDate || '';
      return pDate === todayStr;
    }).length;

    const pendingCount = appointments.filter((a) => a.status === 'Pending').length;
    const confirmedCount = appointments.filter((a) => a.status === 'Confirmed').length;
    const totalCount = appointments.length;

    return { todayCount, pendingCount, confirmedCount, totalCount };
  }, [appointments, todayStr]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      // 1. Date Filter
      if (dateFilter) {
        const itemDate = item.preferred_date || item.appointment_date || item.preferredDate || '';
        if (itemDate !== dateFilter) return false;
      }

      // 2. Doctor Filter
      if (selectedDoctorId !== 'ALL') {
        const docId = item.doctor_id || item.doctorId || item.doctors?.id || '';
        if (docId !== selectedDoctorId) return false;
      }

      // 3. Status Tab Filter
      if (statusTab !== 'ALL') {
        if (item.status !== statusTab) return false;
      }

      // 4. Live Search Filter (Patient Name or Mobile)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const patientName = (item.patient_name || item.patientName || '').toLowerCase();
        const patientPhone = (item.patient_mobile || item.patient_phone || item.patientMobile || '').toLowerCase();
        const doctorName = (item.doctors?.name || item.doctorName || '').toLowerCase();
        
        const matchesName = patientName.includes(q);
        const matchesPhone = patientPhone.includes(q);
        const matchesDoctor = doctorName.includes(q);

        if (!matchesName && !matchesPhone && !matchesDoctor) return false;
      }

      return true;
    });
  }, [appointments, dateFilter, selectedDoctorId, statusTab, searchQuery]);

  // Delete / Cancel Appointment
  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সিরিয়ালটি বাতিল/মুছে ফেলতে চান?')) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) throw error;
      }

      // LocalStorage update
      const updated = appointments.filter((a) => a.id !== id);
      setAppointments(updated);
      localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));
    } catch (err: any) {
      alert('বাতিল করতে সমস্যা হয়েছে: ' + (err?.message || ''));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
              অ্যাডমিন প্যানেল
            </span>
            <span className="text-xs text-slate-400">• mydocbd.com</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            সিরিয়াল ও বুকিং ব্যবস্থাপনা
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            রোগীদের ডাক্তারের চেম্বার সিরিয়াল অনুমোদন, আপডেট এবং দ্রুত SMS পাঠানোর সিস্টেম।
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointmentsAndDoctors}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>রিফ্রেশ ডেটা</span>
        </button>
      </div>

      {/* Real-time Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Patients */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-sky-700 uppercase tracking-wider">আজকের রোগী</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.todayCount}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 font-bold">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Serials */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">পেন্ডিং সিরিয়াল</div>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.pendingCount}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Confirmed Serials */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">অনুমোদিত সিরিয়াল</div>
            <div className="text-2xl font-black text-emerald-900 mt-1">{stats.confirmedCount}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">মোট বুকিং</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalCount}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Advanced Multi-Filter Control Bar */}
      <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search & Date Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Patient Search */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Search className="h-3.5 w-3.5 text-sky-600" />
              রোগীর নাম / ফোন সার্চ
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম বা মোবাইল নম্বর লিখুন..."
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Date Picker & Pills */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-sky-600" />
                তারিখ নির্বাচন
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${!dateFilter ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  সকল
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter(todayStr)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${dateFilter === todayStr ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  আজকে
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter(tomorrowStr)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${dateFilter === tomorrowStr ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  আগামীকাল
                </button>
              </div>
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
          </div>

          {/* Doctor Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-sky-600" />
              ডাক্তার ফিল্টার
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition bg-white"
            >
              <option value="ALL">সকল ডাক্তার</option>
              {doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} {doc.specialtyName ? `(${doc.specialtyName})` : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Row 2: Status Tabs & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {(['ALL', 'Pending', 'Confirmed', 'Cancelled'] as const).map((st) => {
              const labelMap = {
                ALL: 'সকল',
                Pending: 'পেন্ডিং',
                Confirmed: 'অনুমোদিত',
                Cancelled: 'বাতিল'
              };

              const isActive = statusTab === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusTab(st)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labelMap[st]}
                </button>
              );
            })}
          </div>

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>ফিল্টার রিসেট</span>
          </button>

        </div>

      </div>

      {/* Error Alert */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Data Table Container */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-xs overflow-hidden">
        
        {loading ? (
          /* Skeleton Loader */
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-36 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-20 bg-slate-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">কোনো সিরিয়াল পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              নির্বাচিত ফিল্টার বা সার্চ কোয়েরির সাথে মেলে এমন কোনো বুকিং পাওয়া যায়নি।
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline pt-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>সকল ফিল্টার রিসেট করুন</span>
            </button>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">তারিখ</th>
                  <th className="px-5 py-3.5">রোগীর তথ্য</th>
                  <th className="px-5 py-3.5">ডাক্তার ও বিভাগ</th>
                  <th className="px-5 py-3.5">হাসপাতাল ও রুম</th>
                  <th className="px-5 py-3.5">স্ট্যাটাস</th>
                  <th className="px-5 py-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAppointments.map((item) => {
                  const resolved = resolveAppointmentDetails(item);
                  const doctorName = resolved.doctorName;
                  const specialty = resolved.specialty;
                  const facilityName = resolved.facilityName;
                  const roomNo = resolved.roomNo;
                  const floor = resolved.floor;
                  const building = resolved.building;
                  const visitingTime = resolved.visitingTime;

                  const patientName = item.patient_name || item.patientName || 'রোগী';
                  const patientPhone = item.patient_mobile || item.patient_phone || item.patientMobile || '';
                  const patientAge = item.patient_age || item.patientAge || '';

                  const preferredDate = item.preferred_date || item.appointment_date || item.preferredDate || '';
                  const serialNo = item.serial_no || item.serialNo || '';
                  const isPending = item.status === 'Pending';
                  const isConfirmed = item.status === 'Confirmed';
                  const isCancelled = item.status === 'Cancelled' || item.status === 'Rejected';

                  // Build SMS URI for quick SMS click with full detailed template
                  const quickSmsText = generateSmsText({
                    patientName,
                    doctorName,
                    facilityName,
                    serialNo: serialNo || '০১',
                    roomNo,
                    floor,
                    building,
                    visitingTime,
                    date: preferredDate,
                    specialInstructions: item.special_instructions || item.admin_notes || item.adminNotes,
                    trackingCode: item.booking_code || item.id || item.bookingCode
                  });
                  const quickSmsUri = getSmsUri(patientPhone, quickSmsText);

                  // Prepare enriched appointment object to pass to confirmation modal
                  const enrichedAppointment = {
                    ...item,
                    doctorName,
                    doctor_name: doctorName,
                    doctors: {
                      id: item.doctor_id || item.doctorId,
                      name: doctorName,
                      degrees: item.doctors?.degrees || resolved.matchedDoc?.degrees || 'এমবিবিএস',
                      specialties: { name_bn: specialty }
                    },
                    assignedFacilityName: facilityName,
                    assigned_facility_name: facilityName,
                    assignedRoomNo: roomNo,
                    assigned_room_no: roomNo,
                    assignedFloor: floor,
                    assigned_floor: floor,
                    assignedBuilding: building,
                    assigned_building: building,
                    confirmedVisitingTime: visitingTime,
                    confirmed_visiting_time: visitingTime
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Date */}
                      <td className="px-5 py-4 align-top">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Calendar className="h-3.5 w-3.5 text-sky-600" />
                          <span>{preferredDate || 'তারিখ জানা নেই'}</span>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-900">{patientName}</div>
                        {patientAge && <div className="text-[11px] text-slate-500">বয়স: {patientAge} বছর</div>}
                        {patientPhone && (
                          <a
                            href={`tel:${cleanPhone(patientPhone)}`}
                            className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{cleanPhone(patientPhone)}</span>
                          </a>
                        )}
                      </td>

                      {/* Doctor & Specialty */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-900">{doctorName}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          {specialty}
                        </div>
                      </td>

                      {/* Facility & Room */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{facilityName}</span>
                        </div>
                        {(roomNo || floor || building) && (
                          <div className="mt-1 text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                            {roomNo && <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">রুম: {roomNo}</span>}
                            {floor && <span>{floor}</span>}
                            {building && <span className="text-slate-500">• {building}</span>}
                          </div>
                        )}
                        {serialNo && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Hash className="h-3 w-3 text-emerald-600" />
                            <span>সিরিয়াল: {serialNo}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 align-top">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                            <Clock className="h-3 w-3 text-amber-600" />
                            পেন্ডিং
                          </span>
                        )}
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            অনুমোদিত
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-800 border border-red-200">
                            <XCircle className="h-3 w-3 text-red-600" />
                            বাতিল
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => setConfirmingAppointment(enrichedAppointment)}
                              className="inline-flex items-center gap-1 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>অনুমোদন করুন</span>
                            </button>
                          )}

                          {isConfirmed && (
                            <>
                              <a
                                href={quickSmsUri}
                                target="_self"
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                                <span>📱 SMS পাঠান</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => setConfirmingAppointment(enrichedAppointment)}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition"
                                title="সিরিয়াল আপডেট করুন"
                              >
                                <span>এডিট</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center justify-center p-1.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="মুছুন / বাতিল"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Confirmation & SMS Modal */}
      {confirmingAppointment && (
        <ConfirmAppointmentModal
          isOpen={!!confirmingAppointment}
          appointment={confirmingAppointment}
          onClose={() => setConfirmingAppointment(null)}
          onSuccess={() => {
            fetchAppointmentsAndDoctors();
            setConfirmingAppointment(null);
          }}
        />
      )}

    </div>
  );
}
