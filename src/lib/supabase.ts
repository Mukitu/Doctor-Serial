import { createClient } from '@supabase/supabase-js';
import { Doctor, Appointment, District, Specialty, Facility, AdminProfile } from '../types';
import { 
  DISTRICTS, 
  POPULAR_SPECIALTIES, 
  FACILITIES, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS 
} from '../data/mockData';

// Fetch credentials from Vite environment
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your-supabase-project-url' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials not found or placeholder values used. Falling back to persistent client-side LocalStorage database.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 1. DISTRICTS CRUD
// ==========================================

export async function getDistricts(): Promise<District[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_districts');
    if (!saved) {
      const init: District[] = DISTRICTS.map((d, i) => ({
        id: d.id,
        nameBn: d.name,
        nameEn: d.nameEn,
        isActive: true,
        displayOrder: i
      }));
      localStorage.setItem('sheba_districts', JSON.stringify(init));
      return init;
    }
    return JSON.parse(saved);
  }

  try {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Supabase] Failed to fetch districts table:', error.message, error.details, error.hint);
      throw error;
    }
    return (data || []).map(d => ({
      id: d.id,
      nameBn: d.name_bn,
      nameEn: d.name_en,
      isActive: d.is_active,
      displayOrder: d.display_order
    }));
  } catch (err: any) {
    console.error('[Supabase getDistricts error]:', err?.message || err);
    const saved = localStorage.getItem('sheba_districts');
    if (saved) return JSON.parse(saved);
    return DISTRICTS.map((d, i) => ({
      id: d.id,
      nameBn: d.name,
      nameEn: d.nameEn,
      isActive: true,
      displayOrder: i
    }));
  }
}

export async function addDistrict(dist: Omit<District, 'id'>): Promise<void> {
  const districts = await getDistricts();
  const newId = `dist-${Date.now()}`;
  const newItem: District = { ...dist, id: newId };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_districts', JSON.stringify([...districts, newItem]));
    return;
  }

  try {
    const { error } = await supabase
      .from('districts')
      .insert({
        id: crypto.randomUUID(),
        name_bn: dist.nameBn,
        name_en: dist.nameEn,
        display_order: dist.displayOrder,
        is_active: dist.isActive
      });
    if (error) throw error;
  } catch (err) {
    console.error('Error inserting district:', err);
    throw err;
  }
}

export async function updateDistrict(dist: District): Promise<void> {
  const districts = await getDistricts();
  if (!isSupabaseConfigured || !supabase) {
    const updated = districts.map(d => d.id === dist.id ? dist : d);
    localStorage.setItem('sheba_districts', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('districts')
      .update({
        name_bn: dist.nameBn,
        name_en: dist.nameEn,
        display_order: dist.displayOrder,
        is_active: dist.isActive
      })
      .eq('id', dist.id);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating district:', err);
    throw err;
  }
}

export async function deleteDistrict(id: string): Promise<void> {
  const districts = await getDistricts();
  if (!isSupabaseConfigured || !supabase) {
    const filtered = districts.filter(d => d.id !== id);
    localStorage.setItem('sheba_districts', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('districts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting district:', err);
    throw err;
  }
}


// ==========================================
// 2. SPECIALTIES CRUD
// ==========================================

export async function getSpecialties(): Promise<Specialty[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_specialties');
    if (!saved) {
      const init: Specialty[] = POPULAR_SPECIALTIES.map((s, i) => ({
        id: s.id,
        nameBn: s.name,
        nameEn: s.labelEn,
        iconName: s.icon,
        isActive: true,
        displayOrder: i
      }));
      localStorage.setItem('sheba_specialties', JSON.stringify(init));
      return init;
    }
    return JSON.parse(saved);
  }

  try {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Supabase] Failed to fetch specialties table:', error.message, error.details, error.hint);
      throw error;
    }
    return (data || []).map(s => ({
      id: s.id,
      nameBn: s.name_bn,
      nameEn: s.name_en,
      iconName: s.icon_name,
      isActive: s.is_active,
      displayOrder: s.display_order
    }));
  } catch (err: any) {
    console.error('[Supabase getSpecialties error]:', err?.message || err);
    const saved = localStorage.getItem('sheba_specialties');
    if (saved) return JSON.parse(saved);
    return POPULAR_SPECIALTIES.map((s, i) => ({
      id: s.id,
      nameBn: s.name,
      nameEn: s.labelEn,
      iconName: s.icon,
      isActive: true,
      displayOrder: i
    }));
  }
}

export async function addSpecialty(spec: Omit<Specialty, 'id'>): Promise<void> {
  const specialties = await getSpecialties();
  const newId = `spec-${Date.now()}`;
  const newItem: Specialty = { ...spec, id: newId };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_specialties', JSON.stringify([...specialties, newItem]));
    return;
  }

  try {
    const { error } = await supabase
      .from('specialties')
      .insert({
        id: crypto.randomUUID(),
        name_bn: spec.nameBn,
        name_en: spec.nameEn,
        icon_name: spec.iconName,
        display_order: spec.displayOrder,
        is_active: spec.isActive
      });
    if (error) throw error;
  } catch (err) {
    console.error('Error inserting specialty:', err);
    throw err;
  }
}

export async function updateSpecialty(spec: Specialty): Promise<void> {
  const specialties = await getSpecialties();
  if (!isSupabaseConfigured || !supabase) {
    const updated = specialties.map(s => s.id === spec.id ? spec : s);
    localStorage.setItem('sheba_specialties', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('specialties')
      .update({
        name_bn: spec.nameBn,
        name_en: spec.nameEn,
        icon_name: spec.iconName,
        display_order: spec.displayOrder,
        is_active: spec.isActive
      })
      .eq('id', spec.id);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating specialty:', err);
    throw err;
  }
}

export async function deleteSpecialty(id: string): Promise<void> {
  const specialties = await getSpecialties();
  if (!isSupabaseConfigured || !supabase) {
    const filtered = specialties.filter(s => s.id !== id);
    localStorage.setItem('sheba_specialties', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting specialty:', err);
    throw err;
  }
}


// ==========================================
// 3. FACILITIES CRUD
// ==========================================

export async function getFacilities(): Promise<Facility[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_facilities');
    if (!saved) {
      const init: Facility[] = FACILITIES.map(f => ({
        id: f.id,
        districtId: 'rajshahi',
        name: f.name,
        areaAddress: 'লক্ষ্মীপুর, রাজশাহী সদর',
        contactPhone: '০১৭০০-০০০০০০',
        isVip: f.id === 'popular' || f.id === 'amana',
        isActive: true,
        districtName: 'রাজশাহী'
      }));
      localStorage.setItem('sheba_facilities', JSON.stringify(init));
      return init;
    }
    return JSON.parse(saved);
  }

  try {
    const [facRes, distRes] = await Promise.all([
      supabase.from('facilities').select('*').order('name', { ascending: true }),
      supabase.from('districts').select('*')
    ]);

    if (facRes.error) {
      console.error('[Supabase] Failed to fetch facilities table:', facRes.error.message, facRes.error.details, facRes.error.hint);
      throw facRes.error;
    }
    if (distRes.error) {
      console.warn('[Supabase] Non-fatal: failed to fetch districts for facility mapping:', distRes.error.message);
    }
    const facData = facRes.data || [];
    const distData = distRes.data || [];
    const distMap = new Map(distData.map((d: any) => [d.id, d.name_bn]));

    return facData.map((f: any) => ({
      id: f.id,
      districtId: f.district_id,
      name: f.name,
      areaAddress: f.area_address,
      contactPhone: f.contact_phone,
      isVip: f.is_vip,
      isActive: f.is_active,
      districtName: distMap.get(f.district_id) || 'রাজশাহী'
    }));
  } catch (err: any) {
    console.error('[Supabase getFacilities error]:', err?.message || err);
    const saved = localStorage.getItem('sheba_facilities');
    if (saved) return JSON.parse(saved);
    return FACILITIES.map(f => ({
      id: f.id,
      districtId: 'rajshahi',
      name: f.name,
      areaAddress: 'লক্ষ্মীপুর, রাজশাহী সদর',
      contactPhone: '০১৭০০-০০০০০০',
      isVip: f.id === 'popular' || f.id === 'amana',
      isActive: true,
      districtName: 'রাজশাহী'
    }));
  }
}

export async function addFacility(fac: Omit<Facility, 'id'>): Promise<void> {
  const facilities = await getFacilities();
  const newId = `fac-${Date.now()}`;
  const newItem: Facility = { ...fac, id: newId };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_facilities', JSON.stringify([...facilities, newItem]));
    return;
  }

  try {
    const { error } = await supabase
      .from('facilities')
      .insert({
        id: crypto.randomUUID(),
        district_id: fac.districtId,
        name: fac.name,
        area_address: fac.areaAddress,
        contact_phone: fac.contactPhone,
        is_vip: fac.isVip,
        is_active: fac.isActive
      });
    if (error) throw error;
  } catch (err) {
    console.error('Error inserting facility:', err);
    throw err;
  }
}

export async function updateFacility(fac: Facility): Promise<void> {
  const facilities = await getFacilities();
  if (!isSupabaseConfigured || !supabase) {
    const updated = facilities.map(f => f.id === fac.id ? fac : f);
    localStorage.setItem('sheba_facilities', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('facilities')
      .update({
        district_id: fac.districtId,
        name: fac.name,
        area_address: fac.areaAddress,
        contact_phone: fac.contactPhone,
        is_vip: fac.isVip,
        is_active: fac.isActive
      })
      .eq('id', fac.id);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating facility:', err);
    throw err;
  }
}

export async function deleteFacility(id: string): Promise<void> {
  const facilities = await getFacilities();
  if (!isSupabaseConfigured || !supabase) {
    const filtered = facilities.filter(f => f.id !== id);
    localStorage.setItem('sheba_facilities', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting facility:', err);
    throw err;
  }
}


// ==========================================
// 4. DOCTORS & CHAMBERS CONSOLIDATED CRUD
// ==========================================

export async function getDoctors(): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_doctors_v3');
    if (!saved) {
      localStorage.setItem('sheba_doctors_v3', JSON.stringify(INITIAL_DOCTORS));
      return INITIAL_DOCTORS;
    }
    return JSON.parse(saved);
  }

  try {
    const [docsRes, specsRes, chambersRes, facilitiesRes] = await Promise.all([
      supabase.from('doctors').select('*').order('display_priority', { ascending: true }),
      supabase.from('specialties').select('*'),
      supabase.from('chambers').select('*'),
      supabase.from('facilities').select('*')
    ]);

    if (docsRes.error) {
      console.error('[Supabase] Failed to fetch doctors table:', docsRes.error.message, docsRes.error.details, docsRes.error.hint);
      throw docsRes.error;
    }
    if (specsRes.error) {
      console.error('[Supabase] Failed to fetch specialties table for doctors:', specsRes.error.message, specsRes.error.details);
      throw specsRes.error;
    }
    if (chambersRes.error) {
      console.error('[Supabase] Failed to fetch chambers table for doctors:', chambersRes.error.message, chambersRes.error.details);
      throw chambersRes.error;
    }
    if (facilitiesRes.error) {
      console.error('[Supabase] Failed to fetch facilities table for doctors:', facilitiesRes.error.message, facilitiesRes.error.details);
      throw facilitiesRes.error;
    }

    const docs = docsRes.data || [];
    const specs = specsRes.data || [];
    const chambers = chambersRes.data || [];
    const facilities = facilitiesRes.data || [];

    const specMap = new Map(specs.map(s => [s.id, s]));
    const facilityMap = new Map(facilities.map(f => [f.id, f]));
    
    const chamberMap = new Map<string, any[]>();
    chambers.forEach(ch => {
      if (!chamberMap.has(ch.doctor_id)) {
        chamberMap.set(ch.doctor_id, []);
      }
      chamberMap.get(ch.doctor_id)!.push(ch);
    });

    const mappedList: Doctor[] = [];
    docs.forEach((doc: any) => {
      const spec = specMap.get(doc.specialty_id);
      const docChambers = chamberMap.get(doc.id) || [];
      
      if (docChambers.length === 0) {
        mappedList.push({
          id: `${doc.id}::standalone`,
          doctorId: doc.id,
          specialtyId: doc.specialty_id,
          specialtyNameBn: spec?.name_bn || '',
          specialtyNameEn: spec?.name_en || '',
          specialty: spec?.name_bn || 'মেডিসিন',
          facility: 'চেম্বার তথ্য যুক্ত করা হয়নি',
          chamberAddress: '',
          name: doc.name,
          bmdc: doc.bmdc_number || '',
          degrees: doc.degrees || '',
          designation: doc.designation || '',
          workplace: doc.workplace || '',
          photoUrl: doc.photo_url || '',
          priorityIndex: doc.display_priority || 0,
          isActive: doc.is_active,
          rating: doc.rating != null ? Number(doc.rating) : 5.0,
          reviewCount: doc.review_count || 0,
          chamberId: '',
          facilityId: '',
          facilityName: '',
          facilityAddress: '',
          facilityDistrictId: '',
          chamberRoomNo: '',
          visitingDays: [],
          visitingTime: '',
          feesNew: 0,
          feesOld: 0
        });
      } else {
        docChambers.forEach((ch: any) => {
          const fac = facilityMap.get(ch.facility_id);
          mappedList.push({
            id: `${doc.id}::${ch.id}`,
            doctorId: doc.id,
            specialtyId: doc.specialty_id,
            specialtyNameBn: spec?.name_bn || '',
            specialtyNameEn: spec?.name_en || '',
            specialty: spec?.name_bn || 'মেডিসিন',
            facility: fac?.name || '',
            chamberAddress: fac?.area_address || '',
            name: doc.name,
            bmdc: doc.bmdc_number,
            degrees: doc.degrees,
            designation: doc.designation,
            workplace: doc.workplace,
            photoUrl: doc.photo_url || '',
            priorityIndex: doc.display_priority || 0,
            isActive: doc.is_active,
            rating: doc.rating != null ? Number(doc.rating) : 5.0,
            reviewCount: doc.review_count || 0,

            // Chamber Details joined
            chamberId: ch.id,
            facilityId: ch.facility_id,
            facilityName: fac?.name || '',
            facilityAddress: fac?.area_address || '',
            facilityDistrictId: fac?.district_id || '',
            chamberRoomNo: ch.room_no || '',
            visitingDays: ch.visiting_days ? ch.visiting_days.split(',').map((d: string) => d.trim()) : [],
            visitingTime: ch.visiting_time || '',
            feesNew: ch.fee_new || 0,
            feesOld: ch.fee_old || 0
          });
        });
      }
    });

    return mappedList;
  } catch (err) {
    console.error('Error fetching joined doctors:', err);
    const saved = localStorage.getItem('sheba_doctors_v3');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  }
}

export async function addDoctor(doc: Doctor): Promise<void> {
  const doctors = await getDoctors();
  const compositeId = `${doc.doctorId || 'doc-' + Date.now()}::${doc.chamberId || 'ch-' + Date.now()}`;
  const newLocalDoc = { ...doc, id: compositeId };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_doctors_v3', JSON.stringify([newLocalDoc, ...doctors]));
    return;
  }

  try {
    const docUuid = doc.doctorId || crypto.randomUUID();
    const chamberUuid = doc.chamberId || crypto.randomUUID();

    // 1. Insert doctor profile
    const { error: docError } = await supabase
      .from('doctors')
      .insert({
        id: docUuid,
        specialty_id: doc.specialtyId,
        name: doc.name,
        bmdc_number: doc.bmdc,
        degrees: doc.degrees,
        designation: doc.designation,
        workplace: doc.workplace,
        photo_url: doc.photoUrl || '',
        display_priority: doc.priorityIndex,
        is_active: doc.isActive,
        rating: doc.rating || 5.0,
        review_count: doc.reviewCount || 0
      });

    if (docError) throw docError;

    // 2. Insert chamber specs
    const { error: chError } = await supabase
      .from('chambers')
      .insert({
        id: chamberUuid,
        doctor_id: docUuid,
        facility_id: doc.facilityId,
        room_no: doc.chamberRoomNo,
        visiting_days: doc.visitingDays.join(', '),
        visiting_time: doc.visitingTime,
        fee_new: doc.feesNew,
        fee_old: doc.feesOld
      });

    if (chError) throw chError;
  } catch (err) {
    console.error('Error adding doctor:', err);
    throw err;
  }
}

export async function updateDoctor(doc: Doctor): Promise<void> {
  const doctors = await getDoctors();
  if (!isSupabaseConfigured || !supabase) {
    const updated = doctors.map(d => d.id === doc.id ? doc : d);
    localStorage.setItem('sheba_doctors_v3', JSON.stringify(updated));
    return;
  }

  try {
    const [docId, chId] = doc.id.split('::');

    // 1. Update doctor info
    const { error: docError } = await supabase
      .from('doctors')
      .update({
        specialty_id: doc.specialtyId,
        name: doc.name,
        bmdc_number: doc.bmdc,
        degrees: doc.degrees,
        designation: doc.designation,
        workplace: doc.workplace,
        photo_url: doc.photoUrl || '',
        display_priority: doc.priorityIndex,
        is_active: doc.isActive,
        rating: doc.rating || 5.0,
        review_count: doc.reviewCount || 0
      })
      .eq('id', docId);

    if (docError) throw docError;

    // 2. Update chamber info
    if (chId) {
      const { error: chError } = await supabase
        .from('chambers')
        .update({
          facility_id: doc.facilityId,
          room_no: doc.chamberRoomNo,
          visiting_days: doc.visitingDays.join(', '),
          visiting_time: doc.visitingTime,
          fee_new: doc.feesNew,
          fee_old: doc.feesOld
        })
        .eq('id', chId);

      if (chError) throw chError;
    }
  } catch (err) {
    console.error('Error updating doctor:', err);
    throw err;
  }
}

export async function deleteDoctor(id: string): Promise<void> {
  const doctors = await getDoctors();
  if (!isSupabaseConfigured || !supabase) {
    const filtered = doctors.filter(d => d.id !== id);
    localStorage.setItem('sheba_doctors_v3', JSON.stringify(filtered));
    return;
  }

  try {
    const docId = id.split('::')[0];
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', docId);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting doctor:', err);
    throw err;
  }
}


// ==========================================
// 5. APPOINTMENTS OPERATIONS
// ==========================================

export async function getAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_appointments_v3');
    if (!saved) {
      localStorage.setItem('sheba_appointments_v3', JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS.map(app => ({
        ...app,
        patientPhone: app.patientPhone || app.patientMobile || '',
        patientMobile: app.patientMobile || app.patientPhone || ''
      }));
    }
    return JSON.parse(saved).map((app: any) => ({
      ...app,
      patientPhone: app.patientPhone || app.patientMobile || '',
      patientMobile: app.patientMobile || app.patientPhone || ''
    }));
  }

  try {
    const [appointmentsRes, docsRes, chambersRes, facilitiesRes, specsRes] = await Promise.all([
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('doctors').select('*'),
      supabase.from('chambers').select('*'),
      supabase.from('facilities').select('*'),
      supabase.from('specialties').select('*')
    ]);

    if (appointmentsRes.error) throw appointmentsRes.error;
    if (docsRes.error) throw docsRes.error;
    if (chambersRes.error) throw chambersRes.error;
    if (facilitiesRes.error) throw facilitiesRes.error;
    if (specsRes.error) throw specsRes.error;

    const appointmentsData = appointmentsRes.data || [];
    const docs = docsRes.data || [];
    const chambers = chambersRes.data || [];
    const facilities = facilitiesRes.data || [];
    const specs = specsRes.data || [];

    const docMap = new Map(docs.map(d => [d.id, d]));
    const chamberMap = new Map(chambers.map(c => [c.id, c]));
    const facilityMap = new Map(facilities.map(f => [f.id, f]));
    const specMap = new Map(specs.map(s => [s.id, s]));

    return appointmentsData.map((app: any) => {
      const doc = docMap.get(app.doctor_id);
      const spec = doc ? specMap.get(doc.specialty_id) : null;
      const ch = chamberMap.get(app.chamber_id);
      const fac = ch ? facilityMap.get(ch.facility_id) : null;
      const phone = app.patient_phone || '';

      return {
        id: app.booking_code,
        doctorId: app.doctor_id,
        doctorName: doc?.name || '',
        doctorDegrees: doc?.degrees || '',
        doctorSpecialty: spec?.name_bn || '',
        chamberId: app.chamber_id,
        facilityName: fac?.name || '',
        facilityAddress: fac?.area_address || '',
        patientName: app.patient_name,
        patientAge: app.patient_age,
        patientPhone: phone,
        patientMobile: phone,
        preferredDate: app.preferred_date,
        status: app.status as Appointment['status'],
        serialNo: app.serial_no || undefined,
        assignedRoomNo: app.assigned_room_no || undefined,
        confirmedVisitingTime: app.confirmed_visiting_time || undefined,
        rejectionReason: app.rejection_reason || undefined,
        adminNotes: app.admin_notes || undefined,
        createdAt: app.created_at,
        updatedAt: app.updated_at
      };
    });
  } catch (err) {
    console.error('Error loading appointments:', err);
    const saved = localStorage.getItem('sheba_appointments_v3');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addAppointment(app: Appointment): Promise<void> {
  const appointments = await getAppointments();
  const phone = app.patientMobile || app.patientPhone;
  const newLocalApp = { ...app, patientPhone: phone, patientMobile: phone };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_appointments_v3', JSON.stringify([newLocalApp, ...appointments]));
    return;
  }

  try {
    const [docId, chId] = app.doctorId.split('::');
    
    // Fallback look-up if chamberId is missing from payload
    let targetChamberId = app.chamberId || chId;
    if (!targetChamberId) {
      const { data: chambers } = await supabase
        .from('chambers')
        .select('id')
        .eq('doctor_id', docId)
        .limit(1);
      if (chambers && chambers.length > 0) {
        targetChamberId = chambers[0].id;
      } else {
        throw new Error('No chamber schedule found for this doctor.');
      }
    }

    const { error } = await supabase
      .from('appointments')
      .insert({
        booking_code: app.id,
        doctor_id: docId,
        chamber_id: targetChamberId,
        patient_name: app.patientName,
        patient_age: app.patientAge,
        patient_phone: phone,
        preferred_date: app.preferredDate,
        status: 'Pending'
      });

    if (error) throw error;
  } catch (err) {
    console.error('Error creating appointment:', err);
    throw err;
  }
}

export interface ConfirmAppointmentParams {
  bookingCode: string;
  serialNo: string;
  assignedRoomNo: string;
  confirmedVisitingTime: string;
  adminNotes?: string;
}

export async function confirmAppointment(params: ConfirmAppointmentParams): Promise<void> {
  const appointments = await getAppointments();
  const nowStr = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const updated = appointments.map(app => {
      if (app.id === params.bookingCode) {
        return {
          ...app,
          status: 'Confirmed' as const,
          serialNo: params.serialNo,
          assignedRoomNo: params.assignedRoomNo,
          confirmedVisitingTime: params.confirmedVisitingTime,
          adminNotes: params.adminNotes,
          updatedAt: nowStr
        };
      }
      return app;
    });
    localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'Confirmed',
        serial_no: params.serialNo,
        assigned_room_no: params.assignedRoomNo,
        confirmed_visiting_time: params.confirmedVisitingTime,
        admin_notes: params.adminNotes || null,
        updated_at: nowStr
      })
      .eq('booking_code', params.bookingCode);

    if (error) throw error;
  } catch (err) {
    console.error('Error confirming appointment:', err);
    throw err;
  }
}

export interface RejectAppointmentParams {
  bookingCode: string;
  rejectionReason: string;
}

export async function rejectAppointment(params: RejectAppointmentParams): Promise<void> {
  const appointments = await getAppointments();
  const nowStr = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const updated = appointments.map(app => {
      if (app.id === params.bookingCode) {
        return {
          ...app,
          status: 'Rejected' as const,
          rejectionReason: params.rejectionReason,
          updatedAt: nowStr
        };
      }
      return app;
    });
    localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'Rejected',
        rejection_reason: params.rejectionReason,
        updated_at: nowStr
      })
      .eq('booking_code', params.bookingCode);

    if (error) throw error;
  } catch (err) {
    console.error('Error rejecting appointment:', err);
    throw err;
  }
}

export async function resetAppointmentToPending(bookingCode: string): Promise<void> {
  const appointments = await getAppointments();
  const nowStr = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const updated = appointments.map(app => {
      if (app.id === bookingCode) {
        return {
          ...app,
          status: 'Pending' as const,
          serialNo: undefined,
          assignedRoomNo: undefined,
          confirmedVisitingTime: undefined,
          rejectionReason: undefined,
          updatedAt: nowStr
        };
      }
      return app;
    });
    localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'Pending',
        serial_no: null,
        assigned_room_no: null,
        confirmed_visiting_time: null,
        rejection_reason: null,
        updated_at: nowStr
      })
      .eq('booking_code', bookingCode);

    if (error) throw error;
  } catch (err) {
    console.error('Error resetting appointment:', err);
    throw err;
  }
}

export async function updateAppointmentStatus(bookingCode: string, status: Appointment['status']): Promise<void> {
  const appointments = await getAppointments();
  const nowStr = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const updated = appointments.map(app => {
      if (app.id === bookingCode) {
        return {
          ...app,
          status,
          updatedAt: nowStr
        };
      }
      return app;
    });
    localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({
        status,
        updated_at: nowStr
      })
      .eq('booking_code', bookingCode);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating appointment status:', err);
    throw err;
  }
}

// ==========================================
// 9. ADMIN PROFILES & AUTH MANAGEMENT
// ==========================================

export async function signIn(email: string, password: string): Promise<AdminProfile> {
  if (!isSupabaseConfigured || !supabase) {
    const admins = await getAdmins();
    const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) {
      throw new Error('ভুল ইমেইল অথবা পাসওয়ার্ড।');
    }
    localStorage.setItem('sheba_current_admin', JSON.stringify(admin));
    return admin;
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('ইউজার সেশন তৈরি করা যায়নি।');

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      throw new Error('আপনার অ্যাকাউন্টটির অ্যাডমিন অনুমতি নেই।');
    }

    const admin: AdminProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || '',
      role: profile.role as 'super_admin' | 'admin',
      createdAt: profile.created_at,
      createdBy: profile.created_by || undefined
    };

    localStorage.setItem('sheba_current_admin', JSON.stringify(admin));
    return admin;
  } catch (err: any) {
    console.error('Error in signIn:', err);
    throw new Error(err.message || 'লগইন করতে ব্যর্থ হয়েছে।');
  }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem('sheba_current_admin');
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Error in signOut:', err);
  }
}

export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  const local = localStorage.getItem('sheba_current_admin');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }

  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    const admin: AdminProfile = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || '',
      role: profile.role as 'super_admin' | 'admin',
      createdAt: profile.created_at,
      createdBy: profile.created_by || undefined
    };

    localStorage.setItem('sheba_current_admin', JSON.stringify(admin));
    return admin;
  } catch (err) {
    console.error('Error in getCurrentAdmin:', err);
    return null;
  }
}

export async function getAdmins(): Promise<AdminProfile[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_admins');
    if (!saved) {
      const init: AdminProfile[] = [
        {
          id: 'super-admin-uuid',
          email: 'nishat.af27@gmail.com',
          fullName: 'নিশাত আফরোজ (Super Admin)',
          role: 'super_admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'admin-uuid-1',
          email: 'admin@sebaserial.com',
          fullName: 'সহকারী ব্যবস্থাপক (Admin)',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('sheba_admins', JSON.stringify(init));
      return init;
    }
    return JSON.parse(saved);
  }

  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name || '',
      role: p.role as 'super_admin' | 'admin',
      createdAt: p.created_at,
      createdBy: p.created_by || undefined
    }));
  } catch (err) {
    console.error('Error in getAdmins:', err);
    throw err;
  }
}

export async function createAdminUser(
  email: string,
  password:  string,
  fullName: string,
  role: 'super_admin' | 'admin'
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const admins = await getAdmins();
    const newAdmin: AdminProfile = {
      id: `admin-${Date.now()}`,
      email,
      fullName,
      role,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('sheba_admins', JSON.stringify([newAdmin, ...admins]));
    return;
  }

  try {
    const { error } = await supabase.rpc('create_admin_user', {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
      p_role: role
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Error creating admin user:', err);
    throw new Error(err.message || 'অ্যাডমিন অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে।');
  }
}

export async function updateAdminRole(userId: string, role: 'super_admin' | 'admin'): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const admins = await getAdmins();
    const updated = admins.map(a => a.id === userId ? { ...a, role } : a);
    localStorage.setItem('sheba_admins', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase.rpc('update_admin_role', {
      p_user_id: userId,
      p_role: role
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Error updating admin role:', err);
    throw new Error(err.message || 'অ্যাডমিন রোল পরিবর্তন করতে ব্যর্থ হয়েছে।');
  }
}

export async function revokeAdminAccess(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const admins = await getAdmins();
    const updated = admins.filter(a => a.id !== userId);
    localStorage.setItem('sheba_admins', JSON.stringify(updated));
    return;
  }

  try {
    const { error } = await supabase.rpc('revoke_admin_access', {
      p_user_id: userId
    });

    if (error) throw error;
  } catch (err: any) {
    console.error('Error revoking admin access:', err);
    throw new Error(err.message || 'অ্যাডমিন অ্যাকাউন্ট মুছে ফেলতে ব্যর্থ হয়েছে।');
  }
}

