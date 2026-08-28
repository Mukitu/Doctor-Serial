import { createClient } from '@supabase/supabase-js';
import { Doctor, Appointment, District, Specialty, Facility, AdminProfile, Review, BlogPost, PromoBanner } from '../types';
import { 
  DISTRICTS, 
  POPULAR_SPECIALTIES, 
  FACILITIES, 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS
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
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
      },
    })
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
    
    const mapped = (data || []).map(d => ({
      id: d.id,
      nameBn: d.name_bn,
      nameEn: d.name_en,
      isActive: d.is_active,
      displayOrder: d.display_order
    }));
    localStorage.setItem('sheba_districts', JSON.stringify(mapped));
    return mapped;
  } catch (err: any) {
    console.error('[Supabase getDistricts error]:', err?.message || err);
    const saved = localStorage.getItem('sheba_districts');
    if (saved) return JSON.parse(saved);
    return [];
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

    const mapped = (data || []).map(s => ({
      id: s.id,
      nameBn: s.name_bn,
      nameEn: s.name_en,
      iconName: s.icon_name,
      isActive: s.is_active,
      displayOrder: s.display_order
    }));
    localStorage.setItem('sheba_specialties', JSON.stringify(mapped));
    return mapped;
  } catch (err: any) {
    console.error('[Supabase getSpecialties error]:', err?.message || err);
    const saved = localStorage.getItem('sheba_specialties');
    if (saved) return JSON.parse(saved);
    return [];
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
    return [];
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
          about: doc.about || doc.biography || '',
          psPhone: doc.ps_phone || '',
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
          chamberFloor: 'নিচতলা',
          chamberBuildingStand: 'মেইন বিল্ডিং',
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
            about: doc.about || doc.biography || '',
            psPhone: doc.ps_phone || '',
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
            chamberFloor: ch.floor || 'নিচতলা',
            chamberBuildingStand: ch.building_stand || 'মেইন বিল্ডিং',
            visitingDays: ch.visiting_days ? ch.visiting_days.split(',').map((d: string) => d.trim()) : [],
            visitingTime: ch.visiting_time || '',
            feesNew: ch.fee_new || 0,
            feesOld: ch.fee_old || 0
          });
        });
      }
    });

    localStorage.setItem('sheba_doctors_v3', JSON.stringify(mappedList));
    return mappedList;
  } catch (err) {
    console.error('Error fetching joined doctors:', err);
    const saved = localStorage.getItem('sheba_doctors_v3');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addDoctor(doc: Doctor): Promise<void> {
  const doctors = await getDoctors();
  const compositeId = `${doc.doctorId || 'doc-' + Date.now()}::${doc.chamberId || 'ch-' + Date.now()}`;
  const newLocalDoc = { ...doc, id: compositeId };

  // Always update local cache for instant UI feedback
  localStorage.setItem('sheba_doctors_v3', JSON.stringify([newLocalDoc, ...doctors.filter(d => d.id !== compositeId)]));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const docUuid = doc.doctorId || crypto.randomUUID();
    const chamberUuid = doc.chamberId || crypto.randomUUID();

    // 1. Insert doctor profile
    const insertPayload: any = {
      id: docUuid,
      specialty_id: doc.specialtyId,
      name: doc.name,
      bmdc_number: doc.bmdc,
      degrees: doc.degrees,
      designation: doc.designation,
      workplace: doc.workplace,
      ps_phone: doc.psPhone || null,
      photo_url: doc.photoUrl || '',
      display_priority: doc.priorityIndex,
      is_active: doc.isActive,
      rating: doc.rating || 5.0,
      review_count: doc.reviewCount || 0
    };

    if (doc.about) {
      insertPayload.about = doc.about;
    }

    const { error: docError } = await supabase
      .from('doctors')
      .insert(insertPayload);

    if (docError) {
      // If error is about missing 'about' column, retry without 'about'
      if (docError.message?.includes('about') || docError.message?.includes('column')) {
        delete insertPayload.about;
        const { error: retryError } = await supabase.from('doctors').insert(insertPayload);
        if (retryError) throw retryError;
      } else {
        throw docError;
      }
    }

    // 2. Insert chamber specs
    const { error: chError } = await supabase
      .from('chambers')
      .insert({
        id: chamberUuid,
        doctor_id: docUuid,
        facility_id: doc.facilityId,
        room_no: doc.chamberRoomNo,
        floor: doc.chamberFloor || 'নিচতলা',
        building_stand: doc.chamberBuildingStand || 'মেইন বিল্ডিং',
        visiting_days: doc.visitingDays.join(', '),
        visiting_time: doc.visitingTime,
        fee_new: doc.feesNew,
        fee_old: doc.feesOld
      });

    if (chError) throw chError;
  } catch (err) {
    console.error('Error adding doctor in Supabase:', err);
  }
}

export async function updateDoctor(doc: Doctor): Promise<void> {
  const doctors = await getDoctors();
  const updated = doctors.map(d => d.id === doc.id ? doc : d);
  localStorage.setItem('sheba_doctors_v3', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const [docId, chId] = doc.id.split('::');

    // 1. Update doctor info
    const updatePayload: any = {
      specialty_id: doc.specialtyId,
      name: doc.name,
      bmdc_number: doc.bmdc,
      degrees: doc.degrees,
      designation: doc.designation,
      workplace: doc.workplace,
      ps_phone: doc.psPhone || null,
      photo_url: doc.photoUrl || '',
      display_priority: doc.priorityIndex,
      is_active: doc.isActive,
      rating: doc.rating || 5.0,
      review_count: doc.reviewCount || 0
    };

    if (doc.about !== undefined) {
      updatePayload.about = doc.about;
    }

    const { error: docError } = await supabase
      .from('doctors')
      .update(updatePayload)
      .eq('id', docId);

    if (docError) {
      if (docError.message?.includes('about') || docError.message?.includes('column')) {
        delete updatePayload.about;
        const { error: retryError } = await supabase.from('doctors').update(updatePayload).eq('id', docId);
        if (retryError) throw retryError;
      } else {
        throw docError;
      }
    }

    // 2. Update chamber info
    if (chId) {
      const { error: chError } = await supabase
        .from('chambers')
        .update({
          facility_id: doc.facilityId,
          room_no: doc.chamberRoomNo,
          floor: doc.chamberFloor || 'নিচতলা',
          building_stand: doc.chamberBuildingStand || 'মেইন বিল্ডিং',
          visiting_days: doc.visitingDays.join(', '),
          visiting_time: doc.visitingTime,
          fee_new: doc.feesNew,
          fee_old: doc.feesOld
        })
        .eq('id', chId);

      if (chError) throw chError;
    }
  } catch (err) {
    console.error('Error updating doctor in Supabase:', err);
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

export async function updateDoctorStatus(id: string, isActive: boolean): Promise<void> {
  const doctors = await getDoctors();
  const updated = doctors.map(d => d.id === id ? { ...d, isActive } : d);
  localStorage.setItem('sheba_doctors_v3', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const docId = id.split('::')[0];
    const { error } = await supabase
      .from('doctors')
      .update({ is_active: isActive })
      .eq('id', docId);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating doctor status in Supabase:', err);
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

    const mapped = appointmentsData.map((app: any) => {
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
        assignedFloor: app.assigned_floor || undefined,
        assignedBuilding: app.assigned_building || undefined,
        confirmedVisitingTime: app.confirmed_visiting_time || undefined,
        rejectionReason: app.rejection_reason || undefined,
        adminNotes: app.admin_notes || undefined,
        createdAt: app.created_at,
        updatedAt: app.updated_at
      };
    });

    localStorage.setItem('sheba_appointments_v3', JSON.stringify(mapped));
    return mapped;
  } catch (err) {
    console.error('Error loading appointments:', err);
    const saved = localStorage.getItem('sheba_appointments_v3');
    if (saved) return JSON.parse(saved);
    return [];
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
  assignedFloor?: string;
  assignedBuilding?: string;
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
          assignedFloor: params.assignedFloor,
          assignedBuilding: params.assignedBuilding,
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
        assigned_floor: params.assignedFloor || null,
        assigned_building: params.assignedBuilding || null,
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
          assignedFloor: undefined,
          assignedBuilding: undefined,
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
        assigned_floor: null,
        assigned_building: null,
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
// 8. REVIEWS & RATINGS CRUD (100% VERIFIED PATIENT SYSTEM)
// ==========================================

export async function getReviews(doctorId?: string): Promise<Review[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_reviews_v1');
    let reviews: Review[] = saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    if (!saved) {
      localStorage.setItem('sheba_reviews_v1', JSON.stringify(INITIAL_REVIEWS));
    }
    if (doctorId) {
      const cleanDocId = doctorId.split('::')[0];
      return reviews.filter(r => r.doctorId === cleanDocId || r.doctorId === doctorId);
    }
    return reviews;
  }

  try {
    let query = supabase
      .from('reviews')
      .select('id, doctor_id, patient_name, rating, comment, review_text, is_verified_patient, is_approved, created_at, doctors(name)')
      .order('created_at', { ascending: false });

    if (doctorId) {
      const cleanDocId = doctorId.split('::')[0];
      query = query.eq('doctor_id', cleanDocId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      doctorId: r.doctor_id,
      doctorName: r.doctors?.name || '',
      patientName: r.patient_name,
      rating: Number(r.rating),
      comment: r.comment || r.review_text || '',
      reviewText: r.comment || r.review_text || '',
      isVerifiedPatient: r.is_verified_patient ?? true,
      isApproved: r.is_approved ?? true,
      createdAt: r.created_at
    }));

    return mapped;
  } catch (err) {
    console.error('Error loading reviews:', err);
    const saved = localStorage.getItem('sheba_reviews_v1');
    if (saved) {
      const reviews: Review[] = JSON.parse(saved);
      if (doctorId) {
        const cleanDocId = doctorId.split('::')[0];
        return reviews.filter(r => r.doctorId === cleanDocId || r.doctorId === doctorId);
      }
      return reviews;
    }
    return [];
  }
}

export interface SubmitReviewResult {
  success: boolean;
  message: string;
  reviewId?: string;
}

export async function submitVerifiedPatientReview(params: {
  doctorId: string;
  doctorName?: string;
  patientName: string;
  patientPhone: string;
  rating: number;
  comment?: string;
}): Promise<SubmitReviewResult> {
  const cleanDocId = params.doctorId.split('::')[0];
  const cleanPhone = params.patientPhone.trim().replace(/[^0-9+]/g, '');

  if (!cleanPhone || cleanPhone.length < 6) {
    return {
      success: false,
      message: 'একটি সঠিক মোবাইল নম্বর প্রদান করুন।'
    };
  }

  // 1. Try Supabase RPC if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('verify_and_submit_review', {
        p_doctor_id: cleanDocId,
        p_patient_name: params.patientName.trim(),
        p_patient_phone: params.patientPhone.trim(),
        p_rating: params.rating,
        p_comment: params.comment ? params.comment.trim() : null
      });

      if (!error && data) {
        if (data.success) {
          // Also update local cache for instant smooth UI
          const newRev: Review = {
            id: data.review_id || `rev-${Date.now()}`,
            doctorId: cleanDocId,
            doctorName: params.doctorName || '',
            patientName: params.patientName.trim(),
            rating: params.rating,
            comment: params.comment?.trim() || '',
            reviewText: params.comment?.trim() || '',
            isVerifiedPatient: true,
            isApproved: true,
            createdAt: new Date().toISOString()
          };
          const saved = localStorage.getItem('sheba_reviews_v1');
          const reviews: Review[] = saved ? JSON.parse(saved) : INITIAL_REVIEWS;
          localStorage.setItem('sheba_reviews_v1', JSON.stringify([newRev, ...reviews]));

          return {
            success: true,
            message: data.message || 'আপনার মূল্যবান রিভিউ ও রেটিংটি সফলভাবে যুক্ত হয়েছে।',
            reviewId: data.review_id
          };
        } else {
          return {
            success: false,
            message: data.message || 'আপনি পূর্বে এই ডাক্তারের অ্যাপয়েন্টমেন্ট নেননি। অনুগ্রহ করে যে নম্বর দিয়ে সিরিয়াল বুকিং করেছিলেন সেটি ব্যবহার করুন।'
          };
        }
      }

      // If RPC failed (e.g., function not created yet in SQL editor), verify directly via appointments table
      console.warn('RPC verify_and_submit_review not available or errored, falling back to direct table verification:', error);
      const { data: appointments, error: appError } = await supabase
        .from('appointments')
        .select('id, status, patient_phone')
        .eq('doctor_id', cleanDocId)
        .eq('status', 'Confirmed');

      const isVerified = (appointments || []).some((a: any) => {
        const p = (a.patient_phone || '').replace(/[^0-9+]/g, '');
        return p === cleanPhone || (cleanPhone.length >= 10 && p.endsWith(cleanPhone.slice(-10))) || (p.length >= 10 && cleanPhone.endsWith(p.slice(-10)));
      });

      if (!isVerified) {
        return {
          success: false,
          message: 'আপনি পূর্বে এই ডাক্তারের অ্যাপয়েন্টমেন্ট নেননি। অনুগ্রহ করে যে নম্বর দিয়ে সিরিয়াল বুকিং করেছিলেন সেটি ব্যবহার করুন।'
        };
      }

      const { data: newReviewData, error: revError } = await supabase
        .from('reviews')
        .insert({
          doctor_id: cleanDocId,
          patient_name: params.patientName.trim(),
          patient_phone: params.patientPhone.trim(),
          rating: params.rating,
          comment: params.comment?.trim() || null,
          review_text: params.comment?.trim() || null,
          is_verified_patient: true,
          is_approved: true
        })
        .select()
        .single();

      if (revError) throw revError;

      return {
        success: true,
        message: 'আপনার মূল্যবান রিভিউ ও রেটিংটি সফলভাবে যুক্ত হয়েছে।',
        reviewId: newReviewData?.id
      };
    } catch (err: any) {
      console.error('Error in submitVerifiedPatientReview (Supabase):', err);
    }
  }

  // 2. Client-side / LocalStorage fallback verification
  const appointments = await getAppointments();
  const isVerified = appointments.some(app => {
    const appDocId = app.doctorId.split('::')[0];
    const appPhone = (app.patientPhone || app.patientMobile || '').replace(/[^0-9+]/g, '');
    const isDocMatch = appDocId === cleanDocId;
    const isStatusMatch = app.status === 'Confirmed';
    const isPhoneMatch =
      appPhone === cleanPhone ||
      (cleanPhone.length >= 10 && appPhone.endsWith(cleanPhone.slice(-10))) ||
      (appPhone.length >= 10 && cleanPhone.endsWith(appPhone.slice(-10)));

    return isDocMatch && isStatusMatch && isPhoneMatch;
  });

  if (!isVerified) {
    return {
      success: false,
      message: 'আপনি পূর্বে এই ডাক্তারের অ্যাপয়েন্টমেন্ট নেননি। অনুগ্রহ করে যে নম্বর দিয়ে সিরিয়াল বুকিং করেছিলেন সেটি ব্যবহার করুন।'
    };
  }

  const newRev: Review = {
    id: `rev-${Date.now()}`,
    doctorId: cleanDocId,
    doctorName: params.doctorName || '',
    patientName: params.patientName.trim(),
    rating: params.rating,
    comment: params.comment?.trim() || '',
    reviewText: params.comment?.trim() || '',
    isVerifiedPatient: true,
    isApproved: true,
    createdAt: new Date().toISOString()
  };

  const saved = localStorage.getItem('sheba_reviews_v1');
  const reviews: Review[] = saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  const updatedReviews = [newRev, ...reviews];
  localStorage.setItem('sheba_reviews_v1', JSON.stringify(updatedReviews));

  // Recalculate doctor rating and count in local storage
  const docReviews = updatedReviews.filter(r => r.doctorId === cleanDocId);
  const avg = docReviews.reduce((acc, curr) => acc + curr.rating, 0) / docReviews.length;
  const savedDocs = localStorage.getItem('sheba_doctors_v3');
  if (savedDocs) {
    const doctors: Doctor[] = JSON.parse(savedDocs);
    const updatedDocs = doctors.map(d => {
      if (d.doctorId === cleanDocId || d.id.startsWith(cleanDocId)) {
        return {
          ...d,
          rating: Number(avg.toFixed(1)),
          reviewCount: docReviews.length
        };
      }
      return d;
    });
    localStorage.setItem('sheba_doctors_v3', JSON.stringify(updatedDocs));
  }

  return {
    success: true,
    message: 'আপনার মূল্যবান রিভিউ ও রেটিংটি সফলভাবে যুক্ত হয়েছে।',
    reviewId: newRev.id
  };
}

export async function addReview(review: {
  doctorId: string;
  doctorName?: string;
  patientName: string;
  patientPhone?: string;
  rating: number;
  comment?: string;
  reviewText?: string;
  isApproved?: boolean;
}): Promise<void> {
  const result = await submitVerifiedPatientReview({
    doctorId: review.doctorId,
    doctorName: review.doctorName,
    patientName: review.patientName,
    patientPhone: review.patientPhone || '01898765432',
    rating: review.rating,
    comment: review.comment || review.reviewText
  });

  if (!result.success) {
    throw new Error(result.message);
  }
}

export async function approveReview(reviewId: string): Promise<void> {
  const saved = localStorage.getItem('sheba_reviews_v1');
  if (saved) {
    const reviews: Review[] = JSON.parse(saved);
    const updated = reviews.map(r => r.id === reviewId ? { ...r, isApproved: true } : r);
    localStorage.setItem('sheba_reviews_v1', JSON.stringify(updated));
  }

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);
    if (error) throw error;
  } catch (err) {
    console.error('Error approving review:', err);
    throw err;
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const saved = localStorage.getItem('sheba_reviews_v1');
  if (saved) {
    const reviews: Review[] = JSON.parse(saved);
    const updated = reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('sheba_reviews_v1', JSON.stringify(updated));
  }

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting review:', err);
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

// ==========================================
// 8. BLOGS CRUD (with zero-friction LocalStorage Fallback)
// ==========================================

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'উচ্চ রক্তচাপ বা হাইপারটেনশন প্রতিরোধে করণীয় ও সঠিক খাদ্যাভ্যাস',
    slug: 'hypertension-prevention-and-diet',
    excerpt: 'উচ্চ রক্তচাপ একটি নীরব ঘাতক। কীভাবে সঠিক জীবনযাত্রা ও খাদ্যাভ্যাসের মাধ্যমে এটি নিয়ন্ত্রণ করবেন তা বিস্তারিত জানুন।',
    content: `উচ্চ রক্তচাপ বা হাইপারটেনশন বর্তমান সময়ে একটি অত্যন্ত সাধারণ কিন্তু মারাত্মক স্বাস্থ্য সমস্যা। একে 'নীরব ঘাতক' বলা হয় কারণ অনেক সময় কোনো স্পষ্ট লক্ষণ ছাড়াই এটি শরীরের বিভিন্ন অঙ্গের ক্ষতি করতে পারে।

### উচ্চ রক্তচাপের প্রধান কারণসমূহ:
১. অতিরিক্ত লবণ বা সোডিয়াম যুক্ত খাবার খাওয়া।
২. অলস জীবনযাপন ও শারীরিক পরিশ্রমের অভাব।
৩. মানসিক চাপ বা দুশ্চিন্তা।
৪. ধূমপান ও মদ্যপানের অভ্যাস।
৫. বংশগত কারণ।

### প্রতিরোধে আমাদের করণীয়:
১. **লবণ খাওয়া নিয়ন্ত্রণ করুন:** রান্নায় লবণের ব্যবহার কমান এবং কাঁচা লবণ খাওয়া সম্পূর্ণ পরিহার করুন।
২. **পটাশিয়াম সমৃদ্ধ খাবার বাড়ান:** কলা, ডাব, পালংশাক, এবং মিষ্টি আলু নিয়মিত খাদ্যতালিকায় রাখুন।
৩. **নিয়মিত ব্যায়াম:** প্রতিদিন অন্তত ৩০ মিনিট হাঁটুন বা হালকা ব্যায়াম করুন।
৪. **ওজন নিয়ন্ত্রণ:** শরীরের অতিরিক্ত ওজন কমিয়ে স্বাভাবিক সীমায় রাখুন।
৫. **ধূমপান বর্জন:** হৃদরোগ ও উচ্চ রক্তচাপের ঝুঁকি কমাতে ধূমপান পরিহার করুন।`,
    coverImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000',
    category: 'কার্ডিওলজি / হৃদরোগ',
    author: 'MyDocBD মেডিকেল টিম',
    isPublished: true,
    views: 124,
    createdAt: new Date('2026-08-20').toISOString()
  },
  {
    id: 'blog-2',
    title: 'শিশুদের ডায়রিয়া ও ডিহাইড্রেশন: লক্ষণ ও ঘরোয়া চিকিৎসা নির্দেশিকা',
    slug: 'pediatric-diarrhea-dehydration-guide',
    excerpt: 'শিশুদের ডায়রিয়া হলে কখন হাসপাতালে নিয়ে যাবেন এবং কীভাবে খাবার স্যালাইন ও তরল খাবার খাওয়াবেন তা জেনে নিন।',
    content: `শিশুদের ক্ষেত্রে ডায়রিয়া অত্যন্ত সংবেদনশীল একটি বিষয়। সঠিক সময়ে সঠিক পদক্ষেপ না নিলে ডিহাইড্রেশন বা পানিশূন্যতা হয়ে শিশুর জীবন ঝুঁকিতে পড়তে পারে।

### ডিহাইড্রেশন বা পানিশূন্যতার লক্ষণসমূহ:
- অনবরত বমি হওয়া বা কিছু খেতে না পারা।
- প্রস্রাবের পরিমাণ কমে যাওয়া বা ১২ ঘণ্টা প্রস্রাব না হওয়া।
- চোখ বসে যাওয়া এবং কান্নার সময় জল না পড়া।
- অতিরিক্ত ছটফট করা বা একদম নিস্তেজ হয়ে পড়া।

### করণীয় ও ঘরোয়া চিকিৎসা:
১. **খাবার স্যালাইন (ORS):** প্রতিবার পাতলা পায়খানার পর বয়স অনুযায়ী খাবার স্যালাইন খাওয়ান।
২. **বুকের দুধ ও তরল খাবার:** শিশুকে কোনোভাবেই বুকের দুধ খাওয়ানো বন্ধ করবেন না। এছাড়া ভাতের মাড়, ডাবের জল ও বিশুদ্ধ জল খাওয়ান।
৩. **জিংক সিরাপ:** চিকিৎসকের পরামর্শ অনুযায়ী জিংক সিরাপ দিন, যা ডায়রিয়ার মেয়াদ কমায়।

### কখন দ্রুত হাসপাতালে যাবেন:
- যদি মলদ্বার দিয়ে রক্ত যায়।
- তীব্র জ্বর থাকলে।
- শিশু একেবারেই স্যালাইন বা জল খেতে না পারলে বা নিস্তেজ হয়ে পড়লে।`,
    coverImage: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
    category: 'শিশু রোগ',
    author: 'ডা. ফারহানা ইয়াসমিন',
    isPublished: true,
    views: 98,
    createdAt: new Date('2026-08-22').toISOString()
  }
];

export async function getBlogs(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_blogs');
    if (!saved) {
      localStorage.setItem('sheba_blogs', JSON.stringify(INITIAL_BLOGS));
      return INITIAL_BLOGS;
    }
    return JSON.parse(saved);
  }

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('Blogs table does not exist in Supabase yet. Falling back to local storage.');
        const saved = localStorage.getItem('sheba_blogs');
        if (!saved) {
          localStorage.setItem('sheba_blogs', JSON.stringify(INITIAL_BLOGS));
          return INITIAL_BLOGS;
        }
        return JSON.parse(saved);
      }
      throw error;
    }

    const mapped = (data || []).map(b => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      content: b.content,
      excerpt: b.excerpt,
      coverImage: b.cover_image,
      category: b.category,
      author: b.author,
      isPublished: b.is_published,
      views: b.views || 0,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));
    localStorage.setItem('sheba_blogs', JSON.stringify(mapped));
    return mapped;
  } catch (err) {
    console.error('Error fetching blogs from Supabase:', err);
    const saved = localStorage.getItem('sheba_blogs');
    if (saved) return JSON.parse(saved);
    return INITIAL_BLOGS;
  }
}

export async function addBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'views'>): Promise<void> {
  const blogs = await getBlogs();
  const newId = `blog-${Date.now()}`;
  const newItem: BlogPost = {
    ...blog,
    id: newId,
    views: 0,
    createdAt: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_blogs', JSON.stringify([newItem, ...blogs]));
    return;
  }

  try {
    const { error } = await supabase
      .from('blogs')
      .insert({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        cover_image: blog.coverImage,
        category: blog.category,
        author: blog.author,
        is_published: blog.isPublished,
        views: 0
      });
    if (error) throw error;
  } catch (err) {
    console.error('Error inserting blog:', err);
    localStorage.setItem('sheba_blogs', JSON.stringify([newItem, ...blogs]));
  }
}

export async function updateBlog(blog: BlogPost): Promise<void> {
  const blogs = await getBlogs();
  const updated = blogs.map(b => b.id === blog.id ? blog : b);
  localStorage.setItem('sheba_blogs', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('blogs')
      .update({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        cover_image: blog.coverImage,
        category: blog.category,
        author: blog.author,
        is_published: blog.isPublished,
        views: blog.views,
        updated_at: new Date().toISOString()
      })
      .eq('id', blog.id);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating blog:', err);
  }
}

export async function deleteBlog(id: string): Promise<void> {
  const blogs = await getBlogs();
  const filtered = blogs.filter(b => b.id !== id);
  localStorage.setItem('sheba_blogs', JSON.stringify(filtered));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting blog:', err);
  }
}

export async function incrementBlogViews(id: string): Promise<void> {
  const blogs = await getBlogs();
  const updated = blogs.map(b => b.id === id ? { ...b, views: (b.views || 0) + 1 } : b);
  localStorage.setItem('sheba_blogs', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const current = blogs.find(b => b.id === id);
    if (current) {
      await supabase
        .from('blogs')
        .update({ views: (current.views || 0) + 1 })
        .eq('id', id);
    }
  } catch (err) {
    console.error('Error incrementing blog views:', err);
  }
}

// ==========================================
// 9. PROMO BANNERS CRUD
// ==========================================

const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'banner-hero',
    title: 'বিনামূল্যে ডায়াবেটিস স্ক্রীনিং ক্যাম্প',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    targetUrl: '#directory',
    slot: 'hero',
    isActive: true,
    createdAt: new Date('2026-08-25').toISOString()
  },
  {
    id: 'banner-sidebar',
    title: 'পপুলার হেলথ প্যাকেজ - ২০% ছাড়',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    targetUrl: '#directory',
    slot: 'sidebar',
    isActive: true,
    createdAt: new Date('2026-08-26').toISOString()
  }
];

export async function getPromoBanners(): Promise<PromoBanner[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_banners');
    if (!saved) {
      localStorage.setItem('sheba_banners', JSON.stringify(INITIAL_BANNERS));
      return INITIAL_BANNERS;
    }
    return JSON.parse(saved);
  }

  try {
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        console.warn('Promo banners table does not exist in Supabase yet. Falling back to local storage.');
        const saved = localStorage.getItem('sheba_banners');
        if (!saved) {
          localStorage.setItem('sheba_banners', JSON.stringify(INITIAL_BANNERS));
          return INITIAL_BANNERS;
        }
        return JSON.parse(saved);
      }
      throw error;
    }

    const mapped = (data || []).map(b => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image_url,
      targetUrl: b.target_url,
      slot: b.slot as 'hero' | 'directory' | 'sidebar' | 'footer',
      isActive: b.is_active,
      createdAt: b.created_at
    }));
    localStorage.setItem('sheba_banners', JSON.stringify(mapped));
    return mapped;
  } catch (err) {
    console.error('Error fetching banners from Supabase:', err);
    const saved = localStorage.getItem('sheba_banners');
    if (saved) return JSON.parse(saved);
    return INITIAL_BANNERS;
  }
}

export async function addPromoBanner(banner: Omit<PromoBanner, 'id' | 'createdAt'>): Promise<void> {
  const banners = await getPromoBanners();
  const newId = `banner-${Date.now()}`;
  const newItem: PromoBanner = {
    ...banner,
    id: newId,
    createdAt: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    localStorage.setItem('sheba_banners', JSON.stringify([newItem, ...banners]));
    return;
  }

  try {
    const { error } = await supabase
      .from('promo_banners')
      .insert({
        title: banner.title,
        image_url: banner.imageUrl,
        target_url: banner.targetUrl,
        slot: banner.slot,
        is_active: banner.isActive
      });
    if (error) throw error;
  } catch (err) {
    console.error('Error inserting banner:', err);
    localStorage.setItem('sheba_banners', JSON.stringify([newItem, ...banners]));
  }
}

export async function updatePromoBanner(banner: PromoBanner): Promise<void> {
  const banners = await getPromoBanners();
  const updated = banners.map(b => b.id === banner.id ? banner : b);
  localStorage.setItem('sheba_banners', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('promo_banners')
      .update({
        title: banner.title,
        image_url: banner.imageUrl,
        target_url: banner.targetUrl,
        slot: banner.slot,
        is_active: banner.isActive
      })
      .eq('id', banner.id);
    if (error) throw error;
  } catch (err) {
    console.error('Error updating banner:', err);
  }
}

export async function deletePromoBanner(id: string): Promise<void> {
  const banners = await getPromoBanners();
  const filtered = banners.filter(b => b.id !== id);
  localStorage.setItem('sheba_banners', JSON.stringify(filtered));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('promo_banners')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('Error deleting banner:', err);
  }
}

