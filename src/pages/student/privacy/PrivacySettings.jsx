import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, Lock, Globe, History, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';

const PrivacySettings = () => {
    const { showNotification } = useNotification();
    const [isRestricted, setIsRestricted] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    const fetchLogs = useCallback(async (page) => {
        try {
            // Updated endpoint to support page and size query params
            const res = await apiClient.get(`/student/privacy?page=${page}&size=${pageSize}`);
            setLogs(res.data.content || []); // Assumes Spring-style Page object
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            showNotification("Error loading access logs", "error");
        }
    }, [showNotification]);

    useEffect(() => {
        const initData = async () => {
            try {
                const profileRes = await apiClient.get('/student/profile');
                setIsRestricted(profileRes.data.isFerpaRestricted);
                await fetchLogs(0);
            } catch (err) {
                showNotification("Error initializing settings", "error");
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [fetchLogs, showNotification]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            fetchLogs(newPage);
        }
    };

    const handleTogglePrivacy = async () => {
        try {
            const newVal = !isRestricted;
            await apiClient.patch('/student/privacy/toggle', { isRestricted: newVal });
            setIsRestricted(newVal);
            showNotification(newVal ? "Profile Restricted" : "Profile now Public", "success");
        } catch (err) {
            showNotification("Failed to update privacy", "error");
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">Securing Connection...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
             {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Privacy & <span className="text-[#A10022]">Data Security</span></h1>
                <p className="text-gray-500 font-medium">Control who sees your Eagle records and how your data is shared.</p>
            </div>

            {/* FERPA Toggle Card */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className={`p-6 rounded-[2rem] ${isRestricted ? 'bg-red-50 text-[#A10022]' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isRestricted ? <Lock size={40} /> : <Globe size={40} />}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-gray-900 italic">FERPA Visibility Mode</h2>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isRestricted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isRestricted ? 'Private' : 'Public'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                            {isRestricted 
                                ? "Your profile is hidden from all general searches. Only employers you apply to can see your data." 
                                : "Your directory info and career profile are visible to verified recruiters in talent searches."}
                        </p>
                    </div>
                    <button 
                        onClick={handleTogglePrivacy}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg
                            ${isRestricted ? 'bg-gray-900 text-white' : 'bg-[#A10022] text-white hover:bg-black'}`}
                    >
                        {isRestricted ? 'Disable Restriction' : 'Enable Restriction'}
                    </button>
                </div>
                {/* Background Pattern */}
                <Shield className="absolute -right-10 -bottom-10 text-gray-50 opacity-50" size={200} />
            </div>


            {/* Access Audit Log */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <History size={20} className="text-[#A10022]" />
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Data Access History</h3>
                    </div>
                </div>

                <div className="divide-y divide-gray-50 min-h-[400px]">
                    {logs.length > 0 ? logs.map((log, idx) => (
                        <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <Eye size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 italic">{log.companyName}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.accessContext?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-900">{formatDate(log.accessedAt)}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center text-gray-300">
                             <History size={48} className="mx-auto mb-4 opacity-20" />
                             <p className="text-xs font-bold uppercase tracking-widest italic">No access records found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Warning Box remains the same */}
        </div>
    );
};

export default PrivacySettings;