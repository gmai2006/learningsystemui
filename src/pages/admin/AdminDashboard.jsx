import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, GraduationCap, Activity, 
  Settings, LogOut, ShieldCheck, Calendar 
} from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { useUser } from '../../context/UserContext';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUser();

  // Updated menuItems with children for Applied Learning
  const menuItems = [
    { id: 'overview', label: 'Command Center', icon: Activity, path: '/admin/overview' },
    { id: 'users', label: 'User Directory', icon: Users, path: '/admin/users' },
    { id: 'jobs', label: 'Job Oversight', icon: Briefcase, path: '/admin/jobs' },
    { 
      id: 'learning', 
      label: 'Applied Learning', 
      icon: GraduationCap, 
      path: '/admin/learning',
      children: [
        { id: 'internships', label: 'Internships & Practicums', path: '/admin/learning/internships' },
        { id: 'volunteer', label: 'Community Service', path: '/admin/learning/volunteer' }
      ]
    },
    { id: 'events', label: 'Events', icon: Calendar, path: '/admin/events' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  /**
   * Enhanced title logic: 
   * Searches top-level items AND sub-menu children to find the current label.
   */
  const getCurrentTitle = () => {
    for (const item of menuItems) {
      if (location.pathname === item.path) return item.label;
      if (item.children) {
        const subItem = item.children.find(child => location.pathname === child.path);
        if (subItem) return subItem.label;
      }
    }
    return "System Oversight";
  };

  const handleLogout = async () => {
    try {
        await logout();
        navigate('/login');
    } catch (err) {
        console.error("Logout failed", err);
        localStorage.clear();
        navigate('/login');
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-[#A10022] rounded-lg">
                <ShieldCheck size={18} />
            </div>
            <h2 className="text-lg font-black italic text-gray-800 tracking-tight">
                {getCurrentTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Network Status</span>
                <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   Optimal
                </span>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-200" />
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate('/admin/settings')}
                    className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border border-gray-100"
                >
                    <Settings size={18} />
                </button>

                <button 
                    onClick={handleLogout}
                    className="group flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:border-red-100 hover:bg-red-50 transition-all"
                >
                    <div className="flex flex-col items-end mr-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter group-hover:text-red-400">Exit Session</span>
                        <span className="text-[11px] font-bold text-gray-900 group-hover:text-[#A10022]">Logout</span>
                    </div>
                    <LogOut size={18} className="text-gray-400 group-hover:text-[#A10022] group-hover:translate-x-0.5 transition-all" />
                </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;