import React, { useEffect, useState } from 'react';
import {
    BookOpen, Play, Download, Star, CheckCircle,
    Lightbulb, Users, Trophy, ChevronRight, Search
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import apiClient from '../../../api/ApiClient';

const StudentLearning = () => {
    const { showNotification } = useNotification();
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/learning/modules');
            // Map the backend structure to your local module state
            const mappedModules = res.data.map(m => ({
                ...m,
                progress: m.isCompleted ? 100 : 0
            }));
            setModules(mappedModules);
        } catch (err) {
            showNotification("Failed to load learning paths.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleModuleComplete = async (moduleId) => {
        try {
            const res = await apiClient.post(`/learning/modules/${moduleId}/complete`);
            showNotification("Skill unlocked!", "success");
            // Refresh modules to show the new completion status
            fetchModules();
        } catch (err) {
            showNotification("Error saving progress.", "error");
        }
    };

    // const modules = [
    //     { id: 1, title: 'Mastering the Elevator Pitch', type: 'VIDEO', category: 'NETWORKING', duration: '5 min', progress: 100 },
    //     { id: 2, title: 'Resume Checklist for Tech Roles', type: 'DOCUMENT', category: 'RESUME', duration: '10 min', progress: 0 },
    //     { id: 3, title: 'LinkedIn Profile Optimization', type: 'INTERACTIVE', category: 'SOCIAL', duration: '15 min', progress: 45 },
    //     { id: 4, title: 'Interviewing at EWU Departments', type: 'VIDEO', category: 'INTERVIEW', duration: '8 min', progress: 0 },
    // ];

    useEffect(() => {
        fetchModules();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Hero Learning Header */}
            <section className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
                <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Career Readiness Path</span>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tight leading-none">Sharpen Your <span className="text-[#A10022]">Professional Edge.</span></h1>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        Access curated modules and resources specifically designed for the EWU ecosystem to turn your experiences into career milestones.
                    </p>
                </div>
                <Lightbulb className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
            </section>

            {/* Categories & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {['ALL', 'RESUME', 'NETWORKING', 'INTERVIEW'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input placeholder="Search modules..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#A10022]/10" />
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.filter(m => activeCategory === 'ALL' || m.category === activeCategory).map((m) => (
                    <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#A10022]/20 transition-all group relative">
                        <div className="absolute top-8 right-8">
                            <div className="flex flex-col items-center justify-center bg-gray-50 px-3 py-2 rounded-2xl border border-gray-100 group-hover:bg-[#A10022] group-hover:border-[#A10022] transition-colors">
                                <span className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-tighter">Points</span>
                                <span className="text-sm font-black text-gray-900 group-hover:text-white leading-none">+{m.weight}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl ${m.progress === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                                {m.moduleType === 'VIDEO' ? <Play size={20} /> : <BookOpen size={20} />}
                            </div>
                            {m.progress === 100 && <CheckCircle size={20} className="text-emerald-500" />}
                        </div>

                        <div className="space-y-2 mb-8">
                            <span className="text-[10px] font-black text-[#A10022] uppercase tracking-widest">{m.category}</span>
                            <h3 className="text-xl font-black text-gray-900 leading-tight italic group-hover:text-[#A10022] transition-colors">{m.title}</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{m.duration} • {m.type}</p>
                        </div>

                        {/* Progress Mini-Bar */}
                        {m.progress > 0 && m.progress < 100 && (
                            <div className="w-full bg-gray-50 h-1 rounded-full mb-6 overflow-hidden">
                                <div className="bg-[#A10022] h-full transition-all duration-500" style={{ width: `${m.progress}%` }} />
                            </div>
                        )}

                        <button className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group-hover:bg-gray-900 group-hover:text-white transition-all">
                            {m.progress === 100 ? "Review Module" : "Start Learning"} <ChevronRight size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Featured Institutional Resources */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                    <div className="p-3 bg-red-50 text-[#A10022] rounded-2xl"><Download size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase italic">Essential Toolkits</h2>
                        <p className="text-gray-400 font-medium text-sm italic">Direct access to official EWU career documentation.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResourceItem title="Federal Work Study FAQ" size="1.2 MB" />
                    <ResourceItem title="Employer Networking Map" size="4.5 MB" />
                    <ResourceItem title="Interview Prep Workbook" size="2.8 MB" />
                    <ResourceItem title="Career Fair Success Guide" size="3.1 MB" />
                </div>
            </div>
        </div>
    );
};

const ResourceItem = ({ title, size }) => (
    <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2rem] border border-transparent hover:border-gray-200 hover:bg-white transition-all cursor-pointer group">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-[#A10022] shadow-sm"><Download size={18} /></div>
            <div>
                <h4 className="font-black text-gray-900 text-sm tracking-tight italic">{title}</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{size} • PDF</p>
            </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 group-hover:bg-[#A10022] group-hover:text-white transition-all shadow-sm">
            <ChevronRight size={16} />
        </div>
    </div>
);

export default StudentLearning;