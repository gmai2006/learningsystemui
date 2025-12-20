import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, GraduationCap, 
  Briefcase, Calendar, ClipboardCheck, Users, Settings, LogOut 
} from 'lucide-react';

const EWULayout = ({ children, userRole }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  userRole = 'STUDENT';
  
  // Navigation items mapped to RFP scope
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'FACULTY', 'STAFF', 'EMPLOYER'] },
    { name: 'Applied Learning', icon: GraduationCap, roles: ['STUDENT', 'FACULTY', 'STAFF'] },
    { name: 'Career Services', icon: Briefcase, roles: ['STUDENT', 'STAFF', 'EMPLOYER'] },
    { name: 'Approvals', icon: ClipboardCheck, roles: ['FACULTY', 'STAFF'] },
    { name: 'Events & Fairs', icon: Calendar, roles: ['STUDENT', 'STAFF', 'EMPLOYER'] },
    { name: 'Partnerships', icon: Users, roles: ['STAFF', 'EMPLOYER'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside 
        className={`bg-[#A10022] text-white transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* EWU Banner Section */}
        <div className="p-4 flex items-center border-b border-red-800">
          <div className="bg-white p-2 rounded-md min-w-[40px]">
             {/* EWU Logo Placeholder */}
            <div className="w-6 h-6 bg-red-600 rounded-sm" />
          </div>
          {!isCollapsed && (
            <span className="ml-3 font-bold text-lg tracking-tight whitespace-nowrap">
              EWU Portal
            </span>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4 px-3 space-y-2">
          {filteredMenu.map((item) => (
            <button
              key={item.name}
              className="w-full flex items-center p-3 rounded-lg hover:bg-red-800 transition-colors group"
              aria-label={item.name}
            >
              <item.icon size={24} className="shrink-0" />
              {!isCollapsed && <span className="ml-3 font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-4 border-t border-red-800 flex items-center justify-center hover:bg-red-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /> <span>Collapse</span></div>}
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Area */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Applied Learning Management
          </h1>
          
          <div className="flex items-center gap-4">
             {/* Integration: Okta Claims would populate this */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Eagle User</p>
              <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border flex items-center justify-center">
               <Users size={20} className="text-slate-600" />
            </div>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EWULayout;