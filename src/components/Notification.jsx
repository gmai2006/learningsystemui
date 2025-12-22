const Notification = ({ notification }) => {
    const styles = {
        success: "bg-emerald-500 border-emerald-600",
        error: "bg-[#A10022] border-red-800",
        warning: "bg-amber-500 border-amber-600", // New Warning Style
        info: "bg-blue-500 border-blue-600"
    };

    return (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl text-white shadow-2xl border-b-4 animate-in slide-in-from-right duration-300 z-[999] ${styles[notification.type]}`}>
            <span className="font-bold text-sm">{notification.message}</span>
        </div>
    );
};
export default Notification;