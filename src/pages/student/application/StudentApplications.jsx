import React, { useState, useEffect } from 'react';
import {
    Send, Clock, CheckCircle, XCircle, Search,
    ExternalLink, Calendar, Briefcase, Filter, Info,
    MapPin
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';
import ApplicationDetailModal from './ApplicationDetailModal';

const StudentApplications = () => {
    const { showNotification } = useNotification();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Calls the endpoint: @GET /api/applications/my-applications
            const res = await apiClient.get('/applications/my-applications');
            setApplications(res.data);
        } catch (err) {
            showNotification("Failed to load your applications.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;

        try {
            await apiClient.delete(`/applications/${appId}/withdraw`);
            showNotification("Application withdrawn.", "info");
            fetchApplications(); // Refresh the list
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
        filter === 'ALL' ? true : app.status === filter
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        My <span className="text-[#A10022]">Applications</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Track your journey across {applications.length} submitted roles.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {['ALL', 'PENDING', 'ACCEPTED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${filter === s ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                        <Clock className="mx-auto text-gray-200 animate-pulse mb-4" size={48} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Status...</p>
                    </div>
                ) : filteredApps.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center space-y-4">
                        <Send className="mx-auto text-gray-200" size={64} />
                        <h3 className="text-xl font-black text-gray-900">No Applications Found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm italic">You haven't submitted any applications yet. Head over to the Job Board to find your next adventure.</p>
                    </div>
                ) : (
                    filteredApps.map((app) => (
                        <div key={app.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                {/* Left Side: Job Info */}
                                <div className="flex gap-6 items-start">
                                    <div className="flex gap-2">
                                        {/* The Standard Status Badge */}
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>

                                        {/* NEW: Position Closed Badge */}
                                        {!app.isJobActive && (
                                            <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <XCircle size={12} /> Position Closed
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-900 leading-none group-hover:text-[#A10022] transition-colors italic">
                                            {app.jobTitle} {/* Now displays the real title from the DB */}
                                        </h3>
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <span className="text-xs font-bold flex items-center gap-1.5">
                                                <MapPin size={14} /> {app.location} {/* Display real location */}
                                            </span>
                                            <div className="flex items-center gap-4 text-gray-400">
                                                <span className="text-xs font-bold flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    Applied <span className={formatDate(app.createdAt).includes('ago') ? 'text-[#A10022] font-black' : ''}>
                                                        {formatDate(app.createdAt)}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <span className="text-xs font-bold flex items-center gap-1.5">
                                                <Calendar size={14} /> Applied {new Date(app.createdAt[0], app.createdAt[1] - 1, app.createdAt[2]).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#A10022]/40">ID: {app.id.substring(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Status & Actions */}
                                <div className="flex items-center gap-4 self-end md:self-center">
                                    <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                        {app.status}
                                    </div>
                                    {app.status === 'PENDING' && app.isJobActive && (
                                        <button
                                            onClick={() => handleWithdraw(app.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <XCircle size={14} /> Withdraw
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-100"
                                    >
                                        <Info size={20} />
                                    </button>
                                    <button className="p-3 bg-gray-900 text-white hover:bg-[#A10022] rounded-xl transition-all shadow-lg shadow-gray-200">
                                        <ExternalLink size={20} />
                                    </button>
                                </div>

                            </div>

                            {/* Expansion Area: Submission Notes */}
                            {app.notes && (
                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">My Submission Note</p>
                                    <div className="bg-gray-50/50 p-4 rounded-2xl text-xs text-gray-600 italic leading-relaxed">
                                        "{app.notes}"
                                    </div>
                                </div>
                            )}

                            {selectedApp && (
                                <ApplicationDetailModal
                                    app={selectedApp}
                                    onClose={() => setSelectedApp(null)}
                                />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentApplications;