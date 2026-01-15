import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save, Briefcase, MapPin, DollarSign,
  FileText, Calendar, Wallet, CheckSquare,
  ChevronLeft, CheckCircle, Tag, Power,
  Plus, Trash2, Award // Added Plus and Trash2 for array management
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const EditEmployerJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [""], // Initialized as an array with one empty string
    category: "General",
    location: "",
    salaryRange: "",
    fundingSource: "State",
    deadline: "",
    isOnCampus: true,
    isActive: true,
    serviceHours: ""
  });

  const categories = ["Technical", "Administrative", "Creative", "Healthcare", "Education", "General", "Volunteer"];
  const fundingOptions = ["State", "Grant", "Federal Work-Study", "Private", "Departmental"];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await apiClient.get(`/employer/dashboard/${jobId}/details`);
        const data = res.data;

        let cleanDeadline = "";
        if (Array.isArray(data.deadline)) {
          const [year, month, day] = data.deadline;
          cleanDeadline = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          // Ensure requirements is an array; if empty or null, provide a default row
          requirements: Array.isArray(data.requirements) && data.requirements.length > 0 
                        ? data.requirements 
                        : [""],
          category: data.category || "General",
          location: data.location || "",
          salaryRange: data.salaryRange || "",
          fundingSource: data.fundingSource || "State",
          deadline: cleanDeadline,
          isOnCampus: data.onCampus ?? true,
          isActive: data.isActive ?? true,
          serviceHours: data.serviceHours || ""
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

  // --- Array Logic for Requirements ---
  const handleAddRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ""] });
  };

  const handleRequirementChange = (index, value) => {
    const newReqs = [...formData.requirements];
    newReqs[index] = value;
    setFormData({ ...formData, requirements: newReqs });
  };

  const handleRemoveRequirement = (index) => {
    const newReqs = formData.requirements.filter((_, i) => i !== index);
    // Maintain at least one input field
    setFormData({ ...formData, requirements: newReqs.length > 0 ? newReqs : [""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Filter out any empty requirement strings before sending to API
      const payload = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== "")
      };
      
      await apiClient.put(`/employer/dashboard/jobs/${jobId}/update`, payload);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Job Title" icon={<Briefcase size={16} />}>
              <input
                className="form-input-eagle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup label="Category" icon={<Tag size={16} />}>
              <select
                className="form-input-eagle"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </FormGroup>
          </div>

          {formData.category === 'Volunteer' && (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <FormGroup label="Service Hours Total" icon={<Award size={16} />}>
                <div className="relative">
                  <input
                    type="number"
                    className="form-input-eagle pr-16"
                    placeholder="e.g. 20"
                    value={formData.serviceHours}
                    onChange={(e) => setFormData({ ...formData, serviceHours: e.target.value })}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Hours</span>
                </div>
              </FormGroup>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <FormGroup label="Location" icon={<MapPin size={16} />}>
              <input
                className="form-input-eagle"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Job Type" icon={<CheckSquare size={16} />}>
              <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100 h-[58px]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnCampus: true })}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.isOnCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  On-Campus
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnCampus: false })}
                  className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.isOnCampus ? 'bg-white text-[#A10022] shadow-sm' : 'text-gray-400'}`}
                >
                  Off-Campus
                </button>
              </div>
            </FormGroup>

            <FormGroup label="Application Deadline" icon={<Calendar size={16} />}>
              <input
                type="date"
                className="form-input-eagle"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup label="Salary / Pay Rate" icon={<DollarSign size={16} />}>
              <input
                className="form-input-eagle"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              />
            </FormGroup>

            <FormGroup label="Funding Source" icon={<Wallet size={16} />}>
              <select
                className="form-input-eagle"
                value={formData.fundingSource}
                onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
              >
                {fundingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </FormGroup>
          </div>

          <div className="space-y-8">
            <FormGroup label="Detailed Description" icon={<FileText size={16} />}>
              <textarea
                className="form-textarea-eagle min-h-[180px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </FormGroup>

            {/* --- Updated Multi-Value Requirements Section --- */}
            <FormGroup label="Candidate Requirements" icon={<CheckCircle size={16} />}>
              <div className="space-y-3">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 group animate-in fade-in slide-in-from-left-1">
                    <input
                      className="form-input-eagle flex-1"
                      placeholder={`Requirement #${index + 1} (e.g. Valid Driver's License)`}
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      required={index === 0}
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="flex items-center gap-2 px-6 py-3 mt-2 text-[10px] font-black uppercase tracking-widest text-[#A10022] hover:bg-red-50 rounded-2xl transition-all w-fit"
                >
                  <Plus size={14} /> Add Another Requirement
                </button>
              </div>
            </FormGroup>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black italic text-gray-900">Post Visibility</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unchecking this will hide the job from the student portal.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border
                        ${formData.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
              >
                <Power size={14} /> {formData.isActive ? 'Publicly Live' : 'Draft / Closed'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200 flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : <><Save size={18} /> Update Posting</>}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormGroup = ({ label, icon, children }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-1">
      {icon} {label}
    </label>
    {children}
  </div>
);

export default EditEmployerJob;