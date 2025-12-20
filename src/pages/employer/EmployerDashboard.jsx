import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  Building2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const EmployerDashboard = ({ user }) => {
  const [stats, setStats] = useState({ activeJobs: 0, pendingApprovals: 0, totalInterns: 0 });
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    // In a real implementation, these would fetch from the REST APIs generated earlier
    setStats({ activeJobs: 12, pendingApprovals: 4, totalInterns: 8 });
    setPendingRequests([
      { id: 1, student: "Alice Eagle", type: "INTERNSHIP", title: "Software Engineer Intern", date: "2025-12-10" },
      { id: 2, student: "Bob Swoop", type: "CO_OP", title: "Mechanical Engineering Co-op", date: "2025-12-12" }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#A10022] to-red-900 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Employer Partner Portal</h1>
            <p className="mt-2 text-red-100">Managing recruitment and applied learning for <strong>EWU Students</strong>.</p>
          </div>
          <Building2 size={64} className="opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Job Postings', value: stats.activeJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Current Interns/Staff', value: stats.totalInterns, icon: Users, color: 'text-green-600', bg: 'bg-green-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-lg`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Pending Approval Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Pending Approvals</h2>
            <button className="text-[#A10022] text-sm font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {pendingRequests.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {pendingRequests.map((req) => (
                  <li key={req.id} className="p-5 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex gap-4 items-start">
                      <div className="p-2 bg-gray-100 rounded text-gray-600"><Clock size={20} /></div>
                      <div>
                        <p className="font-bold text-gray-900">{req.student}</p>
                        <p className="text-sm text-gray-600">{req.title}</p>
                        <span className="mt-1 inline-block px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded uppercase tracking-wider">
                          {req.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#A10022] text-white text-sm font-bold rounded-lg hover:bg-red-800 transition-all">
                        Review Request
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-10 text-center text-gray-500">No pending approval requests.</div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Recruitment Hub</h2>
          <div className="bg-white rounded-xl border p-4 shadow-sm space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <PlusCircle className="text-[#A10022]" size={20} />
                <span className="font-semibold text-gray-700">Post New Job</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                <span className="font-semibold text-gray-700">Manage Campus Fairs</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="flex items-center gap-3">
                <Building2 className="text-green-600" size={20} />
                <span className="font-semibold text-gray-700">Company Profile</span>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl text-white">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <ExternalLink size={16} className="text-red-400" />
              Quick Support
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Need help with the "No-Login" approval process or EWU recruiting policies?
            </p>
            <button className="mt-4 text-xs font-bold text-red-400 hover:text-red-300">
              Contact Career Services →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;