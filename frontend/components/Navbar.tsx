'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Utensils, User as UserIcon, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems, toggleDrawer } = useCart();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-500 p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FastFood</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/menu"
              className="text-gray-600 hover:text-red-500 font-medium transition-colors hidden sm:block"
            >
              Menu
            </Link>

            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:block text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => toggleDrawer(true)}
              className="relative p-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}