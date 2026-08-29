import React from 'react';
import brandLogo from '@/app/about/MyDocBD-Logo.png';
import appIcon from '@/app/about/MyDocBD-App-Icon.png';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Building2, 
  Map, 
  FileText, 
  Image as ImageIcon, 
  LogOut, 
  UserCheck, 
  Radio 
} from 'lucide-react';

interface AdminSidebarProps {
  subTab: string;
  setSubTab: (tab: string) => void;
  pendingAppointmentsCount: number;
  doctorsCount: number;
  facilitiesCount: number;
  blogsCount: number;
  districtsCount: number;
  currentAdmin: any;
  onSignOut: () => void;
}

export default function AdminSidebar({
  subTab,
  setSubTab,
  pendingAppointmentsCount,
  doctorsCount,
  facilitiesCount,
  blogsCount,
  districtsCount,
  currentAdmin,
  onSignOut
}: AdminSidebarProps) {
  
  const menuItems = [
    {
      id: 'dashboard',
      label: 'ড্যাশবোর্ড ওভারভিউ',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'appointments',
      label: 'সিরিয়াল বুকিং লিস্ট',
      icon: CalendarCheck,
      badge: pendingAppointmentsCount > 0 ? {
        count: pendingAppointmentsCount,
        color: 'bg-rose-500 text-white font-mono'
      } : null
    },
    {
      id: 'doctors',
      label: 'ডাক্তার ডিরেক্টরি',
      icon: Users,
      badge: doctorsCount > 0 ? {
        count: doctorsCount,
        color: 'bg-slate-100 text-slate-700 font-mono'
      } : null
    },
    {
      id: 'facilities',
      label: 'হাসপাতাল ও ক্লিনিক',
      icon: Building2,
      badge: facilitiesCount > 0 ? {
        count: facilitiesCount,
        color: 'bg-slate-100 text-slate-700 font-mono'
      } : null
    },
    {
      id: 'districts',
      label: 'জেলাসমূহ',
      icon: Map,
      badge: districtsCount > 0 ? {
        count: districtsCount,
        color: 'bg-slate-100 text-slate-700 font-mono'
      } : null
    },
    {
      id: 'blogs',
      label: 'স্বাস্থ্য ব্লগ আর্টিকেলস',
      icon: FileText,
      badge: blogsCount > 0 ? {
        count: blogsCount,
        color: 'bg-slate-100 text-slate-700 font-mono'
      } : null
    },
    {
      id: 'banners',
      label: 'প্রোমো ব্যানার ও এডস',
      icon: ImageIcon,
      badge: null
    }
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300">
      
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <img 
            src="/MyDocBD-App-Icon.png" 
            alt="MyDocBD App Icon" 
            className="h-8 w-8 object-contain rounded-lg" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wide block">MyDocBD</span>
              <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-black px-1.5 py-0.5 rounded">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">লাইভ সিস্টেম</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-[#0284C7] text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${item.badge.color}`}>
                  {item.badge.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Left Footer Profile & Sign Out */}
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-800/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 border border-slate-600 font-extrabold text-white text-xs">
              <UserCheck className="h-4.5 w-4.5 text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs font-black text-white">
                {currentAdmin?.name || 'অ্যাডমিন ইউজার'}
              </span>
              <span className="block text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                {currentAdmin?.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'সাধারণ অ্যাডমিন'}
              </span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-700/50 hover:bg-rose-950/30 border border-slate-700 hover:border-rose-900/60 px-3 py-2 text-[11px] font-bold text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>লগ আউট করুন</span>
          </button>
        </div>
      </div>

    </div>
  );
}
