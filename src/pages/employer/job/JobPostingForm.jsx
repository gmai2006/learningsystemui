import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Briefcase, MapPin, DollarSign, FileText, CheckCircle } from 'lucide-react';

import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const JobPostingForm = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "General",
        description: "",
        location: "Remote",
        salaryRange: "",
        requirements: ""
    });

    const categories = ["Technical", "Administrative", "Creative", "Healthcare", "Education", "General"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/employer/jobs/create', formData);
            showNotification("Job posted successfully!", "success");
            navigate('/employer/my-jobs');
        } catch (err) {
            showNotification("Failed to post job. Please check your inputs.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black italic text-gray-900 tracking-tight">Create New Position</h1>
                <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">

                    {/* Section 1: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Job Title"
                            icon={<Briefcase size={16} />}
                            value={formData.title}
                            onChange={(v) => setFormData({ ...formData, title: v })}
                            placeholder="e.g. Senior Software Engineer"
                            required
                        />

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                Category
                            </label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#A10022]/10 appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Location"
                            icon={<MapPin size={16} />}
                            value={formData.location}
                            onChange={(v) => setFormData({ ...formData, location: v })}
                            placeholder="e.g. Cheney, WA (Hybrid)"
                        />
                        <FormInput
                            label="Salary Range"
                            icon={<DollarSign size={16} />}
                            value={formData.salaryRange}
                            onChange={(v) => setFormData({ ...formData, salaryRange: v })}
                            placeholder="e.g. $25/hr or $50k - $70k"
                        />
                    </div>

                    {/* Requirements Area */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle size={14} /> Candidate Requirements
                        </label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#A10022]/10 min-h-[150px]"
                            placeholder="List required skills, certifications, or experience..."
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        />
                    </div>
                    {/* Section 3: Detailed Content */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Job Description
                        </label>
                        <textarea
                            className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#A10022]/10 min-h-[200px]"
                            placeholder="Describe the role, responsibilities, and day-to-day tasks..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200 flex items-center gap-3"
                    >
                        {loading ? "Posting..." : <><Save size={18} /> Post Job</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

const FormInput = ({ label, icon, value, onChange, placeholder, required }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#A10022]/10"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
        />
    </div>
);

export default JobPostingForm;