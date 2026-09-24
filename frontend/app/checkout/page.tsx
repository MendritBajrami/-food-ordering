'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, MapPin, Clock, User as UserIcon, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    payment_method: 'cash' as 'cash' | 'card',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
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
  const grandTotal = Number(totalPrice) + deliveryFee;

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

    // Payment validation
    if (formData.payment_method === 'card') {
      if (!formData.card_number.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors.card_number = 'Enter a valid 16-digit card number';
      }
      if (!formData.card_expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        newErrors.card_expiry = 'Use MM/YY format';
      }
      if (!formData.card_cvv.match(/^\d{3,4}$/)) {
        newErrors.card_cvv = 'Invalid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/[^0-9]/g, '')
      .replace(/^([2-9])/, '0$1')
      .replace(/^(1[3-9])/, '0$1')
      .replace(/^([0-1][0-9])([0-9])/, '$1/$2')
      .substring(0, 5);
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
        payment_method: formData.payment_method,
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
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'card_number') finalValue = formatCardNumber(value);
    if (name === 'card_expiry') finalValue = formatExpiry(value);
    if (name === 'card_cvv') finalValue = value.replace(/[^0-9]/g, '').substring(0, 4);

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                          errors.customer_name ? 'border-red-500' : 'border-gray-100'
                        }`}
                      />
                      {errors.customer_name && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.customer_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                          errors.phone ? 'border-red-500' : 'border-gray-100'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Options</h3>
                  <div className="flex gap-4 mb-4">
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.delivery_type === 'delivery'
                          ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                          : 'border-gray-100 bg-gray-50 grayscale hover:grayscale-0'
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
                      <MapPin className="h-5 w-5" />
                      <span className="font-bold">Delivery</span>
                    </label>
                    <label
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.delivery_type === 'pickup'
                          ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                          : 'border-gray-100 bg-gray-50 grayscale hover:grayscale-0'
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
                      <Clock className="h-5 w-5" />
                      <span className="font-bold">Pickup</span>
                    </label>
                  </div>

                  {formData.delivery_type === 'delivery' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. 123 Burger St, Food City"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                          errors.address ? 'border-red-500' : 'border-gray-100'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-gray-50 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                  <div className="flex gap-4 mb-6">
                    <label
                      className={`flex-1 flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.payment_method === 'cash'
                          ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                          : 'border-gray-100 bg-gray-50 grayscale hover:grayscale-0'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash"
                        checked={formData.payment_method === 'cash'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Utensils className="h-6 w-6" />
                      <span className="font-bold">Cash on Delivery</span>
                    </label>
                    <label
                      className={`flex-1 flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.payment_method === 'card'
                          ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                          : 'border-gray-100 bg-gray-50 grayscale hover:grayscale-0'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="card"
                        checked={formData.payment_method === 'card'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Check className="h-6 w-6" />
                      <span className="font-bold">Card Payment</span>
                    </label>
                  </div>

                  <AnimatePresence>
                    {formData.payment_method === 'card' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-2xl mb-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[60px] group-hover:bg-red-500/40 transition-colors" />
                          <div className="relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 block">Card Number</span>
                            <p className="text-xl font-mono tracking-[0.1em] mb-6 min-h-[1.5rem]">
                              {formData.card_number || '•••• •••• •••• ••••'}
                            </p>
                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 block">Expiry</span>
                                <p className="font-mono">{formData.card_expiry || 'MM/YY'}</p>
                              </div>
                              <div className="w-12 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-md opacity-80" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 px-1">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Card Number</label>
                            <input
                              type="text"
                              name="card_number"
                              value={formData.card_number}
                              onChange={handleChange}
                              placeholder="0000 0000 0000 0000"
                              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none ${
                                errors.card_number ? 'border-red-500' : 'border-gray-100'
                              }`}
                            />
                            {errors.card_number && <p className="text-xs text-red-500 mt-1 font-medium">{errors.card_number}</p>}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                              <input
                                type="text"
                                name="card_expiry"
                                value={formData.card_expiry}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none ${
                                  errors.card_expiry ? 'border-red-500' : 'border-gray-100'
                                }`}
                              />
                              {errors.card_expiry && <p className="text-xs text-red-500 mt-1 font-medium">{errors.card_expiry}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">CVV</label>
                              <input
                                type="password"
                                name="card_cvv"
                                value={formData.card_cvv}
                                onChange={handleChange}
                                placeholder="•••"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none ${
                                  errors.card_cvv ? 'border-red-500' : 'border-gray-100'
                                }`}
                              />
                              {errors.card_cvv && <p className="text-xs text-red-500 mt-1 font-medium">{errors.card_cvv}</p>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!user && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-start gap-3">
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Save details for later?</p>
                      <Link href="/register" className="text-xs text-red-500 hover:text-red-600 font-bold">
                        Create an account to track orders faster
                      </Link>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-red-500/20 active:scale-95"
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order Now'}
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
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${Number(totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${Number(deliveryFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-red-500">${Number(grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}