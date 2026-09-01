import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  CreditCard, 
  Building, 
  MessageSquarePlus, 
  CheckCircle2, 
  AlertCircle,
  Send,
  User,
  Phone,
  ThumbsUp,
  BadgeCheck,
  Lock,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { Doctor, Review } from '../types';
import { getReviews, submitVerifiedPatientReview } from '../lib/supabase';
import PromoBannerComponent from './PromoBanner';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (doctor: Doctor) => void;
}

export default function DoctorProfileModal({
  doctor,
  isOpen,
  onClose,
  onBookNow
}: DoctorProfileModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doctor) {
      loadDoctorReviews();
      setShowReviewForm(false);
      setSubmitSuccess(null);
      setErrorMessage(null);
    }
  }, [isOpen, doctor]);

  const loadDoctorReviews = async () => {
    if (!doctor) return;
    setLoadingReviews(true);
    try {
      const docReviews = await getReviews(doctor.doctorId || doctor.id);
      setReviews(docReviews);
    } catch (err) {
      console.error('Error loading doctor reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    if (!reviewerName.trim()) {
      setErrorMessage('আপনার নাম প্রদান করুন।');
      return;
    }

    if (!patientPhone.trim()) {
      setErrorMessage('সিরিয়াল বুকিংয়ের মোবাইল নম্বরটি প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(null);

    try {
      const result = await submitVerifiedPatientReview({
        doctorId: doctor.doctorId || doctor.id,
        doctorName: doctor.name,
        patientName: reviewerName.trim(),
        patientPhone: patientPhone.trim(),
        rating,
        comment: reviewText.trim() ? reviewText.trim() : undefined
      });

      if (result.success) {
        setSubmitSuccess(result.message || 'আপনার রিভিউ ও রেটিং সফলভাবে গ্রহণ করা হয়েছে!');
        setReviewerName('');
        setPatientPhone('');
        setReviewText('');
        setRating(5);
        await loadDoctorReviews();
        setTimeout(() => {
          setShowReviewForm(false);
          setSubmitSuccess(null);
        }, 3000);
      } else {
        setErrorMessage(result.message || 'আপনি পূর্বে এই ডাক্তারের অ্যাপয়েন্টমেন্ট নেননি। অনুগ্রহ করে যে নম্বর দিয়ে সিরিয়াল বুকিং করেছিলেন সেটি ব্যবহার করুন।');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setErrorMessage(err?.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !doctor) return null;

  const approvedReviews = reviews.filter(r => r.isApproved !== false);
  const totalReviewCount = (doctor.reviewCount || 0) + approvedReviews.length;
  const displayRating = doctor.rating !== undefined && doctor.rating !== null && doctor.rating > 0
    ? Number(doctor.rating).toFixed(1)
    : (approvedReviews.length > 0
        ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
        : '5.0');

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": doctor.name,
    "description": doctor.about || doctor.degrees || `${doctor.name} - ${doctor.specialty} expert physician at MyDocBD`,
    "image": doctor.photoUrl || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=200",
    "medicalSpecialty": doctor.specialty,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": doctor.chamberAddress || doctor.facilityAddress || "Rajshahi, Bangladesh",
      "addressLocality": "Rajshahi",
      "addressCountry": "BD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": displayRating,
      "reviewCount": Math.max(1, totalReviewCount),
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": `BDT ${doctor.feesNew}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Dynamic Schema.org SEO tags */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8"
        id={`doctor-profile-modal-${doctor.id}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500"></span>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">ডাক্তারের বিস্তারিত প্রোফাইল ও রিভিউ</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
            id="close-profile-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Doctor Header Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200/80">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-white text-slate-800 font-extrabold text-base sm:text-lg border border-slate-200 shadow-xs overflow-hidden">
                {doctor.photoUrl ? (
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback to initials if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{doctor.name.split(' ').filter(n => !n.includes('ডা.') && !n.includes(' can')).map(n => n[0]).slice(0, 2).join('') || 'DR'}</span>
                )}
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0284C7] text-white shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(doctor.specialties && doctor.specialties.length > 0
                    ? doctor.specialties
                    : (doctor.specialtyNameBn || doctor.specialty || 'মেডিসিন').split(/[,/]/).map(s => s.trim())
                  ).map((specName, sIdx) => (
                    <span key={sIdx} className="inline-flex rounded-md bg-[#0284C7]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#0284C7] border border-[#0284C7]/20">
                      {specName}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50">
                    <ShieldCheck className="h-3 w-3" />
                    <span>BM&DC: {doctor.bmdc || 'ভেরিফাইড'}</span>
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg font-bold text-slate-900">{doctor.name}</h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{doctor.degrees}</p>
                <p className="text-xs font-bold text-[#0D9488]">{doctor.designation} — {doctor.workplace}</p>
              </div>
            </div>

            {/* Rating Summary Card */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span className="text-sm font-extrabold text-amber-900">{displayRating}</span>
                <span className="text-[11px] text-amber-700 font-semibold">/ ৫.০</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-1">
                ({totalReviewCount} টি ভেরিফাইড রিভিউ)
              </span>
            </div>
          </div>

          {/* Doctor Biography & About Section */}
          {doctor.about && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0284C7]" />
                <span>ডাক্তার পরিচিতি ও বিশেষ অভিজ্ঞতা</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
                {doctor.about}
              </p>
            </div>
          )}

          {/* Promo Ad Banner inside Doctor Profile */}
          <PromoBannerComponent slot="sidebar_rect" className="shadow-xs" />

          {/* Chamber & Location Breakdown (Room, Floor, Building) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-[#0284C7]" />
              <span>চেম্বার ও সিরিয়াল সংক্রান্ত তথ্য ({doctor.chambers?.length || 1} টি চেম্বার)</span>
            </h3>

            {(doctor.chambers && doctor.chambers.length > 0 ? doctor.chambers : [{
              id: 'primary',
              facilityName: doctor.facilityName || doctor.facility,
              facilityAddress: doctor.facilityAddress || doctor.chamberAddress,
              roomNo: doctor.chamberRoomNo,
              floor: doctor.chamberFloor,
              buildingStand: doctor.chamberBuildingStand,
              visitingDays: doctor.visitingDays,
              visitingTime: doctor.visitingTime,
              feeNew: doctor.feesNew,
              feeOld: doctor.feesOld
            }]).map((ch, idx) => (
              <div key={ch.id || idx} className={`space-y-3 ${idx > 0 ? 'pt-4 border-t border-slate-200' : ''}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">হাসপাতাল / ডায়াগনস্টিক</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{ch.facilityName || 'চেম্বার'}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{ch.facilityAddress}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100">
                    <span className="block text-[10px] font-bold text-[#0284C7] uppercase">কক্ষ ও ফ্লোর নম্বর</span>
                    <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                      রুম: {ch.roomNo || 'নির্ধারিত নয়'} | ফ্লোর: {ch.floor || 'নিচতলা'}
                    </div>
                    <span className="text-[10px] text-sky-700 font-semibold block mt-0.5">
                      স্ট্যান্ড / উইং: {ch.buildingStand || 'মেইন ভবন'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">রোগী দেখার সময় ও ফি</span>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      ফি: ৳{ch.feeNew || 0} (নতুন) / ৳{ch.feeOld || 0} (পুরাতন)
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium block mt-0.5">
                      সময়: {ch.visitingTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs font-semibold text-emerald-800">
                  <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>রোগী দেখার দিনসমূহ: {Array.isArray(ch.visitingDays) ? ch.visitingDays.join(', ') : 'সবদিন'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs" id="reviews-section">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  <span>রোগীদের রিভিউ ও রেটিং ({totalReviewCount})</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  ১০০% যাচাইকৃত রোগীদের বাস্তব অভিজ্ঞতা ও মূল্যায়ন
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(!showReviewForm);
                  setErrorMessage(null);
                  setSubmitSuccess(null);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
                id="write-review-btn"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>{showReviewForm ? 'ফর্ম বন্ধ করুন' : 'রিভিউ দিন'}</span>
              </button>
            </div>

            {/* Review Submission Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-sky-800">
                  <Lock className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sky-950">যাচাইকৃত রোগী ভেরিফিকেশন নীতি:</span>
                    <span>শুধুমাত্র ইতিপূর্বে এই ডাক্তারের কনফার্ম হওয়া রোগীগণ রেটিং দিতে পারবেন। আপনার মোবাইল নম্বরটি শুধুই যাচাইয়ের জন্য নেওয়া হচ্ছে এবং জনসম্মুখে এটি কখনোই প্রকাশ করা হবে না।</span>
                  </div>
                </div>
                
                {submitSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      রোগীর নাম <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="যেমন: মো: কামরুল হাসান"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      />
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      বুকিংকৃত মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="যেমন: 017XXXXXXXX"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none"
                      />
                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 block">যেই নম্বর দিয়ে পূর্বে সিরিয়াল নিয়েছিলেন</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    রেটিং নির্বাচন করুন <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 h-9 bg-white p-2 rounded-lg border border-slate-200 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-800 ml-2">({rating} / ৫ স্টার)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    আপনার মন্তব্য / অভিজ্ঞতা <span className="text-slate-400 font-normal">(অপশনাল)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ডাক্তারের সেবা, পরামর্শ ও অভিজ্ঞতা কেমন লাগলো লিখুন (কমেন্ট ছাড়াও শুধু স্টার দেওয়া যাবে)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#0284C7] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setErrorMessage(null);
                      setSubmitSuccess(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                    id="submit-verified-review-btn"
                  >
                    <Send className="h-3 w-3" />
                    <span>{submitting ? 'যাচাই করা হচ্ছে...' : 'রিভিউ জমা দিন'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                রিভিউ লোড হচ্ছে...
              </div>
            ) : approvedReviews.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-100">
                <Star className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">এখনো কোনো রিভিউ যোগ করা হয়নি</p>
                <p className="text-[11px] text-slate-400 mt-0.5">পূর্বের রোগী হয়ে থাকলে প্রথম রিভিউ দিয়ে আপনার অভিজ্ঞতা শেয়ার করুন।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                          {rev.patientName ? rev.patientName[0] : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-slate-800">{rev.patientName}</h5>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200/60">
                              <BadgeCheck className="h-2.5 w-2.5 text-emerald-600" />
                              <span>ভেরিফাইড রোগী</span>
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {(rev.comment || rev.reviewText) && (
                      <p className="text-xs font-medium text-slate-600 leading-relaxed pl-9">
                        "{rev.comment || rev.reviewText}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/90 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="text-xs font-bold text-slate-600 text-center sm:text-left">
            পরামর্শ ফি: <span className="text-slate-900 font-extrabold">৳{doctor.feesNew}</span> (নতুন রোগী)
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 sm:py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={() => {
                onClose();
                onBookNow(doctor);
              }}
              className="flex-1 sm:flex-none rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-6 py-2.5 sm:py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              id="modal-book-serial-btn"
            >
              সিরিয়াল বুক করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
