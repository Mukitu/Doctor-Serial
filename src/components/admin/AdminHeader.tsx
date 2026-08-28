import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Activity, 
  CheckCircle, 
  Users, 
  Calendar, 
  Layers 
} from 'lucide-react';

interface AdminHeaderProps {
  pendingAppointmentsCount: number;
  doctorsCount: number;
  facilitiesCount: number;
}

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BANGLA_DAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const toBanglaDigits = (num: string | number): string => {
  return num.toString().replace(/\d/g, (digit) => BANGLA_DIGITS[parseInt(digit)]);
};

export default function AdminHeader({
  pendingAppointmentsCount,
  doctorsCount,
  facilitiesCount
}: AdminHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Date in Bengali
  const dayName = BANGLA_DAYS[time.getDay()];
  const dateNum = toBanglaDigits(time.getDate());
  const monthName = BANGLA_MONTHS[time.getMonth()];
  const yearNum = toBanglaDigits(time.getFullYear());

  // Format Time in Bengali
  let hours = time.getHours();
  const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  const banglaTimeStr = `${ampm} ${toBanglaDigits(hours)}:${toBanglaDigits(minutes)}:${toBanglaDigits(seconds)}`;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs">
      
      {/* Live Running Date & Time Widget */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-1.5 shadow-2xs">
          <Calendar className="h-4 w-4 text-[#0284C7]" />
          <span className="font-extrabold text-slate-800">
            {dayName}, {dateNum} {monthName} {yearNum}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-sky-50/50 border border-sky-100 px-3.5 py-1.5 shadow-2xs">
          <Clock className="h-4 w-4 text-[#0284C7] animate-pulse" />
          <span className="font-extrabold text-slate-800 font-mono tracking-wider">
            {banglaTimeStr}
          </span>
        </div>
      </div>

      {/* System Status and Micro Stats */}
      <div className="flex items-center gap-6">
        
        {/* System Health Check Status Indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100/60 px-3 py-1 text-[10px] font-extrabold text-emerald-700">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>সার্ভার অন-লাইন (API Active)</span>
        </div>

        {/* Compact Quick Stats Widget */}
        <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">সক্রিয় ডক্টর</span>
              <span className="text-[11px] text-slate-800 font-mono font-extrabold leading-none">{doctorsCount} জন</span>
            </div>
          </div>

          <span className="text-slate-200">|</span>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-500" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">নতুন আবেদন</span>
              <span className="text-[11px] text-rose-600 font-mono font-extrabold leading-none">{pendingAppointmentsCount} টি</span>
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
