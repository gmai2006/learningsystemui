import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Briefcase, Users, Clock, CheckCircle, ArrowRight,
    Plus, AlertCircle, Megaphone, Info
} from 'lucide-react';

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

    if (!summary) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. KPI Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <StatCard
                    icon={<Clock />}
                    label="Avg. Time to Hire"
                    value="14 Days"
                    color="text-amber-600"
                    bg="bg-amber-50"
                    tooltip="Average days from post to offer"
                />
                <StatCard
                    icon={<CheckCircle />}
                    label="Total Placements"
                    value="24"
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
                                        <Tooltip text="Time since posting went live">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-help">
                                                Live for {job.daysAgo} days
                                            </p>
                                        </Tooltip>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <PipelineStat label="Review" count={job.pendingCount} highlighted={job.pendingCount > 0} tooltip="Unread applications" />
                                        <PipelineStat label="Interview" count={job.interviewCount} tooltip="Active interview loops" />
                                        <PipelineStat label="Offer" count={job.offerCount} tooltip="Pending or accepted offers" />

                                        <Tooltip text="Manage this specific pipeline">
                                            <button
                                                onClick={() => navigate(`/employer/applicants?jobId=${job.jobId}`)}
                                                className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#A10022] group-hover:text-white transition-all"
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Recent Activity */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black italic text-gray-900 tracking-tight">Live Activity</h2>
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="space-y-8 relative z-10">
                            {summary.recentActivity?.map((activity, idx) => (
                                <div key={idx} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">
                                    <Tooltip text={activity.type === 'APPLICATION' ? 'New Student Applicant' : 'System Update'}>
                                        <div className={`mt-1 p-2 rounded-xl h-fit shadow-sm transition-transform group-hover:scale-110 ${activity.type === 'APPLICATION'
                                                ? 'bg-red-50 text-[#A10022]'
                                                : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {activity.type === 'APPLICATION' ? <Users size={16} /> : <Megaphone size={16} />}
                                        </div>
                                    </Tooltip>

                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#A10022] transition-colors cursor-default">
                                            {activity.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Tooltip text="Time of occurrence">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter cursor-default">
                                                    {activity.timeAgo}
                                                </p>
                                            </Tooltip>
                                            {activity.type === 'JOB_POSTED' && (
                                                <span className="text-[7px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase">
                                                    Success
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!summary.recentActivity || summary.recentActivity.length === 0) && (
                            <div className="text-center py-10 space-y-4">
                                <AlertCircle size={40} className="mx-auto text-gray-200" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                                    No recent activity found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- Updated Sub-components with Tooltip Support --- */

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