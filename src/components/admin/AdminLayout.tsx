import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  subTab: string;
  setSubTab: (tab: string) => void;
  pendingAppointmentsCount: number;
  doctorsCount: number;
  facilitiesCount: number;
  blogsCount: number;
  districtsCount: number;
  specialtiesCount?: number;
  currentAdmin: any;
  onSignOut: () => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  subTab,
  setSubTab,
  pendingAppointmentsCount,
  doctorsCount,
  facilitiesCount,
  blogsCount,
  districtsCount,
  specialtiesCount = 0,
  currentAdmin,
  onSignOut,
  children
}: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSelectTab = (tab: string) => {
    setSubTab(tab);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar (Drawer on mobile/tablet, Fixed in flow on lg+ desktop) */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar
          subTab={subTab}
          setSubTab={handleSelectTab}
          pendingAppointmentsCount={pendingAppointmentsCount}
          doctorsCount={doctorsCount}
          facilitiesCount={facilitiesCount}
          blogsCount={blogsCount}
          districtsCount={districtsCount}
          specialtiesCount={specialtiesCount}
          currentAdmin={currentAdmin}
          onSignOut={onSignOut}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Right Core Content Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Topbar */}
        <AdminHeader
          pendingAppointmentsCount={pendingAppointmentsCount}
          doctorsCount={doctorsCount}
          facilitiesCount={facilitiesCount}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Dynamic Viewport View Scroll */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}

