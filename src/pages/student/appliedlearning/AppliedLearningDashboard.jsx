import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  FileText, 
  Info, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const AppliedLearningDashboard = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    organizationName: '',
    startDate: '',
    endDate: '',
    approverEmail: '',
    approverName: '',
    typeSpecificData: {}
  });

  // The 16 distinct learning types required by EWU
  const learningTypes = [
    'INTERNSHIP', 'PRACTICUM', 'CLINICAL', 'CO_OP', 
    'STUDENT_EMPLOYMENT', 'RESEARCH', 'FIELD_WORK', 'FELLOWSHIP', 
    'STUDY_ABROAD', 'VOLUNTEERISM', 'COMMUNITY_PROJECT', 
    'SERVICE_LEARNING', 'CLASSROOM_SIMULATION', 'LAB_WORK', 
    'ARTS_PERFORMANCE', 'APPRENTICESHIP'
  ];

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setFormData({ ...formData, typeSpecificData: {} }); // Reset specific data on type change
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maps type-specific inputs based on the JSONB structure
  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'CLINICAL':
        return (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <label className="block text-sm font-medium text-blue-800">Hospital Unit / Clinical Site</label>
            <input 
              type="text" 
              className="mt-1 w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, typeSpecificData: { unit: e.target.value }})}
              placeholder="e.g. ICU, Pediatrics"
            />
          </div>
        );
      case 'RESEARCH':
        return (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <label className="block text-sm font-medium text-purple-800">Grant Number / Research Topic</label>
            <input 
              type="text" 
              className="mt-1 w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, typeSpecificData: { grant: e.target.value }})}
              placeholder="e.g. NSF-2025-01"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic to POST to /api/applied-learning/create and initiate workflow
    console.log("Submitting experience:", { ...formData, type: selectedType });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Applied Learning</h2>
          <p className="text-gray-500">Track and manage your 16 learning types here.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#A10022] hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <Plus size={20} /> New Experience
        </button>
      </div>

      {/* Submission Modal/Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Log New Experience</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Experience Type</label>
                  <select 
                    required
                    className="mt-1 w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500"
                    value={selectedType}
                    onChange={handleTypeChange}
                  >
                    <option value="">Select a type...</option>
                    {learningTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Project/Position Title</label>
                  <input name="title" required onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-lg" placeholder="e.g. Summer Software Intern" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                  <input name="startDate" type="date" required onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-lg" />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700">End Date (Expected)</label>
                  <input name="endDate" type="date" required onChange={handleInputChange} className="mt-1 w-full p-2.5 border rounded-lg" />
                </div>
              </div>

              {renderTypeSpecificFields()}

              <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2"><Send size={16} /> Approval Workflow</h4>
                <p className="text-xs text-gray-500 italic">An email will be sent to your supervisor for login-free approval.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="approverName" placeholder="Supervisor Name" required onChange={handleInputChange} className="p-2 text-sm border rounded bg-white" />
                  <input name="approverEmail" type="email" placeholder="Supervisor Email" required onChange={handleInputChange} className="p-2 text-sm border rounded bg-white" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#A10022] text-white font-bold py-3 rounded-lg hover:bg-red-800 transition-colors">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Cards - Simplified View of Existing Silos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <h4 className="font-bold">Interdisciplinary Research</h4>
            <p className="text-sm text-gray-500">EWU Biology Lab • Completed</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">RESEARCH</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 opacity-75">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock size={24} /></div>
          <div>
            <h4 className="font-bold">Community Project</h4>
            <p className="text-sm text-gray-500">Spokane Harvest • Pending Supervisor Approval</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">COMMUNITY_PROJECT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppliedLearningDashboard;