'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, Lock, Save, LogOut, ShieldCheck, ArrowLeft, Pencil, X, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Input from '@/components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordPanel, setShowPasswordPanel] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  React.useEffect(() => {
    if (!user) router.push('/login');
    else setFormData({ name: user.name, address: user.address || '' });
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCancelEdit = () => {
    setFormData({ name: user?.name || '', address: user?.address || '' });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const API_URL = (() => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    if (!url.startsWith('http')) url = `https://${url}`;
    if (!url.endsWith('/api')) url = `${url.replace(/\/$/, '')}/api`;
    return url;
  })();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: formData.name, address: formData.address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess('Profile saved!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password change failed');
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordPanel(false);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Back link */}
        <Link href="/menu" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Link>

        {/* Avatar & Name */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-200 flex-shrink-0">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h1>
            <p className="text-gray-400 text-sm">{user.phone}</p>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Personal Info</h2>
            {!isEditing ? (
              <button
                onClick={() => { setIsEditing(true); setSuccess(''); setError(''); }}
                className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <button onClick={handleCancelEdit} className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          {/* Card Body */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {isEditing ? (
              <>
                <Input label="Full Name" name="name" type="text" icon={<User className="h-5 w-5" />}
                  value={formData.name} onChange={handleChange} required />
                <Input label="Delivery Address" name="address" type="text" icon={<MapPin className="h-5 w-5" />}
                  value={formData.address} onChange={handleChange} placeholder="Your default delivery address" />
              </>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: user.name, icon: <User className="h-4 w-4 text-gray-300" /> },
                  { label: 'Phone', value: user.phone, icon: <Phone className="h-4 w-4 text-gray-300" /> },
                  { label: 'Address', value: user.address || 'Not set', icon: <MapPin className="h-4 w-4 text-gray-300" /> },
                ].map(field => (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="mt-0.5">{field.icon}</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-300">{field.label}</p>
                      <p className="text-sm font-semibold text-gray-700">{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {success && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl">
                  ✓ {success}
                </motion.p>
              )}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {isEditing && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                type="submit" disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-60"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </motion.button>
            )}
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          <button
            onClick={() => { setShowPasswordPanel(!showPasswordPanel); setPasswordError(''); setPasswordSuccess(''); }}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-red-400" />
              <span className="text-sm font-black uppercase tracking-widest text-gray-400">Change Password</span>
            </div>
            <motion.div animate={{ rotate: showPasswordPanel ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ArrowLeft className="h-4 w-4 text-gray-300 -rotate-90" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showPasswordPanel && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleChangePassword}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-50">
                  <Input label="Current Password" name="currentPassword" type="password"
                    icon={<Lock className="h-5 w-5" />} value={passwordData.currentPassword}
                    onChange={handlePasswordChange} required />
                  <Input label="New Password" name="newPassword" type="password"
                    icon={<ShieldCheck className="h-5 w-5" />} value={passwordData.newPassword}
                    onChange={handlePasswordChange} placeholder="Min. 6 characters" required />
                  <Input label="Confirm New Password" name="confirmPassword" type="password"
                    icon={<ShieldCheck className="h-5 w-5" />} value={passwordData.confirmPassword}
                    onChange={handlePasswordChange} required />

                  <AnimatePresence>
                    {passwordSuccess && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl">
                        ✓ {passwordSuccess}
                      </motion.p>
                    )}
                    {passwordError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">
                        {passwordError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={isChangingPassword}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 disabled:opacity-60">
                    <Lock className="h-5 w-5" />
                    {isChangingPassword ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Logout */}
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          onClick={() => { logout(); router.push('/'); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500 font-bold transition-all">
          <LogOut className="h-5 w-5" />
          Logout
        </motion.button>

      </div>
    </div>
  );
}
