'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 group border border-gray-100/50 overflow-hidden"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-gray-900 group-hover:text-red-500 transition-colors leading-tight">{product.name}</h3>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</span>
            <span className="text-2xl font-black text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
              isAdding
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-red-500 text-white hover:bg-black shadow-lg shadow-red-500/20 hover:shadow-black/20'
            }`}
          >
            {isAdding ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>Added!</motion.span>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}