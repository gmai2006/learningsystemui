import React, { useState } from "react";
import { ChevronRight, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const DashboardSidebar = ({ menuItems, sidebarOpen, setSidebarOpen }) => {
    const { appUser } = useUser();
    const location = useLocation();
    
    // State to track which menu item's submenu is expanded
    const [expandedMenu, setExpandedMenu] = useState(null);

    const toggleSubmenu = (id) => {
        if (expandedMenu === id) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(id);
            if (!sidebarOpen) setSidebarOpen(true); // Open sidebar if a submenu is clicked while collapsed
        }
    };

    return (
        <div className={`bg-gray-900 text-white transition-all duration-300 border-r border-gray-800 flex flex-col h-screen sticky top-0 ${
            sidebarOpen ? 'w-64' : 'w-20'
        }`}>
            {/* Header Section */}
            <div className="p-4 border-b border-gray-800 flex items-center h-16 overflow-hidden">
                {sidebarOpen ? (
                    <>
                        <div className="flex items-center gap-3 flex-1">
                            <div className="bg-[#A10022] w-10 h-10 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-white font-black text-xl italic">E</span>
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-bold text-sm tracking-tight">EWU</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Admin Portal</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSidebarOpen(false);
                                setExpandedMenu(null); // Close submenus when collapsing sidebar
                            }}
                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                        >
                            <X size={18} />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex flex-col items-center justify-center w-full group py-2"
                        aria-label="Expand Sidebar"
                    >
                        <div className="p-2 hover:bg-gray-800 rounded-lg transition-all text-gray-400 group-hover:text-white">
                            <Menu size={24} />
                        </div>
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                {menuItems.map(item => {
                    const hasSubmenu = item.children && item.children.length > 0;
                    const isExpanded = expandedMenu === item.id;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                        <div key={item.id} className="space-y-1">
                            {/* Main Item */}
                            {hasSubmenu ? (
                                <button
                                    onClick={() => toggleSubmenu(item.id)}
                                    className={`w-full group flex items-center rounded-xl transition-all duration-200 
                                        ${sidebarOpen ? 'px-4 py-3 gap-3' : 'p-3 justify-center'}
                                        ${isActive && !isExpanded ? 'text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <item.icon size={22} className={isActive ? 'text-red-500' : 'group-hover:text-white'} />
                                    {sidebarOpen && (
                                        <>
                                            <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>
                                            {isExpanded ? (
                                                <ChevronDown size={14} className="ml-auto opacity-60" />
                                            ) : (
                                                <ChevronRight size={14} className="ml-auto opacity-60" />
                                            )}
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`group flex items-center rounded-xl transition-all duration-200 
                                        ${sidebarOpen ? 'px-4 py-3 gap-3' : 'p-3 justify-center'}
                                        ${location.pathname === item.path 
                                            ? 'bg-[#A10022] text-white shadow-md' 
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <item.icon size={22} />
                                    {sidebarOpen && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
                                </Link>
                            )}

                            {/* Submenu Items */}
                            {hasSubmenu && isExpanded && sidebarOpen && (
                                <div className="ml-9 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                    {item.children.map(sub => (
                                        <Link
                                            key={sub.id}
                                            to={sub.path}
                                            className={`block py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all
                                                ${location.pathname === sub.path 
                                                    ? 'text-red-500' 
                                                    : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Tooltip for collapsed state */}
                            {!sidebarOpen && (
                                <div className="fixed left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity ml-2 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                                    {item.label}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile Footer */}
            <div className={`p-4 border-t border-gray-800 transition-colors ${sidebarOpen ? 'bg-gray-900/50' : 'flex justify-center'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600 flex-shrink-0">
                        <span className="font-bold text-xs text-red-400">
                            {appUser?.firstName?.[0] || 'A'}{appUser?.lastName?.[0] || 'D'}
                        </span>
                    </div>
                    {sidebarOpen && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-gray-200">
                                    {appUser?.firstName} {appUser?.lastName}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                    {appUser?.role || 'Staff'}
                                </p>
                            </div>
                            <button className="text-gray-500 hover:text-red-400">
                                <LogOut size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;