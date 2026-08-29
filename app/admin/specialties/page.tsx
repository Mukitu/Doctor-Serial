'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  X, 
  Search, 
  AlertTriangle, 
  RefreshCw, 
  Tag, 
  ArrowUpDown, 
  Eye, 
  CheckCircle2, 
  AlertCircle,
  LucideIcon,
  Heart,
  Baby,
  Brain,
  Activity,
  Pill
} from 'lucide-react';
import { 
  supabase, 
  isSupabaseConfigured, 
  getSpecialties, 
  addSpecialty, 
  updateSpecialty, 
  deleteSpecialty, 
  uploadSpecialtyIcon, 
  getDoctors 
} from '@/src/lib/supabase';
import { Specialty, Doctor } from '@/src/types';

export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

  // Form Fields
  const [nameBn, setNameBn] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [iconMode, setIconMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconName, setIconName] = useState<string>('Stethoscope');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Delete Warning Modal
  const [deletingSpecialty, setDeletingSpecialty] = useState<Specialty | null>(null);
  const [linkedDoctors, setLinkedDoctors] = useState<Doctor[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Auto-hide toast message
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Load Specialties and Doctors
  const loadData = async () => {
    setLoading(true);
    try {
      const [specData, docData] = await Promise.all([
        getSpecialties(),
        getDoctors()
      ]);
      setSpecialties(specData || []);
      setDoctors(docData || []);
    } catch (err: any) {
      console.error('Error loading specialties page data:', err);
      setToastMsg({ type: 'error', text: 'ডাটা লোড করতে সমস্যা হয়েছে' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to slugify English text
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Auto generation of slug when typing English name if slug wasn't manually customized
  const handleEnglishNameChange = (val: string) => {
    setNameEn(val);
    if (!editingSpecialty || !editingSpecialty.slug) {
      setSlug(generateSlug(val));
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingSpecialty(null);
    setNameBn('');
    setNameEn('');
    setSlug('');
    setIconMode('upload');
    setIconUrl('');
    setIconName('Stethoscope');
    setDisplayOrder(specialties.length > 0 ? Math.max(...specialties.map(s => s.displayOrder || 0)) + 1 : 1);
    setIsActive(true);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (spec: Specialty) => {
    setEditingSpecialty(spec);
    setNameBn(spec.nameBn || '');
    setNameEn(spec.nameEn || '');
    setSlug(spec.slug || generateSlug(spec.nameEn || ''));
    setIconUrl(spec.iconUrl || '');
    setIconName(spec.iconName || 'Stethoscope');
    if (spec.iconUrl && (spec.iconUrl.startsWith('http') || spec.iconUrl.startsWith('data:'))) {
      setIconMode('url');
    } else {
      setIconMode('preset');
    }
    setDisplayOrder(spec.displayOrder ?? 1);
    setIsActive(spec.isActive !== false);
    setShowModal(true);
  };

  // Handle Direct File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const uploadedUrl = await uploadSpecialtyIcon(file);
      if (uploadedUrl) {
        setIconUrl(uploadedUrl);
        setIconMode('upload');
        setToastMsg({ type: 'success', text: 'আইকন সফলভাবে আপলোড হয়েছে' });
      } else {
        setToastMsg({ type: 'error', text: 'আইকন আপলোড করা যায়নি' });
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setToastMsg({ type: 'error', text: 'আইকন আপলোডে সমস্যা দেখা দিয়েছে' });
    } finally {
      setUploadingFile(false);
    }
  };

  // Handle Toggle Active Status
  const handleToggleActive = async (spec: Specialty) => {
    const updatedSpec: Specialty = {
      ...spec,
      isActive: !spec.isActive
    };

    // Optimistic Update
    setSpecialties(prev => prev.map(s => s.id === spec.id ? updatedSpec : s));

    try {
      await updateSpecialty(updatedSpec);
      setToastMsg({
        type: 'success',
        text: `"${spec.nameBn}" ক্যাটাগরি ${updatedSpec.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`
      });
    } catch (err: any) {
      console.error('Error toggling specialty active status:', err);
      // Revert state on error
      setSpecialties(prev => prev.map(s => s.id === spec.id ? spec : s));
      setToastMsg({ type: 'error', text: 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি' });
    }
  };

  // Save / Upsert Specialty
  const handleSaveSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !nameEn.trim()) {
      setToastMsg({ type: 'error', text: 'বাংলা ও ইংরেজি নাম আবশ্যক' });
      return;
    }

    const finalSlug = slug.trim() || generateSlug(nameEn);
    const finalIcon = iconUrl.trim() || iconName;

    setSubmitting(true);
    try {
      if (editingSpecialty) {
        const updatedItem: Specialty = {
          ...editingSpecialty,
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim(),
          slug: finalSlug,
          iconUrl: finalIcon,
          iconName: iconName,
          displayOrder: Number(displayOrder) || 1,
          isActive: isActive
        };
        await updateSpecialty(updatedItem);
        setToastMsg({ type: 'success', text: 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে' });
      } else {
        const newItem: Omit<Specialty, 'id'> = {
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim(),
          slug: finalSlug,
          iconUrl: finalIcon,
          iconName: iconName,
          displayOrder: Number(displayOrder) || 1,
          isActive: isActive
        };
        await addSpecialty(newItem);
        setToastMsg({ type: 'success', text: 'নতুন ক্যাটাগরি সফলভাবে যুক্ত করা হয়েছে' });
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving specialty:', err);
      setToastMsg({ type: 'error', text: 'সংরক্ষণে সমস্যা দেখা দিয়েছে: ' + (err?.message || '') });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Click (with linked doctors check warning)
  const handleInitiateDelete = (spec: Specialty) => {
    // Check if doctors are linked to this specialty
    const linked = doctors.filter(doc => {
      const docSpec = (doc.specialty || doc.specialtyNameBn || '').toLowerCase().trim();
      const specBn = (spec.nameBn || '').toLowerCase().trim();
      const specEn = (spec.nameEn || '').toLowerCase().trim();
      return doc.specialtyId === spec.id || docSpec === specBn || docSpec === specEn;
    });

    setDeletingSpecialty(spec);
    setLinkedDoctors(linked);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingSpecialty) return;
    setSubmitting(true);
    try {
      await deleteSpecialty(deletingSpecialty.id);
      setToastMsg({ type: 'success', text: `"${deletingSpecialty.nameBn}" ক্যাটাগরি ডিলিট করা হয়েছে` });
      setShowDeleteModal(false);
      setDeletingSpecialty(null);
      await loadData();
    } catch (err: any) {
      console.error('Error deleting specialty:', err);
      setToastMsg({ type: 'error', text: 'ডিলিট করতে সমস্যা হয়েছে' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Specialties List
  const filteredSpecialties = useMemo(() => {
    return specialties
      .filter(s => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();
        return (
          (s.nameBn || '').toLowerCase().includes(term) ||
          (s.nameEn || '').toLowerCase().includes(term) ||
          (s.slug || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [specialties, searchTerm]);

  const renderIconPreview = (spec: Specialty) => {
    const src = spec.iconUrl || spec.iconName || '';
    if (src && (src.startsWith('http') || src.startsWith('data:'))) {
      return (
        <img
          src={src}
          alt={spec.nameBn}
          className="h-8 w-8 object-contain rounded-lg border border-slate-200 bg-white p-1"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 border border-sky-100 text-[#0284C7] font-bold text-xs">
        <Stethoscope className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 p-4 sm:p-6 bg-slate-50 min-h-screen">
      
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold shadow-lg border transition ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-500' 
            : 'bg-rose-600 text-white border-rose-500'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100 shrink-0">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800">স্পেশালিটি ও ক্যাটাগরি ম্যানেজমেন্ট</h1>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-800">
                মোট {specialties.length} টি
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              হোমপেজের "বিশেষজ্ঞ ক্যাটাগরি সমূহ" ও ডাক্তার ফিল্টারিং সম্পূর্ণ গতিশীলভাবে নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">রিফ্রেশ</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-4 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>নতুন ক্যাটাগরি যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Stats Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ক্যাটাগরির নাম বা স্লাগ দিয়ে খুঁজুন..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#0284C7] focus:bg-white focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>সক্রিয় ক্যাটাগরি: <b className="text-emerald-600">{specialties.filter(s => s.isActive !== false).length}</b></span>
          <span className="text-slate-300">|</span>
          <span>নিষ্ক্রিয়: <b className="text-rose-500">{specialties.filter(s => s.isActive === false).length}</b></span>
        </div>
      </div>

      {/* Specialty Table Overview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-extrabold border-b border-slate-200">
                <th className="p-3.5 text-[11px] w-16 text-center">আইকন</th>
                <th className="p-3.5 text-[11px]">ক্যাটাগরির নাম (বাংলা ও ইংরেজি)</th>
                <th className="p-3.5 text-[11px]">URL স্লাগ</th>
                <th className="p-3.5 text-[11px] text-center">প্রদর্শন ক্রম</th>
                <th className="p-3.5 text-[11px] text-center">অবস্থা (Active/Inactive)</th>
                <th className="p-3.5 text-[11px] text-center w-32">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#0284C7]" />
                    ডাটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredSpecialties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-bold text-slate-400">
                    কোনো স্পেশালিটি ক্যাটাগরি পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredSpecialties.map((spec) => (
                  <tr key={spec.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Icon Preview */}
                    <td className="p-3.5 text-center">
                      <div className="flex justify-center">
                        {renderIconPreview(spec)}
                      </div>
                    </td>

                    {/* Category Name (Bangla & English) */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {spec.nameBn}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {spec.nameEn}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-600 border border-slate-200">
                        /{spec.slug || generateSlug(spec.nameEn)}
                      </span>
                    </td>

                    {/* Display Order */}
                    <td className="p-3.5 text-center">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700 px-2">
                        #{spec.displayOrder || 1}
                      </span>
                    </td>

                    {/* Active Status Toggle */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(spec)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold transition cursor-pointer border ${
                          spec.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                      >
                        <span className={`h-2 w-2 rounded-full ${spec.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{spec.isActive !== false ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}</span>
                      </button>
                    </td>

                    {/* Actions (Edit & Delete) */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(spec)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#0284C7] hover:text-[#0284C7] hover:bg-sky-50 transition cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleInitiateDelete(spec)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Specialty Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100 font-bold">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingSpecialty ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    বিশেষজ্ঞ ক্যাটাগরি ও স্লাগ কনফিগারেশন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecialty} className="mt-5 space-y-4">
              
              {/* Bangla Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বাংলা নাম (Bangla Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder='যেমন: "কার্ডিওলজি / হৃদরোগ", "মেডিসিন"'
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none"
                />
              </div>

              {/* English Name & Auto Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ইংরেজি নাম (English Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => handleEnglishNameChange(e.target.value)}
                    placeholder='e.g., "Cardiology", "Medicine"'
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL স্লাগ (Slug) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder='e.g., "cardiology"'
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Icon Selection Modes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  আইকন / লোগো নির্বাচন পদ্ধতি
                </label>
                
                <div className="flex gap-2 rounded-xl bg-slate-100 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setIconMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      iconMode === 'upload' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>ফাইল আপলোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${
                      iconMode === 'url' ? 'bg-white text-[#0284C7] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>ইমেজ URL</span>
                  </button>
                </div>

                {/* Option A: Direct File Upload */}
                {iconMode === 'upload' && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center bg-slate-50/50">
                    <input
                      type="file"
                      id="specialty-icon-file-input"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="specialty-icon-file-input"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className={`h-6 w-6 text-slate-400 mb-1 ${uploadingFile ? 'animate-bounce text-[#0284C7]' : ''}`} />
                      <span className="text-xs font-bold text-[#0284C7]">
                        {uploadingFile ? 'আপলোড হচ্ছে...' : 'কম্পিউটার/মোবাইল থেকে আইকন সিলেক্ট করুন'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        PNG, JPG, SVG বা WEBP (Supabase Storage: specialty-icons)
                      </span>
                    </label>
                  </div>
                )}

                {/* Option B: Image URL */}
                {iconMode === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      placeholder="https://example.com/icons/cardiology.png"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none"
                    />
                  </div>
                )}

                {/* Icon Preview Box */}
                {iconUrl && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <img
                      src={iconUrl}
                      alt="Icon Preview"
                      className="h-10 w-10 object-contain rounded-lg border border-slate-200 bg-white p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-slate-700">আইকন প্রিভিউ (Preview)</span>
                      <span className="block text-[10px] text-slate-400 truncate">{iconUrl}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIconUrl('')}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Display Order & Active Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    প্রদর্শন অগ্রাধিকার (Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 p-2.5 bg-slate-50/50">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
                    />
                    <span className="text-xs font-bold text-slate-700">সক্রিয় স্ট্যাটাস (Active)</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-5 py-2.5 text-xs font-bold text-white transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingSpecialty ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Linked Doctors Warning Delete Modal */}
      {showDeleteModal && deletingSpecialty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                ক্যাটাগরি মুছে ফেলার নিশ্চয়তা
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              আপনি কি নিশ্চিত যে <b className="text-slate-900 font-extrabold">"{deletingSpecialty.nameBn}"</b> ক্যাটাগরি সম্পূর্ণ মুছে ফেলতে চান?
            </p>

            {linkedDoctors.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-extrabold flex items-center gap-1 text-amber-900">
                  ⚠️ সতর্কতা: এই ক্যাটাগরির সাথে {linkedDoctors.length} জন ডাক্তার যুক্ত আছেন!
                </p>
                <ul className="mt-1.5 space-y-1 pl-4 list-disc text-[11px] max-h-24 overflow-y-auto font-medium">
                  {linkedDoctors.slice(0, 5).map(doc => (
                    <li key={doc.id}>{doc.name} ({doc.workplace || 'ডাক্তার'})</li>
                  ))}
                  {linkedDoctors.length > 5 && (
                    <li className="font-bold">এবং আরও {linkedDoctors.length - 5} জন...</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-6 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>হ্যাঁ, নিশ্চিত ডিলিট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
