import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Users, Plus, Search,
    MoreVertical, Video, Clock, ArrowUpRight,
    ChevronRight, CreditCard, Maximize
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/util';
import CreateEventModal from './CreateEventModal';
import QRScannerModal from './QRScannerModal'; // Ensure this is imported

const EmployerEvents = () => {
    const { showNotification } = useNotification();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('UPCOMING'); 
    const [searchTerm, setSearchTerm] = useState("");
    
    // Lifted scanner state
    const [scanningEvent, setScanningEvent] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/employer/dashboard/events?status=${filter}`);
            setEvents(res.data);
        } catch (err) {
            showNotification("Failed to load events", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* 1. Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black italic text-gray-900 tracking-tight">
                        Recruitment <span className="text-[#A10022]">Events</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Build your brand on campus through workshops and sessions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200"
                >
                    <Plus size={18} /> Host New Event
                </button>
            </div>

            {/* 2. Controls Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto">
                    <TabButton active={filter === 'UPCOMING'} onClick={() => setFilter('UPCOMING')} label="Upcoming" />
                    <TabButton active={filter === 'PAST'} onClick={() => setFilter('PAST')} label="Past Events" />
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search your events..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#A10022]/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Event List Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[3rem]" />)}
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map(event => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            onOpenScanner={() => setScanningEvent(event)} // Trigger lifted state
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No {filter.toLowerCase()} events found</p>
                </div>
            )}

            {/* Create Event Modal */}
            {isModalOpen && (
                <CreateEventModal onClose={() => setIsModalOpen(false)} onRefresh={fetchEvents} />
            )}

            {/* QR Scanner Modal - Managed globally for proper viewport coverage */}
            {scanningEvent && (
                <QRScannerModal 
                    eventId={scanningEvent.id} 
                    eventTitle={scanningEvent.title}
                    onClose={() => setScanningEvent(null)}
                    onRefresh={fetchEvents}
                />
            )}
        </div>
    );
};

/* --- Sub-Components --- */

const EventCard = ({ event, onOpenScanner }) => {
    const fillPercent = event.capacity ? Math.min((event.currentRsrvCount / event.capacity) * 100, 100) : 0;

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-[1.5rem] ${event.isVirtual ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-[#A10022]'}`}>
                    {event.isVirtual ? <Video size={24} /> : <MapPin size={24} />}
                </div>
                <div className="flex gap-2">
                    {event.requiresFee && (
                        <span className="bg-amber-50 text-amber-700 text-[8px] font-black px-2 py-1 rounded-lg uppercase border border-amber-100 flex items-center gap-1">
                            <CreditCard size={10} /> Paid
                        </span>
                    )}
                    <span className="bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">
                        {event.type?.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-black italic text-gray-900 group-hover:text-[#A10022] transition-colors leading-tight">
                    {event.title}
                </h3>
                <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {formatDate(event.startTime)}</span>
                </div>
            </div>

            {/* Attendance Progress */}
            <div className="space-y-3 mb-8 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Registrations</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">
                        {event.currentRsrvCount || 0} <span className="text-gray-400">/ {event.capacity || '∞'}</span>
                    </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gray-900 transition-all duration-1000 ease-out"
                        style={{ width: `${fillPercent}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                    {/* Integrated Launch Scanner Button */}
                    <button
                        onClick={onOpenScanner}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
                    >
                        <Maximize size={14} /> Launch Scanner
                    </button>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#A10022] transition-colors flex items-center gap-1 ml-2">
                        RSVPs <ChevronRight size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 transition-colors">
                        <MoreVertical size={18} />
                    </button>
                    <button className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-[#A10022] transition-all shadow-lg shadow-gray-200">
                        <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
            ${active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
    >
        {label}
    </button>
);

export default EmployerEvents;