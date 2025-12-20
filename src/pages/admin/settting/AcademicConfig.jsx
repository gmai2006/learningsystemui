import React, { useState, useEffect } from 'react';
import {
    Calendar, Shield, Save
} from 'lucide-react';

const ToggleItem = ({ label, desc, checked, onChange }) => (
    <div 
        onClick={onChange}
        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
    >
        <div>
            <p className="font-bold text-gray-800 text-sm">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : ''}`} />
        </div>
    </div>
);


const AcademicConfig = ({ config, setConfig, onSave }) => (
    <div className="max-w-3xl space-y-8">
        <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-gray-400" size={20} /> Academic Period Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Semester</label>
                    <select
                        value={config.currentSemester}
                        onChange={(e) => setConfig({...config, currentSemester: e.target.value})}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    >
                        <option>Winter 2026</option>
                        <option>Spring 2026</option>
                        <option>Summer 2026</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Global Experience Deadline</label>
                    <input 
                        type="date" 
                        value={config.deadlineDate} 
                        onChange={(e) => setConfig({...config, deadlineDate: e.target.value})}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" 
                    />
                </div>
            </div>
        </section>

        <section className="pt-6 border-t">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="text-gray-400" size={20} /> Recruitment Guardrails
            </h3>
            <div className="space-y-4">
                <ToggleItem
                    label="Require Staff Approval for External Jobs"
                    desc="All non-EWU job postings must be manually reviewed."
                    checked={config.jobApprovalRequired}
                    onChange={() => setConfig({...config, jobApprovalRequired: !config.jobApprovalRequired})}
                />
                <ToggleItem
                    label="Automated FWS Eligibility Check"
                    desc="Validate student work-study status against Banner data in real-time."
                    checked={config.fwsCheckEnabled}
                    onChange={() => setConfig({...config, fwsCheckEnabled: !config.fwsCheckEnabled})}
                />
            </div>
        </section>

        <div className="pt-8">
            <button 
                onClick={onSave}
                className="bg-[#A10022] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-800 shadow-lg shadow-red-900/20 transition-all active:scale-95"
            >
                <Save size={18} /> Save Global Settings
            </button>
        </div>
    </div>
);

export default AcademicConfig;