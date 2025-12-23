import { Briefcase, MapPin, Send, X } from "lucide-react";
import { formatDate } from "../../../utils/util";

const ApplicationDetailModal = ({ app, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header - Branding & Title */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#A10022] uppercase tracking-[0.2em]">Application Details</span>
            <h2 className="text-3xl font-black text-gray-900 italic">{app.jobTitle}</h2>
            <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
              <MapPin size={14} /> {app.location}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Progress</p>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${app.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-[#A10022]'}`} />
                <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{app.status}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submitted On</p>
              <p className="text-xs font-bold text-gray-900">{formatDate(app.createdAt)}</p>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-[#A10022]" /> Position Description
            </h3>
            <div className="prose prose-sm text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-6">
              {app.description}
            </div>
          </div>

          {/* Student's Notes Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Send size={16} className="text-[#A10022]" /> Your Application Notes
            </h3>
            <div className="p-6 bg-[#A10022]/5 rounded-3xl border border-[#A10022]/10">
              <p className="text-sm text-gray-700 italic leading-relaxed font-medium">
                "{app.notes || "No notes provided with this application."}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#A10022] transition-all"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;