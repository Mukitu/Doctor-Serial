import { Doctor, Specialty, Facility, District } from '../types';

export interface DoctorFilterOptions {
  searchTerm?: string;
  selectedDistrict?: string;
  selectedSpecialty?: string;
  selectedFacility?: string;
  selectedDays?: string[];
}

export function filterDoctorsList(
  doctors: Doctor[],
  options: DoctorFilterOptions,
  specialties: Specialty[] = [],
  districts: District[] = []
): Doctor[] {
  const {
    searchTerm = '',
    selectedDistrict = '',
    selectedSpecialty = '',
    selectedFacility = '',
    selectedDays = []
  } = options;

  return doctors.filter(doc => {
    // 1. Search term match
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        (doc.name || '').toLowerCase().includes(term) ||
        (doc.degrees || '').toLowerCase().includes(term) ||
        (doc.bmdc || '').toLowerCase().includes(term) ||
        (doc.workplace || '').toLowerCase().includes(term) ||
        (doc.specialty || '').toLowerCase().includes(term) ||
        (doc.specialtyNameBn || '').toLowerCase().includes(term) ||
        (doc.facilityName || '').toLowerCase().includes(term) ||
        (doc.facility || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // 2. Specialty Filter
    if (
      selectedSpecialty && 
      selectedSpecialty !== '' && 
      selectedSpecialty !== 'সকল বিশেষজ্ঞ' && 
      selectedSpecialty !== 'সকল বিশেষজ্ঞ (All)' &&
      selectedSpecialty !== 'সকল বিশেষজ্ঞ সিলেক্ট করুন' && 
      selectedSpecialty !== 'all'
    ) {
      const selNorm = selectedSpecialty.toLowerCase().trim();
      const docSpec = (doc.specialty || '').toLowerCase();
      const docSpecBn = (doc.specialtyNameBn || '').toLowerCase();
      const docSpecEn = (doc.specialtyNameEn || '').toLowerCase();
      const docDeg = (doc.degrees || '').toLowerCase();

      const exactMatch = 
        doc.specialty === selectedSpecialty ||
        doc.specialtyNameBn === selectedSpecialty ||
        doc.specialtyId === selectedSpecialty ||
        docSpec === selNorm ||
        docSpecBn === selNorm;

      let synonymMatch = false;
      if (selNorm.includes('মেডিসিন') || selNorm.includes('medicine')) {
        synonymMatch = docSpec.includes('মেডিসিন') || docSpecBn.includes('মেডিসিন') || docSpecEn.includes('medicine') || docDeg.includes('medicine') || docDeg.includes('fcps');
      } else if (selNorm.includes('হৃদরোগ') || selNorm.includes('cardio') || selNorm.includes('কার্ডিওলজি')) {
        synonymMatch = docSpec.includes('হৃদ') || docSpec.includes('কার্ডি') || docSpecBn.includes('হৃদ') || docSpecBn.includes('কার্ডি') || docSpecEn.includes('cardio') || docDeg.includes('cardio') || docDeg.includes('d-card');
      } else if (selNorm.includes('শিশু') || selNorm.includes('pediatric') || selNorm.includes('child')) {
        synonymMatch = docSpec.includes('শিশু') || docSpecBn.includes('শিশু') || docSpecEn.includes('pediatric') || docDeg.includes('pediatric') || docDeg.includes('child') || docDeg.includes('dch');
      } else if (selNorm.includes('গাইনি') || selNorm.includes('স্ত্রী') || selNorm.includes('gyne') || selNorm.includes('obs')) {
        synonymMatch = docSpec.includes('গাইনি') || docSpec.includes('স্ত্রী') || docSpecBn.includes('গাইনি') || docSpecBn.includes('স্ত্রী') || docSpecEn.includes('gyne') || docDeg.includes('gyne') || docDeg.includes('dgo') || docDeg.includes('mcps');
      } else if (selNorm.includes('অর্থোপেডিক') || selNorm.includes('ortho') || selNorm.includes('হাড়')) {
        synonymMatch = docSpec.includes('অর্থোপেডিক') || docSpecBn.includes('অর্থোপেডিক') || docSpecEn.includes('ortho') || docDeg.includes('ortho') || docDeg.includes('ms (orthopedics)');
      } else if (selNorm.includes('চক্ষু') || selNorm.includes('চোখ') || selNorm.includes('eye') || selNorm.includes('ophthal')) {
        synonymMatch = docSpec.includes('চক্ষু') || docSpecBn.includes('চক্ষু') || docSpecEn.includes('eye') || docSpecEn.includes('ophthal') || docDeg.includes('eye');
      } else if (selNorm.includes('সার্জারি') || selNorm.includes('surgery')) {
        synonymMatch = docSpec.includes('সার্জারি') || docSpecBn.includes('সার্জারি') || docSpecEn.includes('surgery') || docDeg.includes('surgery');
      } else if (selNorm.includes('চর্ম') || selNorm.includes('যৌন') || selNorm.includes('skin') || selNorm.includes('derma')) {
        synonymMatch = docSpec.includes('চর্ম') || docSpecBn.includes('চর্ম') || docSpecEn.includes('derma') || docDeg.includes('derma') || docDeg.includes('skin');
      } else if (selNorm.includes('ডায়াবেটিস') || selNorm.includes('diabet') || selNorm.includes('endocrin')) {
        synonymMatch = docSpec.includes('ডায়াবেটিস') || docSpecBn.includes('ডায়াবেটিস') || docSpecEn.includes('diabet') || docDeg.includes('diabet');
      } else {
        synonymMatch = docSpec.includes(selNorm) || docSpecBn.includes(selNorm) || docSpecEn.includes(selNorm) || selNorm.includes(docSpec) || selNorm.includes(docSpecBn);
      }

      if (!exactMatch && !synonymMatch) return false;
    }

    // 3. Chamber Facility Filter
    if (
      selectedFacility && 
      selectedFacility !== '' && 
      selectedFacility !== 'সকল হাসপাতাল/চেম্বার' && 
      selectedFacility !== 'সকল হাসপাতাল ও ডায়াগনস্টিক (All)' &&
      selectedFacility !== 'all'
    ) {
      const facNorm = selectedFacility.toLowerCase().trim();
      const docFac = (doc.facility || '').toLowerCase();
      const docFacName = (doc.facilityName || '').toLowerCase();

      const matchesPrimary = 
        doc.facilityName === selectedFacility || 
        doc.facilityId === selectedFacility ||
        doc.facility === selectedFacility ||
        docFac.includes(facNorm) ||
        docFacName.includes(facNorm) ||
        facNorm.includes(docFacName) ||
        facNorm.includes(docFac);

      const matchesChambers = doc.chambers?.some(ch => {
        const chFacName = (ch.facilityName || '').toLowerCase();
        const chFacAddr = (ch.facilityAddress || '').toLowerCase();
        return ch.facilityName === selectedFacility ||
               ch.facilityId === selectedFacility ||
               chFacName.includes(facNorm) ||
               chFacAddr.includes(facNorm) ||
               facNorm.includes(chFacName);
      });

      if (!matchesPrimary && !matchesChambers) return false;
    }

    // 4. District Filter
    if (
      selectedDistrict && 
      selectedDistrict !== 'সকল জেলা' && 
      selectedDistrict !== 'সকল জেলা (All)' && 
      selectedDistrict !== 'all' && 
      selectedDistrict !== ''
    ) {
      const distNorm = selectedDistrict.toLowerCase().trim();
      const currentDistrictObj = districts.find(
        d => d.nameBn === selectedDistrict || d.id === selectedDistrict || d.nameEn?.toLowerCase() === distNorm
      );

      const matchesPrimary = 
        doc.facilityDistrictId === selectedDistrict ||
        (currentDistrictObj ? (doc.facilityDistrictId === currentDistrictObj.id || doc.facilityDistrictId === currentDistrictObj.nameBn) : false) ||
        (doc.facilityAddress || '').includes(selectedDistrict) ||
        (doc.facility || '').includes(selectedDistrict) ||
        (doc.chamberAddress || '').includes(selectedDistrict) ||
        (doc.workplace || '').includes(selectedDistrict);

      const matchesChambers = doc.chambers?.some(ch => 
        (ch.facilityAddress || '').includes(selectedDistrict) ||
        (ch.facilityName || '').includes(selectedDistrict)
      );

      if (!matchesPrimary && !matchesChambers) return false;
    }

    // 5. Visiting Days Filter
    if (selectedDays && selectedDays.length > 0) {
      const matchesPrimaryDays = selectedDays.some(day => (doc.visitingDays || []).includes(day));
      const matchesChamberDays = doc.chambers?.some(ch => 
        selectedDays.some(day => (ch.visitingDays || []).includes(day))
      );
      if (!matchesPrimaryDays && !matchesChamberDays) return false;
    }

    return true;
  });
}
