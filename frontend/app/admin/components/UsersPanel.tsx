'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { User } from '@/lib/types';
import { UserPlus, Trash2, Shield, ShieldAlert, Search, X, Save, Phone, MapPin, User as UserIcon, KeyRound } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add user form state
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    password: '',
    address: '',
    role: 'customer' as 'customer' | 'admin'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.users.getAll();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.users.create(newUser);
      await loadUsers();
      setShowAddModal(false);
      setNewUser({ name: '', phone: '', password: '', address: '', role: 'customer' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This will also remove all their orders.')) return;
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      await api.users.update(user.id, { role: newRole });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search users by name or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all shadow-sm"
          />
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          <UserPlus className="h-5 w-5" />
          Add New User
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Address</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                          user.role === 'admin' ? 'bg-indigo-500' : 'bg-red-400'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-[10px] text-gray-400">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 text-sm">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {user.address || <span className="text-gray-300 italic">No address</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                          className={`p-2 rounded-xl transition-all ${
                            user.role === 'admin' ? 'text-indigo-400 hover:bg-indigo-50' : 'text-gray-400 hover:bg-gray-100 hover:text-indigo-500'
                          }`}
                        >
                          {user.role === 'admin' ? <ShieldAlert className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} icon={<UserIcon className="h-5 w-5" />} required />
                  <Input label="Phone" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} icon={<Phone className="h-5 w-5" />} required />
                </div>
                <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} icon={<KeyRound className="h-5 w-5" />} required />
                <Input label="Address" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} icon={<MapPin className="h-5 w-5" />} />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Account Role</label>
                  <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                    {['customer', 'admin'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewUser({...newUser, role: r as any})}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          newUser.role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                      ⚠ {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <Button type="submit" isLoading={isSubmitting} className="w-full h-14 text-lg">
                    Create Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
