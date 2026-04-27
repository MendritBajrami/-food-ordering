'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = '',
  type,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-gray-700 tracking-tight">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`w-full ${icon ? 'pl-12' : 'px-5'} ${isPassword ? 'pr-12' : 'pr-5'} py-3.5 bg-gray-50 border-none rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-red-500 bg-white shadow-sm focus:shadow-lg focus:shadow-red-500/10 outline-none transition-all duration-200 ${
            error ? 'ring-red-500' : ''
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none p-1"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showPassword ? 'show' : 'hide'}
                initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}