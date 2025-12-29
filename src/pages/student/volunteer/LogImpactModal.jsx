import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, DollarSign, 
  Mail, AlignLeft, Send, Heart, Vote 
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const LogImpactModal = ({ experience, onClose, onSuccess }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        experienceId: experience?.id,
        dateLogged: new Date().toISOString().split('T')[0],
        impactType: 'HOURS', // 'HOURS', 'DONATION', 'VOTING', 'PHILANTHROPY'
        hoursWorked: '',
        donationAmount: '',
        description: '',
        siteSupervisorEmail: ''
    });

    // Close on Escape Key
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiClient.post('/student/volunteer/log', formData);
            showNotification("Impact record submitted for verification!", "success");
            onSuccess();
        } catch (err) {
            showNotification("Failed to save log. Please check your inputs.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <form onSubmit={handleSubmit} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Service Registry</span>
                        <h2 className="text-2xl font-black text-gray-900 italic">Log Your Impact</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{experience?.title}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-gray-200 rounded-2xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Impact Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormGroup label="Impact Category" icon={<Heart size={16} className="text-red-500"/>}>
                            <select 
                                className="form-input-eagle"
                                value={formData.impactType}
                                onChange={e => setFormData({...formData, impactType: e.target.value})}
                            >
                                <option value="HOURS">Service Hours</option>
                                <option value="DONATION">Financial Donation</option>
                                <option value="PHILANTHROPY">Philanthropy</option>
                                <option value="VOTING">Civic Engagement (Voting)</option>
                            </select>
                        </FormGroup>

                        <FormGroup label="Date of Service" icon={<Calendar size={16}/>}>
                            <input 
                                type="date"
                                required
                                className="form-input-eagle"
                                value={formData.dateLogged}
                                onChange={e => setFormData({...formData, dateLogged: e.target.value})}
                            />
                        </FormGroup>
                    </div>

                    {/* Dynamic Inputs based on Impact Type */}
                    <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 animate-in fade-in duration-300">
                        {formData.impactType === 'HOURS' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormGroup label="Hours Worked" icon={<Clock size={16} className="text-[#A10022]"/>}>
                                    <input 
                                        type="number" step="0.25" required
                                        className="form-input-eagle"
                                        placeholder="e.g. 4.5"
                                        value={formData.hoursWorked}
                                        onChange={e => setFormData({...formData, hoursWorked: e.target.value})}
                                    />
                                </FormGroup>
                                <FormGroup label="Supervisor Email" icon={<Mail size={16}/>}>
                                    <input 
                                        type="email" required
                                        className="form-input-eagle"
                                        placeholder="approver@organization.org"
                                        value={formData.siteSupervisorEmail}
                                        onChange={e => setFormData({...formData, siteSupervisorEmail: e.target.value})}
                                    />
                                </FormGroup>
                            </div>
                        ) : formData.impactType === 'VOTING' ? (
                            <div className="flex items-center gap-4 py-2">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Vote size={24} />
                                </div>
                                <p className="text-xs font-bold text-gray-500 italic">
                                    Logging civic engagement helps EWU track student participation in the democratic process. No specific ballot data is stored.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormGroup label="Donation Amount" icon={<DollarSign size={16} className="text-emerald-600"/>}>
                                    <input 
                                        type="number" step="0.01" required
                                        className="form-input-eagle"
                                        placeholder="0.00"
                                        value={formData.donationAmount}
                                        onChange={e => setFormData({...formData, donationAmount: e.target.value})}
                                    />
                                </FormGroup>
                                <FormGroup label="Receipt Verification" icon={<Mail size={16}/>}>
                                    <input 
                                        type="email" required
                                        className="form-input-eagle"
                                        placeholder="finance@organization.org"
                                        value={formData.siteSupervisorEmail}
                                        onChange={e => setFormData({...formData, siteSupervisorEmail: e.target.value})}
                                    />
                                </FormGroup>
                            </div>
                        )}
                    </div>

                    <FormGroup label="Description of Activities" icon={<AlignLeft size={16}/>}>
                        <textarea 
                            required
                            className="form-input-eagle min-h-[100px] pt-3"
                            placeholder="Detail your contribution..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </FormGroup>
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
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>Submit Record <Send size={14} /></>
                        )}
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

export default LogImpactModal;