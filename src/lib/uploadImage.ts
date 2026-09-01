import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Validates and uploads an image file to Supabase Storage.
 * If Supabase is not configured or RLS policy / bucket error occurs,
 * it gracefully falls back to a base64 DataURL so image upload never blocks the user.
 * 
 * @param file The HTML File object to upload
 * @param bucketName Target storage bucket ('blog-images' | 'banner-images' | 'doctor-images')
 * @returns Promise<string> The permanent public CDN URL or fallback base64 URL
 */
export async function uploadImage(
  file: File,
  bucketName: 'blog-images' | 'banner-images' | 'doctor-images'
): Promise<string> {
  // 1. File validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('শুধুমাত্র JPG, PNG এবং WebP ফরম্যাটের ছবি আপলোড করা যাবে।');
  }

  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    throw new Error('ছবির সাইজ ৫ মেগাবাইটের (5MB) চেয়ে কম হতে হবে।');
  }

  // 2. Offline / Demo Fallback Mode
  if (!isSupabaseConfigured || !supabase) {
    console.warn(`[uploadImage] Supabase is not configured. Falling back to base64 Data URL for ${file.name}`);
    return convertFileToBase64(file);
  }

  // 3. Supabase Live Storage Upload
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanBaseName = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 30);

    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${fileExt}`;
    const filePath = uniqueFileName;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[Supabase Storage Upload Notice - Bucket: ${bucketName}]:`, uploadError.message, '- Falling back to base64 Data URL');
      return convertFileToBase64(file);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return convertFileToBase64(file);
    }

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.warn(`[uploadImage Storage Fallback - Bucket: ${bucketName}]:`, err?.message);
    return convertFileToBase64(file);
  }
}

function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('ফাইলটি পড়তে সমস্যা হয়েছে।'));
      }
    };
    reader.onerror = () => reject(new Error('ফাইল রিডার এরর।'));
    reader.readAsDataURL(file);
  });
}

