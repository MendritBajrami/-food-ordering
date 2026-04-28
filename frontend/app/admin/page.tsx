'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import { LayoutDashboard, UtensilsCrossed, BarChart3, Users, Wifi, WifiOff, Bell, LogOut } from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import OrdersList from './components/OrdersList';
import ProductsPanel from './components/ProductsPanel';
import StatsPanel from './components/StatsPanel';
import UsersPanel from './components/UsersPanel';

type Tab = 'orders' | 'products' | 'stats' | 'users';

export default function AdminPage() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('orders');
  const [isConnected, setIsConnected] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try { const data = await api.orders.getAll(); setOrders(data.orders); } catch {}
  }, [token]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try { const data = await api.orders.getStats(); setStats(data.stats); } catch {}
  }, [token]);

  useEffect(() => {
    if (!token || authLoading) return;
    loadOrders();
    loadStats();

    const SOCKET_URL = (() => {
      let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      url = url.replace(/\/api$/, '');
      if (!url.startsWith('http')) url = `https://${url}`;
      return url;
    })();

    const socket: Socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-admin', token);
    });

    socket.on('new-order', (data: { order: Order }) => {
      setOrders(prev => [data.order, ...prev]);
      setStats(prev => ({ ...prev, total_orders: prev.total_orders + 1 }));
      setNewOrderAlert(true);
      setNewOrderCount(c => c + 1);
      setTimeout(() => setNewOrderAlert(false), 5000);
      new Audio('/notification.mp3').play().catch(() => {});
    });

    socket.on('order-updated', ({ order_id, status }: { order_id: number; status: string }) => {
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status: status as Order['status'] } : o));
      loadStats();
    });

    socket.on('disconnect', () => setIsConnected(false));
    return () => { socket.disconnect(); };
  }, [token, authLoading, loadOrders, loadStats]);

  const handleUpdateStatus = async (orderId: number, status: string, reason?: string) => {
    try {
      await api.orders.updateStatus(orderId, status, reason);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'], rejection_reason: reason } : o));
      loadStats();
    } catch (e) { console.error(e); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!token || !user) return <AdminLogin />;

  // Role check — show a message if not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-2xl font-black text-gray-900 mb-2">Access Denied</p>
          <p className="text-gray-500 mb-6">You need an admin account to access this panel.</p>
          <button onClick={logout} className="bg-red-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-red-600 transition-all">
            Logout
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders' as Tab, label: 'Orders', icon: LayoutDashboard, badge: newOrderCount > 0 ? newOrderCount : null },
    { id: 'products' as Tab, label: 'Products', icon: UtensilsCrossed, badge: null },
    { id: 'stats' as Tab, label: 'Stats', icon: BarChart3, badge: null },
    { id: 'users' as Tab, label: 'Users', icon: Users, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-1.5 rounded-lg">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-gray-900">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className="text-xs font-semibold text-gray-400 hidden sm:block">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">{user.name}</span>
            <button onClick={logout} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 pb-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'orders') setNewOrderCount(0); }}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
                tab === t.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}>
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.badge !== null && (
                <span className="bg-red-500 text-white text-[10px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* New Order Alert */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-500/40 flex items-center gap-3 font-bold">
            <Bell className="h-5 w-5 animate-bounce" />
            🎉 New Order Received!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900">All Orders</h2>
                <span className="text-sm text-gray-400">{orders.length} total</span>
              </div>
              <OrdersList orders={orders} onUpdateStatus={handleUpdateStatus} />
            </motion.div>
          )}
          {tab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <h2 className="text-xl font-black text-gray-900 mb-4">Menu Products</h2>
              <ProductsPanel />
            </motion.div>
          )}
          {tab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <h2 className="text-xl font-black text-gray-900 mb-4">Today's Stats</h2>
              <StatsPanel stats={stats} orders={orders} />
            </motion.div>
          )}
          {tab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <h2 className="text-xl font-black text-gray-900 mb-4">User Management</h2>
              <UsersPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}