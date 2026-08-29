export interface District {
  id: string;
  nameBn: string;
  nameEn: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Specialty {
  id: string;
  nameBn: string;
  nameEn: string;
  slug?: string;
  iconUrl?: string;
  iconName?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Facility {
  id: string;
  districtId: string;
  name: string;
  areaAddress: string;
  contactPhone: string;
  isVip: boolean;
  isActive: boolean;
  districtName?: string;
}

export interface Chamber {
  id: string;
  doctorId: string;
  facilityId: string;
  facilityName?: string;
  facilityAddress?: string;
  roomNo?: string;
  floor?: string;
  buildingStand?: string;
  visitingDays: string[];
  visitingTime: string;
  feeNew: number;
  feeOld: number;
}

export interface Doctor {
  id: string; // May be composite or raw ID
  doctorId?: string; // Raw UUID of the doctor
  name: string;
  bmdc: string; // BM&DC verification number
  specialty: string; // e.g., "মেডিসিন", "হৃদরোগ", "শিশু", "গাইনি", "অর্থোপেডিকস"
  facility: string; // e.g., "পপুলার ডায়াগনস্টিক সেন্টার", "আমানা হাসপাতাল"
  visitingDays: string[]; // e.g., ["শনিবার", "রবিবার", "সোমবার"]
  visitingTime: string; // e.g., "বিকাল ৫:০০ - রাত ৯:০০"
  feesNew: number; // consultation fee for new patient
  feesOld: number; // consultation fee for old patient
  degrees: string; // e.g., "MBBS, FCPS"
  designation: string; // e.g., "সহযোগী অধ্যাপক"
  workplace: string; // e.g., "রাজশাহী মেডিকেল কলেজ ও হাসপাতাল"
  chamberAddress: string; // e.g., "পপুলার ডায়াগনস্টিক সেন্টার, রাজশাহী"
  about?: string; // Doctor biography / profile / detailed about info
  photoUrl?: string;
  priorityIndex: number;
  isActive?: boolean;
  specialtyId?: string;
  specialtyNameBn?: string;
  specialtyNameEn?: string;
  chamberId?: string;
  facilityId?: string;
  facilityName?: string;
  facilityAddress?: string;
  facilityDistrictId?: string;
  chamberRoomNo?: string;
  chamberFloor?: string; // e.g., "৩য় তলা"
  chamberBuildingStand?: string; // e.g., "মেইন বিল্ডিং, লিফট-১ এর পাশে"
  psPhone?: string; // Doctor's Assistant/PS secret mobile number (ADMIN ONLY)
  rating?: number;
  reviewCount?: number;
  chambers?: Chamber[]; // Array of chambers for multi-chamber support
}

export interface Review {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientName: string;
  patientPhone?: string; // Private / only for verification, not displayed publicly
  rating: number;
  comment?: string;
  reviewText?: string;
  isVerifiedPatient?: boolean;
  isApproved?: boolean;
  isAdminCreated?: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string; // e.g., RJ-8492
  doctorId: string;
  doctorName?: string;
  doctorDegrees?: string;
  doctorSpecialty?: string;
  chamberId?: string;
  facilityName?: string;
  facilityAddress?: string;
  chamberRoomNo?: string;
  chamberFloor?: string;
  chamberBuildingStand?: string;
  visitingTime?: string;
  patientName: string;
  patientAge: number;
  patientMobile: string; // mobile number
  patientPhone?: string; // mapping fallback
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Rejected' | 'Completed';
  serialNo?: string;
  assignedFacilityName?: string;
  assignedRoomNo?: string;
  assignedFloor?: string; // e.g., "৩য় তলা"
  assignedBuilding?: string; // e.g., "বিল্ডিং-বি, পূর্ব গেট স্ট্যান্ড"
  confirmedVisitingTime?: string;
  specialInstructions?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt?: string;
}

export type BannerPlacementSlot = 'home_hero_top' | 'directory_middle' | 'sidebar_rect' | 'footer_sticky' | 'hero' | 'directory' | 'sidebar' | 'footer';

export interface PromoBanner {
  id: string;
  title: string;
  imageUrl: string;
  banner_image?: string;
  targetUrl?: string;
  target_url?: string;
  slot: BannerPlacementSlot;
  placement_slot?: BannerPlacementSlot;
  isActive: boolean;
  is_active?: boolean;
  displayOrder?: number;
  display_order?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ActiveTab = 'home' | 'doctors' | 'track' | 'admin' | 'portal-login' | 'about' | 'terms' | 'privacy' | 'faq' | 'blog';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  createdBy?: string;
}
