import React, { useState } from 'react';
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Info, 
  Save, 
  X 
} from 'lucide-react';

const JobPostingForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingSource: 'NON_WORK_STUDY',
    isOnCampus: false,
    location: '', // Explicitly initialized for mapping to job_postings table
    deadline: '',
    requirements: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to post job');
      
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Form Header */}
      <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-[#A10022]" size={24} />
            Post New Opportunity
          </h2>
          <p className="text-sm text-gray-500 mt-1">Recruit EWU talent for on-campus or external roles.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Core Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
            <input
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="e.g. Student Research Assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              required
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Describe roles, responsibilities, and specific learning outcomes..."
            />
          </div>
        </div>

        {/* EWU Business Logic: Funding & Campus Location Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-red-50 rounded-xl border border-red-100">
          <div>
            <label className="block text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
              <DollarSign size={16} /> Funding Source
            </label>
            <select
              name="fundingSource"
              value={formData.fundingSource}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-red-500"
            >
              <option value="NON_WORK_STUDY">Non-Work Study (Standard)</option>
              <option value="WORK_STUDY">Federal Work Study (FWS)</option>
              <option value="HOURLY">Hourly / Stipend</option>
            </select>
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isOnCampus"
                  checked={formData.isOnCampus}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${formData.isOnCampus ? 'bg-[#A10022]' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isOnCampus ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="text-sm font-semibold text-red-900">On-Campus Position</span>
            </label>
            <p className="text-[10px] text-red-700 mt-2 italic">Select for positions located at Cheney, Spokane, or regional sites.</p>
          </div>
        </div>

        {/* Logistics Section: New Location Field Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <MapPin size={16} className="text-[#A10022]" /> Location
            </label>
            <input
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Cheney Campus, JFK Library, or Remote"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Calendar size={16} /> Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#A10022] hover:bg-red-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md disabled:bg-gray-400"
          >
            {loading ? 'Posting...' : <><Save size={20} /> Post Job Opportunity</>}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostingForm;