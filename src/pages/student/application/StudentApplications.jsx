import React, { useState, useEffect } from 'react';
import {
    Send, Clock, CheckCircle, XCircle, Search,
    ExternalLink, Calendar, Briefcase, Filter, Info,
    MapPin, Tag, Wallet // Added Tag and Wallet icons
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';
import ApplicationDetailModal from './ApplicationDetailModal';
import { useNavigate } from 'react-router-dom';

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

const StudentApplications = () => {
    const { showNotification } = useNotification();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedApp, setSelectedApp] = useState(null);
    const navigate = useNavigate();

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/applications/my-applications');
            setApplications(res.data);
        } catch (err) {
            showNotification("Failed to load your applications.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to withdraw this application?")) return;
        try {
            await apiClient.delete(`/applications/${appId}/withdraw`);
            showNotification("Application withdrawn.", "info");
            fetchApplications();
        } catch (err) {
            showNotification("Could not withdraw application.", "error");
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
            case 'REVIEWING': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-amber-50 text-amber-700 border-amber-100';
        }
    };

    const filteredApps = applications.filter(app =>
        filter === 'ALL' ? true : app.applicationStatus === filter
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        My <span className="text-[#A10022]">Applications</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Tracking {applications.length} active and historical submissions.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {['ALL', 'PENDING', 'ACCEPTED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${filter === s ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                        <Clock className="mx-auto text-gray-200 animate-pulse mb-4" size={48} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing status...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center space-y-4">
                        <Send className="mx-auto text-gray-200" size={64} />
                        <h3 className="text-xl font-black text-gray-900">No Applications Found</h3>
                        <button onClick={() => navigate('/student/jobs')} className="text-xs font-black text-[#A10022] uppercase tracking-widest hover:underline">Find a position</button>
                    </div>
                ) : (
                    filteredApps.map((app) => (
                        <div key={app.applicationId} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                {/* Left Side: Job & Application Meta */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(app.applicationStatus)}`}>
                                            {app.applicationStatus}
                                        </span>
                                        
                                        {/* --- NEW: Category Badge --- */}
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5">
                                            <Tag size={10} /> {app.category || 'General'}
                                        </span>

                                        {/* --- NEW: Funding Source Badge --- */}
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 ${app.fundingSource === 'WORK_STUDY' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                                            <Wallet size={10} /> {app.fundingSource?.replace('_', ' ')}
                                        </span>

                                        {!app.isActive && (
                                            <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5">
                                                <XCircle size={10} /> Position Closed
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 leading-none group-hover:text-[#A10022] transition-colors italic uppercase">
                                            {app.jobTitle}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <MapPin size={14} className="text-gray-300" /> {app.location}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Calendar size={14} className="text-gray-300" />
                                                <span className="uppercase text-[10px] tracking-tighter">Applied</span> 
                                                <span className="text-gray-600 italic">{formatDate(app.appliedAt)}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">Ref: {app.applicationId.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex items-center gap-3">
                                    {app.applicationStatus === 'PENDING' && app.isActive && (
                                        <button
                                            onClick={() => handleWithdraw(app.applicationId)}
                                            className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="p-3.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100"
                                    >
                                        <Info size={20} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/student/jobs/`)}
                                        className="p-3.5 bg-gray-900 text-white hover:bg-[#A10022] rounded-2xl transition-all shadow-lg shadow-gray-200"
                                    >
                                        <Tooltip text="View Board">
                                            <ExternalLink size={20} />
                                        </Tooltip>
                                    </button>
                                </div>
                            </div>

                            {/* Optional: Submission Preview */}
                            {app.studentNotes && (
                                <div className="mt-6 pt-6 border-t border-gray-50 animate-in slide-in-from-top-2">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3 ml-1">Personal Note / Pitch</p>
                                    <div className="bg-gray-50/50 p-5 rounded-[1.5rem] text-[13px] text-gray-600 italic leading-relaxed border border-gray-50">
                                        "{app.studentNotes}"
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {selectedApp && (
                <ApplicationDetailModal
                    app={selectedApp}
                    onClose={() => setSelectedApp(null)}
                />
            )}
        </div>
    );
};

export default StudentApplications;