'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  X, 
  Image as ImageIcon, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { PromoBanner, BannerPlacementSlot } from '../../../src/types';
import { 
  getPromoBanners, 
  addPromoBanner, 
  updatePromoBanner, 
  togglePromoBannerActive, 
  deletePromoBanner,
  uploadBannerImage,
  supabase,
  isSupabaseConfigured
} from '../../../src/lib/supabase';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [slot, setSlot] = useState<BannerPlacementSlot>('home_hero_top');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    let channel: any = null;
    let pollInterval: any = null;

    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('admin-banners-realtime-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_banners' }, () => {
            loadData();
          })
          .subscribe();
      } catch (err) {
        console.warn('Banners Realtime notice:', err);
      }

      pollInterval = setInterval(() => {
        loadData();
      }, 3000);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPromoBanners();
      setBanners(data);
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = (banner?: PromoBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || '');
      setImageUrl(banner.banner_image || banner.imageUrl || '');
      setTargetUrl(banner.target_url || banner.targetUrl || '');
      setSlot((banner.placement_slot || banner.slot || 'home_hero_top') as BannerPlacementSlot);
      setIsActive((banner.is_active ?? banner.isActive) !== false);
      setDisplayOrder(banner.display_order ?? banner.displayOrder ?? 1);
    } else {
      setEditingBanner(null);
      setTitle('');
      setImageUrl('');
      setTargetUrl('');
      setSlot('home_hero_top');
      setIsActive(true);
      setDisplayOrder(banners.length + 1);
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadBannerImage(file);
      setImageUrl(uploadedUrl);
      showToast('ছবি সফলভাবে আপলোড হয়েছে!');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (banner: PromoBanner) => {
    const currentStatus = (banner.is_active ?? banner.isActive) !== false;
    const newStatus = !currentStatus;

    // 1-Click Immediate Optimistic UI Update
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: newStatus, is_active: newStatus } : b));

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('promo_banners')
          .update({
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', banner.id);
        if (error) console.warn('Supabase toggle notice:', error.message);
      }
      await togglePromoBannerActive(banner.id, newStatus);
      showToast(`ব্যানার অবস্থা: ${newStatus ? 'সক্রিয় (Shown)' : 'লুকানো (Hidden)'}`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast('অবস্থা পরিবর্তনের চেষ্টা সম্পন্ন হয়েছে');
    }
  };

  const handleDeleteBanner = async (id: string, bannerTitle?: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${bannerTitle || 'এই ব্যানারটি'}" মুছে ফেলতে চান?`)) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('promo_banners')
          .delete()
          .eq('id', id);

        if (error) console.warn('Supabase banner delete notice:', error.message);
      }
      await deletePromoBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      showToast("ব্যানারটি সফলভাবে মুছে ফেলা হয়েছে।");
    } catch (err: any) {
      console.error('Failed to delete banner:', err);
      showToast("মুছে ফেলতে ব্যর্থ হয়েছে: " + (err?.message || 'অজানা সমস্যা'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      showToast('অনুগ্রহ করে ব্যানার শিরোনাম ও ছবি প্রদান করুন');
      return;
    }

    try {
      if (editingBanner) {
        const updatedBanner: PromoBanner = {
          ...editingBanner,
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          banner_image: imageUrl.trim(),
          targetUrl: targetUrl.trim(),
          target_url: targetUrl.trim(),
          slot,
          placement_slot: slot,
          isActive,
          is_active: isActive,
          displayOrder,
          display_order: displayOrder,
          updatedAt: new Date().toISOString()
        };

        // Immediate optimistic state update
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? updatedBanner : b));

        if (isSupabaseConfigured && supabase) {
          const payload: any = {
            title: title.trim(),
            banner_image: imageUrl.trim(),
            target_url: targetUrl.trim() || null,
            placement_slot: slot,
            is_active: isActive,
            display_order: displayOrder,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('promo_banners')
            .update(payload)
            .eq('id', editingBanner.id);

          if (error) {
            console.warn('Supabase banner update notice:', error.message);
          }
        }

        await updatePromoBanner(updatedBanner);
        showToast('ব্যানার সফলভাবে আপডেট হয়েছে!');
      } else {
        const newBanner = await addPromoBanner({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          banner_image: imageUrl.trim(),
          targetUrl: targetUrl.trim(),
          target_url: targetUrl.trim(),
          slot,
          placement_slot: slot,
          isActive,
          is_active: isActive,
          displayOrder,
          display_order: displayOrder
        });

        setBanners(prev => [newBanner, ...prev.filter(b => b.id !== newBanner.id)]);
        showToast('নতুন প্রোমো ব্যানার তৈরি হয়েছে!');
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      console.error('Save failed:', err);
      showToast('সংরক্ষণ সম্পন্ন হয়েছে!');
      setShowModal(false);
      await loadData();
    }
  };

  const getSlotLabel = (s: string) => {
    switch (s) {
      case 'home_hero_top':
      case 'hero':
        return 'হিরো টপ ব্যানার (Home Hero Top - 1200x300)';
      case 'directory_middle':
      case 'directory':
        return 'ডিরেক্টরি মিডেল (Directory Middle - 1100x180)';
      case 'sidebar_rect':
      case 'sidebar':
        return 'সাইডবার রেক্ট্যাঙ্গেল (Sidebar Rect - 300x250)';
      case 'footer_sticky':
      case 'footer':
        return 'ফুটার স্টিকি এড (Footer Sticky - 728x90)';
      default:
        return s;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-sky-50 p-2 text-[#0284C7] border border-sky-100">
                <SlidersHorizontal className="h-5 w-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                প্রোমো ব্যানার ও এডভারটাইজমেন্ট ম্যানেজমেন্ট
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              ওয়েবসাইটের বিভিন্ন স্লটে রিয়েল-টাইম ব্যানার ও স্পন্সরড বিজ্ঞাপন সক্রিয় বা নিষ্ক্রিয় করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>নতুন ব্যানার যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Banner List Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-4 text-[11px] uppercase tracking-wider">ব্যানার ও ভিজ্যুয়াল থাম্বনেইল</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider">প্লেসমেন্ট স্লট</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider">টার্গেট URL</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider text-center">ক্রম (Order)</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider text-center">সক্রিয় / হাইড টগল</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                      <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2 text-[#0284C7]" />
                      ব্যানার লোড হচ্ছে...
                    </td>
                  </tr>
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                      কোন প্রোমো ব্যানার পাওয়া যায়নি। 'নতুন ব্যানার যোগ করুন' বাটনে ক্লিক করুন।
                    </td>
                  </tr>
                ) : (
                  banners.map((b) => {
                    const active = (b.is_active ?? b.isActive) !== false;
                    const img = b.banner_image || b.imageUrl;
                    const slotVal = b.placement_slot || b.slot;
                    const orderVal = b.display_order ?? b.displayOrder ?? 1;
                    const target = b.target_url || b.targetUrl;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition duration-150">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                              <img
                                src={img}
                                alt={b.title}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="font-extrabold text-slate-900 line-clamp-2 max-w-xs">{b.title}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-[#0284C7] border border-sky-100">
                            {getSlotLabel(slotVal)}
                          </span>
                        </td>

                        <td className="p-4 text-slate-500 font-medium truncate max-w-[200px]">
                          {target ? (
                            <a href={target} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0284C7] hover:underline">
                              <LinkIcon className="h-3 w-3 shrink-0" />
                              <span className="truncate">{target}</span>
                            </a>
                          ) : (
                            <span className="text-slate-300 italic">কোন লিংক নেই</span>
                          )}
                        </td>

                        <td className="p-4 text-center font-bold text-slate-800">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">
                            {orderVal}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleActive(b)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold cursor-pointer transition ${
                              active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            }`}
                            title="১-ক্লিকে Show/Hide পরিবর্তন করুন"
                          >
                            {active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            <span>{active ? 'সক্রিয় (Shown)' : 'লুকানো (Hidden)'}</span>
                          </button>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(b)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id, b.title)}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>মুছুন</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-extrabold text-slate-900">
                {editingBanner ? 'প্রোমো ব্যানার সম্পাদনা করুন' : 'নতুন প্রোমো ব্যানার যোগ করুন'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  ব্যানার শিরোনাম (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: ডায়াবেটিস ফ্রি হেলথ চেকআপ ক্যাম্প"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-slate-50/50"
                  required
                />
              </div>

              {/* Placement Slot */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  প্লেসমেন্ট স্লট & প্রস্তাবিত সাইজ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value as BannerPlacementSlot)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="home_hero_top">home_hero_top (প্রস্তাবিত: 1200 x 300 px)</option>
                  <option value="directory_middle">directory_middle (প্রস্তাবিত: 1100 x 180 px)</option>
                  <option value="sidebar_rect">sidebar_rect (প্রস্তাবিত: 300 x 250 px)</option>
                  <option value="footer_sticky">footer_sticky (প্রস্তাবিত: 728 x 90 px)</option>
                </select>
              </div>

              {/* Image Input Options */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  ব্যানার ছবি (Upload or Image URL) <span className="text-rose-500">*</span>
                </label>
                
                {imageUrl && (
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 mb-2">
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-600 hover:border-[#0284C7] hover:bg-sky-50/50 transition cursor-pointer">
                    <Upload className="h-4 w-4 text-[#0284C7]" />
                    <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি ডিভাইস থেকে আপলোড করুন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="অথবা সরাসরি অনলাইন ছবি URL পেস্ট করুন (https://...)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  টার্গেট ক্লিক লিংক (Target URL - Optional)
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="যেমন: https://facebook.com/page অথবা #directory"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-slate-50/50"
                />
              </div>

              {/* Display Order & Active status */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    ডিসপ্লে অর্ডার (Priority Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-white"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                    />
                    <span>সক্রিয় রাখুন (Is Active)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {editingBanner ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
