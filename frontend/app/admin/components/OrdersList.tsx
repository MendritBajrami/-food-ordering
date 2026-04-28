'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/lib/types';
import { Clock, ChefHat, CheckCircle, Truck, ChevronDown, Phone, MapPin, Package } from 'lucide-react';

interface Props {
  orders: Order[];
  onUpdateStatus: (id: number, status: string, reason?: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400', icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-400',   icon: ChefHat },
  ready:     { label: 'Ready',     color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800',  dot: 'bg-green-400',  icon: Truck },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-800',     dot: 'bg-red-400',    icon: CheckCircle },
};

const NEXT_STATUS: Record<string, string | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  rejected: null,
};

const NEXT_LABEL: Record<string, string> = {
  pending: '→ Start Preparing',
  preparing: '→ Mark Ready',
  ready: '→ Mark Delivered',
};

const FILTERS = ['all', 'pending', 'preparing', 'ready', 'delivered', 'rejected'] as const;

export default function OrdersList({ orders, onUpdateStatus }: Props) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {f !== 'all' && <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.dot}`} />}
              <span className="capitalize">{f}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No orders here</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = cfg?.icon ?? Clock;
              const nextStatus = NEXT_STATUS[order.status];
              const isExpanded = expandedId === order.id;

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg?.color || 'bg-gray-100'}`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-900">#{order.id}</span>
                        <span className="font-semibold text-gray-700 truncate">{order.customer_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span>{formatDate(order.created_at)} {formatTime(order.created_at)}</span>
                        <span className="font-bold text-gray-700">${Number(order.total_price).toFixed(2)}</span>
                        <span className="uppercase tracking-tighter opacity-60">{order.delivery_type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {nextStatus && (
                        <button onClick={() => onUpdateStatus(order.id, nextStatus)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all hover:shadow-md active:scale-95 whitespace-nowrap">
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <button onClick={() => setRejectId(order.id)}
                          className="bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 text-[10px] font-bold px-2 py-2 rounded-xl transition-all">
                          Reject
                        </button>
                      )}
                      <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </motion.div>
                      </button>
                    </div>
                  </div>

                  {/* Reject Reason Input (Simplified inline) */}
                  <AnimatePresence>
                    {rejectId === order.id && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="bg-red-50 px-4 py-3 border-t border-red-100">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Rejection Reason</p>
                        <div className="flex gap-2">
                          <input type="text" placeholder="e.g. Out of stock, busy..." autoFocus
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            className="flex-1 bg-white border border-red-200 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
                          <button onClick={() => { onUpdateStatus(order.id, 'rejected', rejectReason); setRejectId(null); setRejectReason(''); }}
                            className="bg-red-500 text-white text-[10px] font-bold px-3 rounded-lg hover:bg-red-600">
                            Confirm Rejection
                          </button>
                          <button onClick={() => setRejectId(null)} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-2">Cancel</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-50">
                        <div className="p-4 grid sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-300" />
                              <span className="text-gray-600">{order.phone}</span>
                            </div>
                            {order.address && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-300 mt-0.5" />
                                <span className="text-gray-600">{order.address}</span>
                              </div>
                            )}
                            {order.rejection_reason && (
                              <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                                <p className="text-[10px] font-black text-red-500 uppercase mb-1">Rejection Reason</p>
                                <p className="text-xs text-red-700 italic">"{order.rejection_reason}"</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Items Ordered</p>
                            <div className="space-y-1">
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-600">× {item.quantity} Product #{item.product_id}</span>
                                  <span className="font-semibold">${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-black text-sm">
                              <span>Total</span>
                              <span className="text-red-500">${Number(order.total_price).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        {/* All status buttons */}
                        <div className="px-4 pb-4 flex gap-2 flex-wrap">
                          {(['pending','preparing','ready','delivered', 'rejected'] as const).map(s => (
                            <button key={s} onClick={() => onUpdateStatus(order.id, s)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                                order.status === s ? `${STATUS_CONFIG[s].color} ring-2 ring-offset-1 ring-current` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}