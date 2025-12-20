import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Users, Briefcase, GraduationCap, Activity, Settings } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Menu items now use the actual paths used in your App Router
  const menuItems = [
    { id: 'overview', label: 'Command Center', icon: Activity, path: '/admin/overview' },
    { id: 'users', label: 'User Directory', icon: Users, path: '/admin/users' },
    { id: 'jobs', label: 'Job Oversight', icon: Briefcase, path: '/admin/jobs' },
    { id: 'learning', label: 'Applied Learning', icon: GraduationCap, path: '/admin/learning' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  // Derive the page title dynamically from the current path
  const currentTitle = menuItems.find(item => location.pathname === item.path)?.label || "System Oversight";

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <DashboardSidebar 
        menuItems={menuItems} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Nav */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                {currentTitle}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Status</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   Optimal
                </span>
            </div>
            <div className="h-8 w-[1px] bg-gray-200" />
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <Settings size={18} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
            {/* The Outlet renders the component corresponding to the current URL child route */}
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;