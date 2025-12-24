import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, BookOpen, Star, FileText,
  ChevronLeft, CheckCircle, XCircle, Calendar, Send,
  Globe, Linkedin, Github, Download
} from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

/* --- New Tooltip Component --- */
const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap z-50 shadow-xl animate-in fade-in zoom-in duration-200">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

const CandidateReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const res = await apiClient.get(`/employer/dashboard/applicants/${applicationId}/full-profile`);
        setData(res.data);
      } catch (err) {
        showNotification("Error loading candidate profile", "error");
        navigate('/employer/applicants');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, [applicationId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await apiClient.patch(`/employer/dashboard/applicants/${applicationId}/status?newStatus=${newStatus}`);
      setData({ ...data, status: newStatus });
      showNotification(`Application updated to ${newStatus}`, "success");
    } catch (err) {
      showNotification("Failed to update status", "error");
    }
  };

  const handleDownloadResume = async () => {
    try {
      const response = await apiClient.get(
        `/employer/dashboard/applicants/${applicationId}/resume`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `${data.studentName.replace(/\s+/g, '_')}_Resume.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("Resume downloaded successfully", "success");
    } catch (err) {
      showNotification("Could not download resume", "error");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-gray-300 uppercase tracking-widest">Loading Candidate Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Tooltip text="Return to Pool">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#A10022] transition-colors"
          >
            <ChevronLeft size={16} /> Back to Applicant Pool
          </button>
        </Tooltip>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status:</span>
          <StatusIndicator status={data.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Identity Card */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-10">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              {data.profilePicture ? (
                <img src={data.profilePicture} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><User size={48} /></div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-black italic text-gray-900 tracking-tight leading-none">{data.studentName}</h1>
                <p className="text-lg font-bold text-[#A10022] mt-1 italic">{data.major}</p>
              </div>
              <div className="flex flex-wrap gap-6">
                <InfoItem icon={<Mail size={14} />} label="Email" value={data.email} tooltip="Student Contact Email" />
                <InfoItem icon={<Star size={14} />} label="GPA" value={data.gpa?.toFixed(2)} tooltip="Cumulative GPA" />
                <InfoItem icon={<Calendar size={14} />} label="Class Of" value={data.graduationYear} tooltip="Expected Graduation" />
              </div>

              {/* Social Link Tooltips */}
              <div className="flex gap-4 mt-6">
                {data.linkedinUrl && (
                  <Tooltip text="LinkedIn Profile">
                    <a href={data.linkedinUrl} target="_blank" rel="noreferrer"
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                      <Linkedin size={20} />
                    </a>
                  </Tooltip>
                )}
                {data.portfolioUrl && (
                  <Tooltip text="Career Portfolio">
                    <a href={data.portfolioUrl} target="_blank" rel="noreferrer"
                      className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                      <Globe size={20} />
                    </a>
                  </Tooltip>
                )}
                {data.githubUrl && (
                  <Tooltip text="GitHub Repositories">
                    <a href={data.githubUrl} target="_blank" rel="noreferrer"
                      className="p-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                      <Github size={20} />
                    </a>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h2 className="text-2xl font-black italic text-gray-900 tracking-tight flex items-center gap-3">
              <BookOpen size={24} className="text-[#A10022]" /> Candidate Background
            </h2>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statement of Interest</label>
              <p className="text-gray-600 leading-relaxed font-medium bg-gray-50 p-8 rounded-[2rem]">
                {data.bio || "No bio provided by student."}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-8">
            <h3 className="text-xl font-black italic tracking-tight">Hiring Workflow</h3>
            <div className="space-y-4">
              <WorkflowButton
                active={data.status === 'INTERVIEW_SCHEDULED'}
                onClick={() => handleStatusChange('INTERVIEW_SCHEDULED')}
                icon={<Calendar size={18} />}
                label="Move to Interview"
                color="hover:bg-blue-600"
                tooltip="Schedule Interview Stage"
              />
              <WorkflowButton
                active={data.status === 'OFFER_EXTENDED'}
                onClick={() => handleStatusChange('OFFER_EXTENDED')}
                icon={<Send size={18} />}
                label="Extend Offer"
                color="hover:bg-emerald-600"
                tooltip="Send Official Job Offer"
              />
              <WorkflowButton
                active={data.status === 'REJECTED'}
                onClick={() => handleStatusChange('REJECTED')}
                icon={<XCircle size={18} />}
                label="Reject Candidate"
                color="hover:bg-red-600"
                tooltip="Decline Application"
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black italic text-gray-900 tracking-tight">Documents</h3>
            {data.resumeUrl ? (
              <Tooltip text="Download Student Resume">
                <button
                  onClick={handleDownloadResume}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#A10022] hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-gray-400 group-hover:text-[#A10022]" size={20} />
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Student Resume</p>
                      <span className="font-bold text-sm text-gray-700 break-all">{data.resumeUrl.split('/').pop()}</span>
                    </div>
                  </div>
                  <Download className="text-gray-300 group-hover:text-[#A10022]" size={20} />
                </button>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 opacity-60">
                <XCircle className="text-gray-300" size={20} />
                <span className="font-bold text-sm text-gray-400 italic">No resume uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Updated Sub-components with Tooltip Support */

const InfoItem = ({ icon, label, value, tooltip }) => (
  <Tooltip text={tooltip}>
    <div className="flex items-center gap-2">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-sm font-bold text-gray-700">{value || 'N/A'}</p>
      </div>
    </div>
  </Tooltip>
);

const WorkflowButton = ({ label, icon, onClick, active, color, tooltip }) => (
  <Tooltip text={tooltip}>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
        ${active ? 'bg-white text-gray-900' : `bg-white/5 text-white/70 ${color} hover:text-white`}`}
    >
      {icon} {label}
    </button>
  </Tooltip>
);

const StatusIndicator = ({ status }) => {
  const colors = {
    PENDING: 'bg-amber-50 text-amber-600',
    INTERVIEW_SCHEDULED: 'bg-blue-50 text-blue-600',
    OFFER_EXTENDED: 'bg-emerald-50 text-emerald-600',
    REJECTED: 'bg-red-50 text-red-600'
  };
  return (
    <Tooltip text="Current Application Phase">
      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${colors[status] || 'bg-gray-100'}`}>
        {status?.replace('_', ' ')}
      </span>
    </Tooltip>
  );
};

export default CandidateReview;