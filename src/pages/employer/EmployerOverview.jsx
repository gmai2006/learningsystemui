import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp, 
  Plus,
  AlertCircle
} from 'lucide-react';

const EmployerOverview = () => {
  const [summary] = useOutletContext(); // Accesses the data from EmployerDashboard shell
  const navigate = useNavigate();

  if (!summary) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. KPI Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<Briefcase />} 
          label="Active Postings" 
          value={summary.activeJobsCount} 
          color="text-blue-600" 
          bg="bg-blue-50"
        />
        <StatCard 
          icon={<Users />} 
          label="Pending Review" 
          value={summary.totalApplicantsPending} 
          color="text-[#A10022]" 
          bg="bg-red-50"
        />
        <StatCard 
          icon={<Clock />} 
          label="Avg. Time to Hire" 
          value="14 Days" 
          color="text-amber-600" 
          bg="bg-amber-50"
        />
        <StatCard 
          icon={<CheckCircle />} 
          label="Total Placements" 
          value="24" 
          color="text-emerald-600" 
          bg="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Active Pipelines (Left/Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black italic text-gray-900 tracking-tight">Active Pipelines</h2>
            <button 
              onClick={() => navigate('/employer/my-jobs')}
              className="text-[10px] font-black text-[#A10022] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Postings <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {summary.activePipelines?.map((job) => (
              <div key={job.jobId} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic text-gray-900 group-hover:text-[#A10022] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Live for {job.daysAgo} days
                    </p>
                  </div>

                  <div className="flex items-center gap-12">
                    <PipelineStat label="Review" count={job.pendingCount} highlighted={job.pendingCount > 0} />
                    <PipelineStat label="Interview" count={job.interviewCount} />
                    <PipelineStat label="Offer" count={job.offerCount} />
                    
                    <button 
                      onClick={() => navigate(`/employer/applicants?jobId=${job.jobId}`)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#A10022] group-hover:text-white transition-all"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Recent Activity (Right Column) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic text-gray-900 tracking-tight">Live Activity</h2>
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="space-y-8 relative z-10">
              {summary.recentActivity?.map((activity, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className={`mt-1 p-2 rounded-xl h-fit ${activity.type === 'APPLICATION' ? 'bg-red-50 text-[#A10022]' : 'bg-blue-50 text-blue-600'}`}>
                    {activity.type === 'APPLICATION' ? <Users size={16} /> : <TrendingUp size={16} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#A10022] transition-colors">
                      {activity.message}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State Call to Action */}
            {(!summary.recentActivity || summary.recentActivity.length === 0) && (
              <div className="text-center py-10 space-y-4">
                <AlertCircle size={40} className="mx-auto text-gray-200" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                  No recent activity found. Post a new job to start receiving applications.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

/* Internal Sub-components */

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
    <div className={`p-3 w-fit rounded-2xl ${bg} ${color}`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
      <p className="text-3xl font-black italic text-gray-900">{value}</p>
    </div>
  </div>
);

const PipelineStat = ({ label, count, highlighted = false }) => (
  <div className="text-center min-w-[60px]">
    <p className={`text-2xl font-black italic leading-none mb-1 ${highlighted ? 'text-[#A10022]' : 'text-gray-900'}`}>
      {count}
    </p>
    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
  </div>
);

export default EmployerOverview;