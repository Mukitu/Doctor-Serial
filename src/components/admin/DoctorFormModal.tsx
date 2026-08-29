import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Camera, 
  Calendar, 
  Clock, 
  CreditCard, 
  Layers, 
  Lock, 
  User, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { Doctor, Chamber, District, Specialty, Facility } from '../../types';
import { uploadImage } from '../../lib/uploadImage';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  specialties: Specialty[];
  facilities: Facility[];
  districts: District[];
  onSave: (doctorData: any, chambersData: any[]) => Promise<void>;
}

const DAYS_LIST = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

export default function DoctorFormModal({
  isOpen,
  onClose,
  doctor,
  specialties,
  facilities,
  districts,
  onSave
}: DoctorFormModalProps) {
  // Section A: Basic Profile States
  const [name, setName] = useState('');
  const [bmdc, setBmdc] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [degrees, setDegrees] = useState('');
  const [designation, setDesignation] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [about, setAbout] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [psPhone, setPsPhone] = useState('');
  const [priorityIndex, setPriorityIndex] = useState('10');
  const [rating, setRating] = useState('5.0');
  const [reviewCount, setReviewCount] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // Section B: Chamber States
  const [isMultiChamber, setIsMultiChamber] = useState(false);
  const [chambers, setChambers] = useState<any[]>([
    {
      id: '',
      facilityId: '',
      roomNo: '৩০২',
      floor: '৩য় তলা',
      buildingStand: 'মেইন ভবন',
      visitingDays: ['শনিবার', 'রবিবার', 'সোমবার'],
      visitingTime: 'বিকাল ৫:০০ - রাত ৮:৩০',
      feeNew: 800,
      feeOld: 500
    }
  ]);

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load editing doctor info
  useEffect(() => {
    if (doctor) {
      setName(doctor.name || '');
      setBmdc(doctor.bmdc || '');
      setSpecialtyId(doctor.specialtyId || specialties[0]?.id || '');
      setDegrees(doctor.degrees || '');
      setDesignation(doctor.designation || '');
      setWorkplace(doctor.workplace || '');
      setAbout(doctor.about || '');
      setPhotoUrl(doctor.photoUrl || '');
      setPsPhone(doctor.psPhone || '');
      setPriorityIndex((doctor.priorityIndex || 10).toString());
      setRating((doctor.rating || 5.0).toString());
      setReviewCount((doctor.reviewCount || 0).toString());
      setIsActive(doctor.isActive !== false);

      if (doctor.chambers && doctor.chambers.length > 0) {
        setIsMultiChamber(doctor.chambers.length > 1);
        setChambers(doctor.chambers.map(ch => {
          const matchedFac = facilities.find(f => f.id === ch.facilityId || f.id === (ch as any).facility_id || f.name === ch.facilityName || f.name === (ch as any).facility);
          const facId = ch.facilityId || (ch as any).facility_id || matchedFac?.id || '';
          
          let daysArr: string[] = ['সবদিন'];
          if (Array.isArray(ch.visitingDays) && ch.visitingDays.length > 0) {
            daysArr = ch.visitingDays;
          } else if (typeof (ch as any).visiting_days === 'string' && (ch as any).visiting_days.trim()) {
            daysArr = (ch as any).visiting_days.split(',').map((d: string) => d.trim());
          }

          return {
            id: ch.id || '',
            facilityId: facId,
            facility_id: facId,
            facilityName: matchedFac?.name || ch.facilityName || (ch as any).facility || '',
            facilityAddress: matchedFac?.areaAddress || ch.facilityAddress || '',
            roomNo: ch.roomNo || (ch as any).room_no || '',
            room_no: ch.roomNo || (ch as any).room_no || '',
            floor: ch.floor || (ch as any).floor || '',
            buildingStand: ch.buildingStand || (ch as any).building_stand || (ch as any).building_info || '',
            building_info: ch.buildingStand || (ch as any).building_stand || (ch as any).building_info || '',
            visitingDays: daysArr,
            visiting_days: daysArr,
            visitingTime: ch.visitingTime || (ch as any).visiting_time || '',
            visiting_time: ch.visitingTime || (ch as any).visiting_time || '',
            feeNew: ch.feeNew ?? (ch as any).fee_new ?? 0,
            fee_new: ch.feeNew ?? (ch as any).fee_new ?? 0,
            feeOld: ch.feeOld ?? (ch as any).fee_old ?? 0,
            fee_old: ch.feeOld ?? (ch as any).fee_old ?? 0
          };
        }));
      } else {
        // Fallback to legacy single chamber properties on doctor
        setIsMultiChamber(false);
        const matchedFac = facilities.find(f => f.id === doctor.facilityId || f.id === (doctor as any).facility_id || f.name === doctor.facilityName || f.name === doctor.facility);
        const facId = doctor.facilityId || (doctor as any).facility_id || matchedFac?.id || '';
        
        let daysArr: string[] = ['সবদিন'];
        if (Array.isArray(doctor.visitingDays) && doctor.visitingDays.length > 0) {
          daysArr = doctor.visitingDays;
        } else if (typeof (doctor as any).visiting_days === 'string' && (doctor as any).visiting_days.trim()) {
          daysArr = (doctor as any).visiting_days.split(',').map((d: string) => d.trim());
        }

        setChambers([
          {
            id: doctor.chamberId || '',
            facilityId: facId,
            facility_id: facId,
            facilityName: matchedFac?.name || doctor.facilityName || doctor.facility || '',
            facilityAddress: matchedFac?.areaAddress || doctor.facilityAddress || '',
            roomNo: doctor.chamberRoomNo || (doctor as any).room_no || '',
            room_no: doctor.chamberRoomNo || (doctor as any).room_no || '',
            floor: doctor.chamberFloor || (doctor as any).floor || '',
            buildingStand: doctor.chamberBuildingStand || (doctor as any).building_stand || (doctor as any).building_info || '',
            building_info: doctor.chamberBuildingStand || (doctor as any).building_stand || (doctor as any).building_info || '',
            visitingDays: daysArr,
            visiting_days: daysArr,
            visitingTime: doctor.visitingTime || (doctor as any).visiting_time || '',
            visiting_time: doctor.visitingTime || (doctor as any).visiting_time || '',
            feeNew: doctor.feesNew ?? (doctor as any).fee_new ?? 0,
            fee_new: doctor.feesNew ?? (doctor as any).fee_new ?? 0,
            feeOld: doctor.feesOld ?? (doctor as any).fee_old ?? 0,
            fee_old: doctor.feesOld ?? (doctor as any).fee_old ?? 0
          }
        ]);
      }
    } else {
      // Clear for new entry
      setName('');
      setBmdc('');
      setSpecialtyId(specialties[0]?.id || '');
      setDegrees('');
      setDesignation('');
      setWorkplace('');
      setAbout('');
      setPhotoUrl('');
      setPsPhone('');
      setPriorityIndex('10');
      setRating('5.0');
      setReviewCount('0');
      setIsActive(true);
      setIsMultiChamber(false);
      setChambers([
        {
          id: '',
          facilityId: '',
          facility_id: '',
          facilityName: '',
          facilityAddress: '',
          roomNo: '',
          room_no: '',
          floor: '',
          buildingStand: '',
          building_info: '',
          visitingDays: ['সবদিন'],
          visiting_days: ['সবদিন'],
          visitingTime: '',
          visiting_time: '',
          feeNew: 0,
          fee_new: 0,
          feeOld: 0,
          fee_old: 0
        }
      ]);
    }
    setError('');
    setWarning('');
  }, [doctor, isOpen, specialties, facilities]);

  // Chamber Validation Checker
  useEffect(() => {
    if (chambers.length < 2) {
      setWarning('');
      return;
    }

    // Check duplicate facility IDs
    const facilityIds = chambers.map(c => c.facilityId).filter(Boolean);
    const hasDuplicateFacility = facilityIds.some((id, index) => facilityIds.indexOf(id) !== index);
    if (hasDuplicateFacility) {
      setWarning('সতর্কতা: একই হাসপাতাল/ক্লিনিক একাধিক চেম্বারে নির্বাচন করা হয়েছে।');
      return;
    }

    // Check overlapping days across chambers
    let overlaps = false;
    let overlapMsg = '';
    for (let i = 0; i < chambers.length; i++) {
      for (let j = i + 1; j < chambers.length; j++) {
        const daysA = chambers[i].visitingDays || [];
        const daysB = chambers[j].visitingDays || [];
        const commonDays = daysA.filter((d: string) => daysB.includes(d));
        if (commonDays.length > 0) {
          overlaps = true;
          overlapMsg = `সতর্কতা: চেম্বার ${i + 1} এবং চেম্বার ${j + 1} একই দিনে (${commonDays.join(', ')}) রোগী দেখেন। চেম্বারের সময়সূচী ভিন্ন হওয়া নিশ্চিত করুন।`;
          break;
        }
      }
      if (overlaps) break;
    }

    if (overlaps) {
      setWarning(overlapMsg);
    } else {
      setWarning('');
    }
  }, [chambers]);

  if (!isOpen) return null;

  // Handle image drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    try {
      const url = await uploadImage(file, 'doctor-images');
      setPhotoUrl(url);
    } catch (err: any) {
      setError(err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsUploading(false);
    }
  };

  const addChamberField = () => {
    setChambers([
      ...chambers,
      {
        id: '',
        facilityId: '',
        facility_id: '',
        facilityName: '',
        facilityAddress: '',
        roomNo: '',
        room_no: '',
        floor: '',
        buildingStand: '',
        building_info: '',
        visitingDays: ['সবদিন'],
        visiting_days: ['সবদিন'],
        visitingTime: '',
        visiting_time: '',
        feeNew: 0,
        fee_new: 0,
        feeOld: 0,
        fee_old: 0
      }
    ]);
  };

  const removeChamberField = (index: number) => {
    if (chambers.length === 1) {
      setError('কমপক্ষে একটি চেম্বার তথ্য থাকা আবশ্যক।');
      return;
    }
    setChambers(chambers.filter((_, idx) => idx !== index));
  };

  const handleChamberChange = (index: number, field: string, value: any) => {
    setChambers(prev => prev.map((ch, idx) => {
      if (idx !== index) return ch;
      const updated = { ...ch, [field]: value };
      if (field === 'facility_id' || field === 'facilityId') {
        updated.facilityId = value;
        updated.facility_id = value;
        const matched = facilities.find(f => f.id === value);
        if (matched) {
          updated.facilityName = matched.name;
          updated.facilityAddress = matched.areaAddress || '';
        }
      }
      if (field === 'room_no' || field === 'roomNo') {
        updated.roomNo = value;
        updated.room_no = value;
      }
      if (field === 'building_info' || field === 'buildingStand') {
        updated.buildingStand = value;
        updated.building_info = value;
      }
      if (field === 'fee_new' || field === 'feeNew') {
        updated.feeNew = value;
        updated.fee_new = value;
      }
      if (field === 'fee_old' || field === 'feeOld') {
        updated.feeOld = value;
        updated.fee_old = value;
      }
      if (field === 'visiting_days' || field === 'visitingDays') {
        updated.visitingDays = value;
        updated.visiting_days = value;
      }
      if (field === 'visiting_time' || field === 'visitingTime') {
        updated.visitingTime = value;
        updated.visiting_time = value;
      }
      return updated;
    }));
  };

  const updateChamberField = (index: number, key: string, value: any) => {
    handleChamberChange(index, key, value);
  };

  const handleDayToggle = (chamberIndex: number, day: string) => {
    const currentDays = chambers[chamberIndex].visitingDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: string) => d !== day)
      : [...currentDays, day];
    updateChamberField(chamberIndex, 'visitingDays', newDays);
  };

  // Convert Bengali numbers to English
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    if (!name.trim()) return setError('ডাক্তারের নাম দেওয়া আবশ্যক।');
    if (!degrees.trim()) return setError('শিক্ষাগত যোগ্যতা/ডিগ্রি দেওয়া আবশ্যক।');
    if (!designation.trim()) return setError('পদবী দেওয়া আবশ্যক।');
    if (!workplace.trim()) return setError('কর্মস্থল দেওয়া আবশ্যক।');

    // Processing Chambers
    const processedChambers: any[] = [];
    const finalChamberCount = isMultiChamber ? chambers.length : 1;

    for (let i = 0; i < finalChamberCount; i++) {
      const ch = chambers[i];
      const selectedFacId = ch.facilityId || ch.facility_id || '';
      const matchedFacility = facilities.find(f => f.id === selectedFacId || f.name === (ch as any).facilityName || f.name === (ch as any).facility);
      const effectiveFacilityId = selectedFacId || matchedFacility?.id || '';

      const feeNewNum = typeof ch.feeNew === 'string' ? cleanNumberInput(ch.feeNew) : ch.feeNew;
      const feeOldNum = typeof ch.feeOld === 'string' ? cleanNumberInput(ch.feeOld) : ch.feeOld;

      processedChambers.push({
        id: ch.id || undefined, // Keep existing ID for edits
        facilityId: effectiveFacilityId,
        facilityName: matchedFacility?.name || ch.facilityName || (ch as any).facility || '',
        facilityAddress: matchedFacility?.areaAddress || ch.facilityAddress || '',
        facilityDistrictId: matchedFacility?.districtId || '',
        roomNo: ch.roomNo?.trim() || ch.room_no?.trim() || '',
        floor: ch.floor?.trim() || ch.floor?.trim() || '',
        buildingStand: ch.buildingStand?.trim() || ch.building_info?.trim() || '',
        visitingDays: ch.visitingDays && ch.visitingDays.length > 0 ? ch.visitingDays : ['সবদিন'],
        visitingTime: ch.visitingTime?.trim() || ch.visiting_time?.trim() || '',
        feeNew: feeNewNum != null && !isNaN(feeNewNum) ? feeNewNum : 0,
        feeOld: feeOldNum != null && !isNaN(feeOldNum) ? feeOldNum : 0
      });
    }

    // Schedule Conflict Check across Chambers
    if (finalChamberCount > 1) {
      const ALL_WEEKDAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const DAY_ENGLISH_TO_BANGLA: Record<string, string> = {
        'Saturday': 'শনিবার', 'Sunday': 'রবিবার', 'Monday': 'সোমবার',
        'Tuesday': 'মঙ্গলবার', 'Wednesday': 'বুধবার', 'Thursday': 'বৃহস্পতিবার', 'Friday': 'শুক্রবার'
      };

      const normalizeDaysForConflict = (days: string[]): string[] => {
        if (!days || days.length === 0) return [];
        const result = new Set<string>();
        const mapToEnglish: Record<string, string> = {
          'শনিবার': 'Saturday', 'শনি': 'Saturday', 'sat': 'Saturday', 'saturday': 'Saturday',
          'রবিবার': 'Sunday', 'রবি': 'Sunday', 'sun': 'Sunday', 'sunday': 'Sunday',
          'সোমবার': 'Monday', 'সোম': 'Monday', 'mon': 'Monday', 'monday': 'Monday',
          'মঙ্গলবার': 'Tuesday', 'মঙ্গল': 'Tuesday', 'tue': 'Tuesday', 'tuesday': 'Tuesday',
          'বুধবার': 'Wednesday', 'বুধ': 'Wednesday', 'wed': 'Wednesday', 'wednesday': 'Wednesday',
          'বৃহস্পতিবার': 'Thursday', 'বৃহস্পতি': 'Thursday', 'thu': 'Thursday', 'thursday': 'Thursday',
          'শুক্রবার': 'Friday', 'শুক্র': 'Friday', 'fri': 'Friday', 'friday': 'Friday',
        };
        for (const rawDay of days) {
          const clean = rawDay.trim().toLowerCase();
          if (clean.includes('সবদিন') || clean.includes('প্রতিদিন') || clean.includes('everyday') || clean.includes('all')) {
            ALL_WEEKDAYS.forEach(d => result.add(d));
          } else {
            for (const [key, val] of Object.entries(mapToEnglish)) {
              if (clean.includes(key)) {
                result.add(val);
              }
            }
          }
        }
        return Array.from(result);
      };

      const parseTimeRangeToMinutes = (timeStr: string): { start: number; end: number } | null => {
        if (!timeStr) return null;
        const banglaToEn: Record<string, string> = {
          '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
          '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        };
        const cleanStr = timeStr.trim().replace(/[০-৯]/g, w => banglaToEn[w] || w);
        const parts = cleanStr.split(/[-–—]|থেকে|to/i);
        if (parts.length < 2) return null;

        const startSegment = parts[0].trim();
        const endSegment = parts[1].trim();

        const parseSegment = (seg: string, partnerSeg?: string): number | null => {
          const segLower = seg.toLowerCase();
          const partnerLower = partnerSeg ? partnerSeg.toLowerCase() : '';
          const combined = segLower + ' ' + partnerLower;

          let isPm = false;
          let isAm = false;

          if (combined.includes('pm') || combined.includes('বিকাল') || combined.includes('সন্ধ্যা') || combined.includes('রাত') || combined.includes('দুপুর')) {
            isPm = true;
          } else if (combined.includes('am') || combined.includes('সকাল') || combined.includes('ভোর')) {
            isAm = true;
          }

          const timeMatch = seg.match(/(\d{1,2})(?::(\d{2}))?/);
          if (!timeMatch) return null;

          let hours = parseInt(timeMatch[1], 10);
          const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
          if (isNaN(hours)) return null;

          if (isPm) {
            if (hours < 12) hours += 12;
          } else if (isAm) {
            if (hours === 12) hours = 0;
          } else {
            if (hours >= 1 && hours <= 11) {
              if (hours >= 3 && hours <= 11) {
                hours += 12;
              }
            }
          }

          return hours * 60 + minutes;
        };

        const startMin = parseSegment(startSegment, endSegment);
        const endMin = parseSegment(endSegment, startSegment);

        if (startMin === null || endMin === null) return null;

        let finalEnd = endMin;
        if (finalEnd <= startMin) {
          finalEnd += 1440;
        }

        return { start: startMin, end: finalEnd };
      };

      for (let i = 0; i < processedChambers.length; i++) {
        for (let j = i + 1; j < processedChambers.length; j++) {
          const chA = processedChambers[i];
          const chB = processedChambers[j];

          const daysA = normalizeDaysForConflict(chA.visitingDays);
          const daysB = normalizeDaysForConflict(chB.visitingDays);
          const commonDays = daysA.filter(d => daysB.includes(d));

          if (commonDays.length > 0) {
            const rangeA = parseTimeRangeToMinutes(chA.visitingTime);
            const rangeB = parseTimeRangeToMinutes(chB.visitingTime);

            if (rangeA && rangeB) {
              const isOverlapping = rangeA.start < rangeB.end && rangeB.start < rangeA.end;
              if (isOverlapping) {
                const dayNamesBn = commonDays.map(d => DAY_ENGLISH_TO_BANGLA[d] || d).join(', ');
                return setError(`সময়সূচি সাংঘর্ষিক! ডাক্তার ${dayNamesBn}-এ একই সময়ে দুটি ভিন্ন চেম্বারে বসতে পারবেন না। অনুগ্রহ করে চেম্বারের দিন বা সময় পরিবর্তন করুন।`);
              }
            }
          }
        }
      }
    }

    const matchedSpecialty = specialties.find(s => s.id === specialtyId);
    const primaryChamber = processedChambers[0] || {};

    const doctorPayload = {
      id: doctor?.id || doctor?.doctorId || undefined,
      doctorId: doctor?.doctorId || doctor?.id || undefined,
      name: name.trim(),
      bmdc: bmdc.trim(),
      bmdc_number: bmdc.trim(),
      specialtyId: specialtyId,
      specialty_id: specialtyId,
      specialty: matchedSpecialty?.nameBn || doctor?.specialty || 'মেডিসিন',
      specialtyNameBn: matchedSpecialty?.nameBn || doctor?.specialty || 'মেডিসিন',
      specialtyNameEn: matchedSpecialty?.nameEn || '',
      degrees: degrees.trim(),
      designation: designation.trim(),
      workplace: workplace.trim(),
      about: about.trim(),
      biography: about.trim(),
      photoUrl: photoUrl.trim(),
      photo_url: photoUrl.trim(),
      psPhone: psPhone.trim() || undefined,
      ps_phone: psPhone.trim() || undefined,
      priorityIndex: cleanNumberInput(priorityIndex) || 10,
      display_priority: cleanNumberInput(priorityIndex) || 10,
      rating: parseFloat(rating) || 5.0,
      reviewCount: parseInt(reviewCount) || 0,
      isActive: isActive,
      is_active: isActive,

      // Flat chamber properties
      facility: primaryChamber.facilityName || '',
      facilityName: primaryChamber.facilityName || '',
      facilityAddress: primaryChamber.facilityAddress || '',
      chamberRoomNo: primaryChamber.roomNo || '',
      chamberFloor: primaryChamber.floor || 'নিচতলা',
      chamberBuildingStand: primaryChamber.buildingStand || 'মেইন বিল্ডিং',
      visitingDays: primaryChamber.visitingDays || [],
      visitingTime: primaryChamber.visitingTime || '',
      feesNew: primaryChamber.feeNew || 0,
      feesOld: primaryChamber.feeOld || 0,
      chambers: processedChambers
    };

    setIsSubmitting(true);
    try {
      await onSave(doctorPayload, processedChambers);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ডাক্তার তথ্য সংরক্ষণে ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              {doctor ? 'চিকিৎসক এডিট প্যানেল' : 'নতুন চিকিৎসক সংযুক্তি'}
            </span>
            <h2 className="text-base font-bold text-slate-800 mt-1">
              {doctor ? `ডা. ${doctor.name} - এর বিস্তারিত তথ্য` : 'নতুন চিকিৎসক ও চেম্বার যুক্ত করুন'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-white transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Feedback alerts */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-bold text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs font-bold text-amber-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          )}

          {/* SECTION A: BASIC PROFILE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-4.5 w-4.5 text-[#0284C7]" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">১. চিকিৎসকের মৌলিক পরিচিতি ও যোগ্যতা (Basic Profile)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Profile Inputs */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Doctor Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">ডাক্তারের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ডা. আফিফা রহমান"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* BMDC Registration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">BM&DC রেজিঃ (রেজিস্ট্রেশন নম্বর)</label>
                  <input
                    type="text"
                    placeholder="যেমন: A-65432"
                    value={bmdc}
                    onChange={(e) => setBmdc(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-[#0284C7] bg-sky-50/20 outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Specialty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">বিশেষজ্ঞতা / ক্যাটাগরি *</label>
                  <select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] cursor-pointer"
                  >
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nameBn} ({spec.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Degrees */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">যোগ্যতা / ডিগ্রি সমূহ *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: MBBS, FCPS (Gynae), MS"
                    value={degrees}
                    onChange={(e) => setDegrees(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Designation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">পদবী (Designation) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সহকারী অধ্যাপিকা ও বিভাগীয় প্রধান"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  />
                </div>

                {/* Workplace */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500">বর্তমান কর্মস্থল (Workplace) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: রাজশাহী মেডিকেল কলেজ ও হাসপাতাল"
                    value={workplace}
                    onChange={(e) => setWorkplace(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                  />
                </div>

              </div>

              {/* Profile Image Column (Upload with Drag-and-Drop + URL Input) */}
              <div className="md:col-span-1">
                <div className="flex flex-col gap-1.5 h-full">
                  <label className="text-[11px] font-bold text-slate-500">প্রোফাইল ফটো (Profile Photo)</label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center transition min-h-[140px] ${
                      dragActive ? 'border-[#0284C7] bg-sky-50/50' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-6 w-6 text-[#0284C7] animate-spin mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">ছবি আপলোড হচ্ছে...</span>
                      </div>
                    ) : photoUrl ? (
                      <div className="relative group">
                        <img 
                          src={photoUrl} 
                          alt="Doctor" 
                          className="h-20 w-20 object-cover rounded-full border border-slate-200 bg-white shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full border border-white transition cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-6 w-6 text-slate-400 mb-1.5" />
                        <span className="text-[10px] font-bold text-slate-600 block">ইমেজ ফাইল ড্র্যাগ করুন অথবা</span>
                        <label className="mt-1 inline-flex items-center justify-center rounded bg-[#0284C7] px-2 py-1 text-[9px] font-extrabold text-white hover:bg-[#0274af] cursor-pointer transition">
                          ব্রাউজ করুন
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>
                      </>
                    )}
                  </div>
                  {/* Photo URL option */}
                  <input
                    type="text"
                    placeholder="অথবা সরাসরি ফটো লিংক (URL) দিন"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-1.5 px-3 text-[10px] font-bold text-slate-800 bg-white outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

            </div>

            {/* Private Assistant/PS Phone & Ratings / Bio Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Doctor Assistant/PS Private Number */}
              <div className="md:col-span-2 flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                    <span>সহকারীর মোবাইল নম্বর (PS / Assistant) *</span>
                  </label>
                  <span className="inline-flex items-center gap-1 rounded bg-amber-200 px-1.5 py-0.5 text-[8px] font-black text-amber-900">
                    <Lock className="h-2.5 w-2.5" />
                    <span>শুধুমাত্র অ্যাডমিন</span>
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 01712345678"
                  value={psPhone}
                  onChange={(e) => setPsPhone(e.target.value)}
                  className="w-full rounded-lg border border-amber-300 py-1.5 px-3 text-xs font-bold text-slate-800 bg-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Display Priority Index */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">প্রদর্শন অগ্রাধিকার (Priority Index)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="যেমন: 10"
                  value={priorityIndex}
                  onChange={(e) => setPriorityIndex(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Status Switches */}
              <div className="flex flex-col justify-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 block">স্ট্যাটাস (Status)</span>
                <label className="flex items-center gap-2.5 cursor-pointer mt-1 font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#0284C7] h-4.5 w-4.5 focus:ring-0"
                  />
                  <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                    {isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                  </span>
                </label>
              </div>

            </div>

            {/* Custom Review Ratings & Custom Bio Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">কাস্টম রেটিং (Rating)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] cursor-pointer"
                >
                  <option value="5.0">5.0 ★ (ডিফল্ট)</option>
                  <option value="4.9">4.9 ★</option>
                  <option value="4.8">4.8 ★</option>
                  <option value="4.7">4.7 ★</option>
                  <option value="4.6">4.6 ★</option>
                  <option value="4.5">4.5 ★</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500">রিভিউ সংখ্যা (Total Reviews)</label>
                <input
                  type="number"
                  min="0"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* Biography (Brief bio/about text) */}
              <div className="flex flex-col gap-1.5 md:col-span-3">
                <label className="text-[11px] font-bold text-slate-500">চিকিৎসকের সংক্ষিপ্ত বায়োগ্রাফি / পরিচিতি (About Doctor)</label>
                <textarea
                  rows={2}
                  placeholder="যেমন: ডা. আফিফা রহমান প্রসূতি ও স্ত্রীরোগ বিভাগে সুপরিচিত। বন্ধ্যাত্ব চিকিৎসা এবং হাই-রিস্ক প্রেগন্যান্সি ডেলিভারিতে উনার বিশেষ অভিজ্ঞতা ও সুনাম রয়েছে।"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[#0284C7] leading-relaxed"
                />
              </div>

            </div>

          </div>

          {/* SECTION B: CHAMBER & SCHEDULE MANAGEMENT */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-[#0284C7]" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  ২. চেম্বার ও রোগী দেখার সময়সূচী (Chamber / Schedule)
                </h3>
              </div>
              
              {/* Single / Multi-Chamber Selector Slider-Tab */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsMultiChamber(false);
                    if (chambers.length > 1) {
                      // Prompt warning or slice to 1
                      setChambers([chambers[0]]);
                    }
                  }}
                  className={`rounded-md px-3.5 py-1 text-[11px] font-black transition cursor-pointer ${
                    !isMultiChamber 
                      ? 'bg-white text-slate-800 shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  একক চেম্বার (Single)
                </button>
                <button
                  type="button"
                  onClick={() => setIsMultiChamber(true)}
                  className={`rounded-md px-3.5 py-1 text-[11px] font-black transition cursor-pointer ${
                    isMultiChamber 
                      ? 'bg-[#0284C7] text-white shadow-xs' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  বহু-চেম্বার (Multi-Chamber)
                </button>
              </div>
            </div>

            {/* Chamber List Section */}
            <div className="space-y-6">
              {chambers.map((ch, idx) => (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 relative animate-in slide-in-from-bottom-2 duration-150"
                >
                  {/* Chamber Header & Delete option if Multi-chamber */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="inline-flex items-center gap-1 rounded bg-[#0284C7]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#0284C7] border border-[#0284C7]/20">
                      চেম্বার পজিশন স্লট #০{idx + 1}
                    </span>
                    {isMultiChamber && chambers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChamberField(idx)}
                        className="flex items-center gap-1 rounded bg-rose-50 border border-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100 cursor-pointer transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>চেম্বারটি মুছুন</span>
                      </button>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Facility Select */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500">হাসপাতাল / চিকিৎসাকেন্দ্র নির্বাচন *</label>
                      <select
                        value={ch.facility_id || ch.facilityId || ''}
                        onChange={(e) => handleChamberChange(idx, 'facility_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7] cursor-pointer"
                      >
                        <option value="">-- চিকিৎসাকেন্দ্র নির্বাচন করুন --</option>
                        {facilities.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name} - ({fac.areaAddress})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Room No */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500">রুম নম্বর *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ৪০৫"
                        value={ch.roomNo}
                        onChange={(e) => updateChamberField(idx, 'roomNo', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    {/* Floor Guide */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500">ফ্লোর / কত তলা *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ৪র্থ তলা"
                        value={ch.floor}
                        onChange={(e) => updateChamberField(idx, 'floor', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    {/* Building Stand */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-500">বিল্ডিং/উইং নির্দেশিকা</label>
                      <input
                        type="text"
                        placeholder="যেমন: মেইন ভবন, লিফট-৩"
                        value={ch.buildingStand}
                        onChange={(e) => updateChamberField(idx, 'buildingStand', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    {/* Consulting Fee Fields */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-500">নতুন রোগী ভিজিট ফি *</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 800"
                          value={ch.feeNew}
                          onChange={(e) => updateChamberField(idx, 'feeNew', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-[#0D9488] outline-none focus:border-[#0284C7]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-slate-400">পুরাতন রোগী ভিজিট ফি</label>
                        <input
                          type="text"
                          placeholder="যেমন: 500"
                          value={ch.feeOld}
                          onChange={(e) => updateChamberField(idx, 'feeOld', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 py-2 px-2.5 text-xs font-bold text-slate-500 outline-none focus:border-[#0284C7]"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Chamber Days Checkbox List */}
                  <div className="flex flex-col gap-2 rounded-xl bg-white border border-slate-150 p-4">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>চেম্বার বসার দিনসমূহ (কমপক্ষে ১টি সিলেক্ট করুন) *</span>
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1.5">
                      {DAYS_LIST.map((day) => {
                        const checked = (ch.visitingDays || []).includes(day);
                        return (
                          <label 
                            key={day} 
                            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-black cursor-pointer transition select-none ${
                              checked 
                                ? 'bg-sky-50 border-[#0284C7] text-[#0284C7]' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleDayToggle(idx, day)}
                              className="hidden"
                            />
                            <span>{day}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule Time Range */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>রোগী দেখার সময়সূচী (Time Slot Schedule Text) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: বিকাল ৫:০০ - রাত ৮:৩০ (বৃহস্পতিবার বিকাল ৪:০০)"
                      value={ch.visitingTime}
                      onChange={(e) => updateChamberField(idx, 'visitingTime', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs font-bold text-slate-800 outline-none focus:border-[#0284C7]"
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Add Chamber Button if Multi-chamber */}
            {isMultiChamber && (
              <button
                type="button"
                onClick={addChamberField}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0284C7] hover:border-[#0274af] bg-sky-50/20 py-3.5 text-xs font-bold text-[#0284C7] hover:bg-sky-50/50 cursor-pointer transition duration-150"
              >
                <Plus className="h-4 w-4" />
                <span>নতুন আরও একটি চেম্বার যোগ করুন</span>
              </button>
            )}

          </div>

        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer transition"
          >
            বাতিল করুন
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-sky-100 disabled:opacity-50 cursor-pointer transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <span>চিকিৎসক তথ্য সংরক্ষণ করুন</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
