'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Clock, CheckCircle, ChefHat, TrendingUp } from 'lucide-react';
import { Order } from '@/lib/types';

interface Props {
  stats: { total_orders: number; total_revenue: number };
  orders: Order[];
}

export default function StatsPanel({ stats, orders }: Props) {
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const cards = [
    { label: "Today's Orders", value: stats.total_orders, icon: ShoppingBag, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    { label: "Today's Revenue", value: `$${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: 'green', bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-100' },
    { label: 'Active Orders', value: statusCounts.pending + statusCounts.preparing, icon: TrendingUp, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    { label: 'Delivered Today', value: statusCounts.delivered, icon: CheckCircle, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  ];

  const statusBars = [
    { label: 'Pending', count: statusCounts.pending, color: 'bg-yellow-400', text: 'text-yellow-700' },
    { label: 'Preparing', count: statusCounts.preparing, color: 'bg-blue-400', text: 'text-blue-700' },
    { label: 'Ready', count: statusCounts.ready, color: 'bg-purple-400', text: 'text-purple-700' },
    { label: 'Delivered', count: statusCounts.delivered, color: 'bg-green-400', text: 'text-green-700' },
  ];

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${card.iconBg} ${card.text} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.text}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-red-400" />
          Order Status Breakdown
        </h3>
        <div className="space-y-4">
          {statusBars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${bar.text}`}>{bar.label}</span>
                <span className="text-sm font-black text-gray-900">{bar.count}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bar.count / total) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                  className={`h-full ${bar.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-black text-gray-900 mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-sm text-gray-800">#{order.id} — {order.customer_name}</p>
                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">${Number(order.total_price).toFixed(2)}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'ready' ? 'bg-purple-100 text-purple-700' :
                  'bg-green-100 text-green-700'
                }`}>{order.status}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No orders yet today</p>}
        </div>
      </motion.div>
    </div>
  );
}
