'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Lock, Save, LogOut, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Input from '@/components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, token } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          ...(formData.newPassword ? { newPassword: formData.newPassword, currentPassword: formData.currentPassword } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSuccess('Profile updated successfully!');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/menu" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center shadow-lg shadow-red-200">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user.name}</h1>
              <p className="text-gray-400 text-sm font-medium">{user.phone}</p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSave} className="space-y-6">

            {/* Personal Info */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Personal Info</h2>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  icon={<User className="h-5 w-5" />}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={<Phone className="h-5 w-5" />}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 -mt-2">Phone number cannot be changed.</p>
                <Input
                  label="Delivery Address"
                  name="address"
                  type="text"
                  icon={<MapPin className="h-5 w-5" />}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your default delivery address"
                />
              </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Change Password</h2>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                />
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {/* Feedback */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 text-green-600 text-sm p-4 rounded-2xl border border-green-100 font-medium"
              >
                ✓ {success}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl border border-red-100 font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl transition-all hover:shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-500 hover:border-red-200 hover:text-red-500 font-bold transition-all"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
