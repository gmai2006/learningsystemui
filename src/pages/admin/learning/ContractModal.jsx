import React from 'react';
import { 
    X, FileText, Target, ShieldCheck, 
    UserCheck, Clock, Building2, Download,
    CheckCircle
} from 'lucide-react';

const ContractModal = ({ intern, onClose }) => {
    // Note: In a real app, you might fetch specific contract details 
    // using intern.applicationId here.
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in" 
                onClick={onClose} 
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl">
                            <FileText size={24} className="text-red-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Learning Agreement</span>
                            <h2 className="text-xl font-black italic tracking-tight">{intern.studentName}</h2>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* 1. Placement Details Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoTile 
                            icon={<Building2 size={16} />} 
                            label="Host Organization" 
                            value={intern.companyName} 
                        />
                        <InfoTile 
                            icon={<Clock size={16} />} 
                            label="Academic Credits" 
                            value={`${intern.creditHours || 0} Units`} 
                        />
                    </div>

                    {/* 2. Learning Objectives Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <Target size={18} className="text-red-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Learning Objectives</h3>
                        </div>
                        <div className="grid gap-3">
                            {/* Example dynamic content */}
                            {["Apply theoretical knowledge in a clinical setting", 
                              "Develop professional communication skills with diverse patients",
                              "Master hospital-standard administration software"].map((obj, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-600">
                                    <span className="font-black text-red-500">{i + 1}.</span>
                                    {obj}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Employer Requirements Checklist */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Employer Requirements</h3>
                        </div>
                        <div className="space-y-2">
                            <RequirementCheck label="On-site professional supervision provided" checked={true} />
                            <RequirementCheck label="Safety and liability insurance verified" checked={true} />
                            <RequirementCheck label="Mid-term and Final evaluation commitment" checked={true} />
                            <RequirementCheck label="Workspace and necessary tools provided" checked={false} />
                        </div>
                    </div>

                    {/* 4. Contact Footer */}
                    <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl text-red-500 shadow-sm">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Site Supervisor</p>
                                <p className="text-xs font-bold text-gray-900">Dr. Sarah Jenkins (sarah.j@amazon.com)</p>
                            </div>
                        </div>
                        <button className="p-3 hover:bg-red-100 rounded-xl transition-colors text-red-600">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Close Preview
                    </button>
                    <button 
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-gray-200"
                    >
                        Sign & Validate
                    </button>
                </div>
            </div>
        </div>
    );
};

/* --- Helper Components --- */

const InfoTile = ({ icon, label, value }) => (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <div className="flex items-center gap-2 text-gray-400 mb-1">
            {icon}
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-black text-gray-900 italic">{value}</p>
    </div>
);

const RequirementCheck = ({ label, checked }) => (
    <div className="flex items-center justify-between p-3 px-4 bg-white border border-gray-100 rounded-xl">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        {checked ? (
            <CheckCircle size={16} className="text-emerald-500" />
        ) : (
            <div className="w-4 h-4 border-2 border-gray-200 rounded-full" />
        )}
    </div>
);

export default ContractModal;