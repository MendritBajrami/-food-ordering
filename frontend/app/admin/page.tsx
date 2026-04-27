'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AdminLogin from './components/AdminLogin';
import OrdersList from './components/OrdersList';
import OrderDetails from './components/OrderDetails';

export default function AdminPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.orders.getAll(token);
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  }, [token]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.orders.getStats(token);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token && !authLoading) {
      return;
    }

    if (token) {
      loadOrders();
      loadStats();

      const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join-admin', token);
      });

      socket.on('new-order', (data: { order: Order }) => {
        setOrders(prev => [data.order, ...prev]);
        setStats(prev => ({ ...prev, total_orders: prev.total_orders + 1 }));
        setNotification(true);
        setTimeout(() => setNotification(false), 3000);
        
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      });

      socket.on('order-updated', (data: { order_id: number; status: string }) => {
        setOrders(prev =>
          prev.map(order =>
            order.id === data.order_id
              ? { ...order, status: data.status as Order['status'] }
              : order
          )
        );
        if (selectedOrder?.id === data.order_id) {
          setSelectedOrder(prev =>
            prev ? { ...prev, status: data.status as Order['status'] } : null
          );
        }
        loadStats();
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [token, authLoading, loadOrders, loadStats, selectedOrder?.id]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    if (!token) return;
    try {
      await api.orders.updateStatus(orderId, status, token);
      loadOrders();
      loadStats();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </nav>

      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          New Order Received!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Today&apos;s Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_orders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Today&apos;s Revenue</p>
            <p className="text-3xl font-bold text-green-500">
              ${stats.total_revenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-yellow-500">
              {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
            </p>
          </div>
        </div>

        <OrdersList
          orders={orders}
          onSelectOrder={setSelectedOrder}
          selectedOrder={selectedOrder}
        />
      </div>

      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}