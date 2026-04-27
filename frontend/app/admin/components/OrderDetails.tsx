'use client';

import React from 'react';
import { Order } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import { X, MapPin, Phone, User, Clock, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: number, status: string) => void;
}

export default function OrderDetails({ order, onClose, onUpdateStatus }: OrderDetailsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusFlow = ['pending', 'preparing', 'ready', 'delivered'];
  const currentIndex = statusFlow.indexOf(order.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
            <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge status={order.status} />
              <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{order.delivery_type}</p>
                </div>
              </div>
              {order.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{order.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x Item #{item.product_id}
                    </span>
                    <span className="text-gray-600">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                <span>Total</span>
                <span className="text-red-500">${order.total_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map((status, index) => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(order.id, status)}
                    disabled={index <= currentIndex}
                    className={`px-4 py-2 rounded-full font-medium capitalize transition-colors ${
                      index <= currentIndex
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}