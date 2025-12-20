import React, { useState, useEffect } from 'react';
import { Check, X, Eye, ShieldCheck } from 'lucide-react';

const StaffJobOversight = () => {
  const [postings, setPostings] = useState([]);

  useEffect(() => {
    // In production: fetch('/api/jobs/admin/all')
    setPostings([
      { id: 1, title: 'Software Intern', employer: 'Spokane Tech', status: 'PENDING', source: 'NON_WORK_STUDY' },
      { id: 2, title: 'Lab Assistant', employer: 'EWU Biology', status: 'ACTIVE', source: 'WORK_STUDY' },
    ]);
  }, []);

  const handleAction = async (id, action) => {
    // Calls JobPostingResource.toggleStatus
    console.log(`Job ${id} status set to: ${action}`);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 border-b">
        <h3 className="text-lg font-bold">Global Job Oversight</h3>
        <p className="text-sm text-gray-500">Review and moderate all campus and partner postings.</p>
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
          <tr>
            <th className="px-6 py-4">Position</th>
            <th className="px-6 py-4">Employer</th>
            <th className="px-6 py-4">Funding</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y text-sm">
          {postings.map(job => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">{job.title}</td>
              <td className="px-6 py-4">{job.employer}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${job.source === 'WORK_STUDY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job.source}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`flex items-center gap-1.5 ${job.status === 'PENDING' ? 'text-amber-600' : 'text-green-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'PENDING' ? 'bg-amber-600' : 'bg-green-600'}`} />
                  {job.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <button onClick={() => handleAction(job.id, 'ACTIVE')} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Approve">
                  <Check size={18} />
                </button>
                <button onClick={() => handleAction(job.id, 'INACTIVE')} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Reject/Close">
                  <X size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffJobOversight;