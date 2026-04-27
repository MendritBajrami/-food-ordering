'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, ShoppingCart, Clock, Flame, Utensils, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await api.products.getById(Number(id));
        setProduct(data.product);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] text-center p-4">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Product not found</h2>
        <button 
          onClick={() => router.push('/menu')}
          className="bg-red-500 text-white font-bold px-8 py-3 rounded-2xl hover:bg-black transition-all"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Header / Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 hover:bg-white transition-all"
        >
          <ChevronLeft className="h-5 w-5 text-gray-900 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-gray-900">Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Product Image */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-red-500/10 border border-gray-100"
        >
          <Image 
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-red-500 text-xs font-black uppercase tracking-widest">{product.category}</span>
          </div>
        </motion.div>

        {/* Right: Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4 text-orange-500">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-black text-sm">4.9 (120+ Reviews)</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-none">
            {product.name}
          </h1>

          <p className="text-xl text-gray-500 font-medium leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: Clock, label: 'Cook Time', value: '15-20 min' },
              { icon: Flame, label: 'Calories', value: '450 kcal' },
              { icon: Utensils, label: 'Ingredients', value: 'Fresh' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                <feature.icon className="h-6 w-6 text-red-500 mb-2" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{feature.label}</span>
                <span className="text-xs font-black text-gray-900">{feature.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Price</span>
                <span className="text-4xl font-black text-gray-900">${(Number(product.price) * quantity).toFixed(2)}</span>
              </div>

              <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-gray-50 rounded-xl transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-gray-50 rounded-xl transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${
                isAdding 
                  ? 'bg-green-500 text-white shadow-green-500/20' 
                  : 'bg-red-500 text-white hover:bg-black shadow-red-500/20 hover:shadow-black/20'
              }`}
            >
              {isAdding ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Added to Cart!</span>
                </motion.div>
              ) : (
                <>
                  <Plus className="h-6 w-6" />
                  <span>Add to Order</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Suggested Items (Static for now) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <h2 className="text-2xl font-black text-gray-900 mb-8">Goes great with...</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-4 rounded-[2rem] border border-gray-100 flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50 animate-pulse" />
              <div className="h-4 bg-gray-50 rounded-full w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-50 rounded-full w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
