import { Trash2 } from "lucide-react";

const DeleteConfirmModal = ({ isOpen, user, onConfirm, onClose, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
                <div className="w-20 h-20 bg-red-50 text-[#A10022] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Delete User?</h3>
                <p className="text-gray-500 text-sm mb-8">
                    Are you sure you want to remove <span className="font-bold text-gray-800">{user.firstName} {user.lastName}</span>? This action is permanent.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button 
                        onClick={() => onConfirm(user.id)} 
                        disabled={loading}
                        className="flex-1 py-3 font-bold bg-[#A10022] text-white rounded-xl hover:bg-red-800 transition-all disabled:opacity-50"
                    >
                        {loading ? "Deleting..." : "Yes, Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;