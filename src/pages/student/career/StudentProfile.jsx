import React, { useState, useEffect } from 'react';
import {
    User, Mail, Globe, Linkedin, Github,
    Award, BookOpen, Clock, Edit3, Save,
    Plus, X, Briefcase, GraduationCap,
    Camera
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../../../api/ApiClient';
import { useNotification } from '../../../context/NotificationContext';

const StudentProfile = ({ user, token }) => {
    const [summary, profile, setProfile, loading] = useOutletContext(); // Access tier/readiness from Dashboard
    const { showNotification } = useNotification();
    const [isEditing, setIsEditing] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    // 2. Handle Save Logic
    const handleSave = async () => {
        try {
            await apiClient.patch('/student/profile', profile);
            showNotification("Profile updated successfully", "success");
            setIsEditing(false);
        } catch (err) {
            showNotification("Failed to save profile changes", "error");
        }
    };

    // 3. Skills Management (Java-side logic helper)
    const addSkill = () => {
        if (newSkill && !profile.skills.includes(newSkill)) {
            setProfile({ ...profile, gpa: profile.gpa || "", skills: [...profile.skills, newSkill] });
            setNewSkill("");
        }
    };

    const removeSkill = (skillToRemove) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skillToRemove) });
    };

    // Inside StudentProfile.jsx

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Limit size to ~1MB to prevent massive DB bloat
            if (file.size > 1048576) {
                showNotification("Image is too large. Please select a file under 1MB.", "error");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // The result is the full base64 string including the data:image prefix
                setProfile({ ...profile, profilePictureBase64: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse text-gray-300 uppercase tracking-widest">Loading Profile...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* Header Section */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#A10022]/5 rounded-full -mr-32 -mt-32" />

                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gray-900 overflow-hidden shadow-2xl relative group border-4 border-white">
                        {/* Display Base64 Image */}
                        {profile.profilePictureBase64 ? (
                            <img
                                src={profile.profilePictureBase64}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <User size={64} />
                            </div>
                        )}

                        {isEditing && (
                            <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <Camera size={24} />
                                <span className="text-[8px] font-black uppercase mt-2">Upload Photo</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-4xl font-black italic text-gray-900 leading-none">{profile.firstName + '  ' + profile.lastName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                                <span className="px-3 py-1 bg-[#A10022] text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    {summary.tierName}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    Ready for Hire
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg
              ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-900 text-white hover:bg-[#A10022]'}`}
                    >
                        {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Profile</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content: Bio & Academic */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Professional Bio */}
                    <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-black italic text-gray-900 flex items-center gap-3">
                            <BookOpen size={24} className="text-[#A10022]" /> Professional Bio
                        </h3>
                        {isEditing ? (
                            <textarea
                                className="w-full bg-gray-50 p-6 rounded-3xl border border-gray-100 text-gray-600 italic focus:ring-2 focus:ring-[#A10022]/10 outline-none"
                                rows="4"
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            />
                        ) : (
                            <p className="text-gray-500 leading-relaxed italic text-lg">
                                "{profile.bio || "No professional bio provided yet. Add one to stand out to employers!"}"
                            </p>
                        )}
                    </section>

                    {/* Academic Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Academic Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-[#A10022] uppercase block mb-1">Major</label>
                                    <input
                                        disabled={!isEditing}
                                        className="w-full bg-transparent font-black italic text-xl text-gray-900 outline-none disabled:text-gray-900"
                                        value={profile.major}
                                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Inside StudentProfile.jsx -> Academic Details Section */}
                                    <div>
                                        <label className="text-[10px] font-black text-[#A10022] uppercase block mb-1">
                                            GPA (0.00 - 4.00)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01" // Ensures two-decimal precision
                                            min="0.00"   // Lower bound
                                            max="4.00"   // Upper bound
                                            disabled={!isEditing}
                                            className={`w-full bg-transparent font-black italic text-xl outline-none transition-colors
      ${isEditing ? 'border-b-2 border-gray-100 focus:border-[#A10022] pb-1' : 'text-gray-900'}`}
                                            value={profile.gpa}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                // Optional: Prevent typing numbers outside 0-4 immediately
                                                if (val > 4) return;
                                                setProfile({ ...profile, gpa: e.target.value }); // Keep as string for better input handling
                                            }}
                                            onBlur={(e) => {
                                                // Final sanitization: Round to 2 decimals on blur
                                                const rounded = parseFloat(e.target.value).toFixed(2);
                                                setProfile({ ...profile, gpa: parseFloat(rounded) });
                                            }}
                                        />
                                        {isEditing && (profile.gpa < 0 || profile.gpa > 4) && (
                                            <p className="text-[8px] text-red-500 font-bold mt-1 uppercase tracking-tighter">
                                                Please enter a valid GPA between 0.00 and 4.00
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-[#A10022] uppercase block mb-1">Grad Year</label>
                                        <input
                                            type="number"
                                            disabled={!isEditing}
                                            className="w-full bg-transparent font-black italic text-xl text-gray-900 outline-none"
                                            value={profile.graduationYear}
                                            onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Links */}
                        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Digital Portfolio</h3>
                            <div className="space-y-4">
                                <ProfileInput icon={<Linkedin size={16} />} label="LinkedIn" value={profile.linkedinUrl} isEditing={isEditing} onChange={(val) => setProfile({ ...profile, linkedinUrl: val })} />
                                <ProfileInput icon={<Github size={16} />} label="GitHub" value={profile.githubUrl} isEditing={isEditing} onChange={(val) => setProfile({ ...profile, githubUrl: val })} />
                                <ProfileInput icon={<Globe size={16} />} label="Portfolio" value={profile.portfolioUrl} isEditing={isEditing} onChange={(val) => setProfile({ ...profile, portfolioUrl: val })} />
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Column: Skills Management */}
                <div className="space-y-8">
                    <section className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-xl h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black italic flex items-center gap-2">
                                <Award className="text-[#A10022]" /> My Expertise
                            </h3>
                        </div>

                        {isEditing && (
                            <div className="flex gap-2 mb-6">
                                <input
                                    placeholder="Add Skill..."
                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-white/20"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                />
                                <button onClick={addSkill} className="p-2 bg-white text-gray-900 rounded-xl"><Plus size={18} /></button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {profile.skills.map(skill => (
                                <span key={skill} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 group">
                                    {skill}
                                    {isEditing && (
                                        <X size={12} className="cursor-pointer text-white/40 hover:text-white" onClick={() => removeSkill(skill)} />
                                    )}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const ProfileInput = ({ icon, label, value, isEditing, onChange }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="p-2 bg-white rounded-xl text-gray-400">{icon}</div>
        <div className="flex-1">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <input
                disabled={!isEditing}
                className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label} URL`}
            />
        </div>
    </div>
);

export default StudentProfile;