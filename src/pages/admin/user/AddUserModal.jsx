import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Shield, Hash, Loader2, SearchCheck } from 'lucide-react';
import apiClient from '../../../api/ApiClient';

const AddUserModal = ({ isOpen, onClose, onUserAdded, showNotification }) => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', role: 'STUDENT', bannerId: ''
    });
    const [loading, setLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    // Reset verification if ID changes
    useEffect(() => { setIsVerified(false); }, [formData.bannerId]);

    const checkBanner = async () => {
        if (!/^\d{8}$/.test(formData.bannerId)) {
            showNotification("Enter an 8-digit ID to verify.", "info");
            return;
        }
        setIsValidating(true);
        try {
            const res = await apiClient.get(`/admin/users/validate-banner/${formData.bannerId}`);
            // Auto-fill names from the University Database
            setFormData({
                ...formData,
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                email: res.data.email
            });
            setIsVerified(true);
            showNotification("Student identity verified via Banner.", "success");
        } catch (err) {
            showNotification("Banner ID not found.", "error");
        } finally {
            setIsValidating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-[#A10022] p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 hover:bg-white/20 p-2 rounded-full transition-colors"><X size={20} /></button>
                    <h2 className="text-2xl font-black flex items-center gap-3"><UserPlus size={28} /> Add New User</h2>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); /* ... handleSubmit logic ... */ }} className="p-10 space-y-6">
                    {/* Role & Banner ID Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold"
                                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="STUDENT">Student</option>
                                <option value="EMPLOYER">Employer</option>
                                <option value="STAFF">Staff</option>
                            </select>
                        </div>

                        {formData.role === 'STUDENT' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner ID</label>
                                <div className="relative">
                                    <input 
                                        className={`w-full pl-4 pr-12 py-3 bg-gray-50 border rounded-2xl font-mono font-bold transition-all ${isVerified ? 'border-green-500 ring-4 ring-green-500/10' : 'border-gray-200'}`}
                                        value={formData.bannerId} 
                                        onChange={e => setFormData({...formData, bannerId: e.target.value.replace(/\D/g, '')})} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={checkBanner}
                                        disabled={isValidating}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#A10022] hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {isValidating ? <Loader2 className="animate-spin" size={18} /> : <SearchCheck size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Details - Read-only if verified to ensure data integrity */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                            <input required disabled={isVerified} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input required disabled={isVerified} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl disabled:bg-gray-100 disabled:text-gray-500"
                                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">University Email</label>
                        <input required disabled={isVerified} type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl disabled:bg-gray-100 disabled:text-gray-500 font-medium"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-[#A10022] text-white py-4 rounded-[1.5rem] font-black shadow-xl hover:bg-red-800 transition-all flex justify-center items-center gap-2">
                        <UserPlus size={20} /> Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AddUserModal;