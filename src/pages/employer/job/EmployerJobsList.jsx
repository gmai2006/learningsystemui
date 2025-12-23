import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Eye,
    MoreVertical, Power, Briefcase, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/ApiClient';
import { formatDate } from '../../../utils/util';


const EmployerJobsList = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            const res = await apiClient.get('/employer/dashboard/my-postings');
            setJobs(res.data);
        } catch (err) {
            console.error("Error fetching jobs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const toggleJobStatus = async (jobId, currentStatus) => {
        try {
            await apiClient.patch(`/employer/jobs/${jobId}/status`, { isActive: !currentStatus });
            fetchJobs(); // Refresh list
        } catch (err) {
            console.error("Failed to toggle job status");
        }
    };

    const ActionButton = ({ icon, onClick, active = true, danger = false }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-xl border transition-all ${danger
                ? (active ? 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white')
                : 'border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
        >
            {icon}
        </button>
    );

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your postings..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#A10022]/10 font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => navigate('/employer/my-jobs/new')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-lg"
                >
                    <Plus size={18} /> Post New Position
                </button>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Title & Category</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicants</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Posted Date</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${job.isActive ? 'bg-red-50 text-[#A10022]' : 'bg-gray-100 text-gray-400'}`}>
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="font-black italic text-gray-900 leading-none mb-1">{job.title}</p>
                                            {/* Category Badge */}
                                            <span className="text-[9px] font-black text-[#A10022] bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                                {job.category}
                                            </span>
                                        </div>
                                       
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-gray-400" />
                                        <span className="font-black text-gray-900">{job.applicantCount || 0}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-xs font-bold text-gray-500">
                                    {formatDate(job.createdAt)}
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${job.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        {job.isActive ? 'Active' : 'Closed'}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <ActionButton icon={<Eye size={16} />} onClick={() => navigate(`/employer/my-jobs/${job.id}`)} />
                                        <ActionButton icon={<Edit2 size={16} />} onClick={() => navigate(`/employer/my-jobs/edit/${job.id}`)} />
                                        <ActionButton
                                            icon={<Power size={16} />}
                                            active={job.isActive}
                                            onClick={() => toggleJobStatus(job.id, job.isActive)}
                                            danger
                                        />
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

const ActionButton = ({ icon, onClick, active = true, danger = false }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-xl border transition-all ${danger
            ? (active ? 'border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white')
            : 'border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50'
            }`}
    >
        {icon}
    </button>
);

export default EmployerJobsList;