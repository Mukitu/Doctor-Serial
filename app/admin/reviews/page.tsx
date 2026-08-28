import React, { useState, useEffect } from 'react';
import { Star, PlusCircle, Trash2, Check, Loader2, Calendar, User, MessageSquare, AlertCircle, X } from 'lucide-react';
import { Doctor, Review } from '../../../src/types';
import { getDoctors, getReviews, addAdminReview, deleteReview } from '../../../src/lib/supabase';

export default function AdminReviewsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, revsData] = await Promise.all([
        getDoctors(),
        getReviews()
      ]);
      setDoctors(docsData);
      setReviews(revsData);
      if (docsData.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docsData[0].id);
      }
    } catch (err) {
      console.error('Error loading data for admin reviews page:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDoctorId) return setError('ডাক্তার নির্বাচন করুন।');
    if (!patientName.trim()) return setError('রোগীর নাম প্রদান করুন।');
    if (!comment.trim()) return setError('মন্তব্য বা রিভিউ বিবরণ প্রদান করুন।');

    const matchedDoc = doctors.find(d => d.id === selectedDoctorId);

    setSubmitting(true);
    try {
      await addAdminReview({
        doctorId: selectedDoctorId,
        doctorName: matchedDoc?.name,
        patientName: patientName.trim(),
        rating: rating,
        comment: comment.trim(),
        createdAt: reviewDate
      });

      setSuccess('নতুন অ্যাডমিন রিভিউ সফলভাবে যুক্ত করা হয়েছে!');
      setShowModal(false);
      // Reset form
      setPatientName('');
      setComment('');
      setRating(5);
      setReviewDate(new Date().toISOString().split('T')[0]);

      // Reload list
      await loadData();
    } catch (err: any) {
      setError(err.message || 'রিভিউ যুক্ত করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রিভিউটি মুছে ফেলতে চান?')) return;

    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('রিভিউ মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
              <span>ডাক্তার রিভিউ ও রেটিং ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              ডাক্তারদের প্রোফাইলে সরাসরি কাস্টম রিভিউ যোগ করুন এবং বিদ্যমান রিভিউ পর্যবেক্ষণ/ডিলিট করুন।
            </p>
          </div>

          <button
            onClick={() => {
              if (doctors.length > 0 && !selectedDoctorId) setSelectedDoctorId(doctors[0].id);
              setShowModal(true);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer self-start sm:self-auto"
            id="admin-add-review-btn-page"
          >
            <PlusCircle className="h-4 w-4" />
            <span>অ্যাডমিন রিভিউ যোগ করুন</span>
          </button>
        </div>

        {/* Global Notifications */}
        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Table of Reviews */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-bold gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#0284C7]" />
            <span>রিভিউ তালিকা লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                  <th className="p-3.5 text-[11px]">ডাক্তার</th>
                  <th className="p-3.5 text-[11px]">রোগীর নাম</th>
                  <th className="p-3.5 text-[11px]">রেটিং ও মন্তব্য</th>
                  <th className="p-3.5 text-[11px]">তারিখ</th>
                  <th className="p-3.5 text-[11px]">ধরন / স্ট্যাটাস</th>
                  <th className="p-3.5 text-center text-[11px]">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-semibold text-[11px]">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                      কোন রিভিউ পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  reviews.map((rev) => {
                    const matchedDoc = doctors.find((d) => d.id === rev.doctorId);
                    return (
                      <tr key={rev.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{matchedDoc?.name || rev.doctorName || rev.doctorId}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{matchedDoc?.specialty || ''}</p>
                        </td>

                        <td className="p-3.5 font-bold text-slate-800">
                          {rev.patientName}
                        </td>

                        <td className="p-3.5 max-w-md">
                          <div className="flex items-center gap-1 mb-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] font-black text-slate-700 ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-xs bg-slate-50 p-2 rounded border border-slate-100">
                            "{rev.comment || rev.reviewText}"
                          </p>
                        </td>

                        <td className="p-3.5 text-[10px] text-slate-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="p-3.5">
                          {rev.isAdminCreated ? (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/50">
                              অ্যাডমিন কাস্টম
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50">
                              ভেরিফাইড রোগী
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer shadow-xs"
                            title="রিভিউ মুছে ফেলুন"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Add Admin Custom Review */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-amber-500" />
                  <span>অ্যাডমিন কাস্টম রিভিউ যোগ করুন</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error && (
                <div className="mb-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ডাক্তার নির্বাচন করুন *</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                    required
                  >
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">রোগীর নাম *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                      />
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">রিভিউ প্রকাশের তারিখ</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={reviewDate}
                        onChange={(e) => setReviewDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                      />
                      <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">রেটিং স্টার *</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-2">({rating}.0 স্টার)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">রোগীর মন্তব্য / রিভিউ বক্তব্য *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="যেমন: ডাক্তার সাহেবের ব্যবহার অনেক ভালো, সময় নিয়ে রোগী দেখেন।"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 focus:border-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                    id="submit-admin-review-modal-btn"
                  >
                    <Check className="h-4 w-4" />
                    <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : 'রিভিউ সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
