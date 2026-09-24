'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, ArrowRight, Eye, RefreshCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function MyOrdersPage() {
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.orders.getMyOrders();
      setOrders(data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      // Get full product details if possible, but here we use items from order
      // Assuming Order object has 'items' already (I added json_agg in the backend)
      for (const item of order.items || []) {
        // We need the product object. Let's fetch products to be safe or use what we have.
        // For simplicity, we'll try to find the product in our catalog or just add minimal info
        // better: fetch the product by id to get current price and image
        try {
          const { product } = await api.products.getById(item.product_id);
          addItem(product, item.quantity);
        } catch (e) {
          console.error(`Could not reorder product ${item.product_id}`, e);
        }
      }
      // Open cart drawer
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <RefreshCcw className="h-4 w-4 animate-spin-slow" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      case 'rejected': return <Package className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your order history.</p>
          <Link href="/login">
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-end mb-10"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
            <p className="text-gray-500 mt-1">Manage and track your recent orders.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadOrders} className="hidden sm:flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8">Ready to taste something delicious?</p>
            <Link href="/menu">
              <Button>Start Ordering</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <Package className="h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                          <p className="text-sm font-bold text-gray-900 underline decoration-red-200 underline-offset-4">#ORD-{order.id.toString().padStart(6, '0')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                          order.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        <p className="text-sm font-semibold text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.status === 'rejected' && order.rejection_reason && (
                      <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <div className="bg-red-500 p-1.5 rounded-lg shrink-0 mt-0.5">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Reason for Rejection</p>
                          <p className="text-sm text-red-800 font-medium italic">"{order.rejection_reason}"</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-xl font-black text-gray-900">${parseFloat(order.total_price.toString()).toFixed(2)}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/confirmation?id=${order.id}`}>
                          <Button variant="secondary" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <Link href="/menu">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2 group/btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleReorder(order);
                            }}
                          >
                            <RefreshCcw className="h-4 w-4 group-hover/btn:rotate-180 transition-transform duration-500" />
                            Reorder
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
