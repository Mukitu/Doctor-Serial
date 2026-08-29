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
  visitingTime?: string;
  date?: string;
}

/**
 * Concise Bangla SMS Template
 * Low character count to save SMS balance while conveying essential details.
 */
export function generateSmsText(data: SmsTemplateData): string {
  const patient = data.patientName || 'রোগী';
  
  let doctor = data.doctorName || 'ডাক্তার';
  if (!doctor.startsWith('ডাঃ') && !doctor.startsWith('ডাক্তার')) {
    doctor = `ডাঃ ${doctor}`;
  }

  const facility = data.facilityName || 'হাসপাতাল';
  const serial = data.serialNo || '০১';
  const roomStr = data.roomNo ? ` (রুম: ${data.roomNo})` : '';
  const visitingTime = data.visitingTime || 'নির্ধারিত সময়';
  const apptDate = data.date || 'আজ/আগামীকাল';

  return `MyDocBD: সিরিয়াল নিশ্চিত।
রোগী: ${patient}
${doctor}
হাসপাতাল: ${facility}
সিরিয়াল: ${serial}${roomStr}
সময়: ${visitingTime}, ${apptDate}
ট্র্যাক: mydocbd.com`;
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
