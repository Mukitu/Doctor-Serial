import React, { useEffect, useState } from 'react';
import { PromoBanner } from '../types';
import { getPromoBanners } from '../lib/supabase';
import { ExternalLink, X } from 'lucide-react';

interface PromoBannerProps {
  slot: 'hero' | 'directory' | 'sidebar' | 'footer';
  className?: string;
}

export default function PromoBannerComponent({ slot, className = '' }: PromoBannerProps) {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const allBanners = await getPromoBanners();
        const activeBannersForSlot = allBanners.filter(
          (b) => b.slot === slot && b.isActive !== false
        );
        setBanners(activeBannersForSlot);
      } catch (err) {
        console.error('Error loading promo banners:', err);
      }
    }
    loadBanners();
  }, [slot]);

  if (!isVisible || banners.length === 0) return null;

  // Pick the latest banner
  const banner = banners[0];

  const handleBannerClick = () => {
    if (banner.targetUrl) {
      if (banner.targetUrl.startsWith('#')) {
        const element = document.querySelector(banner.targetUrl);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md ${className}`}
      id={`promo-banner-${slot}-${banner.id}`}
    >
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setIsVisible(false)}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/40 text-white hover:bg-slate-900/60 backdrop-blur-xs transition cursor-pointer"
          title="বিজ্ঞাপন বন্ধ করুন"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div
        onClick={handleBannerClick}
        className={`relative cursor-pointer group flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden ${
          slot === 'sidebar' ? 'p-3' : 'p-4 md:p-5'
        }`}
      >
        <div className="relative h-24 w-full shrink-0 md:h-28 md:w-44 rounded-lg bg-slate-100 overflow-hidden">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <span className="absolute top-1.5 left-1.5 rounded bg-[#0284C7] px-1 py-0.5 text-[8px] font-black text-white uppercase tracking-wider">
            PROMO
          </span>
        </div>

        <div className="flex-grow space-y-1 w-full text-left">
          <h4 className="text-xs font-black uppercase text-[#0284C7] tracking-wider">
            বিশেষ অফার ও ঘোষণা
          </h4>
          <h3 className="text-sm font-extrabold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#0284C7] transition">
            {banner.title}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold">
            বিশদ জানতে এখানে ক্লিক করুন
          </p>
        </div>

        {banner.targetUrl && (
          <div className="shrink-0 self-end md:self-center">
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 group-hover:bg-slate-100 transition">
              <span>বিস্তারিত</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
