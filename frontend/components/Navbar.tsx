'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Utensils, User as UserIcon, LogOut, ChevronDown, Package, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { totalItems, toggleDrawer } = useCart();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
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
              className="text-gray-600 hover:text-red-500 font-medium transition-colors hidden sm:block relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-500 after:transition-all hover:after:w-full"
            >
              Menu
            </Link>

            <div className="h-8 w-px bg-gray-100 hidden sm:block" />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors py-2 px-1 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <UserIcon className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold hidden sm:block">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 ring-1 ring-black/5 overflow-hidden z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors group">
                          <Utensils className="h-4 w-4 text-red-500" />
                          <span className="font-bold">Admin Panel</span>
                        </Link>
                      )}
                      
                      <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group">
                        <Package className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                        <span>My Orders</span>
                      </Link>
                      
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group">
                        <UserCircle className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                        <span>Profile & Address</span>
                      </Link>

                      <div className="border-t border-gray-50 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:block text-sm font-bold bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95"
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