import React, { useState, useEffect } from 'react';
import {
    Calendar, Shield, History, Save,
    Search, Filter, User, HardDrive
} from 'lucide-react';

import { useNotification } from '../../../context/NotificationContext';
import apiClient from '../../../api/ApiClient';
import AuditLogTable from './AuditLogPage';
import AcademicConfig from './AcademicConfig';

/**
 * Formats Jakarta JSON array timestamps [YYYY, MM, DD, HH, mm, ss, ns] 
 * into a human-readable string.
 */
const formatTimestamp = (tsArray) => {
    if (!Array.isArray(tsArray)) return "N/A";
    const [year, month, day, hour, min] = tsArray;
    return `${month}/${day}/${year} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('academic');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const { showNotification } = useNotification();
    // 1. Added state for filtering
    const [selectedAction, setSelectedAction] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Initial state is now empty or skeleton
    const [config, setConfig] = useState({
        CURRENT_SEMESTER: '',
        JOB_APPROVAL_REQUIRED: false,
        FWS_CHECK_ENABLED: false,
        EXPERIENCE_DEADLINE: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const pageSize = 25;

    const fetchConfig = async () => {
        try {
            const response = await apiClient.get('/admin/config');
            const data = response.data; // Expected: [{key: '...', value: '...'}, ...]

            // Transform the array of objects into a single flat object for the UI
            const newConfig = {};
            data.forEach(item => {
                // Handle boolean conversion for toggles
                if (item.key === 'JOB_APPROVAL_REQUIRED' || item.key === 'FWS_CHECK_ENABLED') {
                    newConfig[item.key] = item.value === 'true';
                } else {
                    newConfig[item.key] = item.value;
                }
            });

            setConfig(prev => ({ ...prev, ...newConfig }));
        } catch (err) {
            showNotification("Failed to load system configurations.", "error");
        }
    };

    /**
     * API: Save updated configs
     */
    const handleSaveConfig = async () => {
        try {
            // Transform local state back into the format the backend expects
            const payload = {
                settings: {
                    CURRENT_SEMESTER: config.CURRENT_SEMESTER,
                    JOB_APPROVAL_REQUIRED: String(config.JOB_APPROVAL_REQUIRED),
                    FWS_CHECK_ENABLED: String(config.FWS_CHECK_ENABLED),
                    EXPERIENCE_DEADLINE: config.EXPERIENCE_DEADLINE
                }
            };
            
            await apiClient.put('/admin/config', payload);
            showNotification("System configurations synchronized successfully.", "success");
        } catch (err) {
            showNotification("Error saving settings.", "error");
        }
    };

    /**
     * Step 1: Handle Search Debouncing
     * Effect runs every time searchTerm changes, but sets a timeout
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500); // 500ms delay

        return () => clearTimeout(timer); // Cleanup: cancel timer if user types again
    }, [searchTerm]);
    
    /**
     * Step 2: Update fetchLogs to include the search query
     */
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize,
                ...(selectedAction && { action: selectedAction }),
                ...(debouncedSearch && { actor: debouncedSearch }) // Add search param
            };
            
            const response = await apiClient.get('/admin/audit-logs', { params });
            setLogs(response.data);
            setTotalLogs(parseInt(response.headers['x-total-count'] || 0));
        } catch (err) {
            showNotification("Search failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await apiClient.get('/admin/audit-logs/export', {
                responseType: 'blob', // Important for file downloads
            });

            // Create a link to download the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showNotification("CSV Export started.", "success");
        } catch (err) {
            showNotification("Export failed.", "error");
        }
    };

    /**
     * Logic: Reset all filtering parameters to their default state.
     * This will trigger the useEffect because searchTerm and selectedAction change.
     */
    const handleReset = () => {
        setSearchTerm("");
        setSelectedAction("");
        setCurrentPage(1);
        showNotification("Filters cleared.", "info");
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // Reset to page 1 if filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedAction]);

    /**
     * Step 3: Trigger fetch when debounced search or other filters change
     */
    useEffect(() => {
        if (activeTab === 'logs') {
            // Reset to page 1 whenever search or filter changes
            setCurrentPage(1); 
            fetchLogs();
        }
    }, [activeTab, selectedAction, debouncedSearch, currentPage]);

    

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50/50">
                <TabButton
                    active={activeTab === 'academic'}
                    onClick={() => setActiveTab('academic')}
                    icon={<Calendar size={18} />}
                    label="Academic & Funding"
                />
                <TabButton
                    active={activeTab === 'logs'}
                    onClick={() => setActiveTab('logs')}
                    icon={<History size={18} />}
                    label="System Audit Logs"
                />
            </div>

            <div className="p-8">
                {activeTab === 'academic' ? (
                    <AcademicConfig 
                    config={config} 
                    setConfig={setConfig} 
                    onSave={handleSaveConfig} />
                ) : (
                    <AuditLogTable
                        logs={logs}
                        loading={loading}
                        formatTimestamp={formatTimestamp}
                        selectedAction={selectedAction}
                        onFilterChange={setSelectedAction}
                        onExport={handleExport}
                        isExporting={exporting}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalLogs={totalLogs}
                        pageSize={pageSize} 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm} 
                        onReset={handleReset} />
                )}
            </div>
        </div>
    );
};


const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-8 py-4 text-sm font-bold border-b-2 transition-all ${active ? 'border-[#A10022] text-[#A10022] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
    >
        {icon} {label}
    </button>
);


export default SystemSettings;