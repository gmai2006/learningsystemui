import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search, Filter, UserCircle, ExternalLink,
    CheckCircle, XCircle, Clock, Calendar, Info
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

/* --- Reusable Tooltip Component --- */
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap z-50 shadow-xl animate-in fade-in zoom-in duration-200">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const ApplicantPool = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const jobIdFilter = searchParams.get('jobId');

    const [applicants, setApplicants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const url = jobIdFilter ? `/employer/dashboard/applicants?jobId=${jobIdFilter}` : '/employer/dashboard/applicants';
                const res = await apiClient.get(url);
                setApplicants(res.data);
            } catch (err) {
                console.error("Failed to fetch applicants", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [jobIdFilter]);

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            await apiClient.patch(`/employer/dashboard/applicants/${appId}/status?newStatus=${newStatus}`);
            setApplicants(prev => prev.map(app =>
                app.applicationId === appId ? { ...app, status: newStatus } : app
            ));
            showNotification(`Moved to ${newStatus}`, "success");
        } catch (err) {
            showNotification("Failed to update status", "error");
        }
    };

    const filteredApplicants = applicants.filter(app => {
        const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300">SCANNING TALENT POOL...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filter Bar */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by student or job title..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Tooltip text="Filter by stage">
                        <Filter size={18} className="text-gray-400" />
                    </Tooltip>
                    <select
                        className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Review</option>
                        <option value="INTERVIEW_SCHEDULED">Interviews</option>
                        <option value="OFFER_EXTENDED">Offers</option>
                    </select>
                </div>
            </div>

            {/* Applicant Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied Position</th>
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">GPA</th>
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredApplicants.map((app) => (
                            <tr key={app.applicationId} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <Tooltip text={`Profile of ${app.studentName}`}>
                                            <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm cursor-help">
                                                {app.profilePictureBase64 ? (
                                                    <img src={app.profilePictureBase64} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><UserCircle /></div>
                                                )}
                                            </div>
                                        </Tooltip>
                                        <div>
                                            <p className="font-black italic text-gray-900 leading-none mb-1">{app.studentName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{app.major}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <p className="font-bold text-sm text-gray-700">{app.jobTitle}</p>
                                    <Tooltip text="Applied date">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mt-1 italic cursor-default">{app.timeAgo}</p>
                                    </Tooltip>
                                </td>
                                <td className="p-8 text-center">
                                    <Tooltip text={app.gpa >= 3.5 ? "Honor Student" : "Cumulative GPA"}>
                                        <span className={`font-black italic text-lg cursor-default ${app.gpa >= 3.5 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                            {app.gpa?.toFixed(2) || "N/A"}
                                        </span>
                                    </Tooltip>
                                </td>
                                <td className="p-8">
                                    <Tooltip text="Click to update status">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusUpdate(app.applicationId, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer border-none
                                            ${app.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                            app.status === 'INTERVIEW_SCHEDULED' ? 'bg-blue-50 text-blue-600' :
                                            'bg-emerald-50 text-emerald-600'}`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="INTERVIEW_SCHEDULED">Interview</option>
                                            <option value="OFFER_EXTENDED">Offer</option>
                                            <option value="REJECTED">Reject</option>
                                        </select>
                                    </Tooltip>
                                </td>
                                <td className="p-8 text-right">
                                    <Tooltip text="Review full candidate details">
                                        <button
                                            onClick={() => navigate(`/employer/applicants/${app.applicationId}`)}
                                            className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-[#A10022] transition-all shadow-md group-hover:scale-110"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </Tooltip>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicantPool;