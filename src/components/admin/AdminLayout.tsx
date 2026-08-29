import React from 'react';
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
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Persistent Left Sidebar */}
      <AdminSidebar
        subTab={subTab}
        setSubTab={setSubTab}
        pendingAppointmentsCount={pendingAppointmentsCount}
        doctorsCount={doctorsCount}
        facilitiesCount={facilitiesCount}
        blogsCount={blogsCount}
        districtsCount={districtsCount}
        specialtiesCount={specialtiesCount}
        currentAdmin={currentAdmin}
        onSignOut={onSignOut}
      />

      {/* Right Core Content Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Sticky Topbar */}
        <AdminHeader
          pendingAppointmentsCount={pendingAppointmentsCount}
          doctorsCount={doctorsCount}
          facilitiesCount={facilitiesCount}
        />

        {/* Dynamic Viewport View Scroll */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
