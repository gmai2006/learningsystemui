import React, { useState, useEffect } from 'react';
import {
  Check, X, Eye, ShieldCheck, Search, Filter,
  RotateCcw, FileSpreadsheet, Briefcase, Building2,
  MapPin, Calendar, Wallet, Loader2, Globe, School,
  Info, Tag // Added Tag for Category
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const StaffJobOversight = () => {
  const { showNotification } = useNotification();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [hoveredJobId, setHoveredJobId] = useState(null);

  // 1. Updated filters state
  const [filters, setFilters] = useState({
    search: '',
    fundingSource: '',
    category: '', // Added category
    active: ''
  });

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
      // Assuming admin endpoint returns JobOversightView data
      const res = await apiClient.get('/jobs/admin/all');
      setPostings(res.data);
    } catch (err) {
      showNotification("Failed to load job postings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // 2. Local Filtering Logic
  const filteredPostings = postings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                          job.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesFunding = filters.fundingSource ? job.fundingSource === filters.fundingSource : true;
    const matchesCategory = filters.category ? job.category === filters.category : true;
    
    return matchesSearch && matchesFunding && matchesCategory;
  });

  const handleToggleActive = async (id, currentStatus) => {
    setActionLoading(id);
    try {
      await apiClient.patch(`/jobs/${id}/status`, { value: !currentStatus });
      showNotification(`Job ${!currentStatus ? 'Activated' : 'Deactivated'}`, "success");
      fetchJobs();
    } catch (err) {
      showNotification("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Job <span className="text-[#A10022]">Oversight</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">
            System-wide moderation for {filteredPostings.length} filtered postings.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-600 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all">
          <FileSpreadsheet size={18} /> Export CSV
        </button>
      </header>

      {/* Filter Panel - Updated Grid for 4 items */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search titles or locations..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10"
            value={filters.search} 
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* --- New Category Filter --- */}
        <select
          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
          value={filters.category} 
          onChange={e => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="VOLUNTEER">Volunteer</option>
          <option value="PART_TIME">Part-Time</option>
        </select>

        <select
          className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
          value={filters.fundingSource} 
          onChange={e => setFilters({ ...filters, fundingSource: e.target.value })}
        >
          <option value="">All Funding</option>
          <option value="WORK_STUDY">Work Study</option>
          <option value="NON_WORK_STUDY">Non-Work Study</option>
        </select>

        <button onClick={() => setFilters({search: '', fundingSource: '', category: '', active: ''})} 
                className="text-gray-400 text-xs font-black uppercase hover:text-[#A10022] transition-colors">
          Reset Filters
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-5">Position Details</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5">Location & Type</th>
              <th className="px-8 py-5">Deadline</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPostings.map(job => (
              <tr
                key={job.id}
                className={`transition-all duration-200 ${hoveredJobId === job.id ? 'bg-[#A10022]/5' : ''}`}
                onMouseEnter={() => setHoveredJobId(job.id)}
                onMouseLeave={() => setHoveredJobId(null)}
              >
                <td className="px-8 py-5 relative">
                  {/* Tooltip Fix: Isolated conditional rendering */}
                  {hoveredJobId === job.id && (
                    <div className="absolute z-[100] left-full ml-4 top-1/2 -translate-y-1/2 w-80 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-gray-900 text-white p-5 rounded-[1.5rem] shadow-2xl border border-white/10 text-xs leading-relaxed">
                        <p className="font-black text-[10px] text-[#A10022] mb-2 uppercase">Full Description</p>
                        {job.description}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${job.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    <div className="space-y-0.5">
                      <p className="font-black text-gray-900 text-sm italic">{job.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: {job.id.substring(0,8)}</p>
                    </div>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 w-fit">
                    <Tag size={12} /> {job.category || 'General'}
                  </span>
                </td>

                <td className="px-8 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                      <MapPin size={14} className="text-[#A10022]" /> {job.location}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${job.onCampus ? 'bg-indigo-50 text-indigo-700' : 'bg-orange-50 text-orange-700'}`}>
                      {job.onCampus ? 'On-Campus' : 'Off-Campus'}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-5">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700">{formatDate(job.deadline)}</p>
                    <p className={`text-[9px] font-black uppercase ${job.fundingSource === 'WORK_STUDY' ? 'text-amber-600' : 'text-blue-600'}`}>
                      {job.fundingSource.replace('_', ' ')}
                    </p>
                  </div>
                </td>

                <td className="px-8 py-5 text-right">
                  <button
                    onClick={() => handleToggleActive(job.id, job.isActive)}
                    disabled={actionLoading === job.id}
                    className={`p-2.5 rounded-xl transition-all border ${job.isActive
                      ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                      }`}
                  >
                    {actionLoading === job.id ? <Loader2 size={16} className="animate-spin" /> : (job.isActive ? <X size={16} /> : <Check size={16} />)}
                  </button>
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