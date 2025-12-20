import React, { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2, Shield, Search } from 'lucide-react';
import init from "../../../init";
import { useUser } from '../../../context/UserContext';
import axios from 'axios';

const UserManagement = () => {
  const { appUser, token } = useUser();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    const res = await axios.get(`/${init.appName}/api/users/all`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
    const data = await res.data;
    setUsers(data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);

    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    setIsModalOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-500">Manage Student, Faculty, Staff, and Employer identities.</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-[#A10022] hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, email, or Banner ID..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm font-semibold text-gray-600">
              <th className="px-4 py-3">Name / Email</th>
              <th className="px-4 py-3">Banner ID</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.filter(u => u.email.includes(searchTerm)).map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{user.bannerId || 'N/A'}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 uppercase">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`h-2 w-2 inline-block rounded-full mr-2 ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Create New User'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" defaultValue={editingUser?.firstName} placeholder="First Name" required className="p-2.5 border rounded-lg w-full" />
                <input name="lastName" defaultValue={editingUser?.lastName} placeholder="Last Name" required className="p-2.5 border rounded-lg w-full" />
              </div>
              <input name="email" defaultValue={editingUser?.email} type="email" placeholder="Email Address" required className="p-2.5 border rounded-lg w-full" />
              <div className="grid grid-cols-2 gap-4">
                <input name="bannerId" defaultValue={editingUser?.bannerId} placeholder="Banner ID" className="p-2.5 border rounded-lg w-full" />
                <select name="role" defaultValue={editingUser?.role || 'STUDENT'} className="p-2.5 border rounded-lg w-full">
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="STAFF">STAFF</option>
                  <option value="EMPLOYER">EMPLOYER</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#A10022] text-white font-bold py-2.5 rounded-lg hover:bg-red-800 transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;