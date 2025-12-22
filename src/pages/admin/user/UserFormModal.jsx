import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Mail, Shield, Hash, Loader2, SearchCheck } from 'lucide-react';
import apiClient from '../../../api/ApiClient';

const UserFormModal = ({ isOpen, onClose, onUserSaved, showNotification, initialData = null }) => {
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', role: 'STUDENT', bannerId: ''
    });
    const [loading, setLoading] = useState(false);

    // Sync form state when initialData changes (Opening the modal for a specific user)
    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                role: initialData.role || 'STUDENT',
                bannerId: initialData.bannerId || ''
            });
        } else {
            setFormData({ firstName: '', lastName: '', email: '', role: 'STUDENT', bannerId: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                // Update existing user
                await apiClient.put(`/admin/users/${initialData.id}`, formData);
                showNotification(`Updated ${formData.firstName} successfully.`, "success");
            } else {
                // Create new user
                await apiClient.post('/admin/users', formData);
                showNotification(`Created account for ${formData.firstName}.`, "success");
            }
            onUserSaved(); // Refresh the table in parent
            onClose();
        } catch (err) {
            // Global interceptor handles the message, but we stop loading here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
                {/* Dynamic Header */}
                <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-[#A10022]'} p-8 text-white relative transition-colors duration-500`}>
                    <button onClick={onClose} className="absolute top-6 right-6 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        {isEditMode ? <Save size={28} /> : <UserPlus size={28} />}
                        {isEditMode ? 'Update User Profile' : 'Add New User'}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                        {isEditMode ? `Modifying system permissions for ${initialData.email}` : 'Provision a new identity for EWU Career Services.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                            <input required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
                                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (SSO Anchor)</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input required type="email" 
                                disabled={isEditMode} // Usually prevent email changes to keep SSO linked
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl disabled:opacity-50"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-bold"
                                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="STUDENT">Student</option>
                                    <option value="EMPLOYER">Employer</option>
                                    <option value="FACULTY">Faculty</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner ID</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl font-mono font-bold"
                                    value={formData.bannerId} 
                                    onChange={e => setFormData({...formData, bannerId: e.target.value.replace(/\D/g, '')})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button disabled={loading} type="submit" 
                            className={`w-full ${isEditMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#A10022] hover:bg-red-800'} text-white py-4 rounded-[1.5rem] font-black shadow-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditMode ? <Save size={20} /> : <UserPlus size={20} />)}
                            {isEditMode ? "Save Changes" : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;