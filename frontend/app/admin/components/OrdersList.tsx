'use client';

import React from 'react';
import { Order } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrder: Order | null;
}

export default function OrdersList({ orders, onSelectOrder, selectedOrder }: OrdersListProps) {
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'ready' || o.status === 'delivered');

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-yellow-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            Pending Orders ({pendingOrders.length})
          </h2>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {pendingOrders.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No pending orders</p>
          ) : (
            pendingOrders.map(order => (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedOrder?.id === order.id ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">#{order.id}</span>
                  <span className="text-sm text-gray-500">{formatTime(order.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{order.customer_name}</span>
                  <Badge status={order.status} />
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {order.items?.length || 0} items - ${order.total_price.toFixed(2)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-green-50">
          <h2 className="font-semibold text-gray-900">
            Completed Orders ({completedOrders.length})
          </h2>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {completedOrders.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No completed orders</p>
          ) : (
            completedOrders.map(order => (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedOrder?.id === order.id ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-900">#{order.id}</span>
                  <span className="text-sm text-gray-500">{formatTime(order.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{order.customer_name}</span>
                  <Badge status={order.status} />
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {order.items?.length || 0} items - ${order.total_price.toFixed(2)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}