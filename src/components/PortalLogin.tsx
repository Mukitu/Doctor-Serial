import React, { useState } from 'react';
import { HeartPulse, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { AdminProfile } from '../types';
import { signIn } from '../lib/supabase';

interface PortalLoginProps {
  onLoginSuccess: (admin: AdminProfile) => void;
}

export default function PortalLogin({ onLoginSuccess }: PortalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const admin = await signIn(email.trim(), password);
      onLoginSuccess(admin);
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। আপনার তথ্যাদি পুনরায় যাচাই করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill in credentials for testing
  const fillDemoCredentials = (type: 'super' | 'regular') => {
    if (type === 'super') {
      setEmail('nishat.af27@gmail.com');
      setPassword('admin123'); // Standard mock password
    } else {
      setEmail('admin@mydocbd.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Branding & Logo header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-100">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-900 tracking-tight">
            MyDocBD Admin Portal - লগইন করুন
          </h2>
          <p className="mt-1.5 text-xs font-bold text-slate-400">
            সিস্টেম নিরাপত্তা ও অ্যাডমিন অ্যাক্সেস কন্ট্রোল প্যানেল
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-xs font-bold text-slate-500 mb-1.5">
              অ্যাডমিন ইমেইল এড্রেস
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#0284C7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="admin@mydocbd.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 mb-1.5">
              সিক্রেট পাসওয়ার্ড
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#0284C7] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2.5 text-xs font-bold text-white transition focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white mr-1" />
            ) : (
              'নিরাপদ লগইন নিশ্চিত করুন'
            )}
          </button>
        </form>

        {/* Demo Fast Credentials helper */}
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 text-[11px] font-semibold text-slate-500">
          <p className="text-center font-bold text-slate-600 mb-2">ডেভেলপমেন্ট ও রিভিউ টেস্টিং ক্রেনডেনশিয়ালস</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => fillDemoCredentials('super')}
              type="button"
              className="rounded border border-red-200 bg-red-50/50 px-2 py-1.5 hover:bg-red-50 text-red-700 transition cursor-pointer text-center"
            >
              সুপার অ্যাডমিন ফিল করুন
            </button>
            <button
              onClick={() => fillDemoCredentials('regular')}
              type="button"
              className="rounded border border-indigo-200 bg-indigo-50/50 px-2 py-1.5 hover:bg-indigo-50 text-indigo-700 transition cursor-pointer text-center"
            >
              সাধারণ অ্যাডমিন ফিল করুন
            </button>
          </div>
          <p className="text-[9px] text-slate-400 text-center mt-2.5">
            পাসওয়ার্ড (fallback মোডের জন্য): <b className="text-slate-600 font-mono">admin123</b>
          </p>
        </div>
      </div>
    </div>
  );
}
