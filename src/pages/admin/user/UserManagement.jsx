import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCcw, Loader2, UserPlus, Users, Trash2, Edit, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';
import apiClient from '../../../api/ApiClient';
import AddUserModal from './AddUserModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import UserFormModal from './UserFormModal';

const UserManagement = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 15;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Search Debouncer ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Fetch Users ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedRole && { role: selectedRole })
      };
      const response = await apiClient.get('/admin/users/', { params });
      setUsers(response.data);
      setTotalUsers(parseInt(response.headers['x-total-count'] || 0));
    } catch (err) {
      showNotification("Failed to load user directory.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, selectedRole]);

  // --- Reset All ---
  const handleReset = () => {
    setSearchTerm("");
    setSelectedRole("");
    setCurrentPage(1);
    showNotification("User filters reset.", "info");
  };

  // --- CSV Export ---
  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await apiClient.get('/admin/users/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EWU_User_Directory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification("User directory exported.", "success");
    } catch (err) {
      showNotification("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  // DELETE HANDLER
  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/admin/users/${id}`);
      showNotification("User removed from system.", "success");
      fetchUsers(); // Refresh table
      setIsDeleteOpen(false);
    } catch (err) {
      showNotification("Failed to delete user.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const openEdit = (user) => { setSelectedUser(user); setIsEditOpen(true); };
  const openDelete = (user) => { setSelectedUser(user); setIsDeleteOpen(true); };

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <Users className="text-[#A10022]" /> User Directory
          </h1>
          <p className="text-gray-500 text-sm">Manage student, faculty, and employer accounts.</p>
        </div>
        <button onClick={handleAddNewClick} className="...">Add New User</button>
      </header>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#A10022]/20"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
            className="p-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="EMPLOYER">Employer</option>
            <option value="STAFF">Staff</option>
            <option value="FACULTY">Faculty</option>
          </select>

          {(searchTerm || selectedRole) && (
            <button onClick={handleReset} className="text-[#A10022] font-bold text-sm flex items-center gap-1 hover:underline">
              <RefreshCcw size={14} /> Reset
            </button>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-sm font-bold text-gray-700 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          Export CSV
        </button>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b font-bold text-gray-600 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">SSO</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="4" className="py-20 text-center text-gray-400 animate-pulse font-medium">Updating directory...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{user.firstName} {user.lastName}</span>
                    <span className="text-gray-500 text-xs">{user.email}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.oktaId ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <ShieldCheck size={12} /> SSO Linked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <AlertCircle size={12} /> No SSO
                      </span>
                    )}

                    {user.role === 'STUDENT' && !user.bannerId && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                        Missing Banner ID
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${user.role === 'STAFF' ? 'bg-red-50 text-[#A10022] border-red-100' :
                    user.role === 'EMPLOYER' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEditClick(user)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => openDelete(user)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * pageSize, totalUsers)}</span> of {totalUsers}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40"
            >Previous</button>
            <button
              disabled={currentPage * pageSize >= totalUsers}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border rounded-xl text-xs font-bold bg-white disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        initialData={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onUserSaved={fetchUsers} // Refresh the list after any save
        showNotification={showNotification}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        user={selectedUser}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default UserManagement;