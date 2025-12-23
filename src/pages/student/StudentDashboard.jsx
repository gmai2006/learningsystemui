import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Send,
  GraduationCap,
  UserCircle,
  Settings,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import apiClient from '../../api/ApiClient';


const StudentDashboard = ({user, token}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [summary, setSummary] = useState({ readinessScore: 0, tierName: 'Loading...', tierColor: '#9B9B9B' });

  const [profile, setProfile] = useState({
      bio: "",
      major: "",
      graduationYear: "",
      gpa: 0.0,
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      skills: []
    });

  // Navigation items tailored for the Student journey
  const menuItems = [
    { id: 'overview', label: 'My Progress', icon: LayoutDashboard, path: '/student/overview' },
    { id: 'jobs', label: 'Job Board', icon: Search, path: '/student/jobs' },
    { id: 'applications', label: 'Applications', icon: Send, path: '/student/applications' },
    { id: 'learning', label: 'Experience Registry', icon: GraduationCap, path: '/student/learning' },
    { id: 'profile', label: 'Career Profile', icon: UserCircle, path: '/student/profile' },
  ];

  // Derive the page title dynamically
  const currentTitle = menuItems.find(item => location.pathname === item.path)?.label || "Student Portal";

  const fetchStudentData = async () => {
    setLoading(true);
    try {

      const response = await apiClient.get('/student/dashboard/summary');
      const data = response.data;
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch student dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch Profile Data
  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/student/profile');
      setProfile(res.data);
    } catch (err) {
      showNotification("Error loading profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    fetchStudentData();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <DashboardSidebar
        menuItems={menuItems}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Updated Header: Increased height to h-20 for better breathing room */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight italic">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            {/* Career Status Section: Scaled down to w-14 h-14 to fit header */}
            <div className="flex items-center gap-4 border-r border-gray-100 pr-8">
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    style={{ color: summary.tierColor }}
                    strokeWidth="4"
                    strokeDasharray={`${summary.readinessScore}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black italic" style={{ color: summary.tierColor }}>
                    {summary.readinessScore}%
                  </span>
                </div>
              </div>

              <div className="hidden lg:block">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Current Tier</p>
                <h2 className="text-sm font-black italic text-gray-900 flex items-center gap-2 leading-none">
                  {summary.tierName}
                  <Trophy size={14} style={{ color: summary.tierColor }} />
                </h2>
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-black text-gray-900 leading-none mb-1">{user.firstName + ' ' + user.lastName}</span>
                <span className="text-[10px] font-bold text-[#A10022] uppercase tracking-tighter">Class of {profile.graduationYear}</span>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet context={[summary, profile, setProfile, loading]} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;