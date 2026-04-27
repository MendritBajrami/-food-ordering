'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Home, MapPin } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          
          {orderId && (
            <p className="text-gray-500 mb-6">
              Order #{orderId}
            </p>
          )}

          <p className="text-gray-600 mb-6">
            Thank you for your order! We&apos;re preparing your food right now.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Estimated Time</p>
                <p className="text-sm text-gray-600">15-20 minutes</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Pickup Location</p>
                <p className="text-sm text-gray-600">123 Food Street, City</p>
              </div>
            </div>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Menu
          </Link>
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