import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import DoctorDirectory from './components/DoctorDirectory';
import BookingModal from './components/BookingModal';
import DoctorProfileModal from './components/DoctorProfileModal';
import AppointmentTracker from './components/AppointmentTracker';
import AdminDashboard from './components/AdminDashboard';
import PortalLogin from './components/PortalLogin';
import AboutUs from './components/AboutUs';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import FAQ from './components/FAQ';
import BlogView from './components/BlogView';
import PromoBannerComponent from './components/PromoBanner';
import Footer from './components/Footer';
import { Doctor, Appointment, ActiveTab, District, Specialty, Facility, AdminProfile } from './types';
import { filterDoctorsList } from './utils/filterDoctors';
import { HeartPulse, ShieldCheck, PhoneCall, HelpCircle, ChevronRight, Filter, X, Sparkles } from 'lucide-react';
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
  deleteFacility,
  addSpecialty,
  updateSpecialty,
  deleteSpecialty
} from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedDistrict, setSelectedDistrict] = useState('সকল জেলা');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
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
    district: 'সকল জেলা',
    specialty: '',
    facility: '',
  });

  // Public-facing doctors (only active doctors)
  const publicDoctors = useMemo(() => {
    return doctors.filter(d => d.isActive !== false);
  }, [doctors]);

  // Real-time reactive filtered doctors for the Home page "আমাদের সেরা বিশেষজ্ঞরা" section
  const homeFilteredDoctors = useMemo(() => {
    return filterDoctorsList(
      publicDoctors,
      {
        selectedDistrict: selectedDistrict,
        selectedSpecialty: searchFilters.specialty,
        selectedFacility: searchFilters.facility,
      },
      specialties,
      districts
    ).sort((a, b) => (a.priorityIndex || 0) - (b.priorityIndex || 0));
  }, [publicDoctors, selectedDistrict, searchFilters.specialty, searchFilters.facility, specialties, districts]);

  // Unified data-loading sequence that forces a re-render once all tables have successfully populated
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [dbDistricts, dbSpecialties, dbFacilities, dbDocs, dbApps] = await Promise.all([
          getDistricts(),
          getSpecialties(),
          getFacilities(),
          getDoctors(),
          getAppointments()
        ]);

        if (isMounted) {
          // Batch atomic updates to avoid partial rendering or empty view states
          setDistricts(dbDistricts || []);
          setSpecialties(dbSpecialties || []);
          setFacilities(dbFacilities || []);
          setDoctors(dbDocs || []);
          setAppointments(dbApps || []);
        }
      } catch (err) {
        console.error('Error loading initial data in App:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
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

  // Sync URL route states with clean pathname-based routing (/, /doctors, /track, /about, /mydocbdadmin)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      
      if (path === '/mydocbdadmin' || path.endsWith('/mydocbdadmin')) {
        if (currentAdmin) {
          setActiveTab('admin');
        } else {
          setActiveTab('portal-login');
        }
      } else if (path === '/doctors' || path.endsWith('/doctors')) {
        setActiveTab('doctors');
      } else if (path === '/track' || path.endsWith('/track')) {
        setActiveTab('track');
      } else if (path === '/about' || path.endsWith('/about')) {
        setActiveTab('about');
      } else if (path === '/terms' || path.endsWith('/terms')) {
        setActiveTab('terms');
      } else if (path === '/privacy' || path.endsWith('/privacy')) {
        setActiveTab('privacy');
      } else if (path === '/faq' || path.endsWith('/faq')) {
        setActiveTab('faq');
      } else if (path === '/blog' || path.endsWith('/blog')) {
        setActiveTab('blog');
      } else if (path === '/' || path === '' || path.endsWith('/')) {
        setActiveTab('home');
      } else {
        // Fallback for unknown paths
        setActiveTab('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [currentAdmin]);

  // Client-side route protection guard
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/mydocbdadmin' || path.endsWith('/mydocbdadmin')) {
      if (activeTab === 'admin' && !currentAdmin) {
        setActiveTab('portal-login');
      }
    } else {
      if (activeTab === 'admin' && !currentAdmin) {
        setActiveTab('portal-login');
        window.history.pushState({}, '', '/mydocbdadmin');
      }
    }
  }, [activeTab, currentAdmin]);

  // Sync initial district when selectedDistrict changes
  useEffect(() => {
    setSearchFilters((prev) => ({
      ...prev,
      district: selectedDistrict,
    }));
  }, [selectedDistrict]);

  // Scroll to top on tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Reset synced search filters
  const resetSearchFilters = () => {
    setSearchFilters({
      district: selectedDistrict,
      specialty: '',
      facility: '',
    });
  };

  const handleTabChange = (tab: ActiveTab) => {
    let path = '/';
    if (tab === 'portal-login' || tab === 'admin') {
      path = '/mydocbdadmin';
    } else if (tab === 'doctors') {
      path = '/doctors';
    } else if (tab === 'track') {
      path = '/track';
    } else if (tab === 'about') {
      path = '/about';
    } else if (tab === 'terms') {
      path = '/terms';
    } else if (tab === 'privacy') {
      path = '/privacy';
    } else if (tab === 'faq') {
      path = '/faq';
    } else if (tab === 'blog') {
      path = '/blog';
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
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
    window.history.pushState({}, '', '/');
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

  const handleAddSpecialty = async (newSpec: Omit<Specialty, 'id'>) => {
    try {
      await addSpecialty(newSpec);
      const refreshed = await getSpecialties();
      setSpecialties(refreshed);
    } catch (err) {
      console.error('Failed to add specialty:', err);
    }
  };

  const handleUpdateSpecialty = async (updatedSpec: Specialty) => {
    try {
      await updateSpecialty(updatedSpec);
      const refreshed = await getSpecialties();
      setSpecialties(refreshed);
    } catch (err) {
      console.error('Failed to update specialty:', err);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    try {
      await deleteSpecialty(id);
      const refreshed = await getSpecialties();
      setSpecialties(refreshed);
    } catch (err) {
      console.error('Failed to delete specialty:', err);
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

  const handleUpdateAppointmentStatus = async (
    id: string,
    status: Appointment['status'],
    details?: {
      serialNo?: string;
      assignedRoomNo?: string;
      assignedFloor?: string;
      assignedBuilding?: string;
      confirmedVisitingTime?: string;
      adminNotes?: string;
    }
  ) => {
    try {
      if (status === 'Confirmed') {
        const existing = appointments.find((a) => a.id === id);
        await confirmAppointment({
          bookingCode: id,
          serialNo: details?.serialNo || existing?.serialNo || '০১',
          assignedRoomNo: details?.assignedRoomNo || existing?.assignedRoomNo || '',
          assignedFloor: details?.assignedFloor || existing?.assignedFloor || '',
          assignedBuilding: details?.assignedBuilding || existing?.assignedBuilding || '',
          confirmedVisitingTime: details?.confirmedVisitingTime || existing?.confirmedVisitingTime || '',
          adminNotes: details?.adminNotes !== undefined ? details.adminNotes : existing?.adminNotes
        });
      } else if (status === 'Cancelled' || status === 'Rejected') {
        await rejectAppointment({
          bookingCode: id,
          rejectionReason: 'বাতিল করা হয়েছে'
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
        prev.map((app) => (app.id === id ? { 
          ...app, 
          status,
          ...(details ? {
            serialNo: details.serialNo ?? app.serialNo,
            assignedRoomNo: details.assignedRoomNo ?? app.assignedRoomNo,
            assignedFloor: details.assignedFloor ?? app.assignedFloor,
            assignedBuilding: details.assignedBuilding ?? app.assignedBuilding,
            confirmedVisitingTime: details.confirmedVisitingTime ?? app.confirmedVisitingTime,
            adminNotes: details.adminNotes ?? app.adminNotes,
          } : {})
        } : app))
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
              searchFilters={searchFilters}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              districts={districts}
              specialties={specialties}
              facilities={facilities}
            />

            {/* Hero Slot Promo Banner */}
            <PromoBannerComponent slot="hero" className="my-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

            {/* Curated Top-Priority Doctors Highlight Grid with Instant Reactive Filtering */}
            <section id="featured-doctors-section" className="py-12 bg-white border-t border-b border-slate-200 scroll-mt-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-800 md:text-xl">
                        আমাদের সেরা বিশেষজ্ঞরা
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-[#0284C7] border border-sky-100">
                        {homeFilteredDoctors.length} জন ডাক্তার
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      {selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)'
                        ? `${selectedDistrict} জেলার শীর্ষ বিশেষজ্ঞ ডাক্তারগণ`
                        : 'বিভিন্ন মেডিকেল কলেজ ও হাসপাতালের বিশিষ্ট বিশেষজ্ঞ ও চিকিৎসকগণ'}
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
                    <span>সম্পূর্ণ ডাক্তার সূচী দেখুন</span>
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Active Filter Chips in Home Section */}
                {(searchFilters.specialty || searchFilters.facility || (selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)')) && (
                  <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5 text-[#0284C7]" /> সক্রিয় ফিল্টার:
                    </span>

                    {selectedDistrict && selectedDistrict !== 'সকল জেলা' && selectedDistrict !== 'সকল জেলা (All)' && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
                        <span>জেলা: {selectedDistrict}</span>
                        <button
                          onClick={() => {
                            setSelectedDistrict('সকল জেলা');
                            setSearchFilters(prev => ({ ...prev, district: 'সকল জেলা' }));
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="জেলা ফিল্টার মুছুন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {searchFilters.specialty && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-[#0284C7] border border-sky-200 shadow-2xs">
                        <span>বিশেষজ্ঞ: {searchFilters.specialty}</span>
                        <button
                          onClick={() => setSearchFilters(prev => ({ ...prev, specialty: '' }))}
                          className="text-[#0284C7]/70 hover:text-rose-500 cursor-pointer"
                          title="বিশেষজ্ঞ ফিল্টার মুছুন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    {searchFilters.facility && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs">
                        <span>হাসপাতাল: {searchFilters.facility}</span>
                        <button
                          onClick={() => setSearchFilters(prev => ({ ...prev, facility: '' }))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="হাসপাতাল ফিল্টার মুছুন"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSelectedDistrict('সকল জেলা');
                        resetSearchFilters();
                      }}
                      className="ml-auto text-xs font-bold text-rose-600 hover:underline cursor-pointer px-1 py-0.5"
                    >
                      সব ফিল্টার মুছুন
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-12 text-xs font-bold text-slate-400">
                    লোড হচ্ছে...
                  </div>
                ) : homeFilteredDoctors.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-8">
                    <p className="text-sm font-bold text-slate-700">নির্বাচিত ফিল্টারের সাথে কোনো ডাক্তার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">অন্য ক্যাটাগরি বা জেলা সিলেক্ট করুন অথবা ফিল্টার রিসেট করুন।</p>
                    <button
                      onClick={() => {
                        setSelectedDistrict('সকল জেলা');
                        resetSearchFilters();
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-bold text-white hover:bg-[#0274af] cursor-pointer"
                    >
                      সকল ডাক্তার দেখুন
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {homeFilteredDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => setViewingDoctor(doc)}
                        className="group rounded-xl border border-slate-200 p-5 hover:border-[#0284C7] hover:shadow-md transition bg-white flex flex-col justify-between cursor-pointer"
                        id={`home-doctor-card-${doc.id}`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-extrabold border border-slate-200 text-xs overflow-hidden">
                              {doc.photoUrl ? (
                                <img
                                  src={doc.photoUrl}
                                  alt={doc.name}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span>{doc.name.split(' ').filter(n => !n.includes('ডা.') && !n.includes(' can')).map(n => n[0]).slice(0, 2).join('') || 'DR'}</span>
                              )}
                              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0284C7] text-white">
                                <ShieldCheck className="h-3 w-3" />
                              </div>
                            </div>
                            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200/50">
                              {doc.specialty}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-800 text-sm sm:text-base mt-3 flex items-center gap-1 group-hover:text-[#0284C7] transition">
                            {doc.name}
                          </h3>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5 line-clamp-1">{doc.degrees}</p>
                          <p className="text-[11px] font-bold text-[#0D9488] mt-0.5">{doc.designation}</p>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5 line-clamp-1">{doc.workplace}</p>

                          <div className="mt-4 rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-[11px] text-slate-500 space-y-1 font-bold">
                            <p>🕒 সময়: <b className="text-slate-700">{doc.visitingTime || 'বিকাল ৫:০০ - রাত ৮:৩০'}</b></p>
                            <p>🏥 চেম্বার: <b className="text-slate-700 line-clamp-1">{doc.facility ? doc.facility.replace(', রাজশাহী', '') : 'পপুলার ডায়াগনস্টিক সেন্টার'}</b></p>
                            {doc.chamberRoomNo && (
                              <p className="text-[#0284C7]">🚪 রুম: <b className="text-[#0284C7]">{doc.chamberRoomNo}</b> | ফ্লোর: <b className="text-slate-700">{doc.chamberFloor || 'নিচতলা'}</b></p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setViewingDoctor(doc)}
                            className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 py-2 text-center text-xs font-bold text-slate-700 transition cursor-pointer border border-slate-200/60"
                          >
                            প্রোফাইল দেখুন
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookingDoctor(doc)}
                            className="w-full rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2 text-center text-xs font-bold text-white transition cursor-pointer shadow-xs"
                          >
                            সিরিয়াল নিন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'doctors' && (
          <DoctorDirectory
            doctors={publicDoctors}
            specialties={specialties}
            facilities={facilities}
            districts={districts}
            onBookDoctor={setBookingDoctor}
            initialFilters={searchFilters}
            resetInitialFilters={resetSearchFilters}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
          />
        )}

        {activeTab === 'track' && (
          <AppointmentTracker appointments={appointments} />
        )}

        {activeTab === 'about' && (
          <AboutUs onBackToHome={() => handleTabChange('home')} />
        )}

        {activeTab === 'terms' && (
          <TermsOfService onBackToHome={() => handleTabChange('home')} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy onBackToHome={() => handleTabChange('home')} />
        )}

        {activeTab === 'faq' && (
          <FAQ onBackToHome={() => handleTabChange('home')} />
        )}

        {activeTab === 'blog' && (
          <BlogView onBackToHome={() => handleTabChange('home')} />
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
            onAddSpecialty={handleAddSpecialty}
            onUpdateSpecialty={handleUpdateSpecialty}
            onDeleteSpecialty={handleDeleteSpecialty}
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

      {/* Doctor Profile and Reviews Modal */}
      {viewingDoctor && (
        <DoctorProfileModal
          doctor={viewingDoctor}
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          onBookNow={(doc) => {
            setViewingDoctor(null);
            setBookingDoctor(doc);
          }}
        />
      )}

      {/* Dynamic Footer Slot Banner */}
      <PromoBannerComponent slot="footer" className="my-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* Sophisticated Footer with Accent colors */}
      <Footer activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}
