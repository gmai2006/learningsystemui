import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Edit3, Users, Clock, 
  MapPin, DollarSign, Tag, Calendar, CheckCircle,
  Check, Globe, School 
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';

const EmployerJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- NEW: Helper to parse [YYYY, M, D, h, m] or [YYYY, M, D] ---
  const parseJavaDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
    
    // LocalDate [YYYY, M, D] or LocalDateTime [YYYY, M, D, h, m, s]
    const [year, month, day, hour = 0, minute = 0] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await apiClient.get(`/employer/dashboard/${jobId}/details`);
        setJob(res.data);
      } catch (err) {
        console.error("Error fetching job details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  if (loading) return (
    <div className="p-20 text-center animate-pulse">
        <span className="font-black text-gray-300 tracking-[0.2em] uppercase">Retrieving Posting...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/employer/my-jobs')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#A10022] transition-colors"
        >
          <ChevronLeft size={16} /> Back to My Postings
        </button>
        
        <button 
          onClick={() => navigate(`/employer/my-jobs/edit/${jobId}`)}
          className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200"
        >
          <Edit3 size={16} /> Edit Posting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Job Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-12">
            
            {/* Title Block */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  job.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}>
                  {job.isActive ? 'Status: Active' : 'Status: Closed'}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                   {job.category}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black italic text-gray-900 tracking-tight leading-tight uppercase">
                {job.title}
              </h1>
            </div>

            <Section title="Description" icon={<Clock size={20} />}>
              <div className="prose prose-sm text-gray-600 leading-relaxed font-medium">
                {job.description}
              </div>
            </Section>

            <Section title="Requirements" icon={<CheckCircle size={20} />}>
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                {Array.isArray(job.requirements) && job.requirements.length > 0 ? (
                  <ul className="space-y-4">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 bg-white p-1 rounded-lg border border-emerald-100 text-emerald-500 shadow-sm flex-shrink-0">
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <span className="text-gray-700 font-bold text-sm italic leading-snug">
                            {req}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 font-bold text-xs uppercase italic ml-2">
                    No specific requirements listed for this position.
                  </p>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Right: Recruitment Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black italic text-gray-900 uppercase tracking-tight">Posting Snapshot</h2>
            
            <div className="space-y-6">
              <DetailItem icon={<MapPin />} label="Location" value={job.location} />
              <DetailItem icon={<DollarSign />} label="Salary Range" value={job.salaryRange} />
              
              {/* --- UPDATED: Date handling --- */}
              <DetailItem 
                icon={<Calendar />} 
                label="Application Deadline" 
                value={parseJavaDateArray(job.deadline)} 
              />
              <DetailItem 
                icon={<Clock />} 
                label="Date Posted" 
                value={parseJavaDateArray(job.createdAt)} 
              />

              <DetailItem 
                icon={job.onCampus ? <School /> : <Globe />} 
                label="Site Type" 
                value={job.onCampus ? "On-Campus" : "Off-Campus"} 
              />
            </div>

            <div className="pt-6 border-t border-gray-50">
              <div 
                onClick={() => navigate(`/employer/applicants?jobId=${jobId}`)}
                className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-[#A10022] hover:text-white transition-all group"
              >
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-white/60">Total Applicants</p>
                  <p className="text-3xl font-black italic text-gray-900 group-hover:text-white leading-none">{job.applicantCount || 0}</p>
                </div>
                <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Components --- */
const Section = ({ title, icon, children }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
      <span className="text-[#A10022]">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-black text-gray-900 italic">{value || 'N/A'}</p>
    </div>
  </div>
);

export default EmployerJobDetail;