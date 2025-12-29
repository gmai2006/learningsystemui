import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, MapPin, Users, 
  Video, AlignLeft, Sparkles, Globe, CreditCard, DollarSign
} from 'lucide-react';
import apiClient from '../api/ApiClient';
import { useNotification } from '../context/NotificationContext';

const CreateEventModal = ({ onClose, onRefresh }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'INFO_SESSION',
        location: '',
        isVirtual: false,
        meetingLink: '',
        startTime: '',
        endTime: '',
        capacity: 50,
        requiresFee: false,
        feeAmount: 0,
        touchnetPaymentCode: ''
    });

    // Close on Escape Key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            showNotification("Event end time must be after start time", "error");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/employer/events', formData);
            showNotification("Event published successfully!", "success");
            onRefresh();
            onClose(); 
        } catch (err) {
            showNotification("Failed to create event. Check all fields.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop: Clicking here closes the modal */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Recruitment Hub</span>
                        <h2 className="text-2xl font-black text-gray-900 italic">Host an Event</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-200 rounded-2xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormGroup label="Event Title" icon={<Sparkles size={16}/>}>
                                <input 
                                    required
                                    className="form-input-eagle"
                                    placeholder="e.g. Spring Tech Talk"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </FormGroup>
                            <FormGroup label="Event Type" icon={<Globe size={16}/>}>
                                <select 
                                    className="form-input-eagle"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="INFO_SESSION">Information Session</option>
                                    <option value="WORKSHOP">Workshop / Seminar</option>
                                    <option value="NETWORKING">Networking Mixer</option>
                                    <option value="CAREER_FAIR">Career Fair</option>
                                </select>
                            </FormGroup>
                        </div>

                        <FormGroup label="Description" icon={<AlignLeft size={16}/>}>
                            <textarea 
                                className="form-input-eagle min-h-[100px] pt-3"
                                placeholder="What will students learn or achieve?"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </FormGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormGroup label="Start Time" icon={<Calendar size={16}/>}>
                                <input 
                                    type="datetime-local"
                                    className="form-input-eagle"
                                    required
                                    value={formData.startTime}
                                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                                />
                            </FormGroup>
                            <FormGroup label="End Time" icon={<Calendar size={16}/>}>
                                <input 
                                    type="datetime-local"
                                    className="form-input-eagle"
                                    required
                                    value={formData.endTime}
                                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                                />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Location & Attendance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Attendance</p>
                            </div>
                            <FormGroup label="Max Capacity" icon={<Users size={16}/>}>
                                <input 
                                    type="number"
                                    className="form-input-eagle"
                                    value={formData.capacity}
                                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                                />
                            </FormGroup>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Modality</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase">Virtual</span>
                                    <input 
                                        type="checkbox" 
                                        className="accent-[#A10022]"
                                        checked={formData.isVirtual}
                                        onChange={e => setFormData({...formData, isVirtual: e.target.checked})}
                                    />
                                </label>
                            </div>
                            {formData.isVirtual ? (
                                <FormGroup label="Meeting Link" icon={<Video size={14} className="text-blue-500"/>}>
                                    <input 
                                        className="form-input-eagle"
                                        placeholder="Zoom/Teams Link"
                                        value={formData.meetingLink}
                                        onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                                    />
                                </FormGroup>
                            ) : (
                                <FormGroup label="Physical Room" icon={<MapPin size={14} className="text-red-500"/>}>
                                    <input 
                                        className="form-input-eagle"
                                        placeholder="e.g. PUB 201"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </FormGroup>
                            )}
                        </div>
                    </div>

                    {/* Fee Management */}
                    <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard size={16} className="text-amber-600" />
                                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Fee Settings</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-[8px] font-bold text-amber-700 uppercase">Requires Fee</span>
                                <input 
                                    type="checkbox" 
                                    className="accent-amber-600"
                                    checked={formData.requiresFee}
                                    onChange={e => setFormData({...formData, requiresFee: e.target.checked})}
                                />
                            </label>
                        </div>

                        {formData.requiresFee && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                <FormGroup label="Amount ($)" icon={<DollarSign size={14}/>}>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        className="form-input-eagle border-amber-200 focus:ring-amber-500/10"
                                        value={formData.feeAmount}
                                        onChange={e => setFormData({...formData, feeAmount: e.target.value})}
                                    />
                                </FormGroup>
                                <FormGroup label="TouchNet Code" icon={<Globe size={14}/>}>
                                    <input 
                                        className="form-input-eagle border-amber-200 focus:ring-amber-500/10"
                                        placeholder="e.g. ASB-2025-01"
                                        value={formData.touchnetPaymentCode}
                                        onChange={e => setFormData({...formData, touchnetPaymentCode: e.target.value})}
                                    />
                                </FormGroup>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Publishing...' : 'Publish Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormGroup = ({ label, icon, children }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        {children}
    </div>
);

export default CreateEventModal;