import React, { useEffect, useState } from 'react';
import { PromoBanner, BannerPlacementSlot } from '../types';
import { getPromoBanners } from '../lib/supabase';
import { ExternalLink, X } from 'lucide-react';

interface PromoBannerProps {
  slot: BannerPlacementSlot;
  className?: string;
}

export default function PromoBannerComponent({ slot, className = '' }: PromoBannerProps) {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const allBanners = await getPromoBanners();
        const activeBannersForSlot = allBanners
          .filter((b) => {
            const bSlot = b.placement_slot || b.slot;
            const isActive = (b.is_active ?? b.isActive) !== false;
            if (!isActive) return false;

            if (slot === 'home_hero_top' || slot === 'hero') {
              return bSlot === 'home_hero_top' || bSlot === 'hero';
            }
            if (slot === 'directory_middle' || slot === 'directory') {
              return bSlot === 'directory_middle' || bSlot === 'directory';
            }
            if (slot === 'sidebar_rect' || slot === 'sidebar') {
              return bSlot === 'sidebar_rect' || bSlot === 'sidebar';
            }
            if (slot === 'footer_sticky' || slot === 'footer') {
              return bSlot === 'footer_sticky' || bSlot === 'footer';
            }
            return bSlot === slot;
          })
          .sort((a, b) => ((a.display_order ?? a.displayOrder ?? 1) - (b.display_order ?? b.displayOrder ?? 1)));

        if (isMounted) {
          setBanners(activeBannersForSlot);
        }
      } catch (err) {
        console.error('Error loading promo banners:', err);
      }
    }

    loadBanners();

    // Listen to local storage changes for real-time sync across tabs or admin toggles
    const handleStorageChange = () => {
      loadBanners();
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadBanners, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [slot]);

  if (banners.length === 0) return null;

  // Pick the top display order banner
  const banner = banners[0];
  const imageUrl = banner.banner_image || banner.imageUrl;
  const targetUrl = banner.target_url || banner.targetUrl;

  const handleBannerClick = (e: React.MouseEvent) => {
    if (targetUrl) {
      if (targetUrl.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(targetUrl);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isExternal = targetUrl && !targetUrl.startsWith('#');

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:border-[#0284C7]/40 hover:shadow-md ${className}`}
      id={`promo-banner-${slot}-${banner.id}`}
    >
      <a
        href={targetUrl || '#'}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={handleBannerClick}
        className="block w-full text-left cursor-pointer"
      >
        {slot === 'sidebar_rect' || slot === 'sidebar' ? (
          <div className="p-3">
            <div className="relative aspect-[1.2/1] w-full rounded-xl bg-slate-100 overflow-hidden mb-2.5">
              <img
                src={imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 rounded-md bg-[#0284C7] px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                PROMO
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-slate-900 leading-snug group-hover:text-[#0284C7] transition line-clamp-2">
                {banner.title}
              </h3>
              {targetUrl && (
                <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-[#0284C7]">
                  <span>বিস্তারিত জানুন</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        ) : slot === 'footer_sticky' || slot === 'footer' ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-5 sm:py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={banner.title}
                  className="h-10 w-16 object-cover rounded-lg shrink-0 border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">স্পন্সরড হেলথ ঘোষণা</span>
                <h4 className="text-xs font-extrabold text-white line-clamp-1">{banner.title}</h4>
              </div>
            </div>
            {targetUrl && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition shrink-0">
                <span>অফার দেখুন</span>
                <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </div>
        ) : (
          /* home_hero_top & directory_middle */
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-5">
            <div className="relative h-28 w-full md:w-56 shrink-0 rounded-xl bg-slate-100 overflow-hidden">
              <img
                src={imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 rounded-md bg-[#0284C7] px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-xs">
                PROMO
              </span>
            </div>

            <div className="flex-grow space-y-1.5 w-full text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 inline-block">
                বিশেষ ঘোষণা & হেলথ ক্যাম্পেইন
              </span>
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0284C7] transition">
                {banner.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                বিস্তারিত অফার এবং সার্ভিস সংক্রান্ত তথ্য জানতে লিংকে ক্লিক করুন।
              </p>
            </div>

            {targetUrl && (
              <div className="shrink-0 self-end md:self-center">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0284C7] hover:bg-[#0274af] px-4 py-2text-xs font-bold text-white transition shadow-xs group-hover:shadow-md">
                  <span>বিস্তারিত দেখুন</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </div>
            )}
          </div>
        )}
      </a>
    </div>
  );
}

