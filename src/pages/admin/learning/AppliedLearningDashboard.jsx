import React, { useState, useEffect } from 'react';
import { Briefcase, ShieldAlert, Users, TrendingUp } from 'lucide-react';
import AppliedLearningTable from './AppliedLearningTable';
import apiClient from '../../../api/ApiClient';
import { FileSpreadsheet } from 'lucide-react';


const AppliedLearningDashboard = () => {
    const [stats, setStats] = useState({ unverified: 0, newEmployers: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/admin/dashboard/stats');
                setStats({
                    unverified: res.data.unverifiedExperiences,
                    newEmployers: res.data.newEmployerPartners,
                    activePlacements: res.data.activePlacements,
                    completionRate: res.data.completionRate
                });
            } catch (err) { console.error(err); }
        };
        
        fetchStats();
    }, []);

    const statCards = [
        { label: "Pending Verification", value: stats.unverified, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
        { label: "New Employers (Week)", value: stats.newEmployers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Active Placements", value: stats.activePlacements, icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
        { label: "Completion Rate", value: stats.completionRate, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Applied Learning <span className="text-[#A10022]">Command Center</span></h1>
                <p className="text-gray-500 font-medium">Manage and verify all 16 categories of EWU experiential learning.</p>
               
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                        <div className={`${card.bg} ${card.color} p-4 rounded-2xl`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
                            <p className="text-2xl font-black text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience Management Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-800">Experience Registry</h2>
                </div>
                <AppliedLearningTable />
            </div>
        </div>
    );
};

export default AppliedLearningDashboard;