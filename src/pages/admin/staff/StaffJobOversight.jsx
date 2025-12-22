import React, { useState, useEffect } from 'react';
import {
  Check, X, Eye, ShieldCheck, Search, Filter,
  RotateCcw, FileSpreadsheet, Briefcase, Building2,
  MapPin, Calendar, Wallet, Loader2, Globe, School,
  Info
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const StaffJobOversight = () => {
  const { showNotification } = useNotification();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [hoveredJobId, setHoveredJobId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    fundingSource: '',
    active: ''
  });

  // Helper to format the [YYYY, M, D] array from JSON
  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/jobs/admin/all');
      setPostings(res.data);
    } catch (err) {
      showNotification("Failed to load job postings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      // await apiClient.put(`/jobs/${id}/status`, { active: !currentStatus });
      showNotification(`Job ${!currentStatus ? 'Activated' : 'Deactivated'}`, "success");
      fetchJobs();
    } catch (err) {
      showNotification("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      // await apiClient.put(`/jobs/${id}/status`, { status: action });
      showNotification(`Job status updated to ${action}`, "success");
      fetchJobs();
    } catch (err) {
      showNotification("Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const resetFilters = () => setFilters({ search: '', source: '', status: '' });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Job <span className="text-[#A10022]">Oversight</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">System-wide moderation for {postings.length} total postings.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-600 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
          <FileSpreadsheet size={18} /> Export CSV
        </button>
      </header>

      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search titles, locations, or descriptions..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#A10022]/10 outline-none"
            value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
          value={filters.fundingSource} onChange={e => setFilters({ ...filters, fundingSource: e.target.value })}
        >
          <option value="">Funding: All</option>
          <option value="WORK_STUDY">Work Study</option>
          <option value="NON_WORK_STUDY">Non-Work Study</option>
        </select>
        <button onClick={fetchJobs} className="bg-[#A10022] text-white rounded-2xl font-black text-sm hover:bg-red-800 transition-all shadow-lg shadow-red-900/10">
          Update View
        </button>
      </div>

      {/* Modern Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">Position Details</th>
              <th className="px-8 py-5">Location & Type</th>
              <th className="px-8 py-5">Deadline & Funding</th>
              <th className="px-8 py-5 text-right">Visibility Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {postings.map(job => (
              <tr
                key={job.id}
                className={`transition-colors relative ${hoveredJobId === job.id ? 'bg-gray-50/50 z-50' : 'z-0'}`}
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
              >
                <td className="px-8 py-5 relative">

                  {/* --- React-State Controlled Tooltip --- */}
                  {hoveredJobId === job.id && (
                    <div className="absolute z-[100] left-full ml-4 top-1/2 -translate-y-1/2 w-80 
                                    animate-in fade-in zoom-in-95 slide-in-from-left-2 duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white p-5 rounded-[1.5rem] shadow-2xl border border-white/10 text-xs leading-relaxed">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                          <div className="w-2 h-2 rounded-full bg-[#A10022] shadow-[0_0_8px_#A10022]" />
                          <span className="font-black uppercase tracking-widest text-[10px] text-gray-400">Position Summary</span>
                        </div>
                        {job.description}

                        {/* Tooltip Arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 
                                        border-t-[8px] border-t-transparent 
                                        border-r-[12px] border-r-gray-900 
                                        border-b-[8px] border-b-transparent"></div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-gray-900 text-base">{job.title}</p>
                      <Info size={14} className={`${hoveredJobId === job.id ? 'text-[#A10022]' : 'text-gray-300'} transition-colors`} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">Employer: {job.employerId.substring(0, 8)}...</p>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <MapPin size={14} className="text-[#A10022]" /> {job.location}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${job.onCampus ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                        {job.onCampus ? <><School size={10} className="inline mr-1" /> On-Campus</> : <><Globe size={10} className="inline mr-1" /> Off-Campus</>}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Calendar size={14} /> {formatDate(job.deadline)}
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${job.fundingSource === 'WORK_STUDY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {job.fundingSource.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end items-center gap-3">
                    <div className={`text-[10px] font-black uppercase ${job.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {job.active ? 'Active' : 'Inactive'}
                    </div>
                    <button
                      onClick={() => handleToggleActive(job.id, job.active)}
                      disabled={actionLoading === job.id}
                      className={`p-3 rounded-2xl transition-all shadow-sm border ${job.active
                        ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                        }`}
                    >
                      {actionLoading === job.id ? <Loader2 size={18} className="animate-spin" /> : (job.active ? <X size={18} /> : <Check size={18} />)}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffJobOversight;