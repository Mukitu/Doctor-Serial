import React, { useEffect, useState } from 'react';
import { ChevronRight, Stethoscope, Heart, Baby, Eye, Brain, UserCheck, Activity, Pill, Tag } from 'lucide-react';
import { Specialty } from '../types';
import { supabase, getSpecialties } from '../lib/supabase';

interface SpecialtyGridProps {
  specialties?: Specialty[];
  onSelectSpecialty?: (specialtyNameBnOrSlug: string) => void;
  onClearFilter?: () => void;
  selectedSpecialty?: string;
  title?: string;
  subtitle?: string;
  showViewAllBtn?: boolean;
}

export default function SpecialtyGrid({
  specialties: initialSpecialties,
  onSelectSpecialty,
  onClearFilter,
  selectedSpecialty = '',
  title = "বিশেষজ্ঞ ক্যাটাগরি সমূহ",
  subtitle = "আপনার কাঙ্ক্ষিত রোগ অনুযায়ী সঠিক বিশেষজ্ঞ নির্বাচন করুন",
  showViewAllBtn = true,
}: SpecialtyGridProps) {
  const [items, setItems] = useState<Specialty[]>(initialSpecialties || []);
  const [loading, setLoading] = useState(!initialSpecialties || initialSpecialties.length === 0);

  useEffect(() => {
    if (initialSpecialties && initialSpecialties.length > 0) {
      setItems(initialSpecialties.filter(s => s.isActive !== false));
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchSpecialties() {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('specialties')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: Specialty[] = data.map(s => ({
              id: s.id,
              nameBn: s.name_bn,
              nameEn: s.name_en,
              slug: s.slug || (s.name_en ? s.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
              iconUrl: s.icon_url || s.icon_name || '',
              iconName: s.icon_name || '',
              isActive: s.is_active !== false,
              displayOrder: s.display_order ?? 1
            }));
            if (isMounted) setItems(mapped);
            setLoading(false);
            return;
          }
        }
        
        // Local fallback if Supabase table is empty or offline
        const local = await getSpecialties();
        if (isMounted) setItems(local.filter(s => s.isActive !== false));
      } catch (err) {
        console.error('Error fetching specialties in SpecialtyGrid:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSpecialties();
  }, [initialSpecialties]);

  const handleCardClick = (spec: Specialty) => {
    if (onSelectSpecialty) {
      onSelectSpecialty(spec.nameBn);
    }

    const target = document.getElementById('directory') || 
                   document.getElementById('doctor-directory') || 
                   document.getElementById('featured-doctors-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderIcon = (spec: Specialty) => {
    const iconSrc = spec.iconUrl || spec.iconName || '';
    if (iconSrc && (iconSrc.startsWith('http://') || iconSrc.startsWith('https://') || iconSrc.startsWith('data:'))) {
      return (
        <img
          src={iconSrc}
          alt={spec.nameBn}
          className="h-7 w-7 object-contain rounded-md"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    const norm = (iconSrc || spec.nameBn || spec.nameEn || '').toLowerCase().trim();
    if (norm.includes('heart') || norm.includes('cardio') || norm.includes('হৃদ')) {
      return <Heart className="h-5.5 w-5.5 text-rose-500" />;
    }
    if (norm.includes('baby') || norm.includes('pediatric') || norm.includes('শিশু') || norm.includes('child')) {
      return <Baby className="h-5.5 w-5.5 text-amber-500" />;
    }
    if (norm.includes('eye') || norm.includes('vision') || norm.includes('চক্ষু')) {
      return <Eye className="h-5.5 w-5.5 text-indigo-500" />;
    }
    if (norm.includes('brain') || norm.includes('neuro') || norm.includes('মস্তিষ্ক')) {
      return <Brain className="h-5.5 w-5.5 text-purple-500" />;
    }
    if (norm.includes('user') || norm.includes('gyn') || norm.includes('women') || norm.includes('নারী') || norm.includes('গাইনি')) {
      return <UserCheck className="h-5.5 w-5.5 text-pink-500" />;
    }
    if (norm.includes('bone') || norm.includes('ortho') || norm.includes('হাড়')) {
      return <Activity className="h-5.5 w-5.5 text-emerald-500" />;
    }
    if (norm.includes('pill') || norm.includes('pharma') || norm.includes('ঔষধ')) {
      return <Pill className="h-5.5 w-5.5 text-teal-500" />;
    }
    return <Stethoscope className="h-5.5 w-5.5 text-[#0284C7]" />;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 md:text-xl flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
        {showViewAllBtn && (
          <button
            onClick={() => {
              if (onClearFilter) onClearFilter();
              else if (onSelectSpecialty) onSelectSpecialty('');
              
              const target = document.getElementById('directory') || 
                             document.getElementById('doctor-directory') || 
                             document.getElementById('featured-doctors-section');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group flex items-center gap-1 text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
            id="view-all-specialties-btn"
          >
            <span>সকল ডাক্তার দেখুন</span>
            <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 border border-slate-200 p-4"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs font-bold text-slate-400">
          কোনো সক্রিয় ক্যাটাগরি পাওয়া যায়নি
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((spec) => {
            const isSelected = selectedSpecialty && (
              selectedSpecialty === spec.nameBn || 
              selectedSpecialty === spec.slug || 
              selectedSpecialty === spec.nameEn
            );

            return (
              <div
                key={spec.id}
                onClick={() => handleCardClick(spec)}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 text-center transition hover:shadow-md ${
                  isSelected 
                    ? 'border-[#0284C7] bg-sky-50/80 ring-2 ring-[#0284C7]/20 shadow-xs' 
                    : 'border-slate-200 bg-white hover:border-[#0284C7] hover:bg-slate-50/50'
                }`}
                id={`specialty-card-${spec.id}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 transition group-hover:scale-105 group-hover:bg-sky-50 shrink-0">
                  {renderIcon(spec)}
                </div>
                <h3 className={`mt-2.5 font-bold text-xs transition line-clamp-1 ${
                  isSelected ? 'text-[#0284C7]' : 'text-slate-800 group-hover:text-[#0284C7]'
                }`}>
                  {spec.nameBn}
                </h3>
                {spec.nameEn && (
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 line-clamp-1">
                    {spec.nameEn}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
