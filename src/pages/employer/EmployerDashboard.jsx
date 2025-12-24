import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  PlusCircle,
  TrendingUp,
  UserCircle,
  ShieldCheck
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import apiClient from '../../api/ApiClient';

/* --- Reusable Tooltip Component --- */
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap z-[100] shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
            {text}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </div>
  );
};

const EmployerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ 
    activeJobsCount: 0, 
    totalApplicantsPending: 0, 
    companyName: "Loading..." 
  });

  const menuItems = [
    { id: 'overview', label: 'Recruitment Hub', icon: LayoutDashboard, path: '/employer/overview' },
    { id: 'my-jobs', label: 'My Postings', icon: Briefcase, path: '/employer/my-jobs' },
    { id: 'applicants', label: 'Applicant Pool', icon: Users, path: '/employer/applicants' },
    { id: 'interviews', label: 'Interviews', icon: Calendar, path: '/employer/interviews' },
  ];

  const currentTitle = menuItems.find(item => location.pathname === item.path)?.label || "Employer Portal";

  const fetchEmployerData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/employer/dashboard/summary');
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to fetch employer stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <DashboardSidebar
        menuItems={menuItems}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight italic">
              {currentTitle}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            {/* Header KPIs with Tooltips */}
            <div className="flex items-center gap-6 border-r border-gray-100 pr-8">
              <HeaderStat 
                label="Active Jobs" 
                value={summary.activeJobsCount} 
                icon={<Briefcase size={14} className="text-blue-500" />} 
                tooltip="Live postings currently seen by students"
              />
              <HeaderStat 
                label="Pending Review" 
                value={summary.totalApplicantsPending} 
                icon={<TrendingUp size={14} className="text-[#A10022]" />} 
                tooltip="New applicants requiring attention"
              />
            </div>

            {/* Post Job Quick Action with Tooltip */}
            <Tooltip text="Create a new job listing immediately">
                <button 
                onClick={() => navigate('/employer/my-jobs/new')}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-lg shadow-gray-200"
                >
                <PlusCircle size={16} /> Post Position
                </button>
            </Tooltip>

            {/* Profile Section with Tooltips */}
            <div className="flex items-center gap-3 pl-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-black text-gray-900 leading-none mb-1">
                  {summary.companyName}
                </span>
                <Tooltip text="Your account has been vetted by Career Services">
                    <span className="text-[10px] font-bold text-[#A10022] uppercase tracking-tighter flex items-center gap-1 cursor-help">
                    <ShieldCheck size={10} /> Verified Employer
                    </span>
                </Tooltip>
              </div>
              <Tooltip text="Account Settings & Profile">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#A10022] hover:bg-red-50 transition-all cursor-pointer">
                    <UserCircle size={24} />
                </div>
              </Tooltip>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto p-8">
            <Outlet context={[summary]} />
          </div>
        </main>
      </div>
    </div>
  );
};

const HeaderStat = ({ label, value, icon, tooltip }) => (
  <Tooltip text={tooltip}>
    <div className="flex flex-col items-start cursor-help">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1">
        {icon} {label}
        </p>
        <p className="text-lg font-black text-gray-900 leading-none italic">{value}</p>
    </div>
  </Tooltip>
);

export default EmployerDashboard;