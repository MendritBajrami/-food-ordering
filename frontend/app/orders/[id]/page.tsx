'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  Truck,
  Clock,
  RefreshCcw,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const statusFlow = ['pending', 'preparing', 'ready', 'delivered'];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const data = await api.orders.getById(Number(id));
        setOrder(data.order);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    if (id && !authLoading) loadOrder();
  }, [id, authLoading]);

  const handleReorder = async () => {
    if (!order) return;
    setIsReordering(true);
    for (const item of order.items || []) {
      try {
        const { product } = await api.products.getById(item.product_id);
        addItem(product, item.quantity, item.removed_ingredients ?? []);
      } catch (e) {
        console.error(`Could not reorder product ${item.product_id}`, e);
      }
    }
    setIsReordering(false);
    router.push('/cart');
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your order details.</p>
          <Link
            href={`/login?redirect=/orders/${id}`}
            onClick={() => sessionStorage.setItem('redirectAfterLogin', `/orders/${id}`)}
          >
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600 mb-8">{error || 'We could not find that order.'}</p>
          <Link href="/orders">
            <Button className="w-full">Back to My Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const currentIndex = statusFlow.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/orders">
            <button className="p-2 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Details</h1>
            <p className="text-gray-500 mt-1">
              Order #ORD-{order.id.toString().padStart(6, '0')} · placed {formatDate(order.created_at)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge status={order.status} />
                <span className="text-sm text-gray-400 font-medium">
                  {order.status === 'rejected'
                    ? 'This order was cancelled'
                    : order.status === 'delivered'
                      ? 'Enjoy your meal!'
                      : 'We are working on your order'}
                </span>
              </div>
              <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Clock className="h-4 w-4" />
                {formatDate(order.created_at)}
              </span>
            </div>

            {order.status !== 'rejected' && (
              <div className="flex items-center gap-2 mt-6">
                {statusFlow.map((status, index) => (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          index <= currentIndex ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          index <= currentIndex ? 'text-red-500' : 'text-gray-300'
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mb-4 ${
                          index < currentIndex ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {order.status === 'rejected' && order.rejection_reason && (
              <div className="mt-5 p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">
                    Reason for Rejection
                  </p>
                  <p className="text-sm text-red-800 font-medium italic">"{order.rejection_reason}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-red-500" />
              <h2 className="font-bold text-gray-900">What you ordered</h2>
              <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>

            {items.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">No items found for this order.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((item, index) => (
                  <div key={item.id ?? index} className="p-4 sm:p-6 flex gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name || 'Order item'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-gray-300 absolute inset-0 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-3">
                        <h3 className="font-bold text-gray-900">
                          {item.product_name || `Item #${item.product_id}`}
                        </h3>
                        <span className="font-bold text-gray-900 whitespace-nowrap">
                          ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {(item.removed_ingredients?.length ?? 0) > 0 && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                          No {item.removed_ingredients!.join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 mt-1">
                        ${Number(item.price_at_purchase).toFixed(2)} each · Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-6 py-5 bg-gray-50/60 border-t border-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total paid</span>
                <span className="text-2xl font-black text-red-500">
                  ${Number(order.total_price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Order information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-5">Order information</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                  <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{order.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{order.delivery_type}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {order.address || (order.delivery_type === 'pickup' ? 'Pickup at restaurant' : '—')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to My Orders
              </Button>
            </Link>
            <Button
              onClick={handleReorder}
              disabled={isReordering}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${isReordering ? 'animate-spin' : ''}`} />
              {isReordering ? 'Adding to cart...' : 'Order Again'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
