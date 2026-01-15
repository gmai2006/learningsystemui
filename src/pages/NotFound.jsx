import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, 
  ChevronLeft, 
  Home, 
  Search, 
  LifeBuoy 
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Visual Element */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#A10022]/5 blur-3xl rounded-full" />
          <div className="relative flex justify-center">
            <div className="p-8 bg-white rounded-[3rem] shadow-xl border border-gray-100">
              <Map size={80} className="text-[#A10022] stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-8xl font-black text-gray-900 italic tracking-tighter">404</h1>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest">
            Path <span className="text-[#A10022]">Not Found</span>
          </h2>
          <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed italic">
            It looks like this opportunity has moved or the link is broken. Let's get you back to your career journey.
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:border-[#A10022] hover:text-[#A10022] transition-all shadow-sm"
          >
            <ChevronLeft size={16} /> Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 p-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#A10022] transition-all shadow-xl shadow-gray-200"
          >
            <Home size={16} /> Dashboard
          </button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 flex flex-wrap justify-center gap-8 border-t border-gray-200">
          <HelpLink 
            icon={<Search size={14} />} 
            label="Search Jobs" 
            onClick={() => navigate('/student/jobs')} 
          />
          <HelpLink 
            icon={<LifeBuoy size={14} />} 
            label="Support Desk" 
            onClick={() => window.location.href = 'mailto:support@ewu.edu'} 
          />
        </div>
      </div>
    </div>
  );
};

const HelpLink = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
  >
    {icon} {label}
  </button>
);

export default NotFound;