import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, Briefcase, MapPin, DollarSign, 
  FileText, Calendar, Wallet, CheckSquare, 
  Tag,
  CheckCircle
} from 'lucide-react';
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
    requirements: "",
    location: "",
    salaryRange: "",
    fundingSource: "State", // Default to 'State' or 'Grant'
    deadline: "",
    onCampus: true
  });

  const categories = ["Technical", "Administrative", "Creative", "Healthcare", "Education", "General"];
  const fundingOptions = ["State", "Grant", "Federal Work-Study", "Private", "Departmental"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/employer/dashboard/create', formData);
      showNotification("Job posted successfully!", "success");
      navigate('/employer/my-jobs');
    } catch (err) {
      showNotification("Failed to post job. Please check your inputs.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black italic text-gray-900 tracking-tight">Create New Position</h1>
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
          
          {/* Row 1: Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormInput 
              label="Job Title" 
              icon={<Briefcase size={16}/>}
              value={formData.title} 
              onChange={(v) => setFormData({...formData, title: v})} 
              placeholder="e.g. Student Research Assistant"
              required
            />
            <FormSelect 
              label="Category"
              icon={<Tag size={16}/>}
              options={categories}
              value={formData.category}
              onChange={(v) => setFormData({...formData, category: v})}
            />
          </div>

          {/* Row 2: Logistics & On-Campus Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <FormInput 
              label="Location" 
              icon={<MapPin size={16}/>}
              value={formData.location} 
              onChange={(v) => setFormData({...formData, location: v})} 
              placeholder="e.g. JFK Library"
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={14}/> Job Type
              </label>
              <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, onCampus: true})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.onCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  On-Campus
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, onCampus: false})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.onCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  Off-Campus
                </button>
              </div>
            </div>
            <FormInput 
              label="Application Deadline" 
              type="date"
              icon={<Calendar size={16}/>}
              value={formData.deadline} 
              onChange={(v) => setFormData({...formData, deadline: v})} 
              required
            />
          </div>

          {/* Row 3: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormInput 
              label="Salary / Pay Rate" 
              icon={<DollarSign size={16}/>}
              value={formData.salaryRange} 
              onChange={(v) => setFormData({...formData, salaryRange: v})} 
              placeholder="e.g. $16.50/hr"
            />
            <FormSelect 
              label="Funding Source"
              icon={<Wallet size={16}/>}
              options={fundingOptions}
              value={formData.fundingSource}
              onChange={(v) => setFormData({...formData, fundingSource: v})}
            />
          </div>

          {/* Row 4: Descriptions */}
          <div className="space-y-8">
            <FormTextArea 
              label="Job Description" 
              icon={<FileText size={16}/>}
              value={formData.description}
              onChange={(v) => setFormData({...formData, description: v})}
              placeholder="Summarize the core duties of the role..."
              required
            />
            <FormTextArea 
              label="Requirements & Qualifications" 
              icon={<CheckCircle size={16}/>}
              value={formData.requirements}
              onChange={(v) => setFormData({...formData, requirements: v})}
              placeholder="List required skills, minimum GPA, or specific certifications..."
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Discard
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200 flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? "Processing..." : <><Save size={18}/> Post Job</>}
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- Reusable Form Components --- */

const FormInput = ({ label, icon, value, onChange, placeholder, required, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label} {required && <span className="text-[#A10022]">*</span>}
    </label>
    <input 
      type={type}
      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#A10022]/10"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const FormSelect = ({ label, icon, options, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    <select 
      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#A10022]/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const FormTextArea = ({ label, icon, value, onChange, placeholder, required }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label} {required && <span className="text-[#A10022]">*</span>}
    </label>
    <textarea 
      className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#A10022]/10 min-h-[120px]"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

export default JobPostingForm;