import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, Calendar, Wallet, Globe, School,
    ArrowRight, Briefcase, Clock, Sparkles, Loader2
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import JobDetailSlideover from './JobDetailSlideover';

const StudentJobBoard = () => {
    const { showNotification } = useNotification();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', fundingSource: '', onCampus: '' });
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/jobs/student-view', { params: filters });
            setJobs(res.data);
        } catch (err) {
            showNotification("Failed to retrieve current job openings.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    // Formats [YYYY, M, D]
    const formatDeadline = (dateArray) => {
        if (!dateArray || dateArray.length < 3) return 'No Deadline';
        return new Date(dateArray[0], dateArray[1] - 1, dateArray[2]).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Logic to determine if a job is "New" (Posted in last 7 days)
    const isNewPosting = (createdAtArray) => {
        if (!createdAtArray || createdAtArray.length < 3) return false;
        const postDate = new Date(createdAtArray[0], createdAtArray[1] - 1, createdAtArray[2]);
        const today = new Date();
        const diffTime = Math.abs(today - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filter Command Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#A10022] p-2 rounded-xl">
                            <Search className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Career Search</h2>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{jobs.length} Opportunities Found</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <input
                            placeholder="Search by title, location, or skill..."
                            className="w-full pl-6 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#A10022]/20 outline-none transition-all"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-black text-gray-600 outline-none cursor-pointer"
                        value={filters.fundingSource}
                        onChange={(e) => setFilters({ ...filters, fundingSource: e.target.value })}
                    >
                        <option value="">All Funding</option>
                        <option value="WORK_STUDY">Work Study</option>
                        <option value="NON_WORK_STUDY">Non-Work Study</option>
                    </select>
                    <button
                        onClick={fetchJobs}
                        className="bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-[#A10022] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
                    >
                        Update Results
                    </button>
                </div>
            </div>

            {/* Grid of Opportunity Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-[#A10022]" size={40} />
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Scanning Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#A10022]/20 transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-2">
                                        {/* NEW: Submitted Badge */}
                                        {job.isApplied && (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 animate-in zoom-in-95">
                                                <CheckCircle size={12} /> Submitted
                                            </span>
                                        )}
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${job.onCampus ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                            }`}>
                                            {job.onCampus ? <School size={12} /> : <Globe size={12} />}
                                            {job.onCampus ? "On-Campus" : "Off-Campus"}
                                        </span>
                                        {isNewPosting(job.createdAt) && (
                                            <span className="bg-[#A10022]/10 text-[#A10022] px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                                                <Sparkles size={12} /> New
                                            </span>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${job.fundingSource === 'WORK_STUDY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {job.fundingSource.replace('_', ' ')}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 leading-none group-hover:text-[#A10022] transition-colors mb-2 italic">
                                    {job.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 line-clamp-2 mb-6 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><MapPin size={16} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Location</p>
                                            <p className="text-xs font-bold text-gray-700 truncate">{job.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Clock size={16} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Deadline</p>
                                            <p className="text-xs font-bold text-gray-700">{formatDeadline(job.deadline)}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => !job.isApplied && setSelectedJob(job)}
                                    disabled={job.isApplied}
                                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
          ${job.isApplied
                                            ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100'
                                            : 'bg-gray-50 text-gray-900 group-hover:bg-[#A10022] group-hover:text-white'}`}
                                >
                                    {job.isApplied ? (
                                        <>Application Complete <CheckCircle size={18} /></>
                                    ) : (
                                        <>Review Position <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}

                    <JobDetailSlideover
                        job={selectedJob}
                        onClose={() => setSelectedJob(null)}
                    />
                </div>

            )}
        </div>

    );
};

export default StudentJobBoard;