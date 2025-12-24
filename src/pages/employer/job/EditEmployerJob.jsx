import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, Briefcase, MapPin, DollarSign, 
  FileText, Calendar, Wallet, CheckSquare, 
  ChevronLeft, CheckCircle, Tag, Power
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const EditEmployerJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state mapped to the JobPosting Entity structure
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    category: "General",
    location: "",
    salaryRange: "",
    fundingSource: "State",
    deadline: "",
    isOnCampus: true,
    isActive: true
  });

  const categories = ["Technical", "Administrative", "Creative", "Healthcare", "Education", "General"];
  const fundingOptions = ["State", "Grant", "Federal Work-Study", "Private", "Departmental"];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get(`/employer/dashboard/${jobId}/details`);
        const data = res.data;

        // --- Date Array to String Transformation ---
        let cleanDeadline = "";
        if (Array.isArray(data.deadline)) {
          const [year, month, day] = data.deadline;
          cleanDeadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          requirements: data.requirements || "",
          category: data.category || "General",
          location: data.location || "",
          salaryRange: data.salaryRange || "",
          fundingSource: data.fundingSource || "State",
          deadline: cleanDeadline,
          isOnCampus: data.onCampus ?? true, // Entity uses isOnCampus
          isActive: data.isActive ?? true
        });
      } catch (err) {
        showNotification("Failed to load job details", "error");
        navigate('/employer/my-jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/employer/dashboard/jobs/${jobId}/update`, formData);
      showNotification("Posting updated successfully!", "success");
      navigate(`/employer/my-jobs/view/${jobId}`);
    } catch (err) {
      showNotification("Failed to update job.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center animate-pulse">
        <div className="text-gray-300 font-black uppercase tracking-[0.3em] text-xl">Hydrating Portal...</div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#A10022] transition-colors"
        >
          <ChevronLeft size={16} /> Discard Changes
        </button>
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black italic text-gray-900 tracking-tight">Edit Position</h1>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${formData.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {formData.isActive ? 'Status: Active' : 'Status: Closed'}
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
          
          {/* Section 1: Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Job Title" icon={<Briefcase size={16}/>}>
              <input 
                className="form-input-eagle"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required
              />
            </FormGroup>

            <FormGroup label="Category" icon={<Tag size={16}/>}>
              <select 
                className="form-input-eagle"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </FormGroup>
          </div>

          {/* Section 2: Location, Campus Toggle, Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <FormGroup label="Location" icon={<MapPin size={16}/>}>
              <input 
                className="form-input-eagle"
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </FormGroup>

            <FormGroup label="Job Type" icon={<CheckSquare size={16}/>}>
              <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 h-[58px]">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isOnCampus: true})}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.isOnCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  On-Campus
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isOnCampus: false})}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.isOnCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  Off-Campus
                </button>
              </div>
            </FormGroup>

            <FormGroup label="Application Deadline" icon={<Calendar size={16}/>}>
              <input 
                type="date"
                className="form-input-eagle"
                value={formData.deadline} 
                onChange={(e) => setFormData({...formData, deadline: e.target.value})} 
                required
              />
            </FormGroup>
          </div>

          {/* Section 3: Salary & Funding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Salary / Pay Rate" icon={<DollarSign size={16}/>}>
              <input 
                className="form-input-eagle"
                value={formData.salaryRange} 
                onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} 
              />
            </FormGroup>

            <FormGroup label="Funding Source" icon={<Wallet size={16}/>}>
              <select 
                className="form-input-eagle"
                value={formData.fundingSource}
                onChange={(e) => setFormData({...formData, fundingSource: e.target.value})}
              >
                {fundingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </FormGroup>
          </div>

          {/* Section 4: Descriptions & Visibility */}
          <div className="space-y-8">
            <FormGroup label="Detailed Description" icon={<FileText size={16}/>}>
              <textarea 
                className="form-textarea-eagle min-h-[180px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </FormGroup>

            <FormGroup label="Candidate Requirements" icon={<CheckCircle size={16}/>}>
              <textarea 
                className="form-textarea-eagle min-h-[120px]"
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                required
              />
            </FormGroup>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-black italic text-gray-900">Post Visibility</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unchecking this will hide the job from the student portal.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border
                        ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                >
                    <Power size={14} /> {formData.isActive ? 'Publicly Live' : 'Draft / Closed'}
                </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-4">
          <button 
            type="submit"
            disabled={saving}
            className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200 flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : <><Save size={18}/> Update Posting</>}
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- Internal UI Wrappers --- */
const FormGroup = ({ label, icon, children }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

// Global Styles (to be added to your index.css or Tailwind config)
// .form-input-eagle { @apply w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#A10022]/10 transition-all; }
// .form-textarea-eagle { @apply w-full bg-gray-50 border border-gray-100 rounded-[2rem] px-6 py-5 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#A10022]/10 transition-all; }

export default EditEmployerJob;