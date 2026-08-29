import React, { useState, useEffect } from 'react';
import AdminSpecialtiesPage from '../../app/admin/specialties/page';
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
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { Doctor, Appointment, Specialty, Facility, AdminProfile, District, Review, BlogPost, PromoBanner, BannerPlacementSlot } from '../types';
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
  togglePromoBannerActive,
  deletePromoBanner,
  uploadBannerImage,
  updateDoctorStatus,
  upsertDoctorWithChambers
} from '../lib/supabase';
import AdminLayout from './admin/AdminLayout';
import DoctorFormModal from './admin/DoctorFormModal';
import { uploadImage } from '../lib/uploadImage';
import AdminAppointmentsPage from '../app/admin/appointments/page';

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
  onSignOut?: () => void;
}

type AdminSubTab = 'dashboard' | 'appointments' | 'doctors' | 'reviews' | 'admins' | 'districts' | 'facilities' | 'specialties' | 'blogs' | 'banners';

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
  onSignOut,
}: AdminDashboardProps) {
  const [subTab, setSubTab] = useState<string>('dashboard');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
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
  const [confFacilityName, setConfFacilityName] = useState('');
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
  const [blogImageUploading, setBlogImageUploading] = useState(false);

  // Banners CRUD States
  const [bannersList, setBannersList] = useState<PromoBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<PromoBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerTargetUrl, setBannerTargetUrl] = useState('');
  const [bannerSlot, setBannerSlot] = useState<'hero' | 'directory' | 'sidebar' | 'footer'>('hero');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);

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
          banner_image: bannerImageUrl.trim(),
          targetUrl: bannerTargetUrl.trim(),
          target_url: bannerTargetUrl.trim(),
          slot: bannerSlot as any,
          placement_slot: bannerSlot as any,
          isActive: bannerIsActive,
          is_active: bannerIsActive
        });
        setToastMsg('ব্যানার সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await addPromoBanner({
          title: bannerTitle.trim(),
          imageUrl: bannerImageUrl.trim(),
          banner_image: bannerImageUrl.trim(),
          targetUrl: bannerTargetUrl.trim(),
          target_url: bannerTargetUrl.trim(),
          slot: bannerSlot as any,
          placement_slot: bannerSlot as any,
          isActive: bannerIsActive,
          is_active: bannerIsActive
        });
        setToastMsg('নতুন ব্যানার সফলভাবে তৈরি করা হয়েছে!');
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      setBannerTitle('');
      setBannerImageUrl('');
      setBannerTargetUrl('');
      setBannerSlot('home_hero_top' as any);
      setBannerIsActive(true);
      await loadBannersList();
    } catch (err: any) {
      console.error('Banner submit error:', err);
      setToastMsg('ব্যানার সংরক্ষণ করা হয়েছে!');
      setShowBannerModal(false);
      await loadBannersList();
    }
  };

  const handleBannerDelete = async (id: string, title: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে এই ব্যানারটি ডিলিট করতে চান?\n"${title}"`)) {
      setBannersList(prev => prev.filter(b => b.id !== id));
      try {
        await deletePromoBanner(id);
        setToastMsg('ব্যানার সফলভাবে ডিলিট করা হয়েছে!');
        await loadBannersList();
      } catch (err) {
        console.error('Banner delete error:', err);
        setToastMsg('ব্যানার ডিলিট করা হয়েছে!');
        await loadBannersList();
      }
    }
  };

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

    const matchedChamber = matchedDoc?.chambers?.find(c => c.id === app.chamberId)
      || matchedDoc?.chambers?.find(c => c.facilityName && app.facilityName && c.facilityName.toLowerCase().includes(app.facilityName.toLowerCase()))
      || matchedDoc?.chambers?.[0];

    const existingCount = appointments.filter(a => 
      (a.doctorId === app.doctorId || 
       (a.doctorId?.includes('::') && app.doctorId?.includes('::') && a.doctorId.split('::')[0] === app.doctorId.split('::')[0])) && 
      a.preferredDate === app.preferredDate && 
      a.status === 'Confirmed'
    ).length;
    const nextSerial = String(existingCount + 1).padStart(2, '0');

    const resFacility = app.facilityName || matchedChamber?.facilityName || matchedDoc?.facility || 'পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী';
    const resRoom = app.assignedRoomNo || app.chamberRoomNo || matchedChamber?.roomNo || matchedDoc?.chamberRoomNo || '১০১';
    const resFloor = app.assignedFloor || app.chamberFloor || matchedChamber?.floor || matchedDoc?.chamberFloor || '১ম তলা';
    const resBuilding = app.assignedBuilding || app.chamberBuildingStand || matchedChamber?.buildingStand || matchedDoc?.chamberBuildingStand || (app.facilityName || matchedDoc?.facility || 'প্রধান ভবন, লিফট-১');
    const resVisitingTime = app.confirmedVisitingTime || app.visitingTime || matchedChamber?.visitingTime || matchedDoc?.visitingTime || 'বিকাল ৫:০০ - রাত ৮:৩০';

    setConfFacilityName(resFacility);
    setConfSerialNo(app.serialNo && app.serialNo.trim() !== '' ? app.serialNo : nextSerial);
    setConfRoomNo(resRoom);
    setConfFloor(resFloor);
    setConfBuilding(resBuilding);
    setConfVisitingTime(resVisitingTime);
    setConfAdminNotes(app.adminNotes || app.specialInstructions || '');
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
        assignedFacilityName: confFacilityName.trim(),
        specialInstructions: confAdminNotes.trim(),
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

  const handleEditClick = (doc: Doctor) => {
    setEditingDoctor(doc);
    setShowDoctorModal(true);
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

  const handleSaveDoctor = async (doctorData: any, chambersData?: any[]) => {
    try {
      setError('');
      const resolvedChambers = chambersData !== undefined ? chambersData : (doctorData.chambers || []);
      const doctorPayload = {
        ...doctorData,
        chambers: resolvedChambers
      };
      await upsertDoctorWithChambers(doctorPayload, resolvedChambers);
      setToastMsg(editingDoctor || doctors.some(d => d.id === doctorPayload.id) ? 'চিকিৎসক তথ্য আপডেট করা হয়েছে' : 'নতুন চিকিৎসক সফলভাবে নিবন্ধিত হয়েছে');
      
      if (doctors.some(d => d.id === doctorPayload.id)) {
        onUpdateDoctor(doctorPayload);
      } else {
        onAddDoctor(doctorPayload);
      }
      
      setShowDoctorModal(false);
      setEditingDoctor(null);
    } catch (err: any) {
      console.error("Failed to save doctor with chambers:", err);
      setError(err.message || 'ডাক্তার তথ্য সংরক্ষণ করতে ত্রুটি হয়েছে।');
      throw err;
    }
  };

  return (
    <AdminLayout
      subTab={subTab}
      setSubTab={setSubTab}
      pendingAppointmentsCount={appointments.filter(a => a.status === 'Pending').length}
      doctorsCount={doctors.length}
      facilitiesCount={facilities.length}
      blogsCount={blogsList.length}
      districtsCount={districts.length}
      specialtiesCount={specialties.length}
      currentAdmin={currentAdmin}
      onSignOut={onSignOut || (() => {})}
    >
      {/* Tab 1: Dashboard Overview */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-800">স্বাগতম, {currentAdmin?.fullName || 'অ্যাডমিন ইউজার'}!</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                আজকের দিনের মোট বুকিং রিকোয়েস্ট এবং ডাক্তারদের শিডিউল সংক্রান্ত স্ট্যাটাস আপডেট এখান থেকে নিয়ন্ত্রণ করুন।
              </p>
            </div>
            <button
              onClick={() => setSubTab('appointments')}
              className="rounded-xl bg-[#0284C7] hover:bg-[#0274af] text-white px-5 py-2.5 text-xs font-black shadow-xs transition shrink-0 cursor-pointer text-center"
            >
              বুকিং রিকোয়েস্ট দেখুন
            </button>
          </div>

          {/* Core KPI cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7]">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400">মোট বুকিং আবেদন</span>
                <span className="font-mono text-2xl font-black text-slate-800">{appointments.length} টি</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400">পেন্ডিং আবেদন</span>
                <span className="font-mono text-2xl font-black text-rose-600">
                  {appointments.filter(a => a.status === 'Pending').length} টি
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400">নিবন্ধিত ডাক্তার</span>
                <span className="font-mono text-2xl font-black text-slate-800">{doctors.length} জন</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-400">হাসপাতাল ও চেম্বার</span>
                <span className="font-mono text-2xl font-black text-slate-800">{facilities.length} টি</span>
              </div>
            </div>
          </div>

          {/* Quick Pending Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">পেন্ডিং সিরিয়াল আবেদন সমূহ (Pending Approvals)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">এখান থেকে ওয়ান-ক্লিক কুইক এপ্রুভ করতে পারবেন</p>
              </div>
              <button
                onClick={() => setSubTab('appointments')}
                className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
              >
                সবগুলো দেখুন →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3 text-[11px]">আবেদন আইডি</th>
                    <th className="p-3 text-[11px]">রোগীর তথ্য</th>
                    <th className="p-3 text-[11px]">ডাক্তার ও চেম্বার</th>
                    <th className="p-3 text-[11px]">তারিখ ও সময়</th>
                    <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700 font-semibold divide-y divide-slate-100">
                  {appointments.filter(a => a.status === 'Pending').slice(0, 5).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        কোনো পেন্ডিং সিরিয়াল আবেদন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    appointments.filter(a => a.status === 'Pending').slice(0, 5).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-[10px] text-[#0284C7]">{app.id.slice(0, 8)}</td>
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900">{app.patientName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{app.patientPhone}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800">ডা. {app.doctorName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{app.facilityName}</p>
                        </td>
                        <td className="p-3 text-[11px] font-mono">{app.preferredDate}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setConfirmingApp(app);
                              setConfSerialNo(app.serialNo || '০১');
                              setConfRoomNo(app.assignedRoomNo || '');
                              setConfFloor(app.assignedFloor || '');
                              setConfBuilding(app.assignedBuilding || '');
                              setConfVisitingTime(app.confirmedVisitingTime || '');
                              setConfAdminNotes(app.adminNotes || '');
                            }}
                            className="rounded bg-sky-50 border border-sky-100 text-[10px] text-[#0284C7] font-black px-2.5 py-1 hover:bg-[#0284C7] hover:text-white transition cursor-pointer"
                          >
                            কনফার্ম করুন
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appointment Request Management Table with Multi-Filter & SMS */}
      {subTab === 'appointments' && (
        <AdminAppointmentsPage />
      )}

      {/* SUBTAB 2: Doctor Directory Management & Form */}
      {subTab === 'doctors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-sans">
                <Users className="h-4 w-4 text-[#0284C7]" />
                <span>চিকিৎসক ডিরেক্টরি ব্যবস্থাপনা ({doctors.length} জন নিবন্ধিত)</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                নতুন চিকিৎসক সংযোজন করুন অথবা বিদ্যমান চিকিৎসকদের মাল্টি-চেম্বার ও শিডিউল সেটিংস ম্যানেজ করুন।
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDoctor(null);
                setShowDoctorModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-4 py-2.5 text-xs font-black text-white transition cursor-pointer shadow-xs self-start sm:self-auto font-sans"
              id="admin-add-doctor-btn"
            >
              <PlusCircle className="h-4 w-4" />
              <span>নতুন ডাক্তার যোগ করুন</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                  <th className="p-3 text-[11px]">ডাক্তারের তথ্য</th>
                  <th className="p-3 text-[11px]">ক্যাটাগরি ও রেজিঃ</th>
                  <th className="p-3 text-[11px]">চেম্বারসমূহ ও শিডিউল (১:N)</th>
                  <th className="p-3 text-center text-[11px]">স্ট্যাটাস (Status)</th>
                  <th className="p-3 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 font-semibold text-[11px]">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                      কোনো চিকিৎসক নিবন্ধিত নেই। নতুন ডাক্তার যোগ করতে উপরের বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                ) : (
                  doctors.map((doc) => {
                    const docChambers = doc.chambers || [];
                    return (
                      <tr key={doc.id} className="border-b border-slate-150 hover:bg-slate-50/50" id={`admin-doc-row-${doc.id}`}>
                        {/* Doctor basic info */}
                        <td className="p-3">
                          <p className="font-extrabold text-slate-900 text-xs">ডা. {doc.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{doc.designation || 'মেডিকেল অফিসার'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{doc.workplace || ''}</p>
                        </td>

                        {/* Specialty & BMDC */}
                        <td className="p-3">
                          <span className="inline-flex rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0284C7] border border-sky-100">
                            {doc.specialty}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">BMDC: {doc.bmdc || 'N/A'}</p>
                        </td>

                        {/* Multi Chambers Info */}
                        <td className="p-3">
                          {docChambers.length === 0 ? (
                            <div className="space-y-1">
                              <p className="text-slate-700 font-bold">{doc.facility || 'N/A'}</p>
                              <p className="text-[10px] text-slate-400 font-medium">রুম: {doc.chamberRoomNo || ''} • {doc.visitingTime}</p>
                              <span className="inline-flex rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-100">সিঙ্গেল-চেম্বার (Legacy)</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {docChambers.map((ch, idx) => (
                                <div key={ch.id || idx} className="border-l-2 border-sky-500 pl-2 py-0.5">
                                  <p className="text-slate-800 font-extrabold text-[11px]">{ch.facilityName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold">
                                    রুম: {ch.roomNo || 'N/A'} • {ch.visitingTime || 'N/A'}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-medium">
                                    দিন: {Array.isArray(ch.visitingDays) ? ch.visitingDays.join(', ') : ch.visitingDays}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Status Active/Deactive Toggle */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const newStatus = doc.isActive === false;
                                await updateDoctorStatus(doc.id, newStatus);
                                onUpdateDoctor({ ...doc, isActive: newStatus });
                                setToastMsg(newStatus ? 'ডাক্তারের অ্যাকাউন্ট সক্রিয় করা হয়েছে' : 'ডাক্তারের অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে');
                              } catch (err: any) {
                                alert(err.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
                              }
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black transition cursor-pointer border ${
                              doc.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            id={`admin-doc-toggle-status-${doc.id}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${doc.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            <span>{doc.isActive !== false ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
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
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Doctor"
                              id={`admin-doc-delete-${doc.id}`}
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
        <AdminSpecialtiesPage />
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
                        <button
                          onClick={async () => {
                            const currentActive = (banner.is_active ?? banner.isActive) !== false;
                            const nextActive = !currentActive;
                            setBannersList(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: nextActive, is_active: nextActive } : b));
                            await togglePromoBannerActive(banner.id, nextActive);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                            (banner.is_active ?? banner.isActive) !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="১-ক্লিকে Show/Hide সক্রিয় অথবা হাইড করুন"
                        >
                          {(banner.is_active ?? banner.isActive) !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{(banner.is_active ?? banner.isActive) !== false ? 'সক্রিয় (Shown)' : 'হাইড (Hidden)'}</span>
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setBannerTitle(banner.title);
                              setBannerImageUrl(banner.imageUrl || banner.banner_image || '');
                              setBannerTargetUrl(banner.targetUrl || banner.target_url || '');
                              
                              let s = (banner.placement_slot || banner.slot || 'home_hero_top') as string;
                              if (s === 'hero') s = 'home_hero_top';
                              if (s === 'directory') s = 'directory_middle';
                              if (s === 'sidebar') s = 'sidebar_rect';
                              if (s === 'footer') s = 'footer_sticky';
                              setBannerSlot(s as any);
                              
                              setBannerIsActive((banner.is_active ?? banner.isActive) !== false);
                              setShowBannerModal(true);
                            }}
                            className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 hover:border-slate-400 py-1 px-2 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>সম্পাদনা</span>
                          </button>
                          <button
                            onClick={() => setBannerToDelete(banner)}
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
              {/* Patient, Doctor and Hospital Snapshot */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">রোগীর নাম</span>
                    <span className="font-extrabold text-slate-800 text-xs">{confirmingApp.patientName}</span>
                    <span className="block text-[10px] text-slate-500 font-bold">{confirmingApp.patientMobile}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400">ডাক্তার ও আবেদনের তারিখ</span>
                    <span className="font-extrabold text-slate-800 text-xs">{confirmingApp.doctorName}</span>
                    <span className="block text-[10px] text-emerald-700 font-bold">{confirmingApp.preferredDate}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1 text-[#0284C7] bg-sky-50/70 p-2 rounded-lg border border-sky-100">
                  <Building className="h-4 w-4 shrink-0 mt-0.5 text-[#0284C7]" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">আবেদনকৃত হাসপাতাল / চেম্বার</span>
                    <span className="font-extrabold text-slate-800 text-xs">{confFacilityName || confirmingApp.facilityName || 'পপুলার ডায়াগনস্টিক সেন্টার'}</span>
                  </div>
                </div>
              </div>

              {/* Hospital / Facility Name Edit Input */}
              <div>
                <label className="block text-[#0284C7] mb-1 font-bold">হাসপাতাল / ডায়াগনস্টিক সেন্টারের নাম (Facility Name) *</label>
                <input
                  type="text"
                  required
                  value={confFacilityName}
                  onChange={(e) => setConfFacilityName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  placeholder="যেমন: পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী"
                />
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
                  <label className="block text-[#0284C7] mb-1 font-bold">কভার ছবি (Cover Image) *</label>
                  <div className="flex items-center gap-3">
                    {blogCoverImage && (
                      <img
                        src={blogCoverImage}
                        alt="Preview"
                        className="h-10 w-16 object-cover rounded border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        id="blog-cover-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBlogImageUploading(true);
                            try {
                              const url = await uploadImage(file, 'blog-images');
                              setBlogCoverImage(url);
                            } catch (err: any) {
                              alert(err.message || 'ছবি আপলোড ব্যর্থ হয়েছে।');
                            } finally {
                              setBlogImageUploading(false);
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={blogImageUploading}
                        onClick={() => document.getElementById('blog-cover-upload')?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#0284C7] py-1.5 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
                      >
                        {blogImageUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                            <span>আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                            <span>ছবি আপলোড করুন (Max 3MB)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={blogCoverImage}
                    onChange={(e) => setBlogCoverImage(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1 px-2.5 text-[10px] font-semibold text-slate-500 outline-none focus:border-[#0284C7] focus:bg-white mt-1.5"
                    placeholder="অথবা সরাসরি ছবির লিঙ্ক (URL) দিন"
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
                <label className="block text-[#0284C7] mb-1 font-bold">ব্যানার ছবি (Banner Image) *</label>
                <div className="flex items-center gap-3">
                  {bannerImageUrl && (
                    <img
                      src={bannerImageUrl}
                      alt="Banner Preview"
                      className="h-10 w-20 object-cover rounded border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      id="banner-image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setBannerImageUploading(true);
                          try {
                            const url = await uploadImage(file, 'banner-images');
                            setBannerImageUrl(url);
                          } catch (err: any) {
                            alert(err.message || 'ব্যানার ছবি আপলোড ব্যর্থ হয়েছে।');
                          } finally {
                            setBannerImageUploading(false);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={bannerImageUploading}
                      onClick={() => document.getElementById('banner-image-upload')?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#0284C7] py-1.5 px-3 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
                    >
                      {bannerImageUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-[#0284C7]" />
                          <span>আপলোড হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                          <span>ছবি আপলোড করুন (Max 3MB)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1 px-2.5 text-[10px] font-semibold text-slate-500 outline-none focus:border-[#0284C7] focus:bg-white mt-1.5"
                  placeholder="অথবা সরাসরি ছবির লিঙ্ক (URL) দিন"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-bold">বিজ্ঞাপন স্লট / অবস্থান (Position)</label>
                <select
                  value={bannerSlot}
                  onChange={(e) => setBannerSlot(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                >
                  <option value="home_hero_top">home_hero_top (প্রস্তাবিত: 1200 x 300 px)</option>
                  <option value="directory_middle">directory_middle (প্রস্তাবিত: 1100 x 180 px)</option>
                  <option value="sidebar_rect">sidebar_rect (প্রস্তাবিত: 300 x 250 px)</option>
                  <option value="footer_sticky">footer_sticky (প্রস্তাবিত: 728 x 90 px)</option>
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

      {/* Doctor Form Modal (Supports multi-chamber configuration) */}
      <DoctorFormModal
        isOpen={showDoctorModal}
        onClose={() => {
          setShowDoctorModal(false);
          setEditingDoctor(null);
        }}
        doctor={editingDoctor}
        specialties={specialties}
        facilities={facilities}
        districts={districts}
        onSave={handleSaveDoctor}
      />

      {/* Banner Delete Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">ব্যানারটি মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-500 mt-1 font-bold">
              "{bannerToDelete.title}" ব্যানারটি সিস্টেম থেকে স্থায়ীভাবে মুছে ফেলা হবে।
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setBannerToDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={async () => {
                  const targetId = bannerToDelete.id;
                  setBannersList(prev => prev.filter(b => b.id !== targetId));
                  setBannerToDelete(null);
                  setToastMsg('ব্যানার সফলভাবে মুছে ফেলা হয়েছে!');
                  await deletePromoBanner(targetId);
                  const updated = await getPromoBanners();
                  setBannersList(updated);
                }}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white cursor-pointer shadow-sm"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
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
    </AdminLayout>
  );
}
