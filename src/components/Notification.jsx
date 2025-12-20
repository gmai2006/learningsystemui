import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({ notification }) => {
    if (!notification) return null;

    const styles = {
        success: 'bg-green-600 border-green-400',
        error: 'bg-red-600 border-red-400',
        info: 'bg-blue-600 border-blue-400'
    };

    return (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl text-white border-l-4 transition-all duration-500 transform translate-y-0 animate-in slide-in-from-right-full ${styles[notification.type] || styles.info}`}>
            <div className="flex-shrink-0">
                {notification.type === 'success' && <CheckCircle size={22} />}
                {notification.type === 'error' && <AlertCircle size={22} />}
                {notification.type === 'info' && <Info size={22} />}
            </div>
            
            <div className="flex-1">
                <p className="font-bold text-sm tracking-wide">
                    {notification.type.toUpperCase()}
                </p>
                <p className="text-sm opacity-90">{notification.message}</p>
            </div>

            {/* Visual indicator that it's a floating toast */}
            <div className="w-px h-8 bg-white/20 ml-2" />
        </div>
    );
};

export default Notification;