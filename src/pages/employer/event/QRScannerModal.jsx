import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const QRScannerModal = ({ eventId, eventTitle, onClose, onRefresh }) => {
    const { showNotification } = useNotification();
    const [lastScanned, setLastScanned] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckIn = async (studentId) => {
        if (isProcessing || studentId === lastScanned) return;

        setIsProcessing(true);
        try {
            await apiClient.post(`/employer/events/${eventId}/check-in/${studentId}`);
            setLastScanned(studentId);
            showNotification("Student Checked In", "success");
            
            // Brief delay to prevent double-scanning the same code
            setTimeout(() => {
                setLastScanned(null);
                setIsProcessing(false);
            }, 2000);

            if (onRefresh) onRefresh();
        } catch (err) {
            showNotification(err.response?.data?.message || "Check-in failed", "error");
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md p-6">
            <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/10 text-white rounded-full hover:bg-[#A10022] transition-all"
            >
                <X size={24} />
            </button>

            <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl font-black text-white italic">Event <span className="text-[#A10022]">Check-In</span></h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{eventTitle}</p>
            </div>

            {/* Scanner Container */}
            <div className="relative w-full max-w-sm aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                <Scanner
                    onScan={(result) => {
                        if (result && result[0]?.rawValue) {
                            handleCheckIn(result[0].rawValue);
                        }
                    }}
                    onError={(error) => console.error(error)}
                    allowMultiple={true}
                    scanDelay={2000}
                    components={{
                        audio: true,
                        finder: true,
                    }}
                    styles={{
                        container: { width: '100%', height: '100%' }
                    }}
                />

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-[#A10022]/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                        <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center gap-3">
                            <CheckCircle className="text-[#A10022] animate-bounce" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Validating...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 flex items-center gap-3 text-white/40 italic">
                <RefreshCcw size={16} className="animate-spin-slow" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Scanner Active & Secure</p>
            </div>
        </div>
    );
};

export default QRScannerModal;