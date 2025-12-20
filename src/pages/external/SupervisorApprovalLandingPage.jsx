import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, Send } from 'lucide-react';

const SupervisorApprovalLandingPage = () => {
  const { experienceId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Secure token from email link

  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState(null);
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch experience details using the token for authentication context
    const fetchExperience = async () => {
      try {
        const response = await fetch(`/api/workflow/details?token=${token}`);
        if (!response.ok) throw new Error('Invalid or expired link.');
        const data = await response.json();
        setExperience(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchExperience();
    else setError("Missing authorization token.");
  }, [token]);

  //'APPROVED' | 'REJECTED'
  const handleSubmit = async (decision) => {
    try {
      const response = await fetch('/api/workflow/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status: decision, comments }),
      });

      if (!response.ok) throw new Error('Failed to submit decision.');
      setSubmitted(true);
      setStatus(decision);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Clock className="animate-spin text-red-600" /></div>;
  if (error) return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
      <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
      <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
      <p className="text-red-700 mt-2">{error}</p>
    </div>
  );

  if (submitted) return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-xl text-center border-t-4 border-green-500">
      <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
      <h2 className="text-2xl font-bold">Thank You</h2>
      <p className="text-gray-600 mt-2">Your decision has been recorded for <strong>{experience?.studentName}</strong>.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* EWU Branding Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#A10022] p-2 rounded">
          <div className="w-6 h-6 bg-white rounded-sm" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Applied Learning Approval</h1>
      </div>

      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b p-6">
          <h2 className="text-lg font-semibold">Review Experience Request</h2>
          <p className="text-sm text-gray-500">Please verify the details provided by the student below.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Experience Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Student</p>
              <p className="font-medium text-gray-900">{experience?.studentName}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Type</p>
              <span className="inline-block px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold">
                {experience?.type}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 uppercase text-xs font-bold tracking-wider">Title/Project</p>
              <p className="font-medium text-gray-900">{experience?.title}</p>
            </div>
          </div>

          <hr />

          {/* Decision Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">Comments (Optional)</label>
            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              rows={4}
              placeholder="Provide any feedback or requirements for approval..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => handleSubmit('APPROVED')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle size={20} /> Approve
            </button>
            <button
              onClick={() => handleSubmit('REJECTED')}
              className="flex-1 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <XCircle size={20} /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorApprovalLandingPage;