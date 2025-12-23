import React, { useState } from 'react';
import { X, MapPin, Calendar, Wallet, Globe, School, Send, CheckCircle, Info } from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const JobDetailSlideover = ({ job, onClose }) => {
    const { showNotification } = useNotification();
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);

    if (!job) return null;

    const handleApply = async () => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/applications', {
                jobId: job.id,
                notes: notes
            });
            setHasApplied(true);
            showNotification("Application sent successfully!", "success");
        } catch (err) {
            const msg = err.response?.status === 409 ? "Already applied for this role." : "Failed to apply.";
            showNotification(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmApplication = async () => {
        // 1. Prevent double-clicks
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const payload = {
                jobId: job.id,
                notes: notes.trim()
            };

            // 2. Call the API
            const response = await apiClient.post('/applications', payload);

            if (response.status === 201 || response.status === 200) {
                setHasApplied(true);
                showNotification("Your application has been submitted!", "success");

                // 3. Optional: Trigger a refresh of the job board data
                if (onApplicationSuccess) onApplicationSuccess(job.id);
            }
        } catch (err) {
            // 4. Handle Specific Error Codes
            if (err.response?.status === 409) {
                showNotification("You have already applied for this position.", "info");
                setHasApplied(true); // Sync UI if they already applied
            } else {
                showNotification("Submission failed. Please try again later.", "error");
            }
            console.error("Application Error:", err);
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
                <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Position Overview</span>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight italic">{job.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoBlock icon={<MapPin size={18} />} label="Location" value={job.location} />
                        <InfoBlock
                            icon={job.onCampus ? <School size={18} /> : <Globe size={18} />}
                            label="Job Type"
                            value={job.onCampus ? "On-Campus" : "Off-Campus"}
                        />
                        <InfoBlock icon={<Wallet size={18} />} label="Funding" value={job.fundingSource.replace('_', ' ')} />
                        <InfoBlock icon={<Calendar size={18} />} label="Apply By" value={new Date(job.deadline[0], job.deadline[1] - 1, job.deadline[2]).toLocaleDateString()} />
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#A10022]" />
                            Detailed Description
                        </h3>
                        <div className="bg-gray-50 p-6 rounded-3xl text-gray-600 leading-relaxed text-sm border border-gray-100 italic">
                            {job.description}
                        </div>
                    </div>

                    {/* Application Form */}
                    {!hasApplied ? (
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Application Notes / Cover Letter</label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell the employer why you are a great fit..."
                                    className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-3xl text-sm focus:border-[#A10022]/20 focus:bg-white outline-none transition-all resize-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleConfirmApplication}
                                disabled={isSubmitting || notes.length < 10}
                                className={`w-full py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3
    ${isSubmitting || notes.length < 10
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#A10022] text-white shadow-red-900/20 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Confirm Application
                                    </>
                                )}
                            </button>
                            {notes.length < 10 && !isSubmitting && (
                                <p className="text-[10px] text-center text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                    Please provide a brief note (min. 10 chars)
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-lg font-black text-emerald-900">Application Sent!</h4>
                            <p className="text-emerald-600 text-sm font-medium">The employer has been notified. You can track this in your dashboard.</p>
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
        <p className="text-xs font-black text-gray-900">{value}</p>
    </div>
);

export default JobDetailSlideover;