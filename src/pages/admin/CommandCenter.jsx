import React, { useEffect, useState } from 'react';
// 1. Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/ApiClient';
import {
  Users, Briefcase, GraduationCap, CheckCircle,
  AlertTriangle, ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';

const CommandCenter = ({ user }) => {
  // 2. Initialize the navigate function
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      const data = response.data;
      const kpis = [
        { key: 'activeStudents', label: 'Total Active Students', value: data.activeStudents, change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { key: 'pendingJobApprovals', label: 'Pending Job Approvals', value: data.pendingJobApprovals, change: 'Action Required', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
        { key: 'unverifiedExperiences', label: 'Unverified Experiences', value: data.unverifiedExperiences, change: 'High Volume', icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
        { key: 'employerPartners', label: 'Employer Partners', value: data.employerPartners, change: `+${data.newEmployerPartners} this week`, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
      ];
      setStats(kpis);
    } catch (err) {
      console.error("Failed to fetch Command Center stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight italic uppercase">Command Center</h1>
        <p className="text-gray-500 text-sm font-medium">Real-time oversight of the EWU Career & Applied Learning ecosystem.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${kpi.label.includes('Pending') ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1 italic">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applied Learning Visualization */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs italic">Applied Learning Distribution</h3>
            <button className="text-[10px] text-[#A10022] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All 16 Types <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="space-y-6">
            <CategoryBar label="Internships & Co-ops" value={75} color="bg-blue-500" />
            <CategoryBar label="Community Engagement" value={45} color="bg-green-500" />
            <CategoryBar label="Undergraduate Research" value={30} color="bg-[#A10022]" />
            <CategoryBar label="Study Abroad" value={15} color="bg-purple-500" />
          </div>
          <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic border-t border-gray-50 pt-4">
            Aggregating data from Banner and Experiential Learning silos.
          </p>
        </div>

        {/* System Pulse / Activity Feed */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs italic mb-6 flex items-center gap-2">
            <Clock size={18} className="text-[#A10022]" /> System Pulse
          </h3>
          <div className="space-y-6 flex-1">
            <PulseItem
              user="Sam Snyder (Spokane Tech)"
              action="Posted New Job"
              time="2m ago"
              icon={<Briefcase size={14} />}
            />
            <PulseItem
              user="Alice Eagle"
              action="Submitted Internship Log"
              time="15m ago"
              icon={<GraduationCap size={14} />}
            />
            <PulseItem
              user="System Sync"
              action="Banner Refresh Complete"
              time="1h ago"
              icon={<CheckCircle size={14} />}
              isSystem
            />
          </div>
          
          {/* 3. Updated Button with Navigation Logic */}
          <button 
            onClick={() => navigate('/admin/settings/logs')}
            className="mt-8 w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            View Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
const CategoryBar = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 italic">{value}%</span>
    </div>
    <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
      <div className={`${color} h-full rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const PulseItem = ({ user, action, time, icon, isSystem }) => (
  <div className="flex gap-4 group">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSystem ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 group-hover:bg-[#A10022]/10 group-hover:text-[#A10022]'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black text-gray-900 uppercase italic truncate">{user}</p>
      <p className="text-[11px] font-bold text-gray-500">{action}</p>
      <p className="text-[9px] text-gray-400 mt-1 uppercase font-black tracking-widest">{time}</p>
    </div>
  </div>
);

export default CommandCenter;