import React, { useEffect, useState, useMemo } from 'react';
import { BlogPost } from '../types';
import { getBlogs, incrementBlogViews } from '../lib/supabase';
import { BookOpen, Calendar, Eye, User, ArrowLeft, HeartPulse, ChevronRight, Share2, Clock } from 'lucide-react';

interface BlogViewProps {
  onBackToHome: () => void;
}

export default function BlogView({ onBackToHome }: BlogViewProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('সব কন্টেন্ট');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const fetchedBlogs = await getBlogs();
        // Only show published articles for the public portal
        setBlogs(fetchedBlogs.filter((b) => b.isPublished !== false));
      } catch (err) {
        console.error('Error loading blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const categories = useMemo(() => {
    const list = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) list.add(b.category);
    });
    return ['সব কন্টেন্ট', ...Array.from(list)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === 'সব কন্টেন্ট') return blogs;
    return blogs.filter((b) => b.category === selectedCategory);
  }, [blogs, selectedCategory]);

  const handleReadArticle = async (article: BlogPost) => {
    setActiveArticle(article);
    // Optimistic UI views count update
    setBlogs((prev) =>
      prev.map((b) => (b.id === article.id ? { ...b, views: (b.views || 0) + 1 } : b))
    );
    try {
      await incrementBlogViews(article.id);
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  const handleShare = () => {
    if (!activeArticle) return;
    const url = `${window.location.origin}/blog/${activeArticle.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const monthsBn = [
        'জানুয়ারি',
        'ফেব্রুয়ারি',
        'মার্চ',
        'এপ্রিল',
        'মে',
        'জুন',
        'জুলাই',
        'আগস্ট',
        'সেপ্টেম্বর',
        'অক্টোবর',
        'নভেম্বর',
        'ডিসেম্বর',
      ];
      const day = date.getDate().toLocaleString('bn-BD');
      const month = monthsBn[date.getMonth()];
      const year = date.getFullYear().toLocaleString('bn-BD', { useGrouping: false });
      return `${day} ${month}, ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Blog Schema.org JSON-LD structured data for SEO
  const blogJsonLd = activeArticle ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": activeArticle.title,
    "description": activeArticle.excerpt || activeArticle.title,
    "image": activeArticle.coverImage,
    "author": {
      "@type": "Organization",
      "name": activeArticle.author || "MyDocBD Medical Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MyDocBD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mydocbd.com/logo.png"
      }
    },
    "datePublished": activeArticle.createdAt,
    "dateModified": activeArticle.createdAt
  } : null;

  return (
    <div className="bg-slate-50 min-h-screen py-10" id="blog-portal-root">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
          <button
            onClick={onBackToHome}
            className="hover:text-[#0284C7] transition cursor-pointer"
          >
            হোম পেজ
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[#0284C7]">স্বাস্থ্য ব্লগ</span>
        </div>

        {/* Banner Hero Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-[#0284C7] border border-sky-100">
              <HeartPulse className="h-3.5 w-3.5 animate-pulse text-[#0284C7]" />
              <span>স্বাস্থ্য বিষয়ক সচেতনতা</span>
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              নির্ভরযোগ্য মেডিকেল ও স্বাস্থ্য সচেতনতা ব্লগ
            </h1>
            <p className="text-xs text-slate-400 font-bold leading-relaxed">
              MyDocBD ব্লগে আমাদের বিশেষজ্ঞ চিকিৎসকদের পরামর্শ ও স্বাস্থ্য সচেতনতা বিষয়ক দিক-নির্দেশনা সম্বলিত তথ্যবহুল কন্টেন্টগুলো নিয়মিত পড়ুন এবং সুস্থ থাকুন।
            </p>
          </div>
          <div className="shrink-0 flex h-24 w-24 items-center justify-center rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-100/50">
            <BookOpen className="h-10 w-10 text-[#0284C7]" />
          </div>
        </div>

        {/* Dynamic Category Chips Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="text-center py-20 text-xs font-bold text-slate-400">
            ব্লগ কন্টেন্ট লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm font-bold text-slate-700">এই ক্যাটাগরিতে কোনো ব্লগ পোস্ট পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 font-bold mt-1">দয়া করে অন্যান্য স্বাস্থ্য ক্যাটাগরিগুলো দেখুন।</p>
          </div>
        ) : (
          /* Main Articles Grid Layout */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {filteredBlogs.map((post) => (
              <article
                key={post.id}
                onClick={() => handleReadArticle(post)}
                className="group flex flex-col justify-between bg-white border border-slate-200 hover:border-[#0284C7] hover:shadow-lg transition rounded-2xl overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Card Cover Picture */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-150">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#0284C7] shadow-sm border border-slate-100">
                      {post.category}
                    </span>
                  </div>

                  {/* Card Content details */}
                  <div className="p-5 text-left space-y-2">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{formatDate(post.createdAt)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-slate-400" />
                        <span>{(post.views || 0).toLocaleString('bn-BD')} বার পঠিত</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-[#0284C7] transition line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs font-semibold text-slate-450 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Action footer bar */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0284C7]">
                  <span className="flex items-center gap-1 text-slate-500">
                    <User className="h-3 w-3 text-[#0284C7]" />
                    <span className="truncate max-w-[130px]">{post.author}</span>
                  </span>
                  <span className="inline-flex items-center gap-0.5 group-hover:translate-x-1 transition duration-200">
                    <span>বিস্তারিত পড়ুন</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Persistent Full Article Reading Overlay Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          {blogJsonLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
          )}
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header Actions Bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-150 px-6 py-4">
              <button
                onClick={() => setActiveArticle(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>ফিরে যান</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0284C7] hover:bg-slate-50 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{copiedLink ? 'লিংক কপিড!' : 'শেয়ার করুন'}</span>
                </button>
              </div>
            </div>

            {/* Modal Article Content Box */}
            <div className="p-6 md:p-8 text-left space-y-6">
              {/* Category & Stats */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-black text-[#0284C7] border border-sky-100">
                  {activeArticle.category}
                </span>
                <span className="text-slate-350">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(activeArticle.createdAt)}</span>
                </span>
                <span className="text-slate-350">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{(activeArticle.views || 0).toLocaleString('bn-BD')} বার পঠিত</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                {activeArticle.title}
              </h2>

              {/* Author and Read time header */}
              <div className="flex items-center gap-3 border-t border-b border-slate-150 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200 text-xs shrink-0">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">{activeArticle.author}</p>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>৩ মিনিট পড়ার সময়</span>
                  </p>
                </div>
              </div>

              {/* Cover Picture */}
              <div className="h-64 sm:h-80 md:h-96 w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-200">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Main formatted Body Content */}
              <div className="text-slate-700 space-y-4 font-semibold leading-relaxed text-xs sm:text-sm">
                {activeArticle.content.split('\n\n').map((para, idx) => {
                  if (para.startsWith('###')) {
                    return (
                      <h3 key={idx} className="text-sm sm:text-base font-black text-slate-800 pt-3 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#0284C7]" />
                        {para.replace('###', '').trim()}
                      </h3>
                    );
                  }
                  return (
                    <p key={idx} className="whitespace-pre-wrap leading-relaxed text-slate-650">
                      {para}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer banner */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>MyDocBD • স্বাস্থ্য সচেতনতা উইং</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 hover:bg-slate-850 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
