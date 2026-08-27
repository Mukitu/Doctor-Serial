import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import DoctorDirectory from './components/DoctorDirectory';
import BookingModal from './components/BookingModal';
import AppointmentTracker from './components/AppointmentTracker';
import AdminDashboard from './components/AdminDashboard';
import PortalLogin from './components/PortalLogin';
import { Doctor, Appointment, ActiveTab, District, Specialty, Facility, AdminProfile } from './types';
import { HeartPulse, ShieldCheck, PhoneCall, HelpCircle, ChevronRight } from 'lucide-react';
import {
  isSupabaseConfigured,
  getDistricts,
  getSpecialties,
  getFacilities,
  getDoctors,
  getAppointments,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  addAppointment,
  confirmAppointment,
  rejectAppointment,
  resetAppointmentToPending,
  getCurrentAdmin,
  signOut as apiSignOut,
  addDistrict,
  updateDistrict,
  deleteDistrict,
  addFacility,
  updateFacility,
  deleteFacility
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedDistrict, setSelectedDistrict] = useState('রাজশাহী');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);

  // Dynamic tables from backend / localStorage fallback
  const [districts, setDistricts] = useState<District[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Synchronized search filter states between Hero and Directory
  const [searchFilters, setSearchFilters] = useState<{
    district: string;
    specialty: string;
    facility: string;
  }>({
    district: 'রাজশাহী',
    specialty: '',
    facility: '',
  });

  // Async load all tables dynamically from the service layer
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const dbDistricts = await getDistricts();
        setDistricts(dbDistricts);

        const dbSpecialties = await getSpecialties();
        setSpecialties(dbSpecialties);

        const dbFacilities = await getFacilities();
        setFacilities(dbFacilities);

        const dbDocs = await getDoctors();
        setDoctors(dbDocs);

        const dbApps = await getAppointments();
        setAppointments(dbApps);
      } catch (err) {
        console.error('Error loading data in App:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Load session admin on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const admin = await getCurrentAdmin();
        if (admin) {
          setCurrentAdmin(admin);
        }
      } catch (err) {
        console.error('Session loading failed:', err);
      }
    }
    loadSession();
  }, []);

  // Sync URL route states for /portal-login and /admin with safe hash-based routing fallback
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path === '/portal-login' || path.endsWith('/portal-login') || hash === '#/portal-login' || hash === '#portal-login') {
        setActiveTab('portal-login');
        if (!hash) {
          window.history.replaceState({}, '', '/#/portal-login');
        }
      } else if (path === '/admin' || path.endsWith('/admin') || hash === '#/admin' || hash === '#admin') {
        if (currentAdmin) {
          setActiveTab('admin');
          if (!hash) {
            window.history.replaceState({}, '', '/#/admin');
          }
        } else {
          setActiveTab('portal-login');
          window.history.replaceState({}, '', '/#/portal-login');
        }
      } else if (hash === '#/doctors' || hash === '#doctors') {
        setActiveTab('doctors');
      } else if (hash === '#/track' || hash === '#track') {
        setActiveTab('track');
      } else if (hash === '#/' || hash === '#home' || hash === '#/home' || (!hash && path === '/')) {
        setActiveTab('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [currentAdmin]);

  // Client-side route protection guard
  useEffect(() => {
    if (activeTab === 'admin' && !currentAdmin) {
      setActiveTab('portal-login');
      window.history.pushState({}, '', '/#/portal-login');
    }
  }, [activeTab, currentAdmin]);

  // Sync initial district when selectedDistrict changes
  useEffect(() => {
    setSearchFilters((prev) => ({
      ...prev,
      district: selectedDistrict,
    }));
  }, [selectedDistrict]);

  // Reset synced search filters
  const resetSearchFilters = () => {
    setSearchFilters({
      district: selectedDistrict,
      specialty: '',
      facility: '',
    });
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'portal-login') {
      window.history.pushState({}, '', '/#/portal-login');
    } else if (tab === 'admin') {
      window.history.pushState({}, '', '/#/admin');
    } else if (tab === 'doctors') {
      window.history.pushState({}, '', '/#/doctors');
    } else if (tab === 'track') {
      window.history.pushState({}, '', '/#/track');
    } else {
      window.history.pushState({}, '', '/#/');
    }
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      await apiSignOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
    setCurrentAdmin(null);
    setActiveTab('home');
    window.history.pushState({}, '', '/#/');
  };

  // State mutation actions linked directly to the dynamic service layer
  const handleAddDoctor = async (newDoc: Doctor) => {
    try {
      await addDoctor(newDoc);
      // Re-fetch database state to ensure perfect consistency
      const refreshedDocs = await getDoctors();
      setDoctors(refreshedDocs);
    } catch (err) {
      console.error('Failed to add doctor:', err);
      // Client-side fallback if offline
      setDoctors((prev) => [newDoc, ...prev]);
    }
  };

  const handleUpdateDoctor = async (updatedDoc: Doctor) => {
    try {
      await updateDoctor(updatedDoc);
      const refreshedDocs = await getDoctors();
      setDoctors(refreshedDocs);
    } catch (err) {
      console.error('Failed to update doctor:', err);
      // Client-side fallback if offline
      setDoctors((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await deleteDoctor(id);
      const refreshedDocs = await getDoctors();
      setDoctors(refreshedDocs);
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      // Client-side fallback if offline
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleAddDistrict = async (newDist: Omit<District, 'id'>) => {
    try {
      await addDistrict(newDist);
      const refreshed = await getDistricts();
      setDistricts(refreshed);
    } catch (err) {
      console.error('Failed to add district:', err);
    }
  };

  const handleUpdateDistrict = async (updatedDist: District) => {
    try {
      await updateDistrict(updatedDist);
      const refreshed = await getDistricts();
      setDistricts(refreshed);
    } catch (err) {
      console.error('Failed to update district:', err);
    }
  };

  const handleDeleteDistrict = async (id: string) => {
    try {
      await deleteDistrict(id);
      const refreshed = await getDistricts();
      setDistricts(refreshed);
    } catch (err) {
      console.error('Failed to delete district:', err);
    }
  };

  const handleAddFacility = async (newFac: Omit<Facility, 'id'>) => {
    try {
      await addFacility(newFac);
      const refreshed = await getFacilities();
      setFacilities(refreshed);
    } catch (err) {
      console.error('Failed to add facility:', err);
    }
  };

  const handleUpdateFacility = async (updatedFac: Facility) => {
    try {
      await updateFacility(updatedFac);
      const refreshed = await getFacilities();
      setFacilities(refreshed);
    } catch (err) {
      console.error('Failed to update facility:', err);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    try {
      await deleteFacility(id);
      const refreshed = await getFacilities();
      setFacilities(refreshed);
    } catch (err) {
      console.error('Failed to delete facility:', err);
    }
  };

  const handleAddAppointment = async (newApp: Appointment) => {
    try {
      await addAppointment(newApp);
      const refreshedApps = await getAppointments();
      setAppointments(refreshedApps);
    } catch (err) {
      console.error('Failed to add appointment:', err);
      // Client-side fallback if offline
      setAppointments((prev) => [newApp, ...prev]);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      if (status === 'Confirmed') {
        // Quick confirm uses generated/standard details
        await confirmAppointment({
          bookingCode: id,
          serialNo: `SL-${Math.floor(10 + Math.random() * 90)}`,
          assignedRoomNo: `কক্ষ ১০${Math.floor(1 + Math.random() * 8)}`,
          confirmedVisitingTime: 'বিকাল ৫:৩০ টা',
          adminNotes: 'অটো-অনুমোদিত'
        });
      } else if (status === 'Cancelled' || status === 'Rejected') {
        await rejectAppointment({
          bookingCode: id,
          rejectionReason: 'রোগীর অনুরোধে বাতিল'
        });
      } else {
        await resetAppointmentToPending(id);
      }
      
      const refreshedApps = await getAppointments();
      setAppointments(refreshedApps);
    } catch (err) {
      console.error('Error updating appointment status:', err);
      // Local fallback
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Dynamic Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        districts={districts}
        currentAdmin={currentAdmin}
        onSignOut={handleSignOut}
      />

      {/* Main Content Areas */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div>
            {/* Interactive Hero section */}
            <Hero
              setActiveTab={handleTabChange}
              setSearchFilters={setSearchFilters}
              selectedDistrict={selectedDistrict}
              districts={districts}
              specialties={specialties}
              facilities={facilities}
            />

            {/* Curated Top-Priority Doctors Highlight Grid */}
            <section className="py-12 bg-white border-t border-b border-slate-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                      আমাদের সেরা বিশেষজ্ঞরা
                    </h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      রাজশাহী মেডিকেল কলেজ ও হাসপাতালের বিশিষ্ট সহযোগী ও সহকারী অধ্যাপকগণ
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetSearchFilters();
                      setActiveTab('doctors');
                    }}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:underline self-start cursor-pointer"
                    id="home-view-all-docs"
                  >
                    <span>সকল ডাক্তার সূচী দেখুন</span>
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="text-center py-12 text-xs font-bold text-slate-400">
                    লোড হচ্ছে...
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-12 text-xs font-bold text-slate-400">
                    কোন ডাক্তার তালিকাভুক্ত নেই। অ্যাডমিন প্যানেল থেকে ডাক্তার যোগ করুন।
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {doctors.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-lg border border-slate-200 p-5 hover:border-[#0284C7] transition bg-white flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-extrabold border border-slate-200 text-xs">
                              {doc.name.split(' ').filter(n => !n.includes('ডা.') && !n.includes(' can')).map(n => n[0]).slice(0, 2).join('') || 'DR'}
                            </div>
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/50">
                              {doc.specialty}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-800 text-sm sm:text-base mt-3 flex items-center gap-1">
                            {doc.name}
                          </h3>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 line-clamp-1">{doc.degrees}</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-1">{doc.workplace}</p>

                          <div className="mt-4 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-500 space-y-1 font-bold">
                            <p>🕒 সময়: <b className="text-slate-700">{doc.visitingTime}</b></p>
                            <p>🏥 চেম্বার: <b className="text-slate-700 line-clamp-1">{doc.facility.replace(', রাজশাহী', '')}</b></p>
                          </div>
                        </div>

                        <button
                          onClick={() => setBookingDoctor(doc)}
                          className="mt-4 w-full rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2 text-center text-xs font-bold text-white transition cursor-pointer"
                        >
                          সিরিয়াল বুক করুন
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Patients FAQs & Advisory Info */}
            <section className="py-12 md:py-14">
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-[#0284C7] mb-2">
                    <HelpCircle className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                    সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
                  </h2>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    রোগী বুকিং ও ট্র্যাকিং সেবার বিষয়ে প্রয়োজনীয় তথ্য
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-800 text-sm">১. বিএমডিসি ভেরিফাইড (BM&DC Verified) মানে কী?</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-semibold">
                      বাংলাদেশ মেডিকেল অ্যান্ড ডেন্টাল কাউন্সিল (BM&DC) দ্বারা নিবন্ধিত এবং লাইসেন্সকৃত ডাক্তারদের তালিকা এখানে নিশ্চিত করা হয়। আমাদের সকল ডাক্তারের BM&DC রেজিস্ট্রেশন নম্বর ভেরিফাইড ও সত্য।
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-800 text-sm">২. সিরিয়াল রিকোয়েস্ট পেন্ডিং স্ট্যাটাসটি কখন কনফার্ম হবে?</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-semibold">
                      সিরিয়াল বুকিংয়ের পর আমাদের সংশ্লিষ্ট হাসপাতালের চেম্বার সহকারীরা আপনার কাঙ্ক্ষিত শিডিউল এবং ডাক্তারদের উপস্থিতির সাপেক্ষে সাধারণত ২০-৩০ মিনিটের মাঝে রিকোয়েস্টটি যাচাই করে "Pending" থেকে "Confirmed" করবেন।
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-800 text-sm">৩. সিরিয়াল কনফার্মেশন ও রোগী দেখার ক্রমানুসার কীভাবে নির্ধারিত হয়?</h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed font-semibold">
                      চূড়ান্ত কনফার্মেশন নিশ্চিত হলে আপনি ট্র্যাকিং স্ক্রিনে আপনার স্ট্যাটাস কনফার্ম দেখতে পাবেন। রোগী দেখার সিরিয়ালের ক্রম সাধারণত আগে আসলে আগে পাবেন বা চেম্বারে উপস্থিতির ক্রমের উপর ভিত্তি করে সহকারী দ্বারা নিয়ন্ত্রিত হয়।
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'doctors' && (
          <DoctorDirectory
            doctors={doctors}
            specialties={specialties}
            facilities={facilities}
            districts={districts}
            onBookDoctor={setBookingDoctor}
            initialFilters={searchFilters}
            resetInitialFilters={resetSearchFilters}
            selectedDistrict={selectedDistrict}
          />
        )}

        {activeTab === 'track' && (
          <AppointmentTracker appointments={appointments} />
        )}

        {activeTab === 'portal-login' && (
          <PortalLogin
            onLoginSuccess={(admin) => {
              setCurrentAdmin(admin);
              handleTabChange('admin');
            }}
          />
        )}

        {activeTab === 'admin' && currentAdmin && (
          <AdminDashboard
            doctors={doctors}
            appointments={appointments}
            specialties={specialties}
            facilities={facilities}
            districts={districts}
            currentAdmin={currentAdmin}
            onAddDoctor={handleAddDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onAddDistrict={handleAddDistrict}
            onUpdateDistrict={handleUpdateDistrict}
            onDeleteDistrict={handleDeleteDistrict}
            onAddFacility={handleAddFacility}
            onUpdateFacility={handleUpdateFacility}
            onDeleteFacility={handleDeleteFacility}
          />
        )}
      </main>

      {/* Persistent Dynamic Booking Modal Overlay */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onAddAppointment={handleAddAppointment}
          onNavigateToTrack={() => handleTabChange('track')}
        />
      )}

      {/* Sophisticated Footer with Accent colors */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Logo and Brand Info */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0284C7] text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-lg font-black text-white">সেবাসিরিয়াল</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                ডাক্তার সিরিয়াল এবং কনফার্মেশন সহজীকরণে উত্তরবঙ্গের আধুনিক ডিজিটাল সেবা পোর্টাল।
              </p>
              <div className="flex items-center gap-1.5 text-[#2563EB] text-[10px] font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>১০০% বিএমডিসি ভেরিফাইড নেটওয়ার্ক</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">নেভিগেশন</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button onClick={() => handleTabChange('home')} className="hover:text-[#0284C7] transition cursor-pointer">হোম পেজ</button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('doctors')} className="hover:text-[#0284C7] transition cursor-pointer">ডাক্তার তালিকা</button>
                </li>
                <li>
                  <button onClick={() => handleTabChange('track')} className="hover:text-[#0284C7] transition cursor-pointer">সিরিয়াল ট্র্যাকার</button>
                </li>
                {currentAdmin && (
                  <li>
                    <button onClick={() => handleTabChange('admin')} className="hover:text-[#0284C7] transition cursor-pointer">অ্যাডমিন ড্যাশবোর্ড</button>
                  </li>
                )}
              </ul>
            </div>

            {/* Selected District Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">সার্ভিস এরিয়া</h4>
              <p className="text-xs leading-relaxed font-semibold">
                বর্তমানে আমাদের প্ল্যাটফর্মটি মূলত <b>রাজশাহী বিভাগ ও এর পার্শ্ববর্তী জেলাসমূহের</b> চিকিৎসকদের চেম্বার সিডিউল সেবা প্রদান করছে।
              </p>
            </div>

            {/* Emergency Hotline Contact block */}
            <div className="rounded-lg bg-slate-800/30 p-4 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">সহায়তার জন্য হটলাইন</span>
              <div className="flex items-center gap-2 text-white">
                <PhoneCall className="h-4 w-4 text-[#0D9488]" />
                <span className="font-mono text-base font-black">০৯৬১২-৩৪৫৬৭৮</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                সকাল ৮:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত আমাদের সাপোর্ট টিম আপনার যেকোনো প্রশ্নের উত্তর দিতে প্রস্তুত।
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold text-slate-500">
            <p>© ২০২৬ সেবাসিরিয়াল (Sheba Serial) পোর্টাল। সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">ব্যবহারের নিয়মাবলী</a>
              <a href="#" className="hover:underline">প্রাইভেসি পলিসি</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
