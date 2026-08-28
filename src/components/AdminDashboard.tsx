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
  UserPlus,
  MapPin,
  Building,
  Award,
  Star,
  MessageSquare,
  Phone,
  Lock,
  CheckCircle2,
  Send,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { Doctor, Appointment, Specialty, Facility, AdminProfile, District, Review, BlogPost, PromoBanner } from '../types';
import { 
  getAdmins, 
  createAdminUser, 
  updateAdminRole, 
  revokeAdminAccess,
  getReviews,
  addReview,
  approveReview,
  deleteReview,
  confirmAppointment,
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  getPromoBanners,
  addPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  updateDoctorStatus
} from '../lib/supabase';

interface AdminDashboardProps {
  doctors: Doctor[];
  appointments: Appointment[];
  specialties: Specialty[];
  facilities: Facility[];
  districts: District[];
  currentAdmin: AdminProfile | null;
  onAddDoctor: (doc: Doctor) => void;
  onUpdateDoctor: (doc: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  onUpdateAppointmentStatus: (
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
  ) => void;
  onAddDistrict: (dist: Omit<District, 'id'>) => Promise<void>;
  onUpdateDistrict: (dist: District) => Promise<void>;
  onDeleteDistrict: (id: string) => Promise<void>;
  onAddFacility: (fac: Omit<Facility, 'id'>) => Promise<void>;
  onUpdateFacility: (fac: Facility) => Promise<void>;
  onDeleteFacility: (id: string) => Promise<void>;
  onAddSpecialty: (spec: Omit<Specialty, 'id'>) => Promise<void>;
  onUpdateSpecialty: (spec: Specialty) => Promise<void>;
  onDeleteSpecialty: (id: string) => Promise<void>;
}

type AdminSubTab = 'appointments' | 'doctors' | 'reviews' | 'admins' | 'districts' | 'facilities' | 'specialties';

export default function AdminDashboard({
  doctors,
  appointments,
  specialties,
  facilities,
  districts,
  currentAdmin,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor,
  onUpdateAppointmentStatus,
  onAddDistrict,
  onUpdateDistrict,
  onDeleteDistrict,
  onAddFacility,
  onUpdateFacility,
  onDeleteFacility,
  onAddSpecialty,
  onUpdateSpecialty,
  onDeleteSpecialty,
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<AdminSubTab>('appointments');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Reviews Management States
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewDoctorFilter, setReviewDoctorFilter] = useState('');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newRevDoctorId, setNewRevDoctorId] = useState(doctors[0]?.id || '');
  const [newRevPatientName, setNewRevPatientName] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevText, setNewRevText] = useState('');
  const [newRevSubmitting, setNewRevSubmitting] = useState(false);

  // Appointment Confirmation Modal States
  const [confirmingApp, setConfirmingApp] = useState<Appointment | null>(null);
  const [confSerialNo, setConfSerialNo] = useState('');
  const [confRoomNo, setConfRoomNo] = useState('');
  const [confFloor, setConfFloor] = useState('');
  const [confBuilding, setConfBuilding] = useState('');
  const [confVisitingTime, setConfVisitingTime] = useState('');
  const [confAdminNotes, setConfAdminNotes] = useState('');
  const [confSubmitting, setConfSubmitting] = useState(false);

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

  // Districts CRUD States
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [districtNameBn, setDistrictNameBn] = useState('');
  const [districtNameEn, setDistrictNameEn] = useState('');
  const [districtOrder, setDistrictOrder] = useState('0');
  const [districtActive, setDistrictActive] = useState(true);

  // Facilities CRUD States
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityName, setFacilityName] = useState('');
  const [facilityAreaAddress, setFacilityAreaAddress] = useState('');
  const [facilityDistrictId, setFacilityDistrictId] = useState('');
  const [facilityContactPhone, setFacilityContactPhone] = useState('');
  const [facilityIsVip, setFacilityIsVip] = useState(false);
  const [facilityIsActive, setFacilityIsActive] = useState(true);

  // Specialties CRUD States
  const [showAddSpecialtyModal, setShowAddSpecialtyModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [specialtyNameBn, setSpecialtyNameBn] = useState('');
  const [specialtyNameEn, setSpecialtyNameEn] = useState('');
  const [specialtyIconName, setSpecialtyIconName] = useState('Heart');
  const [specialtyOrder, setSpecialtyOrder] = useState('0');
  const [specialtyActive, setSpecialtyActive] = useState(true);

  // Blogs CRUD States
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCoverImage, setBlogCoverImage] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('MyDocBD মেডিকেল টিম');
  const [blogIsPublished, setBlogIsPublished] = useState(true);

  // Banners CRUD States
  const [bannersList, setBannersList] = useState<PromoBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerTargetUrl, setBannerTargetUrl] = useState('');
  const [bannerSlot, setBannerSlot] = useState<'hero' | 'directory' | 'sidebar' | 'footer'>('hero');
  const [bannerIsActive, setBannerIsActive] = useState(true);

  const loadBlogsList = async () => {
    setBlogsLoading(true);
    try {
      const data = await getBlogs();
      setBlogsList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setBlogsLoading(false);
    }
  };

  const loadBannersList = async () => {
    setBannersLoading(true);
    try {
      const data = await getPromoBanners();
      setBannersList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setBannersLoading(false);
    }
  };

  useEffect(() => {
    loadBlogsList();
    loadBannersList();
  }, []);

  // Set default district id on first load
  useEffect(() => {
    if (districts.length > 0 && !facilityDistrictId) {
      setFacilityDistrictId(districts[0].id);
    }
  }, [districts, facilityDistrictId]);

  const handleDistrictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!districtNameBn.trim() || !districtNameEn.trim()) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    const orderNum = parseInt(districtOrder) || 0;
    try {
      if (editingDistrict) {
        await onUpdateDistrict({
          id: editingDistrict.id,
          nameBn: districtNameBn.trim(),
          nameEn: districtNameEn.trim(),
          displayOrder: orderNum,
          isActive: districtActive,
        });
        setSuccessMsg('জেলা সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await onAddDistrict({
          nameBn: districtNameBn.trim(),
          nameEn: districtNameEn.trim(),
          displayOrder: orderNum,
          isActive: districtActive,
        });
        setSuccessMsg('নতুন জেলা সফলভাবে তৈরি করা হয়েছে!');
      }
      setShowAddDistrictModal(false);
      setEditingDistrict(null);
      setDistrictNameBn('');
      setDistrictNameEn('');
      setDistrictOrder('0');
      setDistrictActive(true);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim() || !facilityAreaAddress.trim()) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    const activeDistrictId = facilityDistrictId || districts[0]?.id || 'rajshahi';
    try {
      if (editingFacility) {
        await onUpdateFacility({
          id: editingFacility.id,
          districtId: activeDistrictId,
          name: facilityName.trim(),
          areaAddress: facilityAreaAddress.trim(),
          contactPhone: facilityContactPhone.trim(),
          isVip: facilityIsVip,
          isActive: facilityIsActive,
        });
        setSuccessMsg('চেম্বার/ক্লিনিক সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await onAddFacility({
          districtId: activeDistrictId,
          name: facilityName.trim(),
          areaAddress: facilityAreaAddress.trim(),
          contactPhone: facilityContactPhone.trim(),
          isVip: facilityIsVip,
          isActive: facilityIsActive,
        });
        setSuccessMsg('নতুন চেম্বার/ক্লিনিক সফলভাবে যোগ করা হয়েছে!');
      }
      setShowAddFacilityModal(false);
      setEditingFacility(null);
      setFacilityName('');
      setFacilityAreaAddress('');
      setFacilityContactPhone('');
      setFacilityIsVip(false);
      setFacilityIsActive(true);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const handleDistrictDelete = async (id: string, name: string) => {
    const hasClinics = facilities.some((f) => f.districtId === id);
    const msg = hasClinics 
      ? `সাবধান! এই জেলার (${name}) অধীনে সক্রিয় চেম্বার/ক্লিনিক রয়েছে। জেলাটি ডিলিট করলে ঐ সকল চেম্বারের জেলা লিঙ্ক নষ্ট হবে। আপনি কি নিশ্চিতভাবে ডিলিট করতে চান?`
      : `আপনি কি নিশ্চিতভাবে এই জেলাটি (${name}) ডিলিট করতে চান?`;
    if (confirm(msg)) {
      try {
        await onDeleteDistrict(id);
        setSuccessMsg('জেলা সফলভাবে ডিলিট করা হয়েছে!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        alert(err.message || 'ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleFacilityDelete = async (id: string, name: string) => {
    const hasDoctors = doctors.some((d) => d.facility === name);
    const msg = hasDoctors 
      ? `সাবধান! এই ক্লিনিক/চেম্বারটির (${name}) অধীনে তালিকাভুক্ত ডাক্তার রয়েছে। এটি ডিলিট করলে ঐ ডাক্তারদের চেম্বারের নাম খালি দেখাবে। আপনি কি নিশ্চিতভাবে ডিলিট করতে চান?`
      : `আপনি কি নিশ্চিতভাবে এই ক্লিনিক/চেম্বারটি (${name}) ডিলিট করতে চান?`;
    if (confirm(msg)) {
      try {
        await onDeleteFacility(id);
        setSuccessMsg('চেম্বার/ক্লিনিক সফলভাবে ডিলিট করা হয়েছে!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        alert(err.message || 'ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleSpecialtySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialtyNameBn.trim() || !specialtyNameEn.trim()) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    try {
      if (editingSpecialty) {
        await onUpdateSpecialty({
          id: editingSpecialty.id,
          nameBn: specialtyNameBn.trim(),
          nameEn: specialtyNameEn.trim(),
          iconName: specialtyIconName,
          displayOrder: parseInt(specialtyOrder) || 0,
          isActive: specialtyActive,
        });
        setSuccessMsg('विशेषজ্ঞতা সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await onAddSpecialty({
          nameBn: specialtyNameBn.trim(),
          nameEn: specialtyNameEn.trim(),
          iconName: specialtyIconName,
          displayOrder: parseInt(specialtyOrder) || 0,
          isActive: specialtyActive,
        });
        setSuccessMsg('নতুন বিশেষজ্ঞতা সফলভাবে যোগ করা হয়েছে!');
      }
      setShowAddSpecialtyModal(false);
      setEditingSpecialty(null);
      setSpecialtyNameBn('');
      setSpecialtyNameEn('');
      setSpecialtyIconName('Heart');
      setSpecialtyOrder('0');
      setSpecialtyActive(true);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const handleSpecialtyDelete = async (id: string, name: string) => {
    const hasDoctors = doctors.some((d) => d.specialty === name);
    const msg = hasDoctors 
      ? `সাবধান! এই ক্যাটাগরি (${name}) এর অধীনে তালিকাভুক্ত ডাক্তার রয়েছে। এটি ডিলিট করলে ঐ ডাক্তারদের ক্যাটাগরি নাম খালি দেখাবে। আপনি কি নিশ্চিতভাবে ডিলিট করতে চান?`
      : `আপনি কি নিশ্চিতভাবে এই ক্যাটাগরি (${name}) ডিলিট করতে চান?`;
    if (confirm(msg)) {
      try {
        await onDeleteSpecialty(id);
        setSuccessMsg('ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } catch (err: any) {
        alert(err.message || 'ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    }
  };

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

  // Blog management actions
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim() || !blogSlug.trim()) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    try {
      if (editingBlog) {
        await updateBlog({
          ...editingBlog,
          title: blogTitle.trim(),
          slug: blogSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          excerpt: blogExcerpt.trim() || blogContent.trim().substring(0, 150),
          content: blogContent.trim(),
          coverImage: blogCoverImage.trim() || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000',
          category: blogCategory || 'স্বাস্থ্য সচেতনতা',
          author: blogAuthor.trim() || 'MyDocBD টিম',
          isPublished: blogIsPublished,
          views: editingBlog.views || 0,
          createdAt: editingBlog.createdAt
        });
        setToastMsg('ব্লগ সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addBlog({
          title: blogTitle.trim(),
          slug: blogSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          excerpt: blogExcerpt.trim() || blogContent.trim().substring(0, 150),
          content: blogContent.trim(),
          coverImage: blogCoverImage.trim() || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000',
          category: blogCategory || 'স্বাস্থ্য সচেতনতা',
          author: blogAuthor.trim() || 'MyDocBD টিম',
          isPublished: blogIsPublished
        });
        setToastMsg('নতুন ব্লগ সফলভাবে প্রকাশ করা হয়েছে!');
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      setBlogTitle('');
      setBlogSlug('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogCoverImage('');
      setBlogCategory('');
      setBlogAuthor('MyDocBD মেডিকেল টিম');
      setBlogIsPublished(true);
      await loadBlogsList();
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const handleBlogDelete = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে এই ব্লগটি ডিলিট করতে চান?\n"${title}"`)) {
      try {
        await deleteBlog(id);
        setToastMsg('ব্লগ ডিলিট করা হয়েছে!');
        await loadBlogsList();
      } catch (err) {
        alert('ডিলিট করতে ব্যর্থ হয়েছে।');
      }
    }
  };

  // Banner management actions
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন।');
      return;
    }
    try {
      if (editingBanner) {
        await updatePromoBanner({
          ...editingBanner,
          title: bannerTitle.trim(),
          imageUrl: bannerImageUrl.trim(),
          targetUrl: bannerTargetUrl.trim(),
          slot: bannerSlot,
          isActive: bannerIsActive
        });
        setToastMsg('ব্যানার সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addPromoBanner({
          title: bannerTitle.trim(),
          imageUrl: bannerImageUrl.trim(),
          targetUrl: bannerTargetUrl.trim(),
          slot: bannerSlot,
          isActive: bannerIsActive
        });
        setToastMsg('নতুন ব্যানার সফলভাবে তৈরি করা হয়েছে!');
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      setBannerTitle('');
      setBannerImageUrl('');
      setBannerTargetUrl('');
      setBannerSlot('hero');
      setBannerIsActive(true);
      await loadBannersList();
    } catch (err: any) {
      alert(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  const handleBannerDelete = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে এই ব্যানারটি ডিলিট করতে চান?\n"${title}"`)) {
      try {
        await deletePromoBanner(id);
        setToastMsg('ব্যানার ডিলিট করা হয়েছে!');
        await loadBannersList();
      } catch (err) {
        alert('ডিলিট করতে ব্যর্থ হয়েছে।');
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
  const [docChamberRoomNo, setDocChamberRoomNo] = useState('৩০২');
  const [docChamberFloor, setDocChamberFloor] = useState('৩য় তলা');
  const [docChamberBuildingStand, setDocChamberBuildingStand] = useState('মেইন ভবন, লিফট-১');
  const [docPsPhone, setDocPsPhone] = useState('');
  const [docVisitingDays, setDocVisitingDays] = useState<string[]>(['শনিবার', 'রবিবার', 'সোমবার']);
  const [docVisitingTime, setDocVisitingTime] = useState('বিকাল ৫:০০ - রাত ৮:৩০');
  const [docFeesNew, setDocFeesNew] = useState('৮০০');
  const [docFeesOld, setDocFeesOld] = useState('৫০০');
  const [docPriority, setDocPriority] = useState('১০');
  const [docRating, setDocRating] = useState('5.0');
  const [docReviewCount, setDocReviewCount] = useState('0');
  const [docPhotoUrl, setDocPhotoUrl] = useState('');
  const [docAbout, setDocAbout] = useState('');

  const DAYS_LIST = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

  // Load reviews when tab changes to reviews
  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await getReviews();
      setReviewsList(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (subTab === 'reviews') {
      loadReviews();
    }
  }, [subTab]);

  const handleApproveReview = async (id: string) => {
    try {
      await approveReview(id);
      await loadReviews();
    } catch (err: any) {
      alert(err.message || 'রিভিউ অনুমোদন করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?')) {
      try {
        await deleteReview(id);
        await loadReviews();
      } catch (err: any) {
        alert(err.message || 'রিভিউ মুছতে সমস্যা হয়েছে।');
      }
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevDoctorId || !newRevPatientName.trim() || !newRevText.trim()) {
      alert('সকল ফিল্ড পূরণ করুন।');
      return;
    }
    setNewRevSubmitting(true);
    try {
      const selectedDoc = doctors.find(d => d.id === newRevDoctorId);
      await addReview({
        doctorId: newRevDoctorId,
        doctorName: selectedDoc?.name || '',
        patientName: newRevPatientName.trim(),
        rating: newRevRating,
        reviewText: newRevText.trim(),
        isApproved: true
      });
      setShowAddReviewModal(false);
      setNewRevPatientName('');
      setNewRevText('');
      setNewRevRating(5);
      await loadReviews();
      alert('রিভিউ সফলভাবে যোগ করা হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'রিভিউ যোগ করতে সমস্যা হয়েছে।');
    } finally {
      setNewRevSubmitting(false);
    }
  };

  const handleOpenConfirmModal = (app: Appointment) => {
    setConfirmingApp(app);
    // Find doctor info to prepopulate chamber details if not already set
    const matchedDoc = doctors.find(d => 
      d.id === app.doctorId || 
      d.name === app.doctorName || 
      (d.id.includes('::') && app.doctorId?.includes('::') && d.id.split('::')[0] === app.doctorId.split('::')[0]) ||
      (d.id.includes('::') && d.id.split('::')[0] === app.doctorId) ||
      (app.doctorId?.includes('::') && d.id === app.doctorId.split('::')[0])
    );
    const existingCount = appointments.filter(a => 
      (a.doctorId === app.doctorId || 
       (a.doctorId?.includes('::') && app.doctorId?.includes('::') && a.doctorId.split('::')[0] === app.doctorId.split('::')[0])) && 
      a.preferredDate === app.preferredDate && 
      a.status === 'Confirmed'
    ).length;
    const nextSerial = String(existingCount + 1).padStart(2, '0');

    setConfSerialNo(app.serialNo !== undefined && app.serialNo !== '' ? app.serialNo : nextSerial);
    setConfRoomNo(app.assignedRoomNo !== undefined && app.assignedRoomNo !== '' ? app.assignedRoomNo : (matchedDoc?.chamberRoomNo || ''));
    setConfFloor(app.assignedFloor !== undefined && app.assignedFloor !== '' ? app.assignedFloor : (matchedDoc?.chamberFloor || ''));
    setConfBuilding(app.assignedBuilding !== undefined && app.assignedBuilding !== '' ? app.assignedBuilding : (matchedDoc?.chamberBuildingStand || ''));
    setConfVisitingTime(app.confirmedVisitingTime !== undefined && app.confirmedVisitingTime !== '' ? app.confirmedVisitingTime : (matchedDoc?.visitingTime || ''));
    setConfAdminNotes(app.adminNotes || '');
  };

  const handleConfirmAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingApp) return;
    setConfSubmitting(true);
    try {
      const confirmData = {
        bookingCode: confirmingApp.id,
        serialNo: confSerialNo.trim(),
        assignedRoomNo: confRoomNo.trim(),
        assignedFloor: confFloor.trim(),
        assignedBuilding: confBuilding.trim(),
        confirmedVisitingTime: confVisitingTime.trim(),
        adminNotes: confAdminNotes.trim() || undefined
      };

      await confirmAppointment(confirmData);
      onUpdateAppointmentStatus(confirmingApp.id, 'Confirmed', confirmData);
      setConfirmingApp(null);
      setSuccessMsg('সিরিয়াল সফলভাবে অনুমোদিত হয়েছে ও রুম নম্বর বরাদ্দ করা হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সিরিয়াল অনুমোদন করতে সমস্যা হয়েছে।');
    } finally {
      setConfSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ছবিটি অনেক বড় (সর্বোচ্চ ২ এমবি প্রযোজ্য)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setDocPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayCheckbox = (day: string) => {
    setDocVisitingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleEditClick = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocName(doc.name);
    setDocBmdc(doc.bmdc || '');
    setDocSpecialty(doc.specialty);
    setDocFacility(doc.facility);
    setDocDegrees(doc.degrees);
    setDocDesignation(doc.designation);
    setDocWorkplace(doc.workplace);
    setDocChamberAddress(doc.chamberAddress);
    setDocChamberRoomNo(doc.chamberRoomNo || '৩০২');
    setDocChamberFloor(doc.chamberFloor || '৩য় তলা');
    setDocChamberBuildingStand(doc.chamberBuildingStand || 'মেইন ভবন');
    setDocPsPhone(doc.psPhone || '');
    setDocVisitingDays(doc.visitingDays);
    setDocVisitingTime(doc.visitingTime);
    setDocFeesNew(doc.feesNew.toString());
    setDocFeesOld(doc.feesOld.toString());
    setDocPriority(doc.priorityIndex.toString());
    setDocRating((doc.rating || 5.0).toString());
    setDocReviewCount((doc.reviewCount || 0).toString());
    setDocPhotoUrl(doc.photoUrl || '');
    setDocAbout(doc.about || '');
    
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
    setDocChamberRoomNo('৩০২');
    setDocChamberFloor('৩য় তলা');
    setDocChamberBuildingStand('মেইন ভবন, লিফট-১');
    setDocPsPhone('');
    setDocVisitingDays(['শনিবার', 'রবিবার', 'সোমবার']);
    setDocVisitingTime('বিকাল ৫:০০ - রাত ৮:৩০');
    setDocFeesNew('৮০০');
    setDocFeesOld('৫০০');
    setDocPriority('১০');
    setDocRating('5.0');
    setDocReviewCount('0');
    setDocPhotoUrl('');
    setDocAbout('');
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
    if (!docDegrees.trim()) return setError('শিক্ষাগত যোগ্যতা দেওয়া আবশ্যক।');
    if (!docDesignation.trim()) return setError('পদবী দেওয়া আবশ্যক।');
    if (!docWorkplace.trim()) return setError('কর্মস্থল দেওয়া আবশ্যক।');
    if (!docChamberAddress.trim()) return setError('চেম্বার কক্ষ ও ঠিকানা দেওয়া আবশ্যক।');
    if (docVisitingDays.length === 0) return setError('কমপক্ষে একটি রোগী দেখার দিন সিলেক্ট করুন।');

    const feesNewNum = cleanNumberInput(docFeesNew);
    const feesOldNum = cleanNumberInput(docFeesOld);
    const priorityNum = cleanNumberInput(docPriority);

    if (feesNewNum <= 0) return setError('নতুন রোগীর ফি সঠিকভাবে প্রদান করুন।');

    const matchedSpecialty = specialties.find(s => s.nameBn === docSpecialty || s.nameEn === docSpecialty);
    const matchedFacility = facilities.find(f => f.name === docFacility);

    const specialtyId = matchedSpecialty?.id || specialties[0]?.id || '';
    const facilityId = matchedFacility?.id || facilities[0]?.id || '';

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
      chamberRoomNo: docChamberRoomNo.trim() || 'নির্ধারিত নয়',
      chamberFloor: docChamberFloor.trim() || 'নিচতলা',
      chamberBuildingStand: docChamberBuildingStand.trim() || 'মেইন ভবন',
      psPhone: docPsPhone.trim() || undefined,
      visitingDays: docVisitingDays,
      visitingTime: docVisitingTime,
      feesNew: feesNewNum,
      feesOld: feesOldNum,
      priorityIndex: priorityNum || 10,
      rating: parseFloat(docRating) || 5.0,
      reviewCount: parseInt(docReviewCount) || 0,
      photoUrl: docPhotoUrl,
      about: docAbout,
      specialtyId: specialtyId,
      facilityId: facilityId,
      chamberId: editingDoctor?.chamberId
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
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 border border-slate-200">
                ● MyDocBD কন্ট্রোল প্যানেল
              </span>
              {currentAdmin && (
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-extrabold border ${
                  currentAdmin.role === 'super_admin' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {currentAdmin.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-800 md:text-2xl">
              MyDocBD কন্ট্রোল প্যানেল
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
          <span>সিরিয়াল রিকোয়েস্ট বুকিং (পেন্ডিং: {appointments.filter(a => a.status === 'Pending').length} / মোট: {appointments.length})</span>
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
        <button
          onClick={() => setSubTab('reviews')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'reviews'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-reviews-btn"
        >
          <Star className="h-4 w-4 text-amber-500" />
          <span>রিভিউ ও রেটিং ({reviewsList.length})</span>
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
        <button
          onClick={() => setSubTab('districts')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'districts'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-districts-btn"
        >
          <MapPin className="h-4 w-4 text-[#0284C7]" />
          <span>জেলা সমূহ ({districts.length})</span>
        </button>
        <button
          onClick={() => setSubTab('facilities')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'facilities'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-facilities-btn"
        >
          <Building className="h-4 w-4 text-pink-600" />
          <span>চেম্বার ও ক্লিনিক ({facilities.length})</span>
        </button>
        <button
          onClick={() => setSubTab('specialties')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'specialties'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-specialties-btn"
        >
          <Award className="h-4 w-4 text-purple-600" />
          <span>স্পেশালিটি ও ক্যাটাগরি ({specialties.length})</span>
        </button>
        <button
          onClick={() => setSubTab('blogs')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'blogs'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-blogs-btn"
        >
          <BookOpen className="h-4 w-4 text-sky-600" />
          <span>স্বাস্থ্য ব্লগ ({blogsList.length})</span>
        </button>
        <button
          onClick={() => setSubTab('banners')}
          className={`flex items-center gap-2 border-b-2 px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
            subTab === 'banners'
              ? 'border-[#0284C7] text-[#0284C7]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="admin-subtab-banners-btn"
        >
          <ImageIcon className="h-4 w-4 text-rose-500" />
          <span>প্রোমো ব্যানার ও বিজ্ঞাপন ({bannersList.length})</span>
        </button>
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
                              onClick={() => handleOpenConfirmModal(app)}
                              className={`flex items-center gap-1 rounded-md px-2 py-1 border transition text-xs font-bold ${
                                app.status === 'Confirmed'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                                  : 'border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm'
                              }`}
                              title={app.status === 'Confirmed' ? "সিরিয়াল ও রুম পরিবর্তন করুন" : "সিরিয়াল অনুমোদন ও রুম বরাদ্দ করুন"}
                              id={`admin-confirm-${app.id}`}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>{app.status === 'Confirmed' ? `রুম: ${app.assignedRoomNo || 'নির্ধারিত'} (${app.serialNo || '০১'})` : 'অনুমোদন ও রুম দিন'}</span>
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
                    <label className="text-[11px] font-bold text-slate-500">BM&DC রেজিঃ (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="যেমন: A-54321"
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

                {/* Chamber Room, Floor, Building */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    চেম্বার অবস্থান ও রুম নির্দেশিকা (রোগীদের সিরিয়ালে দেখানোর জন্য)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">রুম নম্বর *</label>
                      <input
                        type="text"
                        placeholder="যেমন: ৩০২"
                        value={docChamberRoomNo}
                        onChange={(e) => setDocChamberRoomNo(e.target.value)}
                        className="w-full rounded border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">ফ্লোর / কত তলা *</label>
                      <input
                        type="text"
                        placeholder="যেমন: ৩য় তলা"
                        value={docChamberFloor}
                        onChange={(e) => setDocChamberFloor(e.target.value)}
                        className="w-full rounded border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">বিল্ডিং / স্ট্যান্ড</label>
                      <input
                        type="text"
                        placeholder="যেমন: মেইন ভবন"
                        value={docChamberBuildingStand}
                        onChange={(e) => setDocChamberBuildingStand(e.target.value)}
                        className="w-full rounded border border-slate-200 py-1.5 px-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>
                  </div>
                </div>

                {/* Doctor PS Phone - ADMIN ONLY (SENSITIVE) */}
                <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-amber-700" />
                      <span>ডাক্তারের পিএস / সহকারীর মোবাইল নম্বর</span>
                    </label>
                    <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.5 text-[9px] font-black text-amber-900">
                      <Lock className="h-2.5 w-2.5" />
                      <span>গোপন (শুধুমাত্র অ্যাডমিন)</span>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="যেমন: 01711223344"
                    value={docPsPhone}
                    onChange={(e) => setDocPsPhone(e.target.value)}
                    className="w-full rounded-md border border-amber-300 py-1.5 px-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-amber-500"
                    id="admin-doc-ps-phone"
                  />
                  <p className="text-[9px] text-amber-800 font-medium">
                    * এই নম্বরটি সাধারণ রোগীদের দেখানো হবে না। এটি শুধুমাত্র অ্যাডমিনদের জরুরি প্রয়োজনে ব্যবহারের জন্য সংরক্ষিত থাকবে।
                  </p>
                </div>

                {/* Chamber Room / Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">চেম্বার বিস্তারিত ঠিকানা *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী"
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

                <div className="grid grid-cols-2 gap-3">
                  {/* Rating Selector */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">কাস্টম রেটিং</label>
                    <select
                      value={docRating}
                      onChange={(e) => setDocRating(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="5.0">5.0 ★ (Default)</option>
                      <option value="4.9">4.9 ★</option>
                      <option value="4.8">4.8 ★</option>
                      <option value="4.7">4.7 ★</option>
                      <option value="4.6">4.6 ★</option>
                      <option value="4.5">4.5 ★</option>
                      <option value="4.4">4.4 ★</option>
                      <option value="4.3">4.3 ★</option>
                      <option value="4.2">4.2 ★</option>
                      <option value="4.0">4.0 ★</option>
                    </select>
                  </div>

                  {/* Review Count Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500">রিভিউ সংখ্যা</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="যেমন: 45"
                      value={docReviewCount}
                      onChange={(e) => setDocReviewCount(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>

                 {/* Biography / About Doctor */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500">ডাক্তারের সংক্ষিপ্ত পরিচিতি বা জীবনবৃত্তান্ত (Biography/About)</label>
                  <textarea
                    rows={4}
                    placeholder="যেমন: ডা. সাজ্জাদ হোসেন একজন প্রখ্যাত ইন্টারভেনশনাল কার্ডিওলজিস্ট। এনজিওগ্রাম, হার্ট ফেইলিউর ব্যবস্থাপনা, বুক ধড়ফড় এবং উচ্চ রক্তচাপের সঠিক ব্যবস্থাপনায় তিনি সুপরিচিত ও নির্ভরযোগ্য।"
                    value={docAbout}
                    onChange={(e) => setDocAbout(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7] leading-relaxed"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">* এই তথ্যটি চিকিৎসকের বিস্তারিত প্রোফাইল মোডালে প্রদর্শিত হবে।</p>
                </div>

                {/* Photo URL & Upload Section */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <label className="text-[11px] font-bold text-slate-700">ডাক্তারের প্রোফাইল ছবি (Profile Picture)</label>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {/* Preview circle */}
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-slate-800 font-extrabold text-lg border border-slate-200 shadow-xs overflow-hidden">
                      {docPhotoUrl ? (
                        <img
                          src={docPhotoUrl}
                          alt="Doctor Preview"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // If load fails, hide image
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">নো ছবি</span>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {/* File upload option */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">১. কম্পিউটার বা মোবাইল থেকে ছবি সিলেক্ট করুন (Upload File)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="w-full text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer cursor-pointer"
                        />
                      </div>

                      {/* URL option */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 block mb-1">অথবা, ২. অনলাইন লিংক (Photo URL) ব্যবহার করুন</span>
                        <input
                          type="text"
                          placeholder="https://example.com/photo.jpg"
                          value={docPhotoUrl}
                          onChange={(e) => setDocPhotoUrl(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>
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
                      <th className="p-3 text-[11px]">চেম্বার অবস্থান ও রুম</th>
                      <th className="p-3 text-[11px]">পিএস এর মোবাইল (গোপন)</th>
                      <th className="p-3 text-[11px]">বিশেষজ্ঞতা</th>
                      <th className="p-3 text-[11px]">ভিজিট ফি</th>
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
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-50/50 border border-amber-100/30 rounded px-1.5 py-0.5 w-max">
                              <span>★ {doc.rating || '5.0'}</span>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-500">{doc.reviewCount || 0} রিভিউ</span>
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  const newStatus = doc.isActive === false ? true : false;
                                  try {
                                    await updateDoctorStatus(doc.id, newStatus);
                                    setToastMsg('ডাক্তারের স্ট্যাটাস পরিবর্তন হয়েছে');
                                    onUpdateDoctor({
                                      ...doc,
                                      isActive: newStatus
                                    });
                                  } catch (err) {
                                    console.error('Failed to update doctor status:', err);
                                  }
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  doc.isActive !== false ? 'bg-[#16A34A]' : 'bg-slate-300'
                                }`}
                                title={doc.isActive !== false ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                    doc.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              {doc.isActive !== false ? (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-[#16A34A] border border-emerald-200">
                                  সক্রিয় (Active)
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-500 border border-slate-200">
                                  নিষ্ক্রিয় (Inactive)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Chamber Location */}
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{doc.facility}</p>
                          <p className="text-[11px] text-[#0284C7] font-bold mt-0.5">
                            রুম: {doc.chamberRoomNo || 'নির্ধারিত নয়'} • {doc.chamberFloor || 'নিচতলা'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">{doc.chamberBuildingStand || 'মেইন ভবন'}</p>
                        </td>

                        {/* Private PS Phone */}
                        <td className="p-3">
                          {doc.psPhone ? (
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60 rounded px-2 py-1 w-max">
                              <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                              <span>{doc.psPhone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold text-[10px]">দেওয়া হয়নি</span>
                          )}
                        </td>

                        {/* Specialty */}
                        <td className="p-3">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/50">
                            {doc.specialty}
                          </span>
                        </td>

                        {/* Fee */}
                        <td className="p-3 font-bold text-[#0D9488]">৳ {doc.feesNew}</td>

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

      {/* SUBTAB: Reviews & Ratings Management */}
      {subTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>রোগীদের রিভিউ ও রেটিং ব্যবস্থাপনা</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                রোগীদের দেওয়া রিভিউ অনুমোদন করুন অথবা চিকিৎসকের প্রোফাইলে নতুন রিভিউ সংযোজন ও নিয়ন্ত্রণ করুন।
              </p>
            </div>
            <button
              onClick={() => {
                setNewRevDoctorId(doctors[0]?.id || '');
                setShowAddReviewModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm self-start sm:self-auto"
              id="admin-add-review-btn"
            >
              <PlusCircle className="h-4 w-4" />
              <span>নতুন রিভিউ লিখুন</span>
            </button>
          </div>

          {reviewsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-bold gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#0284C7]" />
              <span>রিভিউ তালিকা লোড হচ্ছে...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                    <th className="p-3 text-[11px]">ডাক্তার</th>
                    <th className="p-3 text-[11px]">রোগীর নাম</th>
                    <th className="p-3 text-[11px]">রেটিং ও রিভিউ মন্তব্য</th>
                    <th className="p-3 text-[11px]">তারিখ</th>
                    <th className="p-3 text-[11px]">স্ট্যাটাস</th>
                    <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 font-semibold text-[11px]">
                  {reviewsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        কোন রিভিউ পাওয়া যায়নি। উপরের বাটনে ক্লিক করে নতুন রিভিউ যুক্ত করতে পারেন।
                      </td>
                    </tr>
                  ) : (
                    reviewsList.map((rev) => {
                      const matchedDoc = doctors.find((d) => d.id === rev.doctorId);
                      return (
                        <tr key={rev.id} className="border-b border-slate-150 hover:bg-slate-50/50">
                          {/* Doctor */}
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{matchedDoc?.name || rev.doctorId}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{matchedDoc?.specialty || ''}</p>
                          </td>

                          {/* Patient */}
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{rev.patientName}</p>
                          </td>

                          {/* Rating & Review */}
                          <td className="p-3 max-w-md">
                            <div className="flex items-center gap-1 mb-1 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] font-black text-slate-700 ml-1">
                                {rev.rating}.0
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-xs bg-slate-50 p-2 rounded border border-slate-100">
                              "{rev.reviewText}"
                            </p>
                          </td>

                          {/* Date */}
                          <td className="p-3 text-[10px] text-slate-400 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            {rev.isApproved ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50">
                                <Check className="h-3 w-3" />
                                <span>অনুমোদিত</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/50">
                                <span>অপেক্ষমান (Pending)</span>
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!rev.isApproved && (
                                <button
                                  onClick={() => handleApproveReview(rev.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                  title="রিভিউ অনুমোদন করুন"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="রিভিউ মুছে ফেলুন"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
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

      {/* SUBTAB 4: District Management */}
      {subTab === 'districts' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">জেলা তালিকা ও প্রদর্শন ক্রম নির্ধারণ</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">সক্রিয় জেলা সমূহ ডিরেক্টরি ফিল্টারে দৃশ্যমান হবে</p>
            </div>
            <button
              onClick={() => {
                setEditingDistrict(null);
                setDistrictNameBn('');
                setDistrictNameEn('');
                setDistrictOrder('0');
                setDistrictActive(true);
                setShowAddDistrictModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন জেলা যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">জেলা আইডি</th>
                  <th className="p-3 text-[11px]">নাম (বাংলা)</th>
                  <th className="p-3 text-[11px]">নাম (English)</th>
                  <th className="p-3 text-[11px]">প্রদর্শন ক্রম</th>
                  <th className="p-3 text-[11px]">স্ট্যাটাস (Status)</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {districts.map((dist) => (
                  <tr key={dist.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-[10px] text-slate-400">{dist.id}</td>
                    <td className="p-3 text-[#0284C7] text-xs">{dist.nameBn}</td>
                    <td className="p-3 text-xs">{dist.nameEn}</td>
                    <td className="p-3 font-mono text-xs">{dist.displayOrder}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${
                        dist.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {dist.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingDistrict(dist);
                            setDistrictNameBn(dist.nameBn);
                            setDistrictNameEn(dist.nameEn);
                            setDistrictOrder(dist.displayOrder.toString());
                            setDistrictActive(dist.isActive);
                            setShowAddDistrictModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          onClick={() => handleDistrictDelete(dist.id, dist.nameBn)}
                          className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 text-[10px] text-red-600 hover:bg-red-100 py-1 px-2 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 5: Facilities Management */}
      {subTab === 'facilities' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">চেম্বার, ক্লিনিক ও ডায়াগনস্টিক সেন্টার সমূহ</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">ভিআইপি (VIP) চিকিৎসাকেন্দ্র সমূহে বিশেষ স্টার ব্যাজ প্রদর্শিত হয়</p>
            </div>
            <button
              onClick={() => {
                setEditingFacility(null);
                setFacilityName('');
                setFacilityAreaAddress('');
                setFacilityDistrictId(districts[0]?.id || 'rajshahi');
                setFacilityIsVip(false);
                setFacilityIsActive(true);
                setShowAddFacilityModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন চেম্বার/ক্লিনিক যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">নাম (Facility Name)</th>
                  <th className="p-3 text-[11px]">জেলা (District)</th>
                  <th className="p-3 text-[11px]">অবস্থান / চেম্বার ঠিকানা</th>
                  <th className="p-3 text-[11px]">ভিআইপি (VIP)?</th>
                  <th className="p-3 text-[11px]">স্ট্যাটাস</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-900 text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{fac.name}</span>
                      </span>
                      {fac.contactPhone && (
                        <p className="text-[10px] text-slate-500 font-semibold mt-1 ml-5">ফোন: {fac.contactPhone}</p>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-[#0284C7] border border-sky-100">
                        {fac.districtName || 'রাজশাহী'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs font-semibold">{fac.areaAddress}</td>
                    <td className="p-3">
                      {fac.isVip ? (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[9px] text-amber-700 border border-amber-200">
                          ★ VIP Clinic
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-normal">সাধারণ</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${
                        fac.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {fac.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFacility(fac);
                            setFacilityName(fac.name);
                            setFacilityAreaAddress(fac.areaAddress);
                            setFacilityDistrictId(fac.districtId);
                            setFacilityContactPhone(fac.contactPhone || '');
                            setFacilityIsVip(fac.isVip);
                            setFacilityIsActive(fac.isActive);
                            setShowAddFacilityModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          onClick={() => handleFacilityDelete(fac.id, fac.name)}
                          className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 text-[10px] text-red-600 hover:bg-red-100 py-1 px-2 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'specialties' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">বিশেষজ্ঞতা ও ক্যাটাগরি সমূহ</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">ডাক্তার তালিকাভুক্তির জন্য ক্যাটাগরি ও আইকন কাস্টমাইজেশন</p>
            </div>
            <button
              onClick={() => {
                setEditingSpecialty(null);
                setSpecialtyNameBn('');
                setSpecialtyNameEn('');
                setSpecialtyIconName('Heart');
                setSpecialtyOrder('0');
                setSpecialtyActive(true);
                setShowAddSpecialtyModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন ক্যাটাগরি যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">ক্যাটাগরি (বাংলা)</th>
                  <th className="p-3 text-[11px]">ক্যাটাগরি (ইংরেজি)</th>
                  <th className="p-3 text-[11px]">আইকন কোড (Icon)</th>
                  <th className="p-3 text-[11px]">প্রদর্শন ক্রম</th>
                  <th className="p-3 text-[11px]">স্ট্যাটাস</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {specialties.map((spec) => (
                  <tr key={spec.id} className="hover:bg-slate-50/50">
                    <td className="p-3 text-slate-900 text-xs">{spec.nameBn}</td>
                    <td className="p-3 text-slate-500 text-xs">{spec.nameEn}</td>
                    <td className="p-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded bg-purple-50 px-2 py-0.5 text-purple-700 border border-purple-100">
                        {spec.iconName || 'Heart'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs">{spec.displayOrder || 0}</td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${
                        spec.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {spec.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSpecialty(spec);
                            setSpecialtyNameBn(spec.nameBn);
                            setSpecialtyNameEn(spec.nameEn);
                            setSpecialtyIconName(spec.iconName || 'Heart');
                            setSpecialtyOrder((spec.displayOrder || 0).toString());
                            setSpecialtyActive(spec.isActive);
                            setShowAddSpecialtyModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>সম্পাদনা</span>
                        </button>
                        <button
                          onClick={() => handleSpecialtyDelete(spec.id, spec.nameBn)}
                          className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 text-[10px] text-red-600 hover:bg-red-100 py-1 px-2 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'blogs' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">স্বাস্থ্য ব্লগ ও সচেতনতামূলক আর্টিকেল সমূহ</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">ভিজিটরদের সচেতনতা বাড়াতে ছবিসহ ব্লগ পোস্ট এবং টিপস প্রকাশ করুন</p>
            </div>
            <button
              onClick={() => {
                setEditingBlog(null);
                setBlogTitle('');
                setBlogSlug('');
                setBlogExcerpt('');
                setBlogContent('');
                setBlogCoverImage('');
                setBlogCategory('স্বাস্থ্য সচেতনতা');
                setBlogAuthor('MyDocBD মেডিকেল টিম');
                setBlogIsPublished(true);
                setShowBlogModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন ব্লগ আর্টিকেল লিখুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">ব্লগ কভার ও শিরোনাম</th>
                  <th className="p-3 text-[11px]">ক্যাটাগরি</th>
                  <th className="p-3 text-[11px]">লেখক</th>
                  <th className="p-3 text-[11px]">পাঠক সংখ্যা</th>
                  <th className="p-3 text-[11px]">অবস্থা (Status)</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {blogsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      কোন ব্লগ পাওয়া যায়নি। নতুন একটি ব্লগ আর্টিকেল তৈরি করুন।
                    </td>
                  </tr>
                ) : (
                  blogsList.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.coverImage || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=150'}
                            alt={blog.title}
                            className="h-10 w-16 object-cover rounded border border-slate-100 bg-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 line-clamp-1 block">{blog.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 font-mono">slug: {blog.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700 border border-emerald-100">
                          {blog.category || 'স্বাস্থ্য সচেতনতা'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs font-semibold">{blog.author}</td>
                      <td className="p-3 text-slate-700 text-xs font-mono">{blog.views || 0} বার পঠিত</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${
                          blog.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {blog.isPublished ? 'প্রকাশিত (Published)' : 'খসড়া (Draft)'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBlog(blog);
                              setBlogTitle(blog.title);
                              setBlogSlug(blog.slug);
                              setBlogExcerpt(blog.excerpt || '');
                              setBlogContent(blog.content);
                              setBlogCoverImage(blog.coverImage || '');
                              setBlogCategory(blog.category || 'স্বাস্থ্য সচেতনতা');
                              setBlogAuthor(blog.author || 'MyDocBD মেডিকেল টিম');
                              setBlogIsPublished(blog.isPublished);
                              setShowBlogModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>সম্পাদনা</span>
                          </button>
                          <button
                            onClick={() => handleBlogDelete(blog.id, blog.title)}
                            className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 text-[10px] text-red-600 hover:bg-red-100 py-1 px-2 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>মুছুন</span>
                          </button>
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

      {subTab === 'banners' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">প্রোমো ব্যানার ও বিজ্ঞাপন প্যানেল</h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">বিভিন্ন স্লটে বিজ্ঞাপন এবং প্রোমো ব্যানার ব্যানার নিয়ন্ত্রণ করুন</p>
            </div>
            <button
              onClick={() => {
                setEditingBanner(null);
                setBannerTitle('');
                setBannerImageUrl('');
                setBannerTargetUrl('');
                setBannerSlot('hero');
                setBannerIsActive(true);
                setShowBannerModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>নতুন প্রোমো ব্যানার যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3 text-[11px]">ব্যানার ছবি ও শিরোনাম</th>
                  <th className="p-3 text-[11px]">স্লট / পজিশন</th>
                  <th className="p-3 text-[11px]">টার্গেট লিংক (URL)</th>
                  <th className="p-3 text-[11px]">অবস্থা (Status)</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {bannersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                      কোন প্রোমো ব্যানার পাওয়া যায়নি। নতুন একটি ব্যানার তৈরি করুন।
                    </td>
                  </tr>
                ) : (
                  bannersList.map((banner) => (
                    <tr key={banner.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-10 w-24 object-cover rounded border border-slate-100 bg-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-extrabold text-slate-900">{banner.title}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700 border border-rose-100">
                          {banner.slot === 'hero' ? 'হিরো সেকশন (Top Hero)' : 
                           banner.slot === 'directory' ? 'ডাক্তার ডিরেক্টরি (Directory Top)' :
                           banner.slot === 'sidebar' ? 'সাইডবার স্লট (Sidebar Ad)' : 
                           'ফুটার স্লট (Footer Ad)'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs font-semibold truncate max-w-xs">{banner.targetUrl || 'কোন লিংক নেই'}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] ${
                          banner.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}>
                          {banner.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setBannerTitle(banner.title);
                              setBannerImageUrl(banner.imageUrl);
                              setBannerTargetUrl(banner.targetUrl || '');
                              setBannerSlot(banner.slot);
                              setBannerIsActive(banner.isActive);
                              setShowBannerModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>সম্পাদনা</span>
                          </button>
                          <button
                            onClick={() => handleBannerDelete(banner.id, banner.title)}
                            className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-100 text-[10px] text-red-600 hover:bg-red-100 py-1 px-2 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>মুছুন</span>
                          </button>
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

      {/* Add / Edit District Modal Overlay */}
      {showAddDistrictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingDistrict ? 'জেলা তথ্য সংশোধন' : 'নতুন জেলা সংযোজন'}
              </h3>
              <button
                onClick={() => {
                  setShowAddDistrictModal(false);
                  setEditingDistrict(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleDistrictSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 mb-1 font-bold"> can জেলার নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  value={districtNameBn}
                  onChange={(e) => setDistrictNameBn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: রাজশাহী"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">District Name (English)</label>
                <input
                  type="text"
                  required
                  value={districtNameEn}
                  onChange={(e) => setDistrictNameEn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: Rajshahi"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">প্রদর্শন ক্রম (Display Order)</label>
                <input
                  type="number"
                  required
                  value={districtOrder}
                  onChange={(e) => setDistrictOrder(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="district-active"
                  checked={districtActive}
                  onChange={(e) => setDistrictActive(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="district-active" className="text-slate-700 font-bold cursor-pointer">
                  সক্রিয় জেলা (Active District)?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDistrictModal(false);
                    setEditingDistrict(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-4 py-2 text-white font-bold transition cursor-pointer"
                >
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Clinic/Facility Modal Overlay */}
      {showAddFacilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingFacility ? 'ক্লিনিক/চেম্বার তথ্য সংশোধন' : 'নতুন ক্লিনিক/চেম্বার সংযোজন'}
              </h3>
              <button
                onClick={() => {
                  setShowAddFacilityModal(false);
                  setEditingFacility(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleFacilitySubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-500 mb-1 font-bold">সংশ্লিষ্ট জেলা সিলেক্ট করুন</label>
                <select
                  value={facilityDistrictId}
                  onChange={(e) => setFacilityDistrictId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white cursor-pointer"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameBn} ({d.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">ক্লিনিক/ডায়াগনস্টিক এর নাম</label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: মেডিপথ ডায়াগনস্টিক, রাজশাহী"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">বিস্তারিত অবস্থান / ঠিকানা</label>
                <input
                  type="text"
                  required
                  value={facilityAreaAddress}
                  onChange={(e) => setFacilityAreaAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: লক্ষ্মীপুর মোড়, রাজশাহী"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">যোগাযোগের মোবাইল নম্বর (Contact Phone)</label>
                <input
                  type="text"
                  value={facilityContactPhone}
                  onChange={(e) => setFacilityContactPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: 01712345678"
                />
              </div>

              <div className="flex items-center gap-4 py-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="fac-vip"
                    checked={facilityIsVip}
                    onChange={(e) => setFacilityIsVip(e.target.checked)}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="fac-vip" className="text-slate-700 font-bold cursor-pointer">
                    ভিআইপি (VIP Center)?
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="fac-active"
                    checked={facilityIsActive}
                    onChange={(e) => setFacilityIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                  <label htmlFor="fac-active" className="text-slate-700 font-bold cursor-pointer">
                    সক্রিয় (Active)?
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFacilityModal(false);
                    setEditingFacility(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-4 py-2 text-white font-bold transition cursor-pointer"
                >
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddSpecialtyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingSpecialty ? 'ক্যাটাগরি তথ্য সংশোধন' : 'নতুন ক্যাটাগরি সংযোজন'}
              </h3>
              <button
                onClick={() => {
                  setShowAddSpecialtyModal(false);
                  setEditingSpecialty(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSpecialtySubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">ক্যাটাগরি নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  value={specialtyNameBn}
                  onChange={(e) => setSpecialtyNameBn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: মেডিসিন"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={specialtyNameEn}
                  onChange={(e) => setSpecialtyNameEn(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: Medicine"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">আইকন কোড (যেমন: Heart, Brain, Eye)</label>
                <input
                  type="text"
                  required
                  value={specialtyIconName}
                  onChange={(e) => setSpecialtyIconName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="Heart"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">প্রদর্শন ক্রম (Display Order)</label>
                <input
                  type="number"
                  required
                  value={specialtyOrder}
                  onChange={(e) => setSpecialtyOrder(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="specialty-active"
                  checked={specialtyActive}
                  onChange={(e) => setSpecialtyActive(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="specialty-active" className="text-slate-700 font-bold cursor-pointer">
                  সক্রিয় ক্যাটাগরি (Active)?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSpecialtyModal(false);
                    setEditingSpecialty(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-4 py-2 text-white font-bold transition cursor-pointer"
                >
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Confirmation & Location Assignment Modal */}
      {confirmingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">সিরিয়াল অনুমোদন ও রুম নম্বর বরাদ্দ</h3>
                  <p className="text-[10px] text-slate-500 font-bold">বুকিং আইডি: {confirmingApp.id}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAppointmentSubmit} className="p-6 space-y-4 text-xs font-semibold">
              {/* Patient and Doctor Snapshot */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400">রোগীর নাম</span>
                  <span className="font-bold text-slate-800 text-xs">{confirmingApp.patientName}</span>
                  <span className="block text-[10px] text-slate-500">{confirmingApp.patientMobile}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400">ডাক্তার ও তারিখ</span>
                  <span className="font-bold text-slate-800 text-xs">{confirmingApp.doctorName}</span>
                  <span className="block text-[10px] text-slate-500">{confirmingApp.preferredDate}</span>
                </div>
              </div>

              {/* Serial and Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#0284C7] mb-1 font-bold">নির্ধারিত সিরিয়াল নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={confSerialNo}
                    onChange={(e) => setConfSerialNo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                    placeholder="যেমন: ০১"
                  />
                </div>
                <div>
                  <label className="block text-[#0284C7] mb-1 font-bold">রুম নম্বর (Room No) *</label>
                  <input
                    type="text"
                    required
                    value={confRoomNo}
                    onChange={(e) => setConfRoomNo(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                    placeholder="যেমন: ৩১০"
                  />
                </div>
              </div>

              {/* Floor and Building/Stand */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">ফ্লোর / কত তলা (Floor) *</label>
                  <input
                    type="text"
                    required
                    value={confFloor}
                    onChange={(e) => setConfFloor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: ৩য় তলা"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold">বিল্ডিং / স্ট্যান্ড / লিফট</label>
                  <input
                    type="text"
                    value={confBuilding}
                    onChange={(e) => setConfBuilding(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    placeholder="যেমন: মেইন ভবন, লিফট-১"
                  />
                </div>
              </div>

              {/* Visiting Time */}
              <div>
                <label className="block text-slate-600 mb-1 font-bold">রিপোর্টিং / উপস্থিতির সময়সূচী</label>
                <input
                  type="text"
                  required
                  value={confVisitingTime}
                  onChange={(e) => setConfVisitingTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="যেমন: বিকাল ৫:৩০ মিনিট"
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-slate-600 mb-1 font-bold">রোগীর জন্য বিশেষ নির্দেশিকা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={confAdminNotes}
                  onChange={(e) => setConfAdminNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: পূর্বের সকল প্রেসক্রিপশন ও রিপোর্ট সাথে রাখবেন।"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setConfirmingApp(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={confSubmitting}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-white font-bold transition cursor-pointer shadow flex items-center gap-1.5"
                >
                  {confSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[3]" />}
                  <span>কনফার্ম ও সিরিয়াল প্রদান</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Review Modal */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">ডাক্তারের জন্য নতুন রিভিউ লিখুন</h3>
              </div>
              <button
                onClick={() => setShowAddReviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">ডাক্তার নির্বাচন করুন *</label>
                <select
                  value={newRevDoctorId}
                  onChange={(e) => setNewRevDoctorId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] cursor-pointer"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">রোগী / রিভিউকারীর নাম *</label>
                <input
                  type="text"
                  required
                  value={newRevPatientName}
                  onChange={(e) => setNewRevPatientName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="যেমন: তানভীর আহমেদ"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">রেটিং (স্টার) *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRevRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newRevRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-slate-700">{newRevRating}.0 স্টার</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">রোগীর রিভিউ ও মন্তব্য *</label>
                <textarea
                  rows={3}
                  required
                  value={newRevText}
                  onChange={(e) => setNewRevText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0284C7]"
                  placeholder="ডাক্তারের ব্যবহার, চিকিৎসা ও পরামর্শ সম্পর্কে মন্তব্য লিখুন..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={newRevSubmitting}
                  className="rounded-lg bg-amber-500 hover:bg-amber-600 px-5 py-2 text-white font-bold transition cursor-pointer shadow flex items-center gap-1.5"
                >
                  {newRevSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4 fill-white" />}
                  <span>রিভিউ পোস্ট করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingBlog ? 'ব্লগ সংশোধন ও সম্পাদনা' : 'নতুন ব্লগ রাইটার প্যানেল'}
              </h3>
              <button
                onClick={() => {
                  setShowBlogModal(false);
                  setEditingBlog(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="p-6 space-y-4 text-xs font-semibold overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#0284C7] mb-1 font-bold">আর্টিকেলের শিরোনাম (Title) *</label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => {
                      setBlogTitle(e.target.value);
                      if (!editingBlog) {
                        setBlogSlug(e.target.value.toLowerCase()
                          .replace(/[\s_]+/g, '-')
                          .replace(/[^\w\u0980-\u09ff-]/g, '')
                        );
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                    placeholder="যেমন: ডেঙ্গু জ্বরের লক্ষণ ও চিকিৎসা"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-bold">ইউআরএল কাস্টম স্ল্যাগ (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                    placeholder="যেমন: dengue-fever-symptoms"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1 font-bold">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                    placeholder="যেমন: স্বাস্থ্য টিপস"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-bold">লেখক (Author)</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                    placeholder="যেমন: MyDocBD মেডিকেল টিম"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-bold">কভার ছবির লিংক (Image URL)</label>
                  <input
                    type="text"
                    value={blogCoverImage}
                    onChange={(e) => setBlogCoverImage(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                    placeholder="Unsplash ছবির লিঙ্ক"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">সংক্ষিপ্ত সারমর্ম (Excerpt - অনূর্ধ্ব ১৫০ শব্দ)</label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="ব্লগটির সংক্ষিপ্ত বিবরণ দিন যা লিস্ট ভিউতে কার্ডে দেখাবে..."
                />
              </div>

              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">মূল ব্লগ কনটেন্ট (Content - HTML বা প্লেইন টেক্সট সমর্থন করে) *</label>
                <textarea
                  rows={8}
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white font-mono"
                  placeholder="এখানে আপনার ব্লগের বিস্তারিত তথ্য লিখুন। অনুচ্ছেদ তৈরিতে স্বাভাবিক লেখা লিখুন বা HTML ট্যাগ ব্যবহার করতে পারেন।"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="blog-publish"
                  checked={blogIsPublished}
                  onChange={(e) => setBlogIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="blog-publish" className="text-slate-700 font-bold cursor-pointer">
                  ব্লগটি সরাসরি পাবলিশ করুন (পাবলিকলি দেখা যাবে)?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlogModal(false);
                    setEditingBlog(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-5 py-2 text-white font-bold transition cursor-pointer"
                >
                  <span>আর্টিকেল সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 text-sm">
                {editingBanner ? 'প্রোমো ব্যানার সংশোধন' : 'নতুন প্রোমো ব্যানার ক্যাম্পেইন'}
              </h3>
              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setEditingBanner(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">ক্যাম্পেইন / ব্যানার টাইটেল *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: ডেন্টাল চেকআপে ৫০% ডিসকাউন্ট"
                />
              </div>

              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">ব্যানার ইমেজ লিংক (Image URL) *</label>
                <input
                  type="text"
                  required
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: https://images.unsplash.com/photo-1505751172876-fa1923c5c528"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">বিজ্ঞাপন স্লট / অবস্থান (Position)</label>
                <select
                  value={bannerSlot}
                  onChange={(e) => setBannerSlot(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                >
                  <option value="hero">হিরো স্লট (Landing page top)</option>
                  <option value="directory">ডিরেক্টরি স্লট (Doctor search page top)</option>
                  <option value="sidebar">সাইডবার স্লট (Sidebar Ad space)</option>
                  <option value="footer">ফুটার স্লট (Page footer row)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">বিজ্ঞাপন টার্গেট লিংক (Destination Link)</label>
                <input
                  type="text"
                  value={bannerTargetUrl}
                  onChange={(e) => setBannerTargetUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:bg-white"
                  placeholder="যেমন: https://mydocbd.com/doctors"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={bannerIsActive}
                  onChange={(e) => setBannerIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <label htmlFor="banner-active" className="text-slate-700 font-bold cursor-pointer">
                  ব্যানারটি সক্রিয় রাখুন (সরাসরি ইউজারদের দেখাবে)?
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowBannerModal(false);
                    setEditingBanner(null);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-5 py-2 text-white font-bold transition cursor-pointer"
                >
                  <span>বিজ্ঞাপন ব্যানার সংরক্ষণ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Slide-in Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-3 text-xs font-bold shadow-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
