import React from 'react';
// import { apiClient } from '../../api/ApiClient';
import {
  Users, Briefcase, GraduationCap, CheckCircle,
  AlertTriangle, ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';

const CommandCenter = ({ user }) => {
  // Mock data representing real-time system state
  const kpis = [
    { label: 'Total Active Students', value: '8,420', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Job Approvals', value: '24', change: 'Action Required', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Unverified Experiences', value: '156', change: 'High Volume', icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Employer Partners', value: '112', change: '+4 this week', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data); // Axios automatically parses JSON
    } catch (err) {
      console.error("Failed to fetch Command Center stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome & Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
        <p className="text-gray-500 text-sm">Real-time oversight of the EWU Career & Applied Learning ecosystem.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${kpi.label.includes('Pending') ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applied Learning Visualization (16 Types) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Applied Learning Distribution</h3>
            <button className="text-xs text-[#A10022] font-bold flex items-center gap-1 hover:underline">
              View All 16 Types <ArrowUpRight size={14} />
            </button>
          </div>
          {/* Visualizing 4 major categories as an example */}
          <div className="space-y-4">
            <CategoryBar label="Internships & Co-ops" value={75} color="bg-blue-500" />
            <CategoryBar label="Community Engagement" value={45} color="bg-green-500" />
            <CategoryBar label="Undergraduate Research" value={30} color="bg-[#A10022]" />
            <CategoryBar label="Study Abroad" value={15} color="bg-purple-500" />
          </div>
          <p className="mt-6 text-xs text-gray-400 italic border-t pt-4">
            Aggregating data from Banner and Experiential Learning silos.
          </p>
        </div>

        {/* System Pulse / Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" /> System Pulse
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
          <button className="mt-6 w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">
            View Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

/* Helper Components */
const CategoryBar = ({ label, value, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-bold">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">{value}%</span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const PulseItem = ({ user, action, time, icon, isSystem }) => (
  <div className="flex gap-4">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isSystem ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-gray-900 truncate">{user}</p>
      <p className="text-[11px] text-gray-500">{action}</p>
      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{time}</p>
    </div>
  </div>
);

export default CommandCenter;