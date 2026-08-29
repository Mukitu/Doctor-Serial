/**
 * BULLETPROOF SMS HELPER UTILITY
 * Application: MyDocBD (mydocbd.com)
 * Cross-Platform (Android, iOS, Desktop) SMS Links & Clipboard Copy Helper
 */

/**
 * Clean & Format Bangladeshi Mobile Phone Numbers
 * Strips non-digits, normalizes local 017XXXXXXXX or +88017XXXXXXXX formats.
 */
export function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');

  // If phone starts with 8801... (13 digits), convert to 01...
  if (digits.startsWith('8801') && digits.length === 13) {
    return '0' + digits.slice(3);
  }

  // If phone starts with 01... (11 digits)
  if (digits.startsWith('01') && digits.length === 11) {
    return digits;
  }

  // If 10 digits starting with 1...
  if (digits.startsWith('1') && digits.length === 10) {
    return '0' + digits;
  }

  return digits || phone.trim();
}

export interface SmsTemplateData {
  patientName: string;
  doctorName: string;
  facilityName?: string;
  serialNo: string;
  roomNo?: string;
  floor?: string;
  building?: string;
  visitingTime?: string;
  date?: string;
  specialInstructions?: string;
}

/**
 * Concise & Highly Informative Bangla SMS Template
 * Automatically embeds patient name, doctor name, clinic/chamber, serial no, room, floor, building, and visiting time.
 */
export function generateSmsText(data: SmsTemplateData): string {
  const patient = (data.patientName || 'রোগী').trim();
  
  let doctor = (data.doctorName || 'বিশেষজ্ঞ চিকিৎসক').trim();
  // Ensure appropriate prefix without duplicate prefixes like "ডাঃ ডাঃ" or "Dr. ডাঃ"
  const hasPrefix = 
    doctor.startsWith('ডাঃ') || 
    doctor.startsWith('ডা.') || 
    doctor.startsWith('ডা ') || 
    doctor.startsWith('Dr.') || 
    doctor.startsWith('Dr ') || 
    doctor.startsWith('অধ্যাপক') || 
    doctor.startsWith('সহকারী') || 
    doctor.startsWith('সহযোগী') ||
    doctor.startsWith('কনসালটেন্ট');
  
  if (!hasPrefix) {
    doctor = `ডাঃ ${doctor}`;
  }

  const facility = (data.facilityName || 'হাসপাতাল/চেম্বার').trim();
  const serial = (data.serialNo || '০১').trim();
  
  // Location parts: Room, Floor, Building
  const locationParts: string[] = [];
  if (data.roomNo && data.roomNo.trim()) {
    locationParts.push(`রুম: ${data.roomNo.trim()}`);
  }
  if (data.floor && data.floor.trim()) {
    locationParts.push(data.floor.trim());
  }
  if (data.building && data.building.trim()) {
    locationParts.push(data.building.trim());
  }
  const locationStr = locationParts.length > 0 ? locationParts.join(', ') : '';

  const visitingTime = (data.visitingTime || 'নির্ধারিত সময়').trim();
  const apptDate = (data.date || 'আজ/আগামীকাল').trim();

  let sms = `MyDocBD: সিরিয়াল নিশ্চিত।\n`;
  sms += `রোগী: ${patient}\n`;
  sms += `${doctor}\n`;
  sms += `হাসপাতাল: ${facility}\n`;
  sms += `সিরিয়াল: ${serial}\n`;
  if (locationStr) {
    sms += `স্থান: ${locationStr}\n`;
  }
  sms += `সময়: ${visitingTime}, ${apptDate}\n`;
  if (data.specialInstructions && data.specialInstructions.trim()) {
    sms += `নির্দেশনা: ${data.specialInstructions.trim()}\n`;
  }
  sms += `ট্র্যাক: mydocbd.com`;

  return sms;
}

/**
 * Universal SMS URI Formatter
 * Detects iOS vs Android/Desktop and constructs the standard URI:
 * sms:${cleanPhone}${isIOS ? '&' : '?'}body=${encodeURIComponent(smsText)}
 */
export function getSmsUri(phone: string, smsText: string): string {
  const cleaned = cleanPhone(phone);

  let isIOS = false;
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  }

  const delimiter = isIOS ? '&' : '?';
  return `sms:${cleaned}${delimiter}body=${encodeURIComponent(smsText)}`;
}

/**
 * Fallback Clipboard Copy
 * Provides 1-click clipboard copying for desktop or when native messaging app does not launch.
 */
export async function copySmsToClipboard(smsText: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(smsText);
      return true;
    } else {
      // Fallback for non-HTTPS or legacy browsers
      const textArea = document.createElement('textarea');
      textArea.value = smsText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
}
