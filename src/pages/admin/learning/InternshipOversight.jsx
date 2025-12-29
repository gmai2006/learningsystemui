import React, { useState, useEffect } from 'react';
import {
    GraduationCap, Briefcase, FileText, CheckCircle2,
    XCircle, Search, Filter, MoreHorizontal,
    ClipboardCheck, MapPin, Calendar, Clock
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';
import ContractModal from './ContractModal';

const InternshipOversight = () => {
    const { showNotification } = useNotification();
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Aligned with the database view statuses
    const [filter, setFilter] = useState('PENDING');

    const [isContractOpen, setIsContractOpen] = useState(false);

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/jobs/internships?status=${filter}`);
            setInternships(res.data);
        } catch (err) {
            showNotification("Could not retrieve internship data", "error");
        } finally {
            setLoading(false);
        }
    };

    // Logic to update status in the job_applications table
    const updateStatus = async (applicationId, newStatus) => {
        try {
            await apiClient.patch(`/applications/${applicationId}/status`, {value: newStatus});
            showNotification(`Placement ${newStatus.toLowerCase()} successfully`, "success");
            fetchInternships(); // Refresh current view
        } catch (err) {
            showNotification("Failed to update status", "error");
        }
    };

    useEffect(() => {
        fetchInternships();
    }, [filter]);

    const filteredData = internships.filter(item =>
        item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic text-gray-900 tracking-tight uppercase">
                        Internship <span className="text-[#A10022]">Practicums</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Monitor academic placements and verify work-learning contracts.</p>
                </div>
                <div className="flex gap-3">
                    <StatCard label="Active Placements" value={internships.filter(i => i.applicationStatus === 'APPROVED').length} color="emerald" />
                    <StatCard label="Pending Approval" value={internships.filter(i => i.applicationStatus === 'PENDING').length} color="amber" />
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <TabButton active={filter === 'PENDING'} onClick={() => setFilter('PENDING')} label="Contract Review" />
                    <TabButton active={filter === 'APPROVED'} onClick={() => setFilter('APPROVED')} label="In-Progress" />
                    <TabButton active={filter === 'REJECTED'} onClick={() => setFilter('REJECTED')} label="Archive" />
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or employer..."
                        className="form-input-eagle !pl-12 border-none bg-gray-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Placements List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)
                ) : filteredData.length > 0 ? (
                    filteredData.map((intern) => (
                        <InternshipRow
                            key={intern.applicationId}
                            intern={intern}
                            onUpdateStatus={updateStatus}
                            isContractOpen={isContractOpen}
                            setIsContractOpen={setIsContractOpen}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
                        <Briefcase size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No records found for "{filter}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- UI Sub-Components --- */

const InternshipRow = ({ intern, onUpdateStatus, isContractOpen, setIsContractOpen }) => {
    const isPending = intern.applicationStatus === 'PENDING';

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-center justify-between gap-6 group">
            <div className="flex items-center gap-6 w-full lg:w-auto">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-[#A10022]/5 transition-colors">
                    <GraduationCap className="text-gray-400 group-hover:text-[#A10022]" size={24} />
                </div>
                <div>
                    <h3 className="font-black italic text-gray-900 uppercase text-sm tracking-tight">{intern.studentName}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                        <Briefcase size={12} /> {intern.companyName}
                        <span className="text-gray-200">•</span>
                        <MapPin size={12} /> {intern.location || 'Cheney, WA'}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Credit Hours</span>
                    <span className="text-sm font-black text-gray-900">{intern.creditHours || 0} Units</span>
                </div>

                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Application Status</span>
                    <span className={`text-[10px] font-bold uppercase ${intern.applicationStatus === 'APPROVED' ? 'text-emerald-500' :
                        intern.applicationStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                        {intern.applicationStatus}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Only show Approve/Reject if the status is PENDING */}
                    {isPending ? (
                        <>
                            <button
                                onClick={() => onUpdateStatus(intern.applicationId, 'APPROVED')}
                                className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Approve Placement"
                            >
                                <CheckCircle2 size={18} />
                            </button>
                            <button
                                onClick={() => onUpdateStatus(intern.applicationId, 'REJECTED')}
                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Reject Placement"
                            >
                                <XCircle size={18} />
                            </button>
                        </>
                    ) : (
                        <button className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-not-allowed border border-gray-100">
                            Closed
                        </button>
                    )}

                    <button
                        onClick={() => setIsContractOpen(true)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#A10022] transition-all flex items-center gap-2"
                    >
                        <FileText size={14} /> Review Contract
                    </button>


                </div>
            </div>
            {/* Modal to display the contract details */}
            {isContractOpen && (
                <ContractModal
                    intern={intern}
                    onClose={() => setIsContractOpen(false)}
                />
            )}
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`} />
        <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
            <p className="text-lg font-black italic text-gray-900">{value}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
            ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
    >
        {label}
    </button>
);

export default InternshipOversight;