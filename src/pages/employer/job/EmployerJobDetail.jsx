import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Edit3, Users, Clock, 
  MapPin, DollarSign, Tag, Calendar, CheckCircle 
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';


const EmployerJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300">RETRIEVING POSTING...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all"
        >
          <Edit3 size={16} /> Edit Posting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Job Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${job.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                  {job.isActive ? 'Status: Active' : 'Status: Closed'}
                </span>
                <span className="px-3 py-1 bg-red-50 text-[#A10022] text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {job.category}
                </span>
              </div>
              <h1 className="text-4xl font-black italic text-gray-900 tracking-tight leading-none">
                {job.title}
              </h1>
            </div>

            <Section title="Description" icon={<Clock size={18} />}>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line font-medium">
                {job.description}
              </p>
            </Section>

            <Section title="Requirements" icon={<CheckCircle size={18} />}>
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line font-medium italic">
                  {job.requirements || "No specific requirements listed."}
                </p>
              </div>
            </Section>
          </div>
        </div>

        {/* Right: Recruitment Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-xl font-black italic text-gray-900">Posting Snapshot</h2>
            
            <div className="space-y-6">
              <DetailItem icon={<MapPin />} label="Location" value={job.location} />
              <DetailItem icon={<DollarSign />} label="Salary Range" value={job.salaryRange} />
              <DetailItem icon={<Calendar />} label="Created On" value={new Date(job.createdAt).toLocaleDateString()} />
            </div>

            <div className="pt-6 border-t border-gray-50">
              <div 
                onClick={() => navigate(`/employer/applicants?jobId=${jobId}`)}
                className="bg-gray-50 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors group"
              >
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Applicants</p>
                  <p className="text-2xl font-black italic text-gray-900 group-hover:text-[#A10022]">{job.applicantCount}</p>
                </div>
                <div className="p-3 bg-white rounded-2xl text-gray-400 group-hover:text-[#A10022]">
                  <Users size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* Helper Components */
const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-black italic text-gray-900 flex items-center gap-2">
      <span className="text-[#A10022]">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
      {React.cloneElement(icon, { size: 16 })}
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

export default EmployerJobDetail;