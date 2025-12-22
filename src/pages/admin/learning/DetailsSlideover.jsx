import React from 'react';
import { X, Info, Calendar, Building2, User, Hash, CheckCircle2, Clock } from 'lucide-react';
import { FileDown, Loader2 } from 'lucide-react';
import apiClient from '../../../api/ApiClient';

const DetailsSlideover = ({ isOpen, experience, onClose }) => {
    const [isDownloading, setIsDownloading] = React.useState(false);

    if (!isOpen || !experience) return null;

    // Helper to turn "mentor_name" into "Mentor Name"
    const formatKey = (key) => key.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            const response = await apiClient.get(`/admin/applied-learning/${experience.id}/pdf`, {
                responseType: 'blob' // Essential for binary data
            });

            // Create a local URL for the PDF blob and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Verification_${experience.title.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("PDF Download failed", err);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen || !experience) return null;

    const metadata = experience.typeSpecificData || {};

    return (
        <div className="fixed inset-0 z-[120] overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out animate-in slide-in-from-right">
                    <div className="flex h-full flex-col bg-white shadow-2xl border-l border-gray-100">

                        {/* Header */}
                        <div className="bg-[#A10022] p-6 text-white">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Info size={24} /> Experience Details
                                </h2>
                                <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-red-100 text-sm mt-1 uppercase tracking-widest font-bold">
                                {experience.type}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* Core Info Section */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Core Information</h3>
                                <div className="space-y-3">
                                    <DetailRow icon={Building2} label="Organization" value={experience.organizationName} />
                                    <DetailRow icon={User} label="Student ID" value={experience.studentId} />
                                    <DetailRow icon={Calendar} label="Dates" value={`${experience.startDate || ''} to ${experience.endDate || ''}`} />
                                    <DetailRow icon={Hash} label="Canvas ID" value={experience.canvasCourseId || 'Not Linked'} />
                                </div>
                            </section>

                            {/* Dynamic Metadata Section (JSONB) */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">
                                    Type-Specific Data ({experience.type})
                                </h3>
                                <div className="grid grid-cols-1 gap-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50">
                                    {Object.entries(metadata).length > 0 ? (
                                        Object.entries(metadata).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{formatKey(key)}</p>
                                                <p className="text-sm font-black text-gray-800">{value.toString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 italic text-center py-2">No additional metadata found.</p>
                                    )}
                                </div>
                            </section>

                            {/* Verification Status */}
                            <div className={`p-4 rounded-2xl flex items-center gap-4 border ${experience.isVerified ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                                {experience.isVerified ? <CheckCircle2 className="text-green-600" /> : <Clock className="text-amber-500" />}
                                <div>
                                    <p className="text-xs font-bold text-gray-900">{experience.isVerified ? 'Verified' : 'Pending Verification'}</p>
                                    <p className="text-[10px] text-gray-500">{experience.verifiedAt || 'No timestamp available'}</p>
                                </div>
                            </div>

                            {/* PDF Action Section */}
                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-dashed border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900">Official Document</h4>
                                        <p className="text-[10px] text-gray-500">Generate a verified record for student portfolios.</p>
                                    </div>
                                    <button
                                        onClick={handleDownloadPdf}
                                        disabled={isDownloading}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                                    >
                                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                                        {isDownloading ? "Generating..." : "Download PDF"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        {!experience.verified && (
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all flex justify-center items-center gap-2">
                                    Approve & Verify Submission
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for clean rows
const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="text-gray-300 mt-1" size={18} />
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
            <p className="text-sm font-black text-gray-800">{value || 'N/A'}</p>
        </div>
    </div>
);

export default DetailsSlideover;