'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Phone, Lock, User, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData.name, formData.phone, formData.password, formData.address);
      router.push('/menu');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-500 p-3 rounded-2xl shadow-lg shadow-red-200">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Save your details for faster checkout
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              icon={<User className="h-5 w-5 text-gray-400" />}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="0123456789"
              icon={<Phone className="h-5 w-5 text-gray-400" />}
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <Input
              label="Delivery Address (Optional)"
              name="address"
              type="text"
              placeholder="123 Main St"
              icon={<MapPin className="h-5 w-5 text-gray-400" />}
              value={formData.address}
              onChange={handleChange}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100 flex flex-col gap-2">
                <span className="font-bold flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Connection Error
                </span>
                <p className="opacity-80">{error}</p>
                <div className="mt-2 pt-2 border-t border-red-100 flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-widest font-black opacity-50">Diagnostic Info:</p>
                  <p className="text-[10px] break-all">API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
                  <button 
                    type="button"
                    onClick={async () => {
                      try {
                        const data = await api.auth.getHealth();
                        alert(`Backend is ONLINE! Status: ${data.status}`);
                      } catch (e: unknown) {
                        alert(`Backend CHECK FAILED: ${e instanceof Error ? e.message : 'Unknown error'}`);
                      }
                    }}
                    className="text-[10px] text-left underline font-bold hover:text-red-700"
                  >
                    Run Connection Test
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base mt-2"
              isLoading={isLoading}
            >
              Sign Up
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
