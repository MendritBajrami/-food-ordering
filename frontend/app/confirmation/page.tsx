'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Home, MapPin, Eye, Phone } from 'lucide-react';
import { Order } from '@/lib/types';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('fastfood-last-order');
      if (stored) setOrder(JSON.parse(stored));
      setIsLoggedIn(Boolean(localStorage.getItem('food-ordering-auth')));
    } catch (e) {
      console.error('Could not load last order');
    }
  }, []);

  const orderNumber = order?.id ?? (orderId ? Number(orderId) : null);
  const formattedId = orderNumber ? `#ORD-${String(orderNumber).padStart(6, '0')}` : '';

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Order Confirmed!
          </h1>

          {formattedId && (
            <p className="text-gray-500 mb-6 text-center font-semibold">{formattedId}</p>
          )}

          <p className="text-gray-600 mb-6 text-center">
            Thank you for your order! We&apos;re preparing your food right now.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                What you ordered
              </p>
              <div className="space-y-2">
                {(order.items || []).map((item, index) => (
                  <div key={item.id ?? index} className="flex justify-between gap-3 text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.product_name || `Item #${item.product_id}`}
                      {(item.removed_ingredients?.length ?? 0) > 0 && (
                        <span className="block text-xs text-red-500">
                          No {item.removed_ingredients!.join(', ')}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-black pt-3 mt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-red-500">${Number(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Estimated Time</p>
                <p className="text-sm text-gray-600">15-20 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">
                  {order?.delivery_type === 'pickup' ? 'Pickup' : 'Delivery Address'}
                </p>
                <p className="text-sm text-gray-600">
                  {order?.delivery_type === 'pickup'
                    ? 'Pick up at the restaurant'
                    : order?.address || 'We will contact you for the address'}
                </p>
              </div>
            </div>
            {order?.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Contact Number</p>
                  <p className="text-sm text-gray-600">{order.phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to Menu
            </Link>
            {isLoggedIn && orderId && (
              <Link
                href={`/orders/${orderId}`}
                className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                <Eye className="h-5 w-5" />
                View Order Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
