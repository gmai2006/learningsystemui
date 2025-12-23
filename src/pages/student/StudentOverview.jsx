import React, { useEffect, useState } from 'react';
import apiClient from '../../api/ApiClient';
import {
    Briefcase, GraduationCap, CheckCircle, Clock,
    ArrowUpRight, Rocket, Target, Sparkles, Send,
    Calendar
} from 'lucide-react';

import { useOutletContext } from "react-router-dom";

const StudentOverview = ({ user, token }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [summary] = useOutletContext();

    useEffect(() => {

        const kpis = [
            { label: 'Active Applications', value: summary.activeApplications, change: `+${summary.newActiveApplications} new`, icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Verified Hours', value: summary.totalVerifiedHours, change: '80% of goal', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Verifications', value: summary.pendingVerifications, change: 'In Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Career Readiness', value: `${summary.readinessScore}%`, change: 'Optimal', icon: Sparkles, color: 'text-[#A10022]', bg: 'bg-red-50' },
        ];
        setStats(kpis);
        setMilestones(summary?.recentMilestones || []);
    }, [summary]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome & Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Hello, <span className="text-[#A10022]">{user?.firstName || 'Eagle'}</span>!
                    </h1>
                    <p className="text-gray-500 font-medium">Your career journey is looking strong. Here's your current pulse.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#A10022] text-white rounded-2xl font-black text-xs hover:bg-red-800 shadow-lg shadow-red-900/20 transition-all">
                    <Rocket size={16} /> Submit New Experience
                </button>
            </div>

            {/* KPI Grid - Matches CommandCenter Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${kpi.label.includes('Pending') ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {kpi.change}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Experience Progress (Visualizing specific types) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-gray-800 uppercase tracking-tight text-sm">Applied Learning Milestones</h3>
                        <button className="text-xs text-[#A10022] font-black flex items-center gap-1 hover:underline uppercase tracking-widest">
                            Full Registry <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {milestones.map((m, idx) => (
                            <ProgressBar
                                key={idx}
                                label={`${m.title} (${m.orgName})`}
                                progress={m.progress}
                                color={m.progress === 100 ? "bg-emerald-500" : "bg-blue-500"}
                                status={m.status}
                            />
                        ))}
                    </div>
                </div>

                {/* Upcoming Deadlines / Action Items */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="font-black text-gray-800 mb-8 flex items-center gap-2 uppercase tracking-tight text-sm">
                        <Calendar size={18} className="text-[#A10022]" /> Priority Timeline
                    </h3>
                    <div className="space-y-6 flex-1">
                        <TimelineItem
                            title="AWS Internship Deadline"
                            desc="Application closes at midnight"
                            date="Today"
                            icon={<Briefcase size={14} />}
                            priority
                        />
                        <TimelineItem
                            title="Submit Research Log"
                            desc="Needs Faculty Advisor signature"
                            date="Mar 15"
                            icon={<GraduationCap size={14} />}
                        />
                        <TimelineItem
                            title="Career Fair Prep"
                            desc="Update your Career Profile"
                            date="Mar 20"
                            icon={<Sparkles size={14} />}
                        />
                    </div>
                    <button className="mt-8 w-full py-4 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-colors">
                        View Career Calendar
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- Helper Components --- */

const ProgressBar = ({ label, progress, color, status }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <div>
                <span className="text-xs font-black text-gray-900 block">{label}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{status}</span>
            </div>
            <span className="text-xs font-black text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
                className={`${color} h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(0,0,0,0.05)]`}
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

const TimelineItem = ({ title, desc, date, icon, priority }) => (
    <div className="flex gap-4 group cursor-pointer">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${priority ? 'bg-red-50 text-[#A10022] shadow-sm' : 'bg-gray-50 text-gray-400'
            } group-hover:scale-110`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-black text-gray-900 truncate">{title}</p>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{desc}</p>
            <p className={`text-[9px] font-black mt-2 uppercase tracking-widest ${priority ? 'text-[#A10022]' : 'text-gray-400'}`}>
                {date}
            </p>
        </div>
    </div>
);

export default StudentOverview;