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
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-500">
            ${product.price.toFixed(2)}
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className={`p-2 rounded-full transition-colors ${
              isAdding
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <Plus className={`h-5 w-5 ${isAdding ? '' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}