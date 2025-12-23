import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Filter, 
  ChevronRight,
  Info
} from 'lucide-react';

const StudentJobSearch = ({ studentProfile }) => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, WORK_STUDY, NON_WORK_STUDY
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // The API endpoint handles RBAC and Work Study filtering
        const response = await fetch('/api/jobs/student-view');
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Filter logic for frontend search and quick toggles
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filter === 'ALL' || job.fundingSource === filter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by job title or company..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-red-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Funding Types</option>
              <option value="NON_WORK_STUDY">Non-Work Study</option>
              {studentProfile?.workStudyEligible && (
                <option value="WORK_STUDY">Work Study Only</option>
              )}
            </select>
          </div>
        </div>

        {/* Work Study Status Badge */}
        {studentProfile?.workStudyEligible && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
            <Info size={16} className="text-green-600" />
            <p className="text-xs text-green-800 font-medium">
              You are eligible for **Federal Work Study** positions. These opportunities are highlighted below.
            </p>
          </div>
        )}
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">Loading career opportunities...</div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div key={job.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-red-50 transition-colors">
                  <Briefcase size={24} className="group-hover:text-red-600" />
                </div>
                {job.fundingSource === 'WORK_STUDY' && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Work Study
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#A10022] transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{job.organizationName}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  {job.location} {job.isOnCampus && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-1 font-bold">On-Campus</span>}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={16} className="text-gray-400" />
                  {job.fundingSource === 'WORK_STUDY' ? 'FWS Funded' : 'Standard Hourly'}
                </div>
              </div>

              <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-[#A10022] transition-colors flex items-center justify-center gap-2">
                View Details <ChevronRight size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400">
            No jobs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentJobSearch;