import React, { useState } from 'react';
import { MapPin, Search, Calendar, ShieldCheck, Menu, X } from 'lucide-react';
import brandLogo from '@/app/about/MyDocBD-Logo.png';
import { DISTRICTS } from '../data/mockData';
import { ActiveTab, District, AdminProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  districts?: District[];
  currentAdmin?: AdminProfile | null;
  onSignOut?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  selectedDistrict,
  setSelectedDistrict,
  districts = [],
  currentAdmin = null,
  onSignOut,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Map dynamic districts from Supabase
  const renderedDistricts = (districts && districts.length > 0)
    ? districts
        .filter(d => d.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(d => ({ id: d.id, name: d.nameBn, nameEn: d.nameEn }))
    : DISTRICTS;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Platform Logo */}
        <div 
          className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
          onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
          id="platform-logo"
        >
          <img 
            src="/MyDocBD-Logo.png" 
            alt="MyDocBD - ডিজিটাল হেলথ ডিরেক্টরি" 
            className="h-9 md:h-11 w-auto object-contain" 
          />
        </div>

        {/* Center: District Selector & Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {/* District Dropdown Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 px-3 text-xs text-slate-700 transition hover:border-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-bold text-slate-400">জেলা:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              id="district-selector"
            >
              <option value="সকল জেলা">সকল জেলা (All)</option>
              {renderedDistricts.map((dist) => (
                <option key={dist.id} value={dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="nav-home-btn"
            >
              হোম
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === 'doctors'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="nav-doctors-btn"
            >
              ডাক্তার ডিরেক্টরি
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === 'blog'
                  ? 'bg-slate-100 text-slate-900 border border-slate-200/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              id="nav-blog-btn"
            >
              স্বাস্থ্য ব্লগ
            </button>
            {currentAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent hover:border-slate-200/50'
                }`}
                id="nav-admin-btn"
              >
                অ্যাডমিন প্যানেল
              </button>
            )}
          </nav>
        </div>

        {/* Right: Quick Action Button & Admin context */}
        <div className="hidden md:flex items-center gap-3">
          {currentAdmin && (
            <div className="flex items-center gap-2 mr-2">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-extrabold border ${
                currentAdmin.role === 'super_admin' 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {currentAdmin.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs font-black text-slate-400 hover:text-red-600 transition cursor-pointer"
              >
                লগ আউট
              </button>
            </div>
          )}
          <button
            onClick={() => setActiveTab('track')}
            className="flex items-center gap-2 rounded-lg bg-[#0284C7] hover:bg-[#0274af] px-4.5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
            id="track-serial-header-btn"
          >
            <Search className="h-3.5 w-3.5" />
            <span>সিরিয়াল ট্র্যাক করুন</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile District Selector */}
          <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 py-1 px-2 text-xs text-slate-700">
            <MapPin className="h-3 w-3 text-slate-400" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
              id="mobile-district-selector"
            >
              <option value="সকল জেলা">সকল জেলা (All)</option>
              {renderedDistricts.map((dist) => (
                <option key={dist.id} value={dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden shadow-sm">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'home' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              হোম
            </button>
            <button
              onClick={() => { setActiveTab('doctors'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'doctors' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              ডাক্তার ডিরেক্টরি
            </button>
            <button
              onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
              className={`flex w-full items-center rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'blog' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              স্বাস্থ্য ব্লগ
            </button>
            {currentAdmin && (
              <>
                <button
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`flex w-full items-center rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  অ্যাডমিন প্যানেল
                </button>
                <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 mt-1">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-extrabold ${
                    currentAdmin.role === 'super_admin' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {currentAdmin.role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন'}
                  </span>
                  <button
                    onClick={() => { onSignOut?.(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-red-600"
                  >
                    লগ আউট
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0274af] py-2.5 text-xs font-bold text-white"
            >
              <Search className="h-3.5 w-3.5" />
              <span>সিরিয়াল ট্র্যাক করুন</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

