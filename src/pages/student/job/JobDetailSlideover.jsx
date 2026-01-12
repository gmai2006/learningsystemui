import React, { useState } from 'react';
import { 
    X, MapPin, Calendar, Wallet, Globe, School, Send, 
    CheckCircle, Info, Loader2, ShieldCheck, 
    Plus, Target, Trash2, ClipboardList, Check,
    Tag // Added Tag icon for Category
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const JobDetailSlideover = ({ job, onClose, onApplicationSuccess }) => {
    const { showNotification } = useNotification();
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Check if applied via view-provided application_id
    const [hasApplied, setHasApplied] = useState(!!job?.applicationId);

    // Dynamic checks based on the new Category field
    const category = job?.category?.toUpperCase() || 'GENERAL';
    const isInternship = category === 'INTERNSHIP';
    const isVolunteer = category === 'VOLUNTEER';

    // State for Student's Learning Objectives (Required for Internships)
    const [objectives, setObjectives] = useState(['']); 

    if (!job) return null;

    const handleAddObjective = () => setObjectives([...objectives, '']);
    
    const handleObjectiveChange = (index, value) => {
        const newObjectives = [...objectives];
        newObjectives[index] = value;
        setObjectives(newObjectives);
    };

    const handleRemoveObjective = (index) => {
        if (objectives.length > 1) {
            setObjectives(objectives.filter((_, i) => i !== index));
        }
    };

    const handleConfirmApplication = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const filteredObjectives = objectives.filter(obj => obj.trim() !== '');

            const payload = {
                jobId: job.jobId,
                value: notes.trim(),
                learningObjectives: isInternship ? filteredObjectives : []
            };

            const response = await apiClient.post(`/applications/apply/${job.jobId}`, payload);

            if (response.status === 201 || response.status === 200) {
                setHasApplied(true);
                showNotification("Application submitted successfully!", "success");
                if (onApplicationSuccess) onApplicationSuccess(job.jobId);
            }
        } catch (err) {
            const msg = err.response?.status === 409 ? "Already applied." : "Submission failed.";
            showNotification(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose} />

            {/* Slide-over Content */}
            <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/30">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Position Overview</span>
                            <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                                {category}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight italic uppercase">{job.jobTitle}</h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">{job.companyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">

                    {/* Quick Info Grid - Added Category here */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoBlock icon={<Tag size={18} />} label="Classification" value={category} />
                        <InfoBlock icon={<MapPin size={18} />} label="Location" value={job.location} />
                        <InfoBlock
                            icon={job.isOnCampus ? <School size={18} /> : <Globe size={18} />}
                            label="Site Type"
                            value={job.isOnCampus ? "On-Campus" : "Off-Campus"}
                        />
                        <InfoBlock icon={<Wallet size={18} />} label="Funding" value={job.fundingSource?.replace(/_/g, ' ')} />
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#A10022]" />
                            About the Position
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-3xl text-gray-600 leading-relaxed text-sm border border-gray-100 italic font-medium">
                            {job.jobDescription || "No detailed description provided."}
                        </div>
                    </div>

                    {/* Requirements Section */}
                    <div className="space-y-4">
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <ClipboardList size={16} className="text-[#A10022]" />
                            Employer Requirements
                        </h3>
                        <div className="grid gap-2">
                            {job.jobRequirements && job.jobRequirements.length > 0 ? (
                                job.jobRequirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{req}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic ml-2">No specific qualifications listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Application Form Interaction */}
                    {!hasApplied ? (
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            
                            {/* Learning Objectives (Mandatory for Internships) */}
                            {isInternship && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Target size={14} className="text-[#A10022]" /> 
                                            Academic Learning Goals
                                        </label>
                                        <button 
                                            onClick={handleAddObjective}
                                            className="text-[10px] font-black text-[#A10022] uppercase flex items-center gap-1 hover:underline"
                                        >
                                            <Plus size={12} /> Add Objective
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {objectives.map((obj, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Define a goal for this internship..."
                                                    className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:border-[#A10022]/10 focus:bg-white outline-none transition-all"
                                                    value={obj}
                                                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                                />
                                                {objectives.length > 1 && (
                                                    <button onClick={() => handleRemoveObjective(index)} className="p-3 text-gray-300 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    {isVolunteer ? "Why do you want to help?" : "Application Notes"}
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder={isVolunteer ? "Share your passion for this cause..." : "Briefly state your interest and fit..."}
                                    className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-3xl text-sm focus:border-[#A10022]/20 focus:bg-white outline-none transition-all resize-none font-medium"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleConfirmApplication}
                                disabled={isSubmitting || notes.trim().length < 5}
                                className={`w-full py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3
                                    ${isSubmitting || notes.trim().length < 5
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-[#A10022] text-white shadow-red-900/20 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                {isVolunteer ? "Submit Commitment" : "Submit Application"}
                            </button>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-lg font-black text-emerald-900 uppercase">Application Active</h4>
                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-tight">Status: {job.applicationStatus || 'PENDING'}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const InfoBlock = ({ icon, label, value }) => (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2 text-gray-400 mb-1">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-xs font-black text-gray-900 truncate">{value || "N/A"}</p>
    </div>
);

export default JobDetailSlideover;