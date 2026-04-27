'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.phone, formData.password);
      router.push('/menu');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
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
            <LogIn className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base"
              isLoading={isLoading}
            >
              Sign In
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
                  New here?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/register"
                className="font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
