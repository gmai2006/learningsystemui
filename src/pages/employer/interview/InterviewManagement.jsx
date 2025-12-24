import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
    Calendar, Clock, User, Video, MapPin,
    Search, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext'; // Ensure this is imported

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

const EmployerInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { showNotification } = useNotification(); // Initialize notification

    const [reschedulingId, setReschedulingId] = useState(null);
    const [newTime, setNewTime] = useState("");

    // 1. Move fetchInterviews outside so it can be called by handleReschedule
    const fetchInterviews = useCallback(async () => {
        try {
            const res = await apiClient.get('/employer/dashboard/interviews');
            setInterviews(res.data);
        } catch (err) {
            console.error("Error fetching interviews", err);
            showNotification("Failed to load interview schedule", "error");
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    // 2. Updated handleReschedule with state cleanup
    const handleReschedule = async (interviewId) => {
        if (!newTime) {
            showNotification("Please select a new date and time", "error");
            return;
        }

        try {
            await apiClient.patch(`/employer/dashboard/interviews/${interviewId}/reschedule`, {
                newScheduledAt: newTime
            });
            
            showNotification("Interview successfully moved", "success");
            
            // Cleanup state to close modal
            setReschedulingId(null); 
            setNewTime("");
            
            // Refresh the list
            fetchInterviews(); 
        } catch (err) {
            showNotification("Failed to reschedule. Please check candidate availability.", "error");
        }
    };

    const filteredInterviews = interviews.filter(i =>
        i.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest text-xl">Syncing Schedule...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black italic text-gray-900 tracking-tight leading-none">Interview Schedule</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Manage upcoming student evaluations</p>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by student or role..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Interview Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredInterviews.length > 0 ? (
                    filteredInterviews.map((interview) => (
                        <InterviewCard 
                            key={interview.id} 
                            interview={interview} 
                            navigate={navigate} 
                            setReschedulingId={setReschedulingId} 
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 text-center space-y-4">
                        <Calendar size={48} className="mx-auto text-gray-200" />
                        <p className="text-sm font-bold text-gray-400 italic">No interviews scheduled for this period.</p>
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {reschedulingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
                        <h3 className="text-2xl font-black italic text-gray-900 mb-2">Reschedule Interview</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Select a new date and time for the candidate.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} /> New Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#A10022]/10"
                                    onChange={(e) => setNewTime(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => {
                                        setReschedulingId(null);
                                        setNewTime("");
                                    }}
                                    className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReschedule(reschedulingId)}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#A10022] transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InterviewCard = ({ interview, navigate, setReschedulingId }) => {
    // Logic to handle your array date format [YYYY, MM, DD, HH, mm]
    const formatInterviewTime = (dateArr) => {
        if (!Array.isArray(dateArr)) return "TBD";
        const [year, month, day, hour, minute] = dateArr;
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start gap-6 relative z-10">

                {/* Left: Candidate Info */}
                <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                        {interview.studentProfilePicture ? (
                            <img src={interview.studentProfilePicture} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={24} /></div>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black italic text-gray-900 leading-none group-hover:text-[#A10022] transition-colors">
                            {interview.studentName}
                        </h3>
                        <p className="text-sm font-bold text-gray-600">{interview.jobTitle}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <Tooltip text="Interview Format">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${interview.isVirtual ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {interview.isVirtual ? <Video size={10} /> : <MapPin size={10} />}
                                    {interview.isVirtual ? 'Virtual' : 'In-Person'}
                                </span>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Right: Time & Actions */}
                <div className="text-right space-y-4">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Scheduled For</p>
                        <p className="text-sm font-black text-gray-900 italic flex items-center justify-end gap-2">
                            <Clock size={14} className="text-[#A10022]" /> {formatInterviewTime(interview.scheduledAt)}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Tooltip text="View Candidate Profile">
                            <button
                                onClick={() => navigate(`/employer/applicants/${interview.applicationId}`)}
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                            >
                                <ExternalLink size={16} />
                            </button>
                        </Tooltip>
                        {/* Inside the action buttons div of InterviewCard */}
                        <Tooltip text="Reschedule Interview">
                            <button
                                onClick={() => setReschedulingId(interview.id)}
                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                            >
                                <Clock size={16} />
                            </button>
                        </Tooltip>
                        {interview.isVirtual && (
                            <Tooltip text="Launch Meeting">
                                <a
                                    href={interview.meetingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 bg-[#A10022] text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-red-100"
                                >
                                    <Video size={16} />
                                </a>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>

            {/* Background Decal */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Calendar size={120} />
            </div>
        </div>
    );
};

export default EmployerInterviews;