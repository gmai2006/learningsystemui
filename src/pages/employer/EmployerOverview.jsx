import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Briefcase, Users, Clock, CheckCircle, ArrowRight,
    Plus, AlertCircle, Megaphone, Calendar, Sparkles, Video
} from 'lucide-react';
import CreateEventModal from './event/CreateEventModal';

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

const EmployerOverview = () => {
    const [summary] = useOutletContext();
    const navigate = useNavigate();
const [isModalOpen, setIsModalOpen] = useState(false);
    if (!summary) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

            {/* Header & Quick Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight text-gray-900">
                        Employer <span className="text-[#A10022]">Command Center</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your talent pipelines and engagement events in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <Tooltip text="Host a new job event immediately">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-[#A10022] shadow-lg transition-all uppercase tracking-widest"
                    >
                        <Plus size={16} /> Host Event
                    </button>
                    </Tooltip>
                    <Tooltip text="Create a new job listing immediately">
                    <button
                        onClick={() => navigate('/employer/my-jobs/new')}
                        className="flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-900 rounded-2xl font-black text-xs hover:border-[#A10022] transition-all uppercase tracking-widest"
                    >
                        <Sparkles size={16} className="text-[#A10022]" /> Post Job
                    </button>
                    </Tooltip>
                </div>
            </div>

            {/* 1. KPI Top Row - Includes Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Briefcase />}
                    label="Active Postings"
                    value={summary.activeJobsCount}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    tooltip="Jobs currently visible to students"
                />
                <StatCard
                    icon={<Users />}
                    label="Pending Review"
                    value={summary.totalApplicantsPending}
                    color="text-[#A10022]"
                    bg="bg-red-50"
                    tooltip="New applications awaiting action"
                />

                {/* Dedicated Events KPI Card */}
                <Tooltip text="Scheduled sessions to engage talent">
                    <div
                        onClick={() => navigate('/employer/events')}
                        className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 w-full cursor-pointer hover:border-purple-200 transition-all group"
                    >
                        <div className="p-3 w-fit rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Events</p>
                            <p className="text-3xl font-black italic text-gray-900">{summary.activeEventsCount || 0}</p>
                        </div>
                    </div>
                </Tooltip>

                <StatCard
                    icon={<CheckCircle />}
                    label="Total Placements"
                    value={summary.totalPlacements}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    tooltip="Total students successfully hired"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 2. Active Pipelines */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black italic text-gray-900 tracking-tight">Active Pipelines</h2>
                        <Tooltip text="View all job listings">
                            <button
                                onClick={() => navigate('/employer/my-jobs')}
                                className="text-[10px] font-black text-[#A10022] uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                            >
                                View All Postings <ArrowRight size={14} />
                            </button>
                        </Tooltip>
                    </div>

                    <div className="space-y-4">
                        {summary.activePipelines?.map((job) => (
                            <div key={job.jobId} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black italic text-gray-900 group-hover:text-[#A10022] transition-colors cursor-default">
                                            {job.title}
                                        </h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            Live for {job.daysAgo} days
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <PipelineStat label="Review" count={job.pendingCount} highlighted={job.pendingCount > 0} tooltip="Unread applications" />
                                        <PipelineStat label="Interview" count={job.interviewCount} tooltip="Active interview loops" />
                                        <PipelineStat label="Offer" count={job.offerCount} tooltip="Pending or accepted offers" />

                                        <button
                                            onClick={() => navigate(`/employer/applicants?jobId=${job.jobId}`)}
                                            className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#A10022] group-hover:text-white transition-all"
                                        >
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Event Spotlight & Activity */}
                <div className="space-y-8">
                    {/* Event Spotlight Card */}
                    <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/employer/events')}>
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Video size={20} className="text-purple-400" />
                                </div>
                                <span className="text-[8px] font-black bg-purple-600 px-2 py-1 rounded uppercase tracking-widest">Next Session</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic tracking-tight">Tech Career Workshop</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Tomorrow @ 2:00 PM</p>
                            </div>
                            <div className="pt-2 flex items-center justify-between">
                                <p className="text-xs font-black text-purple-400">42 Students Registered</p>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <Calendar size={180} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-black italic text-gray-900 tracking-tight">Live Activity</h2>
                        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="space-y-8 relative z-10">
                                {summary.recentActivity?.map((activity, idx) => (
                                    <div key={idx} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">
                                        <div className={`mt-1 p-2 rounded-xl h-fit transition-transform group-hover:scale-110 ${activity.type === 'APPLICATION'
                                            ? 'bg-red-50 text-[#A10022]'
                                            : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {activity.type === 'APPLICATION' ? <Users size={16} /> : <Megaphone size={16} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#A10022] transition-colors">
                                                {activity.message}
                                            </p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                                                {activity.timeAgo}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            {isModalOpen && (
                <CreateEventModal
                    onClose={() => setIsModalOpen(false)}
                    onRefresh={() => {}}
                />
            )}
        </div>
    );
};

/* --- Updated Sub-components --- */

const StatCard = ({ icon, label, value, color, bg, tooltip }) => (
    <Tooltip text={tooltip}>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 w-full cursor-help">
            <div className={`p-3 w-fit rounded-2xl ${bg} ${color}`}>
                {React.cloneElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
                <p className="text-3xl font-black italic text-gray-900">{value}</p>
            </div>
        </div>
    </Tooltip>
);

const PipelineStat = ({ label, count, tooltip, highlighted = false }) => (
    <Tooltip text={tooltip}>
        <div className="text-center min-w-[60px] cursor-help">
            <p className={`text-2xl font-black italic leading-none mb-1 ${highlighted ? 'text-[#A10022]' : 'text-gray-900'}`}>
                {count}
            </p>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        </div>
    </Tooltip>
);

export default EmployerOverview;