import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Validates and uploads an image file to Supabase Storage.
 * If Supabase is not configured, it gracefully falls back to a base64 DataURL
 * so the system continues to work perfectly in offline/demo mode.
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

  const maxBytes = 3 * 1024 * 1024; // 3MB
  if (file.size > maxBytes) {
    throw new Error('ছবির সাইজ ৩ মেগাবাইটের (3MB) চেয়ে কম হতে হবে।');
  }

  // 2. Offline / Demo Fallback Mode
  if (!isSupabaseConfigured || !supabase) {
    console.warn(`[uploadImage] Supabase is not configured. Falling back to base64 Data URL for ${file.name}`);
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

  // 3. Supabase Live Storage Upload
  try {
    // Sanitize file name: timestamp + snake_case alphanumeric characters and dots
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanBaseName = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_') // Replace all non-alphanumeric characters with underscores
      .substring(0, 30); // Cap filename length

    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${fileExt}`;
    const filePath = uniqueFileName;

    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Supabase Storage Upload Error]:', uploadError);
      throw uploadError;
    }

    // 4. Retrieve Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('পাবলিক সিডিএন ইউআরএল পাওয়া যায়নি।');
    }

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error(`[uploadImage Error in bucket ${bucketName}]:`, err);
    throw new Error(err?.message || 'ছবি আপলোড করতে কোনো একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
  }
}
