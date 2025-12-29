import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, XCircle, Clock, Filter, 
    Search, MoreHorizontal, ExternalLink, ShieldCheck,
    AlertCircle, Download
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';

const VolunteerOversight = () => {
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('LOGS'); // 'LOGS' or 'POSTINGS'
    const [pendingLogs, setPendingLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'LOGS' 
                ? '/staff/volunteer/pending-logs' 
                : '/jobs/volunteer';
            const res = await apiClient.get(endpoint);
            setPendingLogs(res.data);
        } catch (err) {
            showNotification("Failed to sync service data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (logId, action) => {
        try {
            await apiClient.post(`/staff/volunteer/logs/${logId}/${action}`);
            showNotification(`Log ${action}ed successfully`, "success");
            fetchData();
        } catch (err) {
            showNotification("Action failed", "error");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic text-gray-900 tracking-tight uppercase">
                        Service <span className="text-[#A10022]">Oversight</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Validate student impact and manage community partner roles.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {/* 2. Controls & Tabs */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
                    <TabButton active={activeTab === 'LOGS'} onClick={() => setActiveTab('LOGS')} label="Pending Verifications" count={pendingLogs.length} />
                    <TabButton active={activeTab === 'POSTINGS'} onClick={() => setActiveTab('POSTINGS')} label="Manage Postings" />
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or project..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Data Table */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Student / Project</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Impact Details</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Supervisor Contact</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Submitted</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-20 bg-gray-50/20" />)
                        ) : pendingLogs.length > 0 ? (
                            pendingLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black italic text-gray-900 group-hover:text-[#A10022] transition-colors uppercase text-sm">
                                                {log.studentName}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                {log.projectTitle}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 text-[#A10022] rounded-lg">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-gray-900">{log.hoursWorked} HRS</span>
                                                <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{log.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col text-xs font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500" /> {log.supervisorEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs font-bold text-gray-400">
                                        {formatDate(log.dateLogged)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleAction(log.id, 'reject')}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Reject Hours"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(log.id, 'approve')}
                                                className="p-2 text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Verify Hours"
                                            >
                                                <CheckCircle2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <AlertCircle className="mx-auto text-gray-200 mb-4" size={48} />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No pending items found in queue</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
            ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
    >
        {label}
        {count > 0 && (
            <span className="bg-[#A10022] text-white px-2 py-0.5 rounded-full text-[8px]">
                {count}
            </span>
        )}
    </button>
);

export default VolunteerOversight;