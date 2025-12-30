import { 
  Briefcase, MapPin, Send, X, ShieldCheck, 
  Building2, Globe, ExternalLink, Target, CheckCircle2 
} from "lucide-react";
import { formatDate } from "../../../utils/util";

const ApplicationDetailModal = ({ app, onClose }) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Branding & Title */}
        <div className="p-8 pb-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Application Details</span>
              {app.isOnCampus && (
                <span className="bg-[#A10022]/10 text-[#A10022] text-[8px] font-black px-2 py-0.5 rounded-full uppercase">On-Campus</span>
              )}
            </div>
            <h2 className="text-3xl font-black text-gray-900 italic tracking-tight uppercase leading-none mt-1">
              {app.jobTitle}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm font-black text-gray-600 uppercase flex items-center gap-1.5">
                <Building2 size={14} className="text-gray-400" /> {app.companyName}
              </p>
              <span className="text-gray-300">•</span>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <MapPin size={14} /> {app.location}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-2xl shadow-sm border border-gray-100 transition-all text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          
          {/* Status & Employer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Card */}
            <div className="p-6 bg-gray-900 text-white rounded-[2rem] shadow-xl shadow-gray-200">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Submission Status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${app.applicationStatus === 'APPROVED' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  <span className="text-lg font-black italic uppercase tracking-tighter">{app.applicationStatus}</span>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 uppercase font-bold">Applied On</p>
                  <p className="text-[10px] font-bold">{formatDate(app.appliedAt)}</p>
                </div>
              </div>
            </div>

            {/* Employer Quick Card */}
            <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Employer Industry</p>
                <p className="text-xs font-black text-gray-700 uppercase italic">{app.companyIndustry || "General Industry"}</p>
              </div>
              {app.companyWebsite && (
                <a 
                  href={app.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-[10px] font-black text-[#A10022] uppercase hover:underline"
                >
                  <Globe size={12} /> Visit Website <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={14} className="text-[#A10022]" /> Job Description
            </h3>
            <div className="p-6 bg-gray-50 rounded-3xl text-sm text-gray-600 leading-relaxed italic border border-gray-100">
              {app.jobDescription}
            </div>
          </div>

          {/* Learning Objectives (if internship) */}
          {app.learningObjectives?.length > 0 && (
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} className="text-[#A10022]" /> Agreed Learning Objectives
              </h3>
              <div className="grid gap-2">
                {app.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                    <span className="text-xs font-bold text-emerald-900 italic">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student's Notes */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Send size={14} className="text-[#A10022]" /> Your Submission Note
            </h3>
            <div className="p-6 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-sm text-gray-500 italic leading-relaxed">
                "{app.studentNotes || "No notes provided with this application."}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-bold uppercase">Verified Application</span>
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] hover:scale-105 transition-all shadow-lg shadow-gray-200"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;