import { createClient } from '@supabase/supabase-js';
import { Doctor, Appointment, District, Specialty, Facility, AdminProfile, Review, BlogPost, PromoBanner, BannerPlacementSlot } from '../types';
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
      slug: s.slug || (s.name_en ? s.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : ''),
      iconUrl: s.icon_url || s.icon_name || '',
      iconName: s.icon_name || '',
      isActive: s.is_active !== false,
      displayOrder: s.display_order ?? 1
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

export async function uploadSpecialtyIcon(file: File): Promise<string> {
  if (!file) return '';
  if (!isSupabaseConfigured || !supabase) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `specialty_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('specialty-icons')
      .upload(fileName, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to base64:', uploadError.message);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage
      .from('specialty-icons')
      .getPublicUrl(fileName);

    return data?.publicUrl || '';
  } catch (err) {
    console.error('Error in uploadSpecialtyIcon:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

export async function addSpecialty(spec: Omit<Specialty, 'id'>): Promise<void> {
  const specialties = await getSpecialties();
  const newId = `spec-${Date.now()}`;
  const generatedSlug = spec.slug || (spec.nameEn ? spec.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'specialty');
  const newItem: Specialty = { ...spec, id: newId, slug: generatedSlug };

  if (!isSupabaseConfigured || !supabase) {
    const updated = [...specialties, newItem];
    localStorage.setItem('sheba_specialties', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: updated }));
    }
    return;
  }

  try {
    const insertPayload: any = {
      id: crypto.randomUUID(),
      name_bn: spec.nameBn,
      name_en: spec.nameEn,
      slug: generatedSlug,
      icon_url: spec.iconUrl || spec.iconName || '',
      icon_name: spec.iconName || '',
      display_order: spec.displayOrder || 1,
      is_active: spec.isActive !== false
    };

    const { data: insertedData, error } = await supabase
      .from('specialties')
      .insert(insertPayload)
      .select();

    if (error) {
      // If error is about missing icon_url or slug column in Supabase schema cache, fallback to legacy schema
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('icon_url') || errMsg.includes('slug') || errMsg.includes('schema cache') || errMsg.includes('column')) {
        console.warn('[Supabase Specialties] Missing column in database table, retrying with legacy schema:', error.message);
        const legacyPayload: any = {
          id: crypto.randomUUID(),
          name_bn: spec.nameBn,
          name_en: spec.nameEn,
          icon_name: spec.iconUrl || spec.iconName || '',
          display_order: spec.displayOrder || 1,
          is_active: spec.isActive !== false
        };
        const { error: fallbackError } = await supabase
          .from('specialties')
          .insert(legacyPayload);
        
        if (fallbackError) {
          console.error('Fallback insert also failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }

    // Always update local cache & notify all components immediately
    const refreshed = await getSpecialties();
    localStorage.setItem('sheba_specialties', JSON.stringify(refreshed));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: refreshed }));
    }
  } catch (err: any) {
    console.error('Error inserting specialty into Supabase:', err);
    // Ensure local persistence still works seamlessly
    const updated = [...specialties.filter(s => s.id !== newId), newItem];
    localStorage.setItem('sheba_specialties', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: updated }));
    }
    // Re-throw only if both failed completely
    if (err?.message && !err.message.includes('schema cache') && !err.message.includes('column')) {
      throw err;
    }
  }
}

export async function updateSpecialty(spec: Specialty): Promise<void> {
  const specialties = await getSpecialties();
  const generatedSlug = spec.slug || (spec.nameEn ? spec.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'specialty');
  
  if (!isSupabaseConfigured || !supabase) {
    const updated = specialties.map(s => s.id === spec.id ? { ...spec, slug: generatedSlug } : s);
    localStorage.setItem('sheba_specialties', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: updated }));
    }
    return;
  }

  try {
    const updatePayload: any = {
      name_bn: spec.nameBn,
      name_en: spec.nameEn,
      slug: generatedSlug,
      icon_url: spec.iconUrl || spec.iconName || '',
      icon_name: spec.iconName || '',
      display_order: spec.displayOrder || 1,
      is_active: spec.isActive !== false,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('specialties')
      .update(updatePayload)
      .eq('id', spec.id);

    if (error) {
      const errMsg = (error.message || '').toLowerCase();
      if (errMsg.includes('icon_url') || errMsg.includes('slug') || errMsg.includes('schema cache') || errMsg.includes('column')) {
        console.warn('[Supabase Specialties] Missing column in update, retrying with legacy schema:', error.message);
        const legacyPayload: any = {
          name_bn: spec.nameBn,
          name_en: spec.nameEn,
          icon_name: spec.iconUrl || spec.iconName || '',
          display_order: spec.displayOrder || 1,
          is_active: spec.isActive !== false,
          updated_at: new Date().toISOString()
        };
        const { error: fallbackError } = await supabase
          .from('specialties')
          .update(legacyPayload)
          .eq('id', spec.id);
        
        if (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }

    const refreshed = await getSpecialties();
    localStorage.setItem('sheba_specialties', JSON.stringify(refreshed));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: refreshed }));
    }
  } catch (err: any) {
    console.error('Error updating specialty:', err);
    const updated = specialties.map(s => s.id === spec.id ? { ...spec, slug: generatedSlug } : s);
    localStorage.setItem('sheba_specialties', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: updated }));
    }
    if (err?.message && !err.message.includes('schema cache') && !err.message.includes('column')) {
      throw err;
    }
  }
}

export async function deleteSpecialty(id: string): Promise<void> {
  const specialties = await getSpecialties();
  const filtered = specialties.filter(s => s.id !== id);
  localStorage.setItem('sheba_specialties', JSON.stringify(filtered));

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: filtered }));
  }

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase delete specialty warning:', error.message);
    }
  } catch (err) {
    console.error('Error deleting specialty in Supabase:', err);
  } finally {
    const refreshed = await getSpecialties();
    localStorage.setItem('sheba_specialties', JSON.stringify(refreshed));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sheba_specialties_updated', { detail: refreshed }));
    }
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

// Helper to filter out doctors that have been deleted permanently
function filterDeletedDoctors(list: Doctor[]): Doctor[] {
  let deletedDoctorIds: string[] = [];
  try {
    deletedDoctorIds = JSON.parse(localStorage.getItem('sheba_deleted_doctor_ids') || '[]');
  } catch (e) {
    deletedDoctorIds = [];
  }
  if (!deletedDoctorIds || deletedDoctorIds.length === 0) return list;

  return list.filter(d => {
    if (!d) return false;
    const rawId = (d.id || d.doctorId || '').split('::')[0];
    const isDeleted = deletedDoctorIds.includes(d.id) ||
                      deletedDoctorIds.includes(rawId) ||
                      (d.doctorId && deletedDoctorIds.includes(d.doctorId)) ||
                      (d.bmdc && deletedDoctorIds.includes(d.bmdc)) ||
                      (d.name && deletedDoctorIds.includes(d.name));
    return !isDeleted;
  });
}

export async function getDoctors(): Promise<Doctor[]> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_doctors_v3');
    if (!saved) {
      const filteredInitial = filterDeletedDoctors(INITIAL_DOCTORS);
      localStorage.setItem('sheba_doctors_v3', JSON.stringify(filteredInitial));
      return filteredInitial;
    }
    return filterDeletedDoctors(JSON.parse(saved));
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
      
      let parsedSpecialtyIds: string[] = [];
      let parsedSpecialties: string[] = [];

      if (Array.isArray(doc.specialty_ids) && doc.specialty_ids.length > 0) {
        parsedSpecialtyIds = doc.specialty_ids;
      } else if (typeof doc.specialty_ids === 'string' && doc.specialty_ids.trim()) {
        try { parsedSpecialtyIds = JSON.parse(doc.specialty_ids); } catch {
          parsedSpecialtyIds = doc.specialty_ids.split(',').map((s: string) => s.trim());
        }
      }

      if (Array.isArray(doc.specialties) && doc.specialties.length > 0) {
        parsedSpecialties = doc.specialties;
      } else if (typeof doc.specialties === 'string' && doc.specialties.trim()) {
        try { parsedSpecialties = JSON.parse(doc.specialties); } catch {
          parsedSpecialties = doc.specialties.split(',').map((s: string) => s.trim());
        }
      }

      if (parsedSpecialtyIds.length === 0 && doc.specialty_id) {
        parsedSpecialtyIds = [doc.specialty_id];
      }

      if (parsedSpecialties.length === 0) {
        if (parsedSpecialtyIds.length > 0) {
          parsedSpecialties = parsedSpecialtyIds.map(id => specMap.get(id)?.name_bn).filter(Boolean) as string[];
        }
        if (parsedSpecialties.length === 0 && spec?.name_bn) {
          parsedSpecialties = [spec.name_bn];
        }
      }

      const combinedSpecialtyText = parsedSpecialties.length > 0 ? parsedSpecialties.join(', ') : (spec?.name_bn || 'মেডিসিন');

      const fullChambersList = docChambers.map((dc: any) => {
        const fac = facilityMap.get(dc.facility_id);
        const facName = fac?.name || dc.facility_name || dc.facilityName || dc.facility || dc.facilities?.name || '';
        const facAddress = fac?.area_address || dc.facility_address || dc.facilityAddress || dc.facilities?.area_address || '';
        const facDistrictId = fac?.district_id || dc.facility_district_id || dc.facilityDistrictId || '';
        return {
          id: dc.id,
          doctorId: doc.id,
          facilityId: dc.facility_id,
          facilityName: facName,
          facilityAddress: facAddress,
          facilityDistrictId: facDistrictId,
          roomNo: dc.room_no || '',
          floor: dc.floor || 'নিচতলা',
          buildingStand: dc.building_stand || 'মেইন বিল্ডিং',
          visitingDays: dc.visiting_days ? dc.visiting_days.split(',').map((d: string) => d.trim()) : [],
          visitingTime: dc.visiting_time || '',
          feeNew: dc.fee_new || 0,
          feeOld: dc.fee_old || 0
        };
      });

      if (docChambers.length === 0) {
        mappedList.push({
          id: doc.id,
          doctorId: doc.id,
          specialtyId: doc.specialty_id || parsedSpecialtyIds[0] || '',
          specialtyIds: parsedSpecialtyIds,
          specialties: parsedSpecialties,
          specialtyNameBn: combinedSpecialtyText,
          specialtyNameEn: spec?.name_en || '',
          specialty: combinedSpecialtyText,
          subSpecialty: doc.sub_specialty || doc.subSpecialty || '',
          sub_specialty: doc.sub_specialty || doc.subSpecialty || '',
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
          feesOld: 0,
          chambers: []
        });
      } else {
        const primaryChamber = fullChambersList[0];
        mappedList.push({
          id: doc.id,
          doctorId: doc.id,
          specialtyId: doc.specialty_id || parsedSpecialtyIds[0] || '',
          specialtyIds: parsedSpecialtyIds,
          specialties: parsedSpecialties,
          specialtyNameBn: combinedSpecialtyText,
          specialtyNameEn: spec?.name_en || '',
          specialty: combinedSpecialtyText,
          subSpecialty: doc.sub_specialty || doc.subSpecialty || '',
          sub_specialty: doc.sub_specialty || doc.subSpecialty || '',
          facility: primaryChamber?.facilityName || '',
          chamberAddress: primaryChamber?.facilityAddress || '',
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

          // Chamber Details joined
          chamberId: primaryChamber?.id || '',
          facilityId: primaryChamber?.facilityId || '',
          facilityName: primaryChamber?.facilityName || '',
          facilityAddress: primaryChamber?.facilityAddress || '',
          facilityDistrictId: primaryChamber?.facilityDistrictId || '',
          chamberRoomNo: primaryChamber?.roomNo || '',
          chamberFloor: primaryChamber?.floor || 'নিচতলা',
          chamberBuildingStand: primaryChamber?.buildingStand || 'মেইন বিল্ডিং',
          visitingDays: primaryChamber?.visitingDays || [],
          visitingTime: primaryChamber?.visitingTime || '',
          feesNew: primaryChamber?.feeNew || 0,
          feesOld: primaryChamber?.feeOld || 0,
          chambers: fullChambersList
        });
      }
    });

    const finalFilteredList = filterDeletedDoctors(mappedList);
    localStorage.setItem('sheba_doctors_v3', JSON.stringify(finalFilteredList));
    return finalFilteredList;
  } catch (err) {
    console.error('Error fetching joined doctors:', err);
    const saved = localStorage.getItem('sheba_doctors_v3');
    return saved ? filterDeletedDoctors(JSON.parse(saved)) : [];
  }
}

export async function getDoctorWithChambers(doctorId: string): Promise<any> {
  if (!isSupabaseConfigured || !supabase) {
    const doctors = await getDoctors();
    return doctors.find(d => d.id === doctorId || d.doctorId === doctorId) || null;
  }

  try {
    const { data: doctorData, error } = await supabase
      .from('doctors')
      .select(`
        *,
        specialties (*),
        chambers (
          id,
          room_no,
          floor,
          building_info,
          visiting_days,
          visiting_time,
          fee_new,
          fee_old,
          facilities:facility_id (
            id,
            name,
            area_address
          )
        )
      `)
      .eq('id', doctorId)
      .single();

    if (error) {
      console.warn('[Supabase] Failed to fetch doctor with chambers join:', error.message);
      const doctors = await getDoctors();
      return doctors.find(d => d.id === doctorId || d.doctorId === doctorId) || null;
    }

    return doctorData;
  } catch (err) {
    console.error('Error fetching doctor with chambers:', err);
    const doctors = await getDoctors();
    return doctors.find(d => d.id === doctorId || d.doctorId === doctorId) || null;
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
  // Delegate directly to upsertDoctorWithChambers for comprehensive sync
  const resolvedChambers = doc.chambers && doc.chambers.length > 0
    ? doc.chambers
    : [
        {
          id: doc.chamberId || '',
          facilityId: doc.facilityId || '',
          facilityName: doc.facilityName || doc.facility || '',
          facilityAddress: doc.facilityAddress || doc.chamberAddress || '',
          roomNo: doc.chamberRoomNo || '',
          floor: doc.chamberFloor || 'নিচতলা',
          buildingStand: doc.chamberBuildingStand || 'মেইন বিল্ডিং',
          visitingDays: doc.visitingDays || ['সবদিন'],
          visitingTime: doc.visitingTime || '',
          feeNew: doc.feesNew || 0,
          feeOld: doc.feesOld || 0
        }
      ];

  await upsertDoctorWithChambers(doc, resolvedChambers);
}

export async function deleteDoctor(id: string): Promise<void> {
  const doctors = await getDoctors();
  const rawId = id.split('::')[0];
  const targetDoc = doctors.find(d => {
    const dId = (d.doctorId || d.id || '').split('::')[0];
    return dId === rawId || d.id === id || d.doctorId === id;
  });

  // Track deleted doctor identifiers in localStorage to prevent resurfacing
  try {
    const deletedDoctorIds: string[] = JSON.parse(localStorage.getItem('sheba_deleted_doctor_ids') || '[]');
    const toAdd = [id, rawId];
    if (targetDoc) {
      if (targetDoc.id) toAdd.push(targetDoc.id);
      if (targetDoc.doctorId) toAdd.push(targetDoc.doctorId);
      if (targetDoc.bmdc) toAdd.push(targetDoc.bmdc);
      if (targetDoc.name) toAdd.push(targetDoc.name);
    }
    toAdd.forEach(item => {
      if (item && !deletedDoctorIds.includes(item)) {
        deletedDoctorIds.push(item);
      }
    });
    localStorage.setItem('sheba_deleted_doctor_ids', JSON.stringify(deletedDoctorIds));
  } catch (e) {
    console.error('Failed to update sheba_deleted_doctor_ids:', e);
  }

  const filtered = doctors.filter(d => {
    const dId = (d.doctorId || d.id || '').split('::')[0];
    return dId !== rawId && d.id !== id && d.doctorId !== id;
  });
  localStorage.setItem('sheba_doctors_v3', JSON.stringify(filtered));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const targetDocIds = new Set<string>();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (rawId && uuidRegex.test(rawId)) targetDocIds.add(rawId);
    if (id && uuidRegex.test(id)) targetDocIds.add(id);

    // 1. Query Supabase doctors table to find all matching doctor records
    const { data: allSupabaseDocs, error: fetchErr } = await supabase.from('doctors').select('id, name, bmdc_number');
    if (fetchErr) {
      console.warn('[Supabase Delete Fetch Notice]:', fetchErr.message);
    }

    if (allSupabaseDocs && allSupabaseDocs.length > 0) {
      allSupabaseDocs.forEach(d => {
        if (!d || !d.id) return;
        const dRawId = d.id.split('::')[0];
        if (d.id === id || d.id === rawId || dRawId === rawId) {
          targetDocIds.add(d.id);
        }
        if (targetDoc?.bmdc && d.bmdc_number && d.bmdc_number === targetDoc.bmdc) {
          targetDocIds.add(d.id);
        }
        if (targetDoc?.name && d.name && d.name === targetDoc.name) {
          targetDocIds.add(d.id);
        }
      });
    }

    // 2. Also search specific equality queries if list was empty or incomplete
    if (targetDoc?.bmdc) {
      const { data: bmdcMatches } = await supabase.from('doctors').select('id').eq('bmdc_number', targetDoc.bmdc);
      bmdcMatches?.forEach(m => m.id && targetDocIds.add(m.id));
    }
    if (targetDoc?.name) {
      const { data: nameMatches } = await supabase.from('doctors').select('id').eq('name', targetDoc.name);
      nameMatches?.forEach(m => m.id && targetDocIds.add(m.id));
    }

    // 3. For ALL resolved doctor UUIDs & direct query attributes, execute full cascade deletion
    for (const docId of Array.from(targetDocIds)) {
      if (!docId) continue;
      await supabase.from('chambers').delete().eq('doctor_id', docId);
      await supabase.from('appointments').delete().eq('doctor_id', docId);
      await supabase.from('reviews').delete().eq('doctor_id', docId);
      const { error: delErr } = await supabase.from('doctors').delete().eq('id', docId);
      if (delErr) {
        console.warn(`[Supabase Delete Doctor Notice for ${docId}]:`, delErr.message);
      } else {
        console.log(`[Supabase Delete Doctor Success]: Deleted doctor ${docId}`);
      }
    }

    // Direct fallbacks by BMDC, Name, or Raw ID
    if (targetDoc?.bmdc) {
      await supabase.from('doctors').delete().eq('bmdc_number', targetDoc.bmdc);
    }
    if (targetDoc?.name) {
      await supabase.from('doctors').delete().eq('name', targetDoc.name);
    }
    if (id) {
      await supabase.from('doctors').delete().eq('id', id);
    }
    if (rawId && rawId !== id) {
      await supabase.from('doctors').delete().eq('id', rawId);
    }
  } catch (err) {
    console.error('Error deleting doctor from Supabase:', err);
  }
}

export async function updateDoctorStatus(id: string, isActive: boolean): Promise<void> {
  const rawId = id.split('::')[0];
  const doctors = await getDoctors();
  const targetDoc = doctors.find(d => {
    const dId = (d.doctorId || d.id || '').split('::')[0];
    return dId === rawId || d.id === id || d.doctorId === id;
  });

  const updated = doctors.map(d => {
    const dId = (d.doctorId || d.id || '').split('::')[0];
    return dId === rawId || d.id === id ? { ...d, isActive } : d;
  });
  localStorage.setItem('sheba_doctors_v3', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetDocId: string | null = (rawId && uuidRegex.test(rawId)) ? rawId : null;

    if (!targetDocId && rawId && uuidRegex.test(rawId)) {
      const { data } = await supabase.from('doctors').select('id').eq('id', rawId).maybeSingle();
      if (data?.id) targetDocId = data.id;
    }

    if (!targetDocId && targetDoc) {
      if (targetDoc.bmdc) {
        const { data: bmdcMatch } = await supabase.from('doctors').select('id').eq('bmdc_number', targetDoc.bmdc).maybeSingle();
        if (bmdcMatch?.id) targetDocId = bmdcMatch.id;
      }
      if (!targetDocId && targetDoc.name) {
        const { data: nameMatch } = await supabase.from('doctors').select('id').eq('name', targetDoc.name).maybeSingle();
        if (nameMatch?.id) targetDocId = nameMatch.id;
      }
    }

    if (targetDocId) {
      const { error } = await supabase
        .from('doctors')
        .update({ is_active: isActive })
        .eq('id', targetDocId);
      if (error) console.warn('Supabase doctor status update notice:', error.message);
    }
  } catch (err) {
    console.error('Error updating doctor status in Supabase:', err);
  }
}

export async function upsertDoctorWithChambers(
  doctor: any,
  chambers: any[]
): Promise<void> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const rawId = (doctor.doctorId || doctor.id || '').split('::')[0];

  // Resolve specialty object for naming
  let resolvedSpecialtyNameBn = doctor.specialtyNameBn || doctor.specialty || 'মেডিসিন';
  let resolvedSpecialtyNameEn = doctor.specialtyNameEn || '';
  let resolvedSpecialtyId = doctor.specialtyId || doctor.specialty_id || null;

  // Pre-fetch reference data to resolve district and specialty relations dynamically
  let allFacilities: Facility[] = [];
  let allSpecialties: Specialty[] = [];
  try {
    const [facList, specList] = await Promise.all([
      getFacilities(),
      getSpecialties()
    ]);
    allFacilities = facList;
    allSpecialties = specList;
  } catch (err) {
    console.warn('[upsertDoctorWithChambers] Failed to pre-fetch reference data:', err);
  }

  const facilityMapForUpsert = new Map(allFacilities.map(f => [f.id, f]));
  const specialtyMapForUpsert = new Map(allSpecialties.map(s => [s.id, s]));

  // If specialtyId is provided but names are missing, resolve them
  if (resolvedSpecialtyId) {
    const matchedSpec = specialtyMapForUpsert.get(resolvedSpecialtyId);
    if (matchedSpec) {
      resolvedSpecialtyNameBn = matchedSpec.nameBn;
      resolvedSpecialtyNameEn = matchedSpec.nameEn || '';
    }
  } else if (resolvedSpecialtyNameBn) {
    // Try finding specialtyId by nameBn
    const matchedSpec = allSpecialties.find(s => s.nameBn === resolvedSpecialtyNameBn || s.nameEn === resolvedSpecialtyNameBn);
    if (matchedSpec) {
      resolvedSpecialtyId = matchedSpec.id;
      resolvedSpecialtyNameEn = matchedSpec.nameEn || '';
    }
  }

  // 1. Process Chambers array for both LocalStorage and Supabase
  const primaryChamber = chambers && chambers.length > 0 ? chambers[0] : null;
  const resolvedChambersList = (chambers && chambers.length > 0 ? chambers : [
    {
      id: doctor.chamberId || '',
      facilityId: doctor.facilityId || '',
      facilityName: doctor.facilityName || doctor.facility || '',
      facilityAddress: doctor.facilityAddress || doctor.chamberAddress || '',
      roomNo: doctor.chamberRoomNo || '',
      floor: doctor.chamberFloor || 'নিচতলা',
      buildingStand: doctor.chamberBuildingStand || 'মেইন বিল্ডিং',
      visitingDays: doctor.visitingDays || ['সবদিন'],
      visitingTime: doctor.visitingTime || '',
      feeNew: doctor.feesNew || 0,
      feeOld: doctor.feesOld || 0
    }
  ]).map((ch: any, idx: number) => {
    let daysArr: string[] = ['সবদিন'];
    if (Array.isArray(ch.visitingDays) && ch.visitingDays.length > 0) {
      daysArr = ch.visitingDays;
    } else if (Array.isArray(ch.visiting_days) && ch.visiting_days.length > 0) {
      daysArr = ch.visiting_days;
    } else if (typeof ch.visitingDays === 'string' && ch.visitingDays.trim()) {
      daysArr = ch.visitingDays.split(',').map((d: string) => d.trim());
    } else if (typeof ch.visiting_days === 'string' && ch.visiting_days.trim()) {
      daysArr = ch.visiting_days.split(',').map((d: string) => d.trim());
    }

    const chId = ch.id || ch.chamberId || `ch-${Date.now()}-${idx}`;
    const targetFacilityId = ch.facilityId || ch.facility_id || '';
    const matchedFacObj = facilityMapForUpsert.get(targetFacilityId);
    const resolvedDistrictId = ch.facilityDistrictId || ch.facility_district_id || matchedFacObj?.districtId || (matchedFacObj as any)?.district_id || '';

    return {
      id: chId,
      doctorId: rawId || '',
      facilityId: targetFacilityId,
      facilityName: ch.facilityName || ch.facility || matchedFacObj?.name || '',
      facilityAddress: ch.facilityAddress || ch.chamberAddress || matchedFacObj?.areaAddress || '',
      facilityDistrictId: resolvedDistrictId,
      roomNo: ch.roomNo || ch.room_no || '',
      floor: ch.floor || 'নিচতলা',
      buildingStand: ch.building_stand || ch.building_stand || ch.building_info || 'মেইন বিল্ডিং',
      visitingDays: daysArr,
      visitingTime: ch.visitingTime || ch.visiting_time || '',
      feeNew: Number(ch.feeNew ?? ch.fee_new ?? 0),
      feeOld: Number(ch.feeOld ?? ch.fee_old ?? 0)
    };
  });

  const firstChamber: any = resolvedChambersList[0] || {};

  // Build the complete unified Doctor object
  const unifiedDoctor: Doctor = {
    id: rawId || (resolvedChambersList[0]?.id ? `${rawId || 'doc'}::${resolvedChambersList[0].id}` : `doc-${Date.now()}`),
    doctorId: rawId || `doc-${Date.now()}`,
    specialtyId: resolvedSpecialtyId || '',
    specialtyNameBn: resolvedSpecialtyNameBn,
    specialtyNameEn: resolvedSpecialtyNameEn,
    specialty: resolvedSpecialtyNameBn,
    name: doctor.name || '',
    bmdc: doctor.bmdc || doctor.bmdc_number || '',
    degrees: doctor.degrees || '',
    designation: doctor.designation || '',
    workplace: doctor.workplace || '',
    about: doctor.about || doctor.biography || '',
    psPhone: doctor.psPhone || doctor.ps_phone || '',
    photoUrl: doctor.photoUrl || doctor.photo_url || '',
    priorityIndex: Number(doctor.priorityIndex ?? doctor.display_priority ?? 10),
    isActive: doctor.isActive !== false && doctor.is_active !== false,
    rating: doctor.rating != null ? Number(doctor.rating) : 5.0,
    reviewCount: Number(doctor.reviewCount ?? doctor.review_count ?? 0),
    
    // Flat primary chamber fields
    chamberId: firstChamber.id || '',
    facilityId: firstChamber.facilityId || '',
    facilityName: firstChamber.facilityName || '',
    facilityAddress: firstChamber.facilityAddress || '',
    facilityDistrictId: firstChamber.facilityDistrictId || '',
    facility: firstChamber.facilityName || '',
    chamberAddress: firstChamber.facilityAddress || '',
    chamberRoomNo: firstChamber.roomNo || '',
    chamberFloor: firstChamber.floor || 'নিচতলা',
    chamberBuildingStand: firstChamber.buildingStand || 'মেইন বিল্ডিং',
    visitingDays: firstChamber.visitingDays || ['সবদিন'],
    visitingTime: firstChamber.visitingTime || '',
    feesNew: firstChamber.feeNew || 0,
    feesOld: firstChamber.feeOld || 0,
    chambers: resolvedChambersList
  };

  // Always update LocalStorage cache immediately for responsive instant feedback
  try {
    // Clear from deleted doctor IDs tracking list if present
    const deletedDoctorIds: string[] = JSON.parse(localStorage.getItem('sheba_deleted_doctor_ids') || '[]');
    if (deletedDoctorIds.length > 0) {
      const toRemove = [unifiedDoctor.id, unifiedDoctor.doctorId, unifiedDoctor.bmdc, unifiedDoctor.name, rawId].filter(Boolean);
      const cleaned = deletedDoctorIds.filter(id => !toRemove.includes(id));
      localStorage.setItem('sheba_deleted_doctor_ids', JSON.stringify(cleaned));
    }

    const existingDoctors = await getDoctors();
    const filteredDoctors = existingDoctors.filter(d => {
      const dDocId = (d.doctorId || d.id || '').split('::')[0];
      const targetId = (unifiedDoctor.doctorId || unifiedDoctor.id || '').split('::')[0];
      return dDocId !== targetId && d.id !== unifiedDoctor.id && (rawId ? dDocId !== rawId : true);
    });
    localStorage.setItem('sheba_doctors_v3', JSON.stringify([unifiedDoctor, ...filteredDoctors]));
  } catch (localErr) {
    console.warn('LocalStorage doctors sync warning:', localErr);
  }

  // 2. Persist to Supabase if configured
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    // Determine existing or new target ID in Supabase
    let targetDocId: string | null = (rawId && uuidRegex.test(rawId)) ? rawId : null;

    if (!targetDocId && rawId && uuidRegex.test(rawId)) {
      // Check if this ID exists in Supabase
      const { data: existingById } = await supabase.from('doctors').select('id').eq('id', rawId).maybeSingle();
      if (existingById?.id) {
        targetDocId = existingById.id;
      }
    }

    if (!targetDocId && doctor.bmdc) {
      // Check by BMDC number
      const { data: existingByBmdc } = await supabase.from('doctors').select('id').eq('bmdc_number', doctor.bmdc).maybeSingle();
      if (existingByBmdc?.id) {
        targetDocId = existingByBmdc.id;
      }
    }

    if (!targetDocId && doctor.name) {
      // Check by Name
      const { data: existingByName } = await supabase.from('doctors').select('id').eq('name', doctor.name).maybeSingle();
      if (existingByName?.id) {
        targetDocId = existingByName.id;
      }
    }

    const isNew = !targetDocId;
    if (isNew) {
      targetDocId = crypto.randomUUID();
    }

    // Fetch specialties in Supabase to resolve valid specialty_id
    let dbSpecialties: any[] = [];
    try {
      const { data: specs } = await supabase.from('specialties').select('id, name_bn, name_en');
      if (specs) dbSpecialties = specs;
    } catch {
      // Non-fatal
    }

    let finalSpecialtyId: string | null = null;
    if (resolvedSpecialtyId && dbSpecialties.some(s => s.id === resolvedSpecialtyId)) {
      finalSpecialtyId = resolvedSpecialtyId;
    } else if (resolvedSpecialtyNameBn && dbSpecialties.length > 0) {
      const matchedSpec = dbSpecialties.find(s => s.name_bn === resolvedSpecialtyNameBn || s.name_en === resolvedSpecialtyNameEn);
      if (matchedSpec) finalSpecialtyId = matchedSpec.id;
    }

    // Prepare doctor DB payload
    const docPayload: any = {
      name: doctor.name.trim(),
      bmdc_number: doctor.bmdc?.trim() || doctor.bmdc_number?.trim() || '',
      degrees: doctor.degrees?.trim() || '',
      designation: doctor.designation?.trim() || '',
      workplace: doctor.workplace?.trim() || '',
      ps_phone: doctor.psPhone?.trim() || doctor.ps_phone?.trim() || null,
      photo_url: doctor.photoUrl?.trim() || doctor.photo_url?.trim() || '',
      display_priority: Number(doctor.priorityIndex ?? doctor.display_priority ?? 10),
      is_active: doctor.isActive !== false && doctor.is_active !== false,
      rating: doctor.rating != null ? Number(doctor.rating) : 5.0,
      review_count: Number(doctor.reviewCount ?? doctor.review_count ?? 0),
      specialty_id: finalSpecialtyId
    };

    if (doctor.about !== undefined) {
      docPayload.about = doctor.about;
    }

    if (doctor.subSpecialty !== undefined || doctor.sub_specialty !== undefined) {
      docPayload.sub_specialty = doctor.subSpecialty || doctor.sub_specialty || '';
    }

    if (Array.isArray(doctor.specialtyIds) || Array.isArray(doctor.specialty_ids)) {
      docPayload.specialty_ids = doctor.specialtyIds || doctor.specialty_ids;
    }
    if (Array.isArray(doctor.specialties)) {
      docPayload.specialties = doctor.specialties;
    }

    // Upsert Doctor profile
    let didUpdate = false;
    if (!isNew && targetDocId) {
      const { data: updateData, error: updateErr } = await supabase
        .from('doctors')
        .update(docPayload)
        .eq('id', targetDocId)
        .select('id');

      if (updateErr) {
        if (updateErr.message?.includes('specialty_ids') || updateErr.message?.includes('specialties') || updateErr.message?.includes('sub_specialty') || updateErr.message?.includes('column')) {
          delete docPayload.specialty_ids;
          delete docPayload.specialties;
          delete docPayload.sub_specialty;
          if (updateErr.message?.includes('about')) {
            delete docPayload.about;
          }
          const { data: retryData, error: retryUpdateErr } = await supabase
            .from('doctors')
            .update(docPayload)
            .eq('id', targetDocId)
            .select('id');
          if (retryUpdateErr) throw retryUpdateErr;
          if (retryData && retryData.length > 0) {
            didUpdate = true;
          }
        } else if (updateErr.message?.includes('specialty_id')) {
          docPayload.specialty_id = null;
          const { data: retryData, error: retrySpecErr } = await supabase
            .from('doctors')
            .update(docPayload)
            .eq('id', targetDocId)
            .select('id');
          if (retrySpecErr) throw retrySpecErr;
          if (retryData && retryData.length > 0) {
            didUpdate = true;
          }
        } else {
          throw updateErr;
        }
      } else if (updateData && updateData.length > 0) {
        didUpdate = true;
      }
    }

    if (isNew || !didUpdate) {
      const insertPayload = { id: targetDocId, ...docPayload };
      const { error: insertErr } = await supabase
        .from('doctors')
        .insert(insertPayload);

      if (insertErr) {
        if (insertErr.message?.includes('specialty_ids') || insertErr.message?.includes('specialties') || insertErr.message?.includes('sub_specialty') || insertErr.message?.includes('column')) {
          delete insertPayload.specialty_ids;
          delete insertPayload.specialties;
          delete insertPayload.sub_specialty;
          if (insertErr.message?.includes('about')) {
            delete insertPayload.about;
          }
          const { error: retryInsertErr } = await supabase
            .from('doctors')
            .insert(insertPayload);
          if (retryInsertErr) throw retryInsertErr;
        } else if (insertErr.message?.includes('specialty_id')) {
          insertPayload.specialty_id = null;
          const { error: retrySpecErr } = await supabase
            .from('doctors')
            .insert(insertPayload);
          if (retrySpecErr) throw retrySpecErr;
        } else {
          throw insertErr;
        }
      }
    }

    // 3. Sync chambers table for doctor
    if (targetDocId) {
      // Delete old chambers
      const { error: delChErr } = await supabase
        .from('chambers')
        .delete()
        .eq('doctor_id', targetDocId);

      if (delChErr) {
        console.warn('[Supabase] Delete chambers notice:', delChErr.message);
      }

      // Fetch facilities for ID resolution
      let dbFacilities: any[] = [];
      try {
        const { data: facs } = await supabase.from('facilities').select('id, name');
        if (facs) dbFacilities = facs;
      } catch {
        // Non-fatal
      }

      const chamberRecords = resolvedChambersList.map((ch: any) => {
        const cleanChId = (ch.id || '').includes('::') ? ch.id.split('::')[1] : ch.id;
        const validChId = cleanChId && uuidRegex.test(cleanChId) ? cleanChId : crypto.randomUUID();

        let resolvedFacId = ch.facilityId || ch.facility_id;
        if (dbFacilities.length > 0) {
          const matchedById = dbFacilities.find(f => f.id === resolvedFacId);
          const matchedByName = dbFacilities.find(f => f.name === ch.facilityName || f.name === ch.facility);
          if (matchedById) {
            resolvedFacId = matchedById.id;
          } else if (matchedByName) {
            resolvedFacId = matchedByName.id;
          }
        }

        const daysStr = Array.isArray(ch.visitingDays) 
          ? ch.visitingDays.join(', ') 
          : (ch.visitingDays || ch.visiting_days || 'সবদিন');

        return {
          id: validChId,
          doctor_id: targetDocId,
          facility_id: resolvedFacId || null,
          room_no: ch.roomNo || ch.room_no || '',
          floor: ch.floor || 'নিচতলা',
          building_info: ch.buildingStand || ch.building_info || 'মেইন বিল্ডিং',
          building_stand: ch.buildingStand || ch.building_info || 'মেইন বিল্ডিং',
          visiting_days: daysStr,
          visiting_time: ch.visitingTime || ch.visiting_time || '',
          fee_new: Number(ch.feeNew ?? ch.fee_new ?? 0),
          fee_old: Number(ch.feeOld ?? ch.fee_old ?? 0)
        };
      });

      if (chamberRecords.length > 0) {
        const { error: insChError } = await supabase
          .from('chambers')
          .insert(chamberRecords);

        if (insChError) {
          console.warn('[Supabase] Chamber insert notice, retrying without explicit ID:', insChError.message);
          const recordsWithoutId = chamberRecords.map(({ id, ...rest }) => rest);
          const { error: retryErr } = await supabase.from('chambers').insert(recordsWithoutId);
          if (retryErr) {
            console.error('[Supabase] Chamber insert retry failed:', retryErr.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Sync Notice] Doctor profile saved locally. Supabase write notice:', err?.message || err);
    // Gracefully handle Supabase RLS / network errors so the doctor save succeeds smoothly in the UI
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
      const fac = ch ? facilityMap.get(ch.facility_id) : (doc ? facilityMap.get(doc.facility_id) : null);
      const phone = app.patient_phone || '';

      return {
        id: app.booking_code || app.id,
        doctorId: app.doctor_id,
        doctorName: doc?.name || app.doctor_name || '',
        doctorDegrees: doc?.degrees || '',
        doctorSpecialty: spec?.name_bn || doc?.specialty || '',
        chamberId: app.chamber_id,
        facilityName: app.assigned_facility_name || fac?.name || doc?.facility || '',
        facilityAddress: fac?.area_address || '',
        chamberRoomNo: ch?.room_no || app.assigned_room_no || '',
        chamberFloor: ch?.floor || app.assigned_floor || '',
        chamberBuildingStand: ch?.building_info || app.assigned_building || '',
        visitingTime: ch?.visiting_time || app.confirmed_visiting_time || doc?.visiting_time || '',
        patientName: app.patient_name,
        patientAge: app.patient_age,
        patientPhone: phone,
        patientMobile: phone,
        preferredDate: app.preferred_date,
        status: app.status as Appointment['status'],
        serialNo: app.serial_no || undefined,
        assignedRoomNo: app.assigned_room_no || ch?.room_no || undefined,
        assignedFloor: app.assigned_floor || ch?.floor || undefined,
        assignedBuilding: app.assigned_building || ch?.building_info || undefined,
        confirmedVisitingTime: app.confirmed_visiting_time || ch?.visiting_time || doc?.visiting_time || undefined,
        specialInstructions: app.special_instructions || app.admin_notes || undefined,
        rejectionReason: app.rejection_reason || undefined,
        adminNotes: app.admin_notes || app.special_instructions || undefined,
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
        assigned_facility_name: app.assignedFacilityName || app.facilityName,
        assigned_room_no: app.assignedRoomNo || app.chamberRoomNo,
        assigned_floor: app.assignedFloor || app.chamberFloor,
        assigned_building: app.assignedBuilding || app.chamberBuildingStand,
        confirmed_visiting_time: app.confirmedVisitingTime || app.visitingTime,
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
  assignedFacilityName?: string;
  specialInstructions?: string;
  adminNotes?: string;
}

export async function confirmAppointment(params: ConfirmAppointmentParams): Promise<void> {
  const appointments = await getAppointments();
  const nowStr = new Date().toISOString();

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
        facilityName: params.assignedFacilityName || app.facilityName,
        specialInstructions: params.specialInstructions || params.adminNotes,
        adminNotes: params.adminNotes || params.specialInstructions,
        updatedAt: nowStr
      };
    }
    return app;
  });
  localStorage.setItem('sheba_appointments_v3', JSON.stringify(updated));

  if (!isSupabaseConfigured || !supabase) {
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
        assigned_facility_name: params.assignedFacilityName || null,
        special_instructions: params.specialInstructions || params.adminNotes || null,
        admin_notes: params.adminNotes || params.specialInstructions || null,
        updated_at: nowStr
      })
      .eq('booking_code', params.bookingCode);

    if (error) {
      console.warn('Primary confirm appointment update notice, trying core columns fallback:', error.message);
      // Fallback in case assigned_facility_name column doesn't exist yet on DB schema
      const { error: e2 } = await supabase
        .from('appointments')
        .update({
          status: 'Confirmed',
          serial_no: params.serialNo,
          assigned_room_no: params.assignedRoomNo,
          assigned_floor: params.assignedFloor || null,
          assigned_building: params.assignedBuilding || null,
          confirmed_visiting_time: params.confirmedVisitingTime,
          updated_at: nowStr
        })
        .eq('booking_code', params.bookingCode);
      
      if (e2) console.warn('Supabase confirm appointment fallback notice:', e2.message);
    }
  } catch (err) {
    console.error('Error confirming appointment in Supabase:', err);
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
      .select('id, doctor_id, patient_name, rating, comment, review_text, is_verified_patient, is_approved, is_admin_created, created_at, doctors(name)')
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
      isAdminCreated: r.is_admin_created ?? false,
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

export async function deleteReview(reviewId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_reviews_v1');
    if (saved) {
      const reviews: Review[] = JSON.parse(saved);
      const filtered = reviews.filter(r => r.id !== reviewId);
      localStorage.setItem('sheba_reviews_v1', JSON.stringify(filtered));
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    if (error) throw error;

    const saved = localStorage.getItem('sheba_reviews_v1');
    if (saved) {
      const reviews: Review[] = JSON.parse(saved);
      const filtered = reviews.filter(r => r.id !== reviewId);
      localStorage.setItem('sheba_reviews_v1', JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Error deleting review:', err);
    throw err;
  }
}

export async function addAdminReview(params: {
  doctorId: string;
  doctorName?: string;
  patientName: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}): Promise<Review> {
  const cleanDocId = params.doctorId.split('::')[0];
  const dateStr = params.createdAt ? new Date(params.createdAt).toISOString() : new Date().toISOString();

  const newReviewObj: Review = {
    id: `rev-admin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    doctorId: cleanDocId,
    doctorName: params.doctorName || '',
    patientName: params.patientName.trim(),
    rating: params.rating,
    comment: params.comment?.trim() || '',
    reviewText: params.comment?.trim() || '',
    isVerifiedPatient: true,
    isApproved: true,
    isAdminCreated: true,
    createdAt: dateStr
  };

  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_reviews_v1');
    const reviews: Review[] = saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    const updated = [newReviewObj, ...reviews];
    localStorage.setItem('sheba_reviews_v1', JSON.stringify(updated));
    return newReviewObj;
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        doctor_id: cleanDocId,
        patient_name: params.patientName.trim(),
        patient_phone: null,
        rating: params.rating,
        comment: params.comment?.trim() || null,
        review_text: params.comment?.trim() || null,
        is_verified_patient: true,
        is_approved: true,
        is_admin_created: true,
        created_at: dateStr
      })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      newReviewObj.id = data.id;
    }

    const saved = localStorage.getItem('sheba_reviews_v1');
    const reviews: Review[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem('sheba_reviews_v1', JSON.stringify([newReviewObj, ...reviews]));

    return newReviewObj;
  } catch (err) {
    console.error('Error adding admin review:', err);
    const saved = localStorage.getItem('sheba_reviews_v1');
    const reviews: Review[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem('sheba_reviews_v1', JSON.stringify([newReviewObj, ...reviews]));
    return newReviewObj;
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
// 9. PROMO BANNERS CRUD & STORAGE
// ==========================================

const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    title: 'বিনামূল্যে ডায়াবেটিস স্ক্রীনিং ক্যাম্প',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    banner_image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
    targetUrl: '#directory',
    target_url: '#directory',
    slot: 'home_hero_top',
    placement_slot: 'home_hero_top',
    isActive: true,
    is_active: true,
    displayOrder: 1,
    display_order: 1,
    createdAt: new Date('2026-08-25').toISOString()
  },
  {
    id: 'f9e8d7c6-b5a4-4f3e-2d1c-0b9a8f7e6d5c',
    title: 'পপুলার হেলথ প্যাকেজ - ২০% ছাড়',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    banner_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    targetUrl: '#directory',
    target_url: '#directory',
    slot: 'sidebar_rect',
    placement_slot: 'sidebar_rect',
    isActive: true,
    is_active: true,
    displayOrder: 1,
    display_order: 1,
    createdAt: new Date('2026-08-26').toISOString()
  }
];

export async function uploadBannerImage(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('banner-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.warn('Storage bucket upload error, falling back to base64 Data URL:', uploadError);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data } = supabase.storage
      .from('banner-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (err) {
    console.error('Error uploading banner image:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'b' + Date.now().toString(16).padStart(11, '0') + '-4000-8000-' + Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
}

export async function getPromoBanners(): Promise<PromoBanner[]> {
  let deletedIds: string[] = [];
  try {
    deletedIds = JSON.parse(localStorage.getItem('sheba_deleted_banner_ids') || '[]');
  } catch (e) {}

  const filterDeleted = (list: PromoBanner[]) => list.filter(b => b && b.id && !deletedIds.includes(b.id));

  if (!isSupabaseConfigured || !supabase) {
    const saved = localStorage.getItem('sheba_banners');
    if (!saved) {
      const initial = filterDeleted(INITIAL_BANNERS);
      localStorage.setItem('sheba_banners', JSON.stringify(initial));
      return initial;
    }
    return filterDeleted(JSON.parse(saved));
  }

  try {
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Promo banners query notice:', error.message);
      const saved = localStorage.getItem('sheba_banners');
      if (!saved) {
        const initial = filterDeleted(INITIAL_BANNERS);
        localStorage.setItem('sheba_banners', JSON.stringify(initial));
        return initial;
      }
      return filterDeleted(JSON.parse(saved));
    }

    const mapped: PromoBanner[] = (data || []).map((b: any) => {
      const img = b.banner_image || b.image_url || '';
      const slotVal = (b.placement_slot || b.slot || 'home_hero_top') as BannerPlacementSlot;
      const activeVal = b.is_active ?? true;
      const orderVal = b.display_order ?? 1;
      const targetVal = b.target_url || '';

      return {
        id: b.id,
        title: b.title || '',
        imageUrl: img,
        banner_image: img,
        targetUrl: targetVal,
        target_url: targetVal,
        slot: slotVal,
        placement_slot: slotVal,
        isActive: activeVal,
        is_active: activeVal,
        displayOrder: orderVal,
        display_order: orderVal,
        createdAt: b.created_at || new Date().toISOString(),
        updatedAt: b.updated_at
      };
    });

    const finalFiltered = filterDeleted(mapped);
    if (data && data.length > 0) {
      localStorage.setItem('sheba_banners', JSON.stringify(finalFiltered));
      return finalFiltered;
    }

    const saved = localStorage.getItem('sheba_banners');
    if (saved) return filterDeleted(JSON.parse(saved));
    return filterDeleted(INITIAL_BANNERS);
  } catch (err) {
    console.error('Error fetching banners from Supabase:', err);
    const saved = localStorage.getItem('sheba_banners');
    if (saved) return filterDeleted(JSON.parse(saved));
    return filterDeleted(INITIAL_BANNERS);
  }
}

export async function addPromoBanner(banner: Omit<PromoBanner, 'id' | 'createdAt'>): Promise<PromoBanner> {
  const banners = await getPromoBanners();
  const newId = generateUUID();
  const imgUrl = banner.imageUrl || banner.banner_image || '';
  const slotVal = banner.placement_slot || banner.slot || 'home_hero_top';
  const targetVal = banner.targetUrl || banner.target_url || '';
  const activeVal = banner.isActive ?? banner.is_active ?? true;
  const orderVal = banner.displayOrder ?? banner.display_order ?? 1;

  const newItem: PromoBanner = {
    id: newId,
    title: banner.title,
    imageUrl: imgUrl,
    banner_image: imgUrl,
    targetUrl: targetVal,
    target_url: targetVal,
    slot: slotVal,
    placement_slot: slotVal,
    isActive: activeVal,
    is_active: activeVal,
    displayOrder: orderVal,
    display_order: orderVal,
    createdAt: new Date().toISOString()
  };

  if (!isSupabaseConfigured || !supabase) {
    const updated = [newItem, ...banners];
    localStorage.setItem('sheba_banners', JSON.stringify(updated));
    return newItem;
  }

  try {
    const payload: any = {
      id: newId,
      title: banner.title,
      banner_image: imgUrl,
      target_url: targetVal || null,
      placement_slot: slotVal,
      is_active: activeVal,
      display_order: orderVal,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('promo_banners')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('Primary insert error, retrying without id:', error);
      delete payload.id;
      const { data: d2, error: e2 } = await supabase
        .from('promo_banners')
        .insert(payload)
        .select()
        .single();
      
      if (d2) newItem.id = d2.id;
      if (e2) console.warn('Supabase secondary insert notice:', e2);
    } else if (data) {
      newItem.id = data.id;
    }

    const updated = [newItem, ...banners.filter(b => b.id !== newItem.id)];
    localStorage.setItem('sheba_banners', JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.error('Error inserting banner into Supabase:', err);
    const updated = [newItem, ...banners];
    localStorage.setItem('sheba_banners', JSON.stringify(updated));
    return newItem;
  }
}

export async function updatePromoBanner(banner: PromoBanner): Promise<void> {
  const banners = await getPromoBanners();
  const imgUrl = banner.imageUrl || banner.banner_image || '';
  const slotVal = banner.placement_slot || banner.slot || 'home_hero_top';
  const targetVal = banner.targetUrl || banner.target_url || '';
  const activeVal = banner.isActive ?? banner.is_active ?? true;
  const orderVal = banner.displayOrder ?? banner.display_order ?? 1;

  const updatedBanner: PromoBanner = {
    ...banner,
    imageUrl: imgUrl,
    banner_image: imgUrl,
    slot: slotVal,
    placement_slot: slotVal,
    targetUrl: targetVal,
    target_url: targetVal,
    isActive: activeVal,
    is_active: activeVal,
    displayOrder: orderVal,
    display_order: orderVal,
    updatedAt: new Date().toISOString()
  };

  const updatedList = banners.map(b => b.id === banner.id ? updatedBanner : b);
  localStorage.setItem('sheba_banners', JSON.stringify(updatedList));

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const payload: any = {
      title: banner.title,
      banner_image: imgUrl,
      target_url: targetVal || null,
      placement_slot: slotVal,
      is_active: activeVal,
      display_order: orderVal,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('promo_banners')
      .update(payload)
      .eq('id', banner.id);

    if (error) {
      console.warn('Supabase banner update notice:', error);
    }
  } catch (err) {
    console.error('Error updating banner in Supabase:', err);
  }
}

export async function togglePromoBannerActive(id: string, isActive: boolean): Promise<void> {
  const banners = await getPromoBanners();
  const updatedList = banners.map(b => b.id === id ? { ...b, isActive, is_active: isActive } : b);
  localStorage.setItem('sheba_banners', JSON.stringify(updatedList));

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase
      .from('promo_banners')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) console.warn('Supabase banner toggle notice:', error);
  } catch (err) {
    console.error('Error toggling banner status in Supabase:', err);
  }
}

export async function deletePromoBanner(id: string): Promise<void> {
  try {
    const deletedIds = JSON.parse(localStorage.getItem('sheba_deleted_banner_ids') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('sheba_deleted_banner_ids', JSON.stringify(deletedIds));
    }
  } catch (e) {}

  const saved = localStorage.getItem('sheba_banners');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const filtered = parsed.filter((b: any) => b.id !== id);
      localStorage.setItem('sheba_banners', JSON.stringify(filtered));
    } catch (e) {}
  }

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from('promo_banners')
      .delete()
      .eq('id', id);

    if (error) console.warn('Supabase banner delete notice:', error.message);
  } catch (err) {
    console.error('Error deleting banner from Supabase:', err);
  }
}

