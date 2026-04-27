'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, MapPin, Clock, User as UserIcon } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    delivery_type: 'delivery' as 'delivery' | 'pickup',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill if logged in
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.name,
        phone: user.phone,
        address: user.address || '',
      }));
    }
  }, [user]);

  const deliveryFee = formData.delivery_type === 'delivery' ? 2.99 : 0;
  const grandTotal = totalPrice + deliveryFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (formData.delivery_type === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Address is required for delivery';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (items.length === 0) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.delivery_type === 'delivery' ? formData.address : undefined,
        delivery_type: formData.delivery_type,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.orders.create(orderData);
      clearCart();
      router.push(`/confirmation?orderId=${response.order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      setErrors({ submit: 'Failed to place order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500">Add some items before checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
                      errors.customer_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Delivery Type
                  </label>
                  <div className="flex gap-4">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.delivery_type === 'delivery'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        value="delivery"
                        checked={formData.delivery_type === 'delivery'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <MapPin
                        className={`h-5 w-5 ${
                          formData.delivery_type === 'delivery'
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className="font-medium">Delivery</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.delivery_type === 'pickup'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_type"
                        value="pickup"
                        checked={formData.delivery_type === 'pickup'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Clock
                        className={`h-5 w-5 ${
                          formData.delivery_type === 'pickup'
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className="font-medium">Pickup</span>
                    </label>
                  </div>
                </div>

                {formData.delivery_type === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St, City"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-md border border-gray-100">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Save your details for next time?</p>
                      <Link href="/register" className="text-xs text-red-500 hover:text-red-600 font-semibold">
                        Create an account to track orders and checkout faster
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-red-500">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}