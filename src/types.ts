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
  iconName: string;
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
  rating?: number;
  reviewCount?: number;
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
  patientName: string;
  patientAge: number;
  patientMobile: string; // mobile number
  patientPhone?: string; // mapping fallback
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Rejected';
  serialNo?: string;
  assignedRoomNo?: string;
  confirmedVisitingTime?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActiveTab = 'home' | 'doctors' | 'track' | 'admin' | 'portal-login';

export interface AdminProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  createdBy?: string;
}
