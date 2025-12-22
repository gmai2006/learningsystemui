import React, { useState, useEffect } from 'react';
import { Search, Filter, FileSpreadsheet, RotateCcw, ChevronDown, CheckCircle, Clock, ExternalLink, Check } from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { exportExperiencesToCSV } from '../../../utils/csvhelper';
import DetailsSlideover from './DetailsSlideover';
import { useNotification } from '../../../context/NotificationContext';

const AppliedLearningTable = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterKey, setFilterKey] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [verifyingId, setVerifyingId] = useState(null); // Track which row is being updated
    const [isSlideOpen, setIsSlideOpen] = useState(false);
    const [selectedExp, setSelectedExp] = useState(null);
    const { showNotification } = useNotification();

    // Filter States matching UserManagement style
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        status: '',
        isVerified: '',
        metaKey: '',
        metaValue: ''
    });

    const fetchExperiences = async () => {
        setLoading(true);
        try {
            // Build query string dynamically based on active filters
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.isVerified) params.append('isVerified', filters.isVerified);
            if (filters.metaKey && filters.metaValue) {
                params.append(filters.metaKey, filters.metaValue);
            }

            const url = params.toString()
                ? `/admin/applied-learning/filter?${params.toString()}`
                : '/admin/applied-learning';

            const res = await apiClient.get(url);

            // Client-side search filtering for Title/Org if needed
            let data = res.data;
            if (filters.search) {
                const term = filters.search.toLowerCase();
                data = data.filter(ex =>
                    ex.title.toLowerCase().includes(term) ||
                    ex.organizationName?.toLowerCase().includes(term)
                );
            }

            setExperiences(data);
        } catch (err) {
            showNotification("Failed to load experiences", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (exp) => {
        setSelectedExp(exp);
        setIsSlideOpen(true);
    };
    
     const handleExport = () => {
        if (experiences.length === 0) {
            showNotification("No records found to export.", "warning");
            return;
        }
        exportExperiencesToCSV(experiences);
    };


    useEffect(() => { fetchExperiences(); }, []);

    const resetFilters = () => {
        setFilters({ search: '', type: '', status: '', isVerified: '', metaKey: '', metaValue: '' });
    };

    return (
        <div className="space-y-6">
            {/* Filter Panel (UserManagement Style) */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#A10022]/10 p-2 rounded-lg">
                            <Filter className="text-[#A10022]" size={20} />
                        </div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">Refine Registry</h3>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-600 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">
                            <FileSpreadsheet size={16} /> Export CSV
                        </button>
                        <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-200 transition-all">
                            <RotateCcw size={16} /> Reset
                        </button>
                        <button onClick={fetchExperiences} className="px-6 py-2 bg-[#A10022] text-white rounded-xl text-xs font-black hover:bg-red-800 shadow-lg shadow-red-900/20 transition-all">
                            Apply Filters
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Search Search */}
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Search Title or Org..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10 focus:border-[#A10022]"
                            value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
                        value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
                    >
                        <option value="">All Learning Types</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="RESEARCH">Research</option>
                        <option value="SERVICE_LEARNING">Service Learning</option>
                        {/* Add other 13 types... */}
                    </select>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
                        value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">Any Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    {/* Verification Filter */}
                    <select
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
                        value={filters.isVerified} onChange={e => setFilters({ ...filters, isVerified: e.target.value })}
                    >
                        <option value="">Verification Status</option>
                        <option value="true">Verified Only</option>
                        <option value="false">Unverified Only</option>
                    </select>

                    {/* Metadata Toggle/Key */}
                    <input
                        placeholder="Meta Key (e.g. mentor)"
                        className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-mono"
                        value={filters.metaKey} onChange={e => setFilters({ ...filters, metaKey: e.target.value })}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Student & Type</th>
                            <th className="px-6 py-4">Experience Title</th>
                            <th className="px-6 py-4">Organization</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Verification</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {experiences.map((exp) => (
                            <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">ID: {exp.studentId.substring(0, 8)}</span>
                                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit mt-1">
                                            {exp.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">{exp.title}</td>
                                <td className="px-6 py-4 text-gray-500">{exp.organizationName || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    {exp.verified ? (
                                        <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                                            <CheckCircle size={14} /> Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                                            <Clock size={14} /> Pending
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {!exp.verified && (
                                            <button
                                                onClick={() => handleQuickVerify(exp.id, exp.title)}
                                                disabled={verifyingId === exp.id}
                                                title="Quick Verify"
                                                className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all border border-green-100"
                                            >
                                                {verifyingId === exp.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                            </button>
                                        )}
                                        {/* <button className="p-2 bg-gray-50 text-gray-400 hover:text-[#A10022] hover:bg-red-50 rounded-xl transition-all border border-gray-100">
                                            <ExternalLink size={16} />
                                        </button> */}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleViewDetails(exp)}
                                        className="p-2 bg-gray-50 text-gray-400 hover:text-[#A10022] hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <ExternalLink size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* The Slide-over */}
            <DetailsSlideover
                isOpen={isSlideOpen}
                experience={selectedExp}
                onClose={() => setIsSlideOpen(false)}
            />
        </div>
    );
};
export default AppliedLearningTable;