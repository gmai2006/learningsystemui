import React, { useState, useEffect } from 'react';
import {
    Heart, MapPin, Calendar, Clock,
    Search, Filter, ExternalLink, Award,
    CheckCircle2, X, Send, ShieldCheck,
    CheckCircle, Building2
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const VolunteerOpportunities = () => {
    const { showNotification } = useNotification();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOp, setSelectedOp] = useState(null); 
    
    const [volunteer, setVolunteer] = useState({
        totalHours: 0,
        projectCount: 0
    });

    const MILESTONE_TARGET = 50;
    const progressPercentage = Math.min((volunteer.totalHours / MILESTONE_TARGET) * 100, 100);

    const fetchVolunteering = async () => {
        setLoading(true);
        try {
            // Updated to use the new view-backed endpoint
            const res = await apiClient.get('/jobs/volunteer');
            setOpportunities(res.data);
            
            const res2 = await apiClient.get('/student/dashboard/volunteersummary');
            setVolunteer(res2.data);
        } catch (err) {
            console.error("Failed to load volunteer roles", err);
            showNotification("Could not sync community opportunities", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteering();
    }, []);

    const filtered = opportunities.filter(op =>
        op.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header remains the same... */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
                    <div className="space-y-4 max-w-xl">
                        <h1 className="text-4xl font-black italic tracking-tight">Community <span className="text-red-500">Impact</span></h1>
                        <p className="text-gray-400 font-medium italic">Connect with local non-profits and gain experience while giving back.</p>
                        <div className="pt-4 space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Milestone Progress</p>
                                <p className="text-xs font-bold text-white">{volunteer.totalHours} / {MILESTONE_TARGET} Hours</p>
                            </div>
                            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <ImpactStat label="Service Hours" value={volunteer.totalHours} icon={<Clock className="text-red-500" size={18} />} />
                        <ImpactStat label="Events Joined" value={volunteer.projectCount} icon={<Heart className="text-red-500" size={18} />} />
                    </div>
                </div>
                <Heart size={240} className="absolute -right-20 -bottom-20 text-white/5 rotate-12 pointer-events-none" />
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto -mt-12 z-20">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by cause or organization..."
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl outline-none font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />)
                ) : filtered.map((op) => (
                    <VolunteerCard 
                        key={op.jobId} 
                        op={op} 
                        onApply={() => setSelectedOp(op)} 
                    />
                ))}
            </div>

            {selectedOp && (
                <VolunteerApplicationModal 
                    opportunity={selectedOp} 
                    onClose={() => setSelectedOp(null)} 
                    onSuccess={() => {
                        setSelectedOp(null);
                        showNotification("Application submitted!", "success");
                        fetchVolunteering(); 
                    }}
                />
            )}
        </div>
    );
};

/* --- Updated Sub-Components --- */

const VolunteerCard = ({ op, onApply }) => {
    // Logic: In v_job_oversight, if applicationId exists, the current student has applied
    const applied = !!op.applicationId;

    return (
        <div className={`bg-white p-8 rounded-[2.5rem] border transition-all group flex flex-col justify-between h-full relative
            ${applied ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
            
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${applied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-50 text-red-500'}`}>
                        {applied ? <CheckCircle2 size={24} /> : <Heart size={24} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {applied ? (
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                                {op.applicationStatus || 'Applied'}
                            </span>
                        ) : (
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">Available</span>
                        )}
                        
                        {op.serviceHours > 0 && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Award size={10} /> {op.serviceHours} Hours
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className={`text-xl font-black italic transition-colors leading-tight ${applied ? 'text-gray-500' : 'text-gray-900 group-hover:text-red-500'}`}>
                        {op.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-400">
                         <Building2 size={12} />
                         <p className="text-[10px] font-bold uppercase tracking-tight">{op.companyName}</p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-3 font-medium leading-relaxed italic">
                    {op.jobDescription}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {op.location}
                    </span>
                </div>
                
                <button 
                    onClick={onApply}
                    disabled={applied}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                        ${applied 
                            ? 'text-emerald-500 cursor-default' 
                            : 'text-gray-900 hover:text-red-500'
                        }`}
                >
                    {applied ? "Reviewing" : "Apply to Help"}
                    {applied ? <CheckCircle size={14} /> : <ExternalLink size={14} />}
                </button>
            </div>
        </div>
    );
};

const VolunteerApplicationModal = ({ opportunity, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [note, setNote] = useState("");

    const handleApply = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Using jobId from the view entity
            await apiClient.post('/applications', { 
                jobId: opportunity.jobId,
                notes: note.trim() 
            });
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                    <div>
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Service Commitment</span>
                        <h2 className="text-xl font-black italic">{opportunity.jobTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleApply} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Why do you want to volunteer?</label>
                        <textarea 
                            required
                            className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[2rem] outline-none focus:border-red-500/20 focus:bg-white min-h-[140px] font-medium text-sm transition-all"
                            placeholder="Share a brief note about your interest..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
                        <p className="text-[10px] text-emerald-800 font-bold leading-relaxed uppercase">
                            By applying, you authorize EWU to track your hours for official transcript recognition.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting || note.length < 5}
                        className="w-full py-5 bg-[#A10022] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? "Sending..." : <>Confirm Application <Send size={16} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ImpactStat = ({ label, value, icon }) => (
    <div className="text-center bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 min-w-[120px]">
        <div className="flex items-center justify-center gap-2 mb-1">
            {icon} <span className="text-2xl font-black italic">{value}</span>
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    </div>
);

export default VolunteerOpportunities;