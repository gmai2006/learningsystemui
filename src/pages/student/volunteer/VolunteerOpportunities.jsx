import React, { useState, useEffect } from 'react';
import {
    Heart, MapPin, Calendar, Clock,
    Search, Filter, ExternalLink, Award,
    CheckCircle2, X, Send, ShieldCheck,
    CheckCircle // Added for the applied indicator
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
        try {
            const res = await apiClient.get('/jobs/volunteer');
            setOpportunities(res.data);
            const res2 = await apiClient.get('/student/dashboard/volunteersummary');
            setVolunteer(res2.data);
        } catch (err) {
            console.error("Failed to load volunteer roles", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteering();
    }, []);

    const filtered = opportunities.filter(op =>
        op.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* 1. Impact & Progress Header */}
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 relative z-10">
                    <div className="space-y-4 max-w-xl">
                        <h1 className="text-4xl font-black italic tracking-tight">Community <span className="text-red-500">Impact</span></h1>
                        <p className="text-gray-400 font-medium italic">Connect with local non-profits and gain valuable experience while giving back to the community.</p>
                        <div className="pt-4 space-y-3">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Milestone Progress</p>
                                <p className="text-xs font-bold text-white">{volunteer.totalHours} / {MILESTONE_TARGET} Hours</p>
                            </div>
                            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-1000 ease-out rounded-full relative"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
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

            {/* 2. Search Bar */}
            <div className="relative max-w-2xl mx-auto -mt-12 z-20">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by cause or organization..."
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-xl outline-none focus:ring-2 focus:ring-red-500/10 font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* 3. Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-[2.5rem] animate-pulse" />)
                ) : filtered.map((op) => (
                    <VolunteerCard key={op.id} op={op} onApply={() => setSelectedOp(op)} />
                ))}
            </div>

            {/* 4. Application Modal Overlay */}
            {selectedOp && (
                <VolunteerApplicationModal 
                    opportunity={selectedOp} 
                    onClose={() => setSelectedOp(null)} 
                    onSuccess={() => {
                        setSelectedOp(null);
                        showNotification("Application submitted!", "success");
                        fetchVolunteering(); // Refresh list to update isApplied state
                    }}
                />
            )}
        </div>
    );
};

/* --- Sub-Components --- */

const VolunteerCard = ({ op, onApply }) => {
    // Check if the student has already applied
    const applied = op.applied === true;

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full relative">
            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${applied ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                        {applied ? <CheckCircle size={24} /> : <Heart size={24} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {applied ? (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Applied
                            </span>
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Open</span>
                        )}
                        
                        {op.serviceHours > 0 && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                <Award size={10} /> {op.serviceHours} Hours
                            </span>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className={`text-xl font-black italic transition-colors leading-tight ${applied ? 'text-gray-400' : 'text-gray-900 group-hover:text-red-500'}`}>
                        {op.jobTitle}
                    </h3>
                    <p className="text-sm font-bold text-gray-400 mt-1">{op.location}</p>
                </div>
                <p className="text-xs text-gray-500 line-clamp-3 font-medium leading-relaxed italic">
                    {op.jobDescription}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {applied ? "Reviewing..." : "Available Now"}
                    </span>
                </div>
                
                <button 
                    onClick={onApply}
                    disabled={applied}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                        ${applied 
                            ? 'text-emerald-500 cursor-default opacity-80' 
                            : 'text-gray-900 hover:text-red-500'
                        }`}
                >
                    {applied ? (
                        <>Application Active <CheckCircle2 size={14} /></>
                    ) : (
                        <>Apply to Help <ExternalLink size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

// ... VolunteerApplicationModal and ImpactStat remain same as provided in previous code ...

const ImpactStat = ({ label, value, icon }) => (
    <div className="text-center bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-white/10 min-w-[120px]">
        <div className="flex items-center justify-center gap-2 mb-1">
            {icon} <span className="text-2xl font-black italic">{value}</span>
        </div>
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    </div>
);

const VolunteerApplicationModal = ({ opportunity, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [note, setNote] = useState("");

    const handleApply = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post(`/applications/apply/${opportunity.id}`, note );
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-8 bg-red-50 border-b border-red-100 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Applying to Help</span>
                        <h2 className="text-xl font-black italic text-gray-900">{opportunity.jobTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors">
                        <X size={20} className="text-red-500" />
                    </button>
                </div>

                <form onSubmit={handleApply} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Message to Organizer</label>
                        <textarea 
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/10 min-h-[120px] font-medium"
                            placeholder="Briefly explain why you want to help..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
                            By applying, you agree to track your hours through the Eagle Portal to qualify for the <span className="text-red-500">Service Award Milestone</span>.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : <>Confirm Application <Send size={14} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VolunteerOpportunities;