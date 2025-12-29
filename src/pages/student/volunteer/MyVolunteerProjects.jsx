import React, { useState, useEffect } from 'react';
import { 
    Clock, CheckCircle2, Timer, History, 
    Plus, ChevronRight, LayoutGrid, Heart,
    AlertCircle
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import LogImpactModal from './LogImpactModal'; // The modal we created earlier

const MyVolunteerProjects = () => {
    const { showNotification } = useNotification();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchMyProjects = async () => {
        setLoading(true);
        try {
            // This endpoint should return experiences the student is specifically linked to
            const res = await apiClient.get('/student/volunteer/my-active-projects');
            setProjects(res.data);
        } catch (err) {
            showNotification("Failed to load your service history", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyProjects();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight text-gray-900">
                        My <span className="text-[#A10022]">Service Projects</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Manage your active commitments and log your community impact.</p>
                </div>
                <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="px-4 py-2 text-center border-r border-gray-100">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Active Roles</p>
                        <p className="text-sm font-black text-gray-900">{projects.filter(p => p.status === 'APPROVED').length}</p>
                   </div>
                   <div className="px-4 py-2 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pending App</p>
                        <p className="text-sm font-black text-gray-900">{projects.filter(p => p.status === 'PENDING').length}</p>
                   </div>
                </div>
            </div>

            {/* 2. Project Grid */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-44 bg-gray-100 rounded-[3rem] animate-pulse" />)
                ) : projects.length > 0 ? (
                    projects.map((project) => (
                        <ProjectManagementCard 
                            key={project.id} 
                            project={project} 
                            onLogImpact={() => setSelectedProject(project)} 
                        />
                    ))
                ) : (
                    <div className="bg-white py-20 rounded-[3rem] border-2 border-dashed border-gray-100 text-center space-y-4">
                        <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto">
                            <History size={32} className="text-gray-300" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No projects found</p>
                            <p className="text-xs text-gray-400">Head over to the Opportunities page to get started.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Log Impact Modal Integration */}
            {selectedProject && (
                <LogImpactModal 
                    experience={selectedProject} 
                    onClose={() => setSelectedProject(null)} 
                    onSuccess={() => {
                        setSelectedProject(null);
                        fetchMyProjects(); // Refresh to update hour totals
                    }}
                />
            )}
        </div>
    );
};

/* --- Management Card Component --- */

const ProjectManagementCard = ({ project, onLogImpact }) => {
    const isApproved = project.status === 'APPROVED';
    const isRejected = project.status === 'REJECTED';

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Left: Branding & Status */}
                <div className="flex items-start gap-6">
                    <div className={`p-5 rounded-[2rem] shrink-0 ${
                        isApproved ? 'bg-emerald-50 text-emerald-600' : 
                        isRejected ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                        {isApproved ? <CheckCircle2 size={32} /> : 
                         isRejected ? <AlertCircle size={32} /> : <Timer size={32} />}
                    </div>
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                isApproved ? 'bg-emerald-100 text-emerald-700' : 
                                isRejected ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {project.status}
                            </span>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">ID: {project.id.slice(0,8)}</span>
                        </div>
                        <h3 className="text-2xl font-black italic text-gray-900 leading-tight">{project.title}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                            <Heart size={12} className="text-red-400" /> Organized by {project.organizationName}
                        </p>
                    </div>
                </div>

                {/* Right: Hours & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-12 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                    <div className="text-center lg:text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Verified Impact</p>
                        <p className="text-3xl font-black italic text-[#A10022]">
                            {project.totalHoursLogged || 0}<span className="text-xs ml-1 text-gray-400 not-italic">HRS</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isApproved ? (
                            <button 
                                onClick={onLogImpact}
                                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-lg shadow-gray-200"
                            >
                                <Plus size={16} /> Log Impact
                            </button>
                        ) : (
                            <div className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-gray-100">
                                {isRejected ? 'Application Rejected' : 'Verification Pending'}
                            </div>
                        )}
                        <button className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute right-[-20px] top-[-20px] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <LayoutGrid size={150} />
            </div>
        </div>
    );
};

export default MyVolunteerProjects;