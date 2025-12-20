import React, { useState, useEffect } from 'react';
import {
    Calendar, Shield, History, Save,
    Search, Filter, User, HardDrive
} from 'lucide-react';

import { useNotification } from '../../../context/NotificationContext';
import apiClient from '../../../api/ApiClient';
import AuditLogTable from './AuditLogPage';
import AcademicConfig from './AcademicConfig';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState('academic');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const { showNotification } = useNotification();
// 1. Added state for filtering
    const [selectedAction, setSelectedAction] = useState("");

    const [config, setConfig] = useState({
        currentSemester: 'Spring 2026',
        jobApprovalRequired: true,
        fwsCheckEnabled: true,
        deadlineDate: '2026-05-15'
    });

    /**
     * Formats Jakarta JSON array timestamps [YYYY, MM, DD, HH, mm, ss, ns] 
     * into a human-readable string.
     */
    const formatTimestamp = (tsArray) => {
        if (!Array.isArray(tsArray)) return "N/A";
        const [year, month, day, hour, min] = tsArray;
        return `${month}/${day}/${year} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Append the action filter to the query string
            const url = `/admin/audit-logs?limit=50&offset=0${selectedAction ? `&action=${selectedAction}` : ''}`;
            const response = await apiClient.get(url);
            setLogs(response.data);
        } catch (err) {
            showNotification("Could not load filtered logs.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const handleSave = async () => {
        try {
            // Corrected from 'api' to 'apiClient' to match your import
            await apiClient.put('/admin/config', { settings: config });
            showNotification("Global settings updated and logged.", "success");
        } catch (err) {
            const errorMsg = err.response?.data || "Failed to update silos.";
            showNotification(errorMsg, "error");
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
                    <AcademicConfig config={config} setConfig={setConfig} onSave={handleSave} />
                ) : (
                    <AuditLogTable 
                    logs={logs} 
                        loading={loading} 
                        formatTimestamp={formatTimestamp}
                        selectedAction={selectedAction}
                        onFilterChange={setSelectedAction}
                        onExport={handleExport}
                        isExporting={exporting} />
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