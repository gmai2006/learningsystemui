import React, { useState, useEffect } from 'react';
import {

    Search, Filter,
    Download,
    Loader2
} from 'lucide-react';


const AuditLogTable = ({ 
    logs, loading, formatTimestamp, selectedAction, onFilterChange, onExport, isExporting 
}) => (
    <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#A10022]/20" placeholder="Search logs..." />
                </div>
                
                <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-300 rounded-lg">
                    <Filter size={14} className="text-gray-400" />
                    <select 
                        value={selectedAction}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="text-xs font-bold text-gray-700 outline-none bg-transparent cursor-pointer"
                    >
                        <option value="">All Actions</option>
                        <option value="POSTED_NEW_JOB">Job Postings</option>
                        <option value="BANNER_SYNC">System Syncs</option>
                        <option value="USER_ROLE_UPDATED">Security Changes</option>
                        <option value="SUBMITTED_EXPERIENCE">Applied Learning</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={onExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isExporting ? 'Exporting...' : 'Export to CSV'}
            </button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 border-b font-bold text-gray-600">
                    <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Actor</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan="4" className="text-center py-20 text-gray-400">Fetching logs...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-20 text-gray-400">No logs found.</td></tr>
                    ) : (
                        logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">
                                    {formatTimestamp(log.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{log.actorName}</span>
                                        <span className="text-[9px] text-gray-400 font-mono">{log.ipAddress}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black border uppercase tracking-wider ${
                                        log.action.includes('POSTED') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        log.action.includes('BANNER') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 text-xs truncate max-w-xs" title={log.details}>
                                    {log.details}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default AuditLogTable;